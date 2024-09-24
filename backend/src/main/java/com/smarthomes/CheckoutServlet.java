package com.smarthomes;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

@WebServlet("/checkout")
public class CheckoutServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        enableCORS(request, response);
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        Gson gson = new Gson();

        try {
            // Parse the incoming data as a single Orders object, including cartItems
            Orders order = gson.fromJson(request.getReader(), Orders.class);

            // DEBUG: Print incoming order to inspect the data
            System.out.println("Received order data: " + gson.toJson(order));

            String confirmationNumber = generateConfirmationNumber();
            String shipDate = new SimpleDateFormat("yyyy-MM-dd")
                    .format(new Date(System.currentTimeMillis() + 3 * 24 * 60 * 60 * 1000)); // Example: 3 days later

            // Check if cart items are not null or empty
            if (order.getCartItems() == null || order.getCartItems().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"error\": \"Cart items are missing.\"}");
                return;
            }

            // Calculate totalSales as total quantity of items
            int totalQuantity = order.getCartItems().stream().mapToInt(CartItem::getQuantity).sum();

            // Loop through cart items and save each item as part of the order
            for (CartItem item : order.getCartItems()) {
                // DEBUG: Print each item
                System.out.println("Processing cart item: " + gson.toJson(item));

                // Set confirmation number and ship date for the order
                order.setConfirmationNumber(confirmationNumber);
                order.setShipDate(shipDate);
                order.setProductId(item.getProductId()); // Ensure the CartItem has getId()
                order.setCategory(item.getCategory()); // Ensure the CartItem has getCategory()
                order.setPrice(item.getPrice());
                order.setQuantity(item.getQuantity());

                // Set total_sales as total quantity instead of total amount
                order.setTotalSales(totalQuantity);

                // Save each item in the database
                saveOrderToDatabase(order);
            }
            // Send back the confirmation response
            JsonObject jsonResponse = new JsonObject();
            jsonResponse.addProperty("confirmationNumber", confirmationNumber);
            jsonResponse.addProperty("shipDate", shipDate);
            out.print(jsonResponse);

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\": \"Failed to process the order.\"}");
        }

        out.flush();
    }

    private String generateConfirmationNumber() {
        return UUID.randomUUID().toString(); // Generate a random confirmation number
    }

    private void saveOrderToDatabase(Orders order) {
        try (Connection connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/smarthomes", "root",
                "root");
                PreparedStatement stmt = connection.prepareStatement(
                        "INSERT INTO orders (user_id, customer_name, customer_address, credit_card_no, confirmation_number, purchase_date, ship_date, product_id, category, quantity, price, shipping_cost, discount, total_sales, store_id, store_address, deliveryDate, deliveryOption) "
                                +
                                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")) {
            // Purchase date and ship date (3 days from now)
            String purchaseDate = new SimpleDateFormat("yyyy-MM-dd").format(new Date()); // Current date
            String shipDate = new SimpleDateFormat("yyyy-MM-dd")
                    .format(new Date(System.currentTimeMillis() + 3L * 24 * 60 * 60 * 1000)); // 3 days from now
            String deliveryDate = new SimpleDateFormat("yyyy-MM-dd")
                    .format(new Date(System.currentTimeMillis() + 15L * 24 * 60 * 60 * 1000)); // 15 days from now
            order.setDeliveryDate(deliveryDate);
            stmt.setInt(1, order.getUserId());
            stmt.setString(2, order.getCustomerName());
            stmt.setString(3, order.getCustomerAddress());
            stmt.setString(4, order.getCreditCardNo());
            stmt.setString(5, order.getConfirmationNumber());
            stmt.setString(6, purchaseDate);
            stmt.setString(7, shipDate);
            stmt.setInt(8, order.getProductId());
            stmt.setString(9, order.getCategory());
            stmt.setInt(10, order.getQuantity());
            stmt.setDouble(11, order.getPrice());
            stmt.setDouble(12, order.getShippingCost());
            stmt.setDouble(13, order.getDiscount());
            stmt.setInt(14, order.getTotalSales()); // total quantity
            stmt.setInt(15, order.getStoreId());
            stmt.setString(16, order.getStoreAddress());
            stmt.setString(17, deliveryDate);
            stmt.setString(18, order.getDeliveryOption());
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private void enableCORS(HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");
    }
}

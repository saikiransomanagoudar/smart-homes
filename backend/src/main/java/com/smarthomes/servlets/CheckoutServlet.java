package com.smarthomes;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

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
                System.out.println("Item name: " + item.getName());

                // Set product or accessory details in the order
                order.setId(item.getId());
                order.setName(item.getName());
                order.setCategory(item.getCategory());
                order.setPrice(item.getPrice());
                order.setQuantity(item.getQuantity());
                order.setConfirmationNumber(confirmationNumber);
                order.setShipDate(shipDate);

                // Set total_sales as total quantity instead of total amount
                order.setTotalSales(totalQuantity);

                // If accessory, fetch the associated product info
                if ("accessory".equalsIgnoreCase(item.getType())) {
                    int productId = getAssociatedProductId(item.getId());
                    order.setId(productId); // Set the associated product ID
                    order.setName(item.getName()); // Keep accessory name in product name field
                }

                // Save each item in the database
                saveOrderToDatabase(order);
            }

            // Send back the confirmation response
            JsonObject jsonResponse = new JsonObject();
            jsonResponse.addProperty("confirmationNumber", confirmationNumber);
            jsonResponse.addProperty("shipDate", shipDate);
            jsonResponse.addProperty("deliveryDate", order.getDeliveryDate());
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
                        "INSERT INTO orders (user_id, customer_name, customer_address, credit_card_no, confirmation_number, purchase_date, ship_date, product_id, product_name, category, quantity, price, shipping_cost, discount, total_sales, store_id, store_address, deliveryDate, deliveryOption, status) "
                                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")) {

            // Purchase date and ship date (3 days from now)
            String purchaseDate = new SimpleDateFormat("yyyy-MM-dd").format(new Date()); // Current date
            String shipDate = new SimpleDateFormat("yyyy-MM-dd")
                    .format(new Date(System.currentTimeMillis() + 3L * 24 * 60 * 60 * 1000)); // 3 days from now
            String deliveryDate = new SimpleDateFormat("yyyy-MM-dd")
                    .format(new Date(System.currentTimeMillis() + 15L * 24 * 60 * 60 * 1000)); // 15 days from now
            order.setDeliveryDate(deliveryDate);

            // Handle store pickup
            Integer storeId = null;
            String storeAddress = null;
            if ("pickup".equalsIgnoreCase(order.getDeliveryOption()) && order.getStoreLocation() != null) {
                System.out.println("Store ID: " + order.getStoreLocation().getStoreId());
                System.out.println("Store Address: " + order.getStoreLocation().getStoreAddress());
                storeId = order.getStoreLocation().getStoreId();
                storeAddress = order.getStoreLocation().getStoreAddress();
            }

            // Set values for the prepared statement
            stmt.setInt(1, order.getUserId());
            stmt.setString(2, order.getCustomerName());
            stmt.setString(3, order.getCustomerAddress());
            stmt.setString(4, order.getCreditCardNo());
            stmt.setString(5, order.getConfirmationNumber());
            stmt.setString(6, purchaseDate);
            stmt.setString(7, shipDate);
            stmt.setInt(8, order.getId());
            stmt.setString(9, order.getName());
            stmt.setString(10, order.getCategory());
            stmt.setInt(11, order.getQuantity());
            stmt.setDouble(12, Math.round(order.getPrice() * 100.0) / 100.0);
            stmt.setDouble(13, order.getShippingCost());
            stmt.setDouble(14, order.getDiscount());
            stmt.setInt(15, order.getTotalSales());
            stmt.setObject(16, storeId); // Use setObject to allow null
            stmt.setString(17, storeAddress);
            stmt.setString(18, deliveryDate);
            stmt.setString(19, order.getDeliveryOption());
            stmt.setString(20, "Processing");

            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // Helper function to get the associated product_id for an accessory
    private int getAssociatedProductId(int accessoryId) {
        String query = "SELECT product_id FROM ProductAccessories WHERE accessory_id = ?";
        try (Connection conn = MySQLDataStoreUtilities.getConnection();
                PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, accessoryId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return rs.getInt("product_id");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1; // Return -1 if no product found
    }

    private void enableCORS(HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");
    }
}

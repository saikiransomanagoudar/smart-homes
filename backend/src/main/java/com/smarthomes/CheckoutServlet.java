package com.smarthomes;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@WebServlet("/checkout")
public class CheckoutServlet extends HttpServlet {

    private static final String DB_INSERT_ORDER = "INSERT INTO orders "
            + "(user_id, customer_name, customer_address, credit_card_no, confirmation_number, purchase_date, ship_date, "
            + "product_id, product_name, category, quantity, price, shipping_cost, discount, total_sales, store_id, store_address) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            // Read the incoming order JSON data
            BufferedReader reader = request.getReader();
            Orders order = new Gson().fromJson(reader, Orders.class);

            // Get the session and fetch userId
            HttpSession session = request.getSession();
            Integer userId = (Integer) session.getAttribute("userId");

            // Ensure the userId is valid and not 0
            if (userId == null || userId == 0) {
                // Hardcode userId for testing (change to a valid userId)
                userId = 1; // Replace with a valid user ID from customers table
            }
            order.setUserId(userId);

            // Log the received order
            System.out.println("Order received: " + new Gson().toJson(order));

            // Validate the order data
            if (order == null || order.getProductName() == null || order.getPrice() <= 0 || order.getCustomerAddress() == null) {
                throw new IllegalArgumentException("Invalid product name, price, or customer address");
            }

            // Generate confirmation number and dates
            String confirmationNumber = UUID.randomUUID().toString();
            String purchaseDate = LocalDate.now().toString();
            String shipDate = LocalDate.now().plusWeeks(2).toString(); // Adjust based on delivery option

            // Calculate the total sales and store details
            double totalSales = (order.getPrice() * order.getQuantity()) - order.getDiscount()
                    + order.getShippingCost();
            int storeId = order.getDeliveryOption().equalsIgnoreCase("pickup") ? 1 : 0;
            String storeAddress = (storeId == 1) ? "123 Store St, City, State, 12345" : "";

            // Save the order to the database
            saveOrderToDatabase(order, confirmationNumber, purchaseDate, shipDate, totalSales, storeId, storeAddress);

            // Prepare the success response
            Map<String, String> responseData = new HashMap<>();
            responseData.put("confirmationNumber", confirmationNumber);
            responseData.put("shipDate", shipDate);

            response.setContentType("application/json");
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write(new Gson().toJson(responseData));

        } catch (Exception e) {
            // Log the error and send a 500 error response
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("application/json");
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error processing your order: " + e.getMessage());
            response.getWriter().write(new Gson().toJson(errorResponse));
        }
    }

    /**
     * Save the order data to the MySQL database
     *
     * @param order             The order object
     * @param confirmationNumber Generated confirmation number
     * @param purchaseDate      The date of purchase
     * @param shipDate          The shipping date
     * @param totalSales        Calculated total sales for the order
     * @param storeId           ID for the pickup store
     * @param storeAddress      Address of the pickup store
     * @throws SQLException If any SQL errors occur
     */
    private void saveOrderToDatabase(Orders order, String confirmationNumber, String purchaseDate, String shipDate,
                                     double totalSales, int storeId, String storeAddress) throws SQLException {
        Connection conn = MySQLDataStoreUtilities.getConnection();
        try (PreparedStatement ps = conn.prepareStatement(DB_INSERT_ORDER)) {
            ps.setInt(1, order.getUserId());
            ps.setString(2, order.getCustomerName());
            ps.setString(3, order.getCustomerAddress());
            ps.setString(4, order.getCreditCardNo());
            ps.setString(5, confirmationNumber);
            ps.setString(6, purchaseDate);
            ps.setString(7, shipDate);
            ps.setInt(8, order.getProductId());
            ps.setString(9, order.getProductName());
            ps.setString(10, order.getCategory());
            ps.setInt(11, order.getQuantity());
            ps.setDouble(12, order.getPrice());
            ps.setDouble(13, order.getShippingCost());
            ps.setDouble(14, order.getDiscount());
            ps.setDouble(15, totalSales);
            ps.setInt(16, storeId);
            ps.setString(17, storeAddress);
            ps.executeUpdate();
        } finally {
            MySQLDataStoreUtilities.closeConnection(conn);
        }
    }
}

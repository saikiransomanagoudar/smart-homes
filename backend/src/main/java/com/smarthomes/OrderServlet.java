package com.smarthomes;

import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@WebServlet("/orders")
public class OrderServlet extends HttpServlet {

    // Helper method to add CORS headers to the response
    private void enableCORS(HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Allow frontend origin
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Allow these methods
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true"); // Allow credentials (cookies)
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        enableCORS(request, response);
        response.setContentType("application/json");

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("email") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("User not logged in");
            return;
        }

        Integer userId = (Integer) session.getAttribute("userId"); // Fetch user_id from session

        if (userId == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("User ID not found in session.");
            return;
        }

        // Fetch the user's orders from the database
        List<Orders> userOrders = getUserOrdersFromDatabase(userId);

        // Convert the list of orders to JSON and send as response
        String jsonResponse = new Gson().toJson(Map.of("orders", userOrders));
        response.getWriter().write(jsonResponse);
    }

    // Fetch orders from the database for the specified user
    private List<Orders> getUserOrdersFromDatabase(int userId) throws IOException {
        List<Orders> ordersList = new ArrayList<>();

        String selectOrdersSQL = "SELECT * FROM orders WHERE user_id = ? ORDER BY purchase_date DESC";

        try (Connection connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/smarthomes", "root", "root");
             PreparedStatement stmt = connection.prepareStatement(selectOrdersSQL)) {

            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                Orders order = new Orders();
                // Populate the order object with data from the result set
                order.setOrderId(rs.getInt("order_id"));
                order.setUserId(rs.getInt("user_id"));
                order.setCustomerName(rs.getString("customer_name"));
                order.setCustomerAddress(rs.getString("customer_address"));
                order.setCreditCardNo(rs.getString("credit_card_no"));
                order.setConfirmationNumber(rs.getString("confirmation_number"));
                order.setPurchaseDate(rs.getString("purchase_date"));
                order.setShipDate(rs.getString("ship_date"));
                order.setProductId(rs.getInt("product_id"));
                order.setProductName(rs.getString("product_name"));
                order.setCategory(rs.getString("category"));
                order.setQuantity(rs.getInt("quantity"));
                order.setPrice(rs.getDouble("price"));
                order.setShippingCost(rs.getDouble("shipping_cost"));
                order.setDiscount(rs.getDouble("discount"));
                order.setTotalSales(rs.getInt("total_sales"));
                order.setDeliveryDate(rs.getString("deliveryDate"));
                order.setDeliveryOption(rs.getString("deliveryOption"));
                order.setStatus(rs.getString("status"));

                // Set StoreLocation object if store_id is not null
                if (rs.getObject("store_id") != null) {
                    Orders.StoreLocation storeLocation = new Orders.StoreLocation();
                    storeLocation.setStoreId(rs.getInt("store_id"));
                    storeLocation.setStoreAddress(rs.getString("store_address"));
                    order.setStoreLocation(storeLocation);
                }

                ordersList.add(order);
            }

        } catch (SQLException e) {
            e.printStackTrace();
            throw new IOException("Error fetching orders from the database.", e);
        }

        return ordersList;
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        enableCORS(request, response);
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("email") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("User not logged in");
            return;
        }

        // Get the order ID from the URL path
        String pathInfo = request.getPathInfo();
        if (pathInfo == null || pathInfo.length() <= 1) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Invalid order ID.");
            return;
        }

        String orderIdStr = pathInfo.substring(1);
        try {
            int orderId = Integer.parseInt(orderIdStr);

            // Update the order status to 'Cancelled' in the database
            boolean success = cancelOrderInDatabase(orderId);

            if (success) {
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("Order cancelled successfully.");
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("Failed to cancel order.");
            }

        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Invalid order ID format.");
        }
    }

    private boolean cancelOrderInDatabase(int orderId) throws IOException {
        String updateOrderSQL = "UPDATE orders SET status = 'Cancelled' WHERE order_id = ? AND status = 'Processing'";

        try (Connection connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/smarthomes", "root", "root");
             PreparedStatement stmt = connection.prepareStatement(updateOrderSQL)) {

            stmt.setInt(1, orderId);
            int rowsUpdated = stmt.executeUpdate();

            return rowsUpdated > 0; // Return true if any row was updated
        } catch (SQLException e) {
            e.printStackTrace();
            throw new IOException("Error cancelling the order in the database.", e);
        }
    }
}

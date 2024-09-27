package com.smarthomes;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
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
import java.util.ArrayList;
import java.util.List;

@WebServlet("/orders/*")
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

        // Check if the session exists and the user is logged in
        if (session == null || session.getAttribute("email") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"User not logged in\"}");
            return;
        }

        // Fetch the user ID from the session
        Integer userId = (Integer) session.getAttribute("userId");

        // Ensure userId exists in the session
        if (userId == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"User ID not found in session.\"}");
            return;
        }

        // Fetch the user's orders from the database
        List<Orders> orders = fetchOrdersFromDatabase(userId);

        // If no orders are found, return an empty array
        if (orders.isEmpty()) {
            response.getWriter().write("{\"orders\": []}");
        } else {
            // Convert the list of orders to JSON and send as a response
            String jsonResponse = new Gson().toJson(orders);
            response.getWriter().write(jsonResponse);
        }
    }

    // Method to fetch orders from the database for a specific user
    private List<Orders> fetchOrdersFromDatabase(int userId) throws IOException {
        List<Orders> ordersList = new ArrayList<>();

        // SQL query to fetch the user's orders
        String selectOrdersSQL = "SELECT * FROM orders WHERE user_id = ? ORDER BY purchase_date DESC";

        try (Connection connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/smarthomes", "root",
                "root");
                PreparedStatement stmt = connection.prepareStatement(selectOrdersSQL)) {

            // Set the user ID in the query
            stmt.setInt(1, userId);

            // Execute the query and retrieve the result set
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    // Create a new Order object for each order
                    Orders order = new Orders();
                    order.setOrderId(rs.getInt("order_id"));
                    order.setUserId(rs.getInt("user_id"));
                    order.setCustomerName(rs.getString("customer_name"));
                    order.setCustomerAddress(rs.getString("customer_address"));
                    order.setCreditCardNo(rs.getString("credit_card_no"));
                    order.setConfirmationNumber(rs.getString("confirmation_number"));
                    order.setPurchaseDate(rs.getString("purchase_date"));
                    order.setShipDate(rs.getString("ship_date"));
                    order.setId(rs.getInt("product_id"));
                    order.setName(rs.getString("product_name"));
                    order.setCategory(rs.getString("category"));
                    order.setQuantity(rs.getInt("quantity"));
                    order.setPrice(rs.getDouble("price"));
                    order.setShippingCost(rs.getDouble("shipping_cost"));
                    order.setDiscount(rs.getDouble("discount"));
                    order.setTotalSales(rs.getInt("total_sales"));
                    order.setDeliveryDate(rs.getString("deliveryDate"));
                    order.setDeliveryOption(rs.getString("deliveryOption"));
                    order.setStatus(rs.getString("status"));

                    // Check if there is a store associated with the order
                    if (rs.getObject("store_id") != null) {
                        Orders.StoreLocation storeLocation = new Orders.StoreLocation();
                        storeLocation.setStoreId(rs.getInt("store_id"));
                        storeLocation.setStoreAddress(rs.getString("store_address"));
                        order.setStoreLocation(storeLocation);
                    }

                    // Add the order to the list
                    ordersList.add(order);
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
            throw new IOException("Error fetching orders from the database.", e);
        }

        return ordersList;
    }

    // Method to handle both Customer cancellation and Store Manager quantity update
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        enableCORS(request, response);
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("email") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"User not logged in\"}");
            return;
        }

        // Get the order ID from the URL path
        String pathInfo = request.getPathInfo();
        if (pathInfo == null || pathInfo.length() <= 1) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"Invalid order ID\"}");
            return;
        }

        String orderIdStr = pathInfo.substring(1);
        try {
            int orderId = Integer.parseInt(orderIdStr);

            // Parse the request body to understand the action
            JsonObject requestBody = new Gson().fromJson(request.getReader(), JsonObject.class);
            String action = requestBody.get("action").getAsString();

            // If action is cancelOrder, cancel the order for Customers
            if ("cancelOrder".equals(action)) {
                String loginType = (String) session.getAttribute("loginType");
                if (!"Customer".equals(loginType)) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write("{\"error\": \"Only Customers can cancel orders\"}");
                    return;
                }
                boolean success = cancelOrderInDatabase(orderId);

                if (success) {
                    response.setStatus(HttpServletResponse.SC_OK);
                    response.getWriter().write("{\"message\": \"Order cancelled successfully\"}");
                } else {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().write("{\"error\": \"Failed to cancel order\"}");
                }
            }
            // If action is incrementQuantity, update the quantity for Store Managers
            else if ("incrementQuantity".equals(action)) {
                String loginType = (String) session.getAttribute("loginType");
                if (!"StoreManager".equals(loginType)) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write("{\"error\": \"Only Store Managers can update order quantity\"}");
                    return;
                }
                boolean success = incrementOrderQuantityInDatabase(orderId);

                if (success) {
                    response.setStatus(HttpServletResponse.SC_OK);
                    response.getWriter().write("{\"message\": \"Order quantity updated successfully\"}");
                } else {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().write("{\"error\": \"Failed to update order quantity\"}");
                }
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\": \"Invalid action\"}");
            }

        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"Invalid order ID format\"}");
        }
    }

    // Method to handle order deletion for Store Managers
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        enableCORS(request, response);
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("email") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"User not logged in\"}");
            return;
        }

        // Get the login type from the session to check if the user is a Store Manager
        String loginType = (String) session.getAttribute("loginType");
        if (!"StoreManager".equals(loginType)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\": \"Only Store Managers can delete orders\"}");
            return;
        }

        // Get the order ID from the URL path
        String pathInfo = request.getPathInfo();
        if (pathInfo == null || pathInfo.length() <= 1) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"Invalid order ID\"}");
            return;
        }

        String orderIdStr = pathInfo.substring(1);
        try {
            int orderId = Integer.parseInt(orderIdStr);

            // Delete the order from the database
            boolean success = deleteOrderFromDatabase(orderId);

            if (success) {
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("{\"message\": \"Order deleted successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\": \"Failed to delete order\"}");
            }

        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"Invalid order ID format\"}");
        }
    }

    // Method to cancel the order (update status to "Cancelled") for Customers
    private boolean cancelOrderInDatabase(int orderId) throws IOException {
        String updateOrderSQL = "UPDATE orders SET status = 'Cancelled' WHERE order_id = ? AND status = 'Processing'";

        try (Connection connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/smarthomes", "root",
                "root");
                PreparedStatement stmt = connection.prepareStatement(updateOrderSQL)) {

            stmt.setInt(1, orderId);
            int rowsUpdated = stmt.executeUpdate();

            return rowsUpdated > 0; // Return true if the status was updated
        } catch (SQLException e) {
            e.printStackTrace();
            throw new IOException("Error cancelling the order in the database.", e);
        }
    }

    // Method to increment the quantity of the order in the database for Store
    // Store Managers
    private boolean incrementOrderQuantityInDatabase(int orderId) throws IOException {
        String updateOrderSQL = "UPDATE orders " +
        "SET quantity = quantity + 1, " +
        "    total_sales = total_sales + 1, " +
        "    price = (price / quantity) * (quantity + 1) " +
        "WHERE order_id = ?";

        try (Connection connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/smarthomes", "root",
                "root");
                PreparedStatement stmt = connection.prepareStatement(updateOrderSQL)) {

            stmt.setInt(1, orderId);
            int rowsUpdated = stmt.executeUpdate();

            return rowsUpdated > 0; // Return true if any row was updated
        } catch (SQLException e) {
            e.printStackTrace();
            throw new IOException("Error updating the order quantity in the database.", e);
        }
    }

    // Method to delete the order from the database for Store Managers
    private boolean deleteOrderFromDatabase(int orderId) throws IOException {
        String deleteOrderSQL = "DELETE FROM orders WHERE order_id = ?";

        try (Connection connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/smarthomes", "root",
                "root");
                PreparedStatement stmt = connection.prepareStatement(deleteOrderSQL)) {

            stmt.setInt(1, orderId);
            int rowsDeleted = stmt.executeUpdate();

            return rowsDeleted > 0; // Return true if any row was deleted
        } catch (SQLException e) {
            e.printStackTrace();
            throw new IOException("Error deleting the order from the database.", e);
        }
    }
}

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
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.*;

@WebServlet("/orders")
public class OrderServlet extends HttpServlet {

    private Map<String, Orders> orders = new HashMap<>();

    // Helper method to add CORS headers to the response
    private void enableCORS(HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Allow frontend origin
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Allow these methods
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true"); // Allow credentials (cookies)
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        enableCORS(request, response); // Enable CORS for POST request
        response.setContentType("application/json");

        HttpSession session = request.getSession(false);
        System.out.println("Username in session (OrderServlet): " + session.getAttribute("username"));

        // Ensure the user is logged in
        if (session == null || session.getAttribute("username") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("User not logged in");
            return;
        }

        String customerName = (String) session.getAttribute("username");
        Integer userId = (Integer) session.getAttribute("userId"); // Fetch user_id from the session

        if (userId == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("User ID not found in session.");
            return;
        }

        try {
            // Read and parse the request body to get the order data
            String requestData = request.getReader().lines().reduce("", (accumulator, actual) -> accumulator + actual);
            Orders order = new Gson().fromJson(requestData, Orders.class);

            if (order == null || order.getProductName() == null || order.getPrice() <= 0) {
                throw new IllegalArgumentException("Invalid order data");
            }

            // Set the customer name and user ID in the order
            order.setCustomerName(customerName);
            order.setUserId(userId);

            // Generate a confirmation number and ship date
            String confirmationNumber = UUID.randomUUID().toString();
            order.setConfirmationNumber(confirmationNumber);
            order.setPurchaseDate(LocalDate.now().toString()); // Set today's date as purchase date
            LocalDate shipDate = LocalDate.now().plusDays("pickup".equals(order.getDeliveryOption()) ? 1 : 3);
            order.setShipDate(shipDate.toString());

            // Save the order in the database
            saveOrderToDatabase(order);

            // Send the response with confirmation number and delivery date
            Map<String, String> responseMap = new HashMap<>();
            responseMap.put("confirmationNumber", confirmationNumber);
            responseMap.put("deliveryDate", shipDate.toString());

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write(new Gson().toJson(responseMap));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error processing order: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void saveOrderToDatabase(Orders order) throws SQLException {
        String insertOrderSQL = "INSERT INTO orders (user_id, customer_name, customer_address, credit_card_no, " +
                "confirmation_number, purchase_date, ship_date, product_id, product_name, category, quantity, price, " +
                "shipping_cost, discount, total_sales, store_id, store_address, delivery_option, delivery_date) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/smarthomes", "user", "password");
             PreparedStatement stmt = connection.prepareStatement(insertOrderSQL)) {

            stmt.setInt(1, order.getUserId());
            stmt.setString(2, order.getCustomerName());
            stmt.setString(3, order.getCustomerAddress());
            stmt.setString(4, order.getCreditCardNo());
            stmt.setString(5, order.getConfirmationNumber());
            stmt.setString(6, order.getPurchaseDate());
            stmt.setString(7, order.getShipDate());
            stmt.setInt(8, order.getProductId());
            stmt.setString(9, order.getProductName());
            stmt.setString(10, order.getCategory());
            stmt.setInt(11, order.getQuantity());
            stmt.setDouble(12, order.getPrice());
            stmt.setDouble(13, order.getShippingCost());
            stmt.setDouble(14, order.getDiscount());
            stmt.setDouble(15, order.getTotalSales());
            stmt.setInt(16, order.getStoreId());
            stmt.setString(17, order.getStoreAddress());
            stmt.setString(18, order.getDeliveryOption());
            stmt.setString(19, order.getDeliveryDate());

            stmt.executeUpdate();
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        enableCORS(request, response); // Enable CORS for GET request
        response.setContentType("application/json");

        HttpSession session = request.getSession(false);
        System.out.println("Username in session (OrderServlet): " + session.getAttribute("username"));

        // Check if the user is logged in
        if (session == null || session.getAttribute("username") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("User not logged in");
            return;
        }

        String username = (String) session.getAttribute("username");

        // Fetch orders for the logged-in user
        List<Orders> userOrders = new ArrayList<>();
        for (Orders order : orders.values()) {
            if (order.getCustomerName().equals(username)) {
                userOrders.add(order);
            }
        }

        String jsonResponse = new Gson().toJson(Map.of("orders", userOrders));
        response.getWriter().write(jsonResponse);
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        enableCORS(request, response); // Enable CORS for DELETE request
        HttpSession session = request.getSession(false);
        System.out.println("Username in session (OrderServlet): " + session.getAttribute("username"));

        if (session == null || session.getAttribute("username") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("User not logged in");
            return;
        }

        String orderId = request.getPathInfo().substring(1);
        if (orders.remove(orderId) != null) {
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }
}

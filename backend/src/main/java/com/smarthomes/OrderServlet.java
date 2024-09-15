package com.smarthomes;

import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
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

        try {
            String requestData = request.getReader().lines().reduce("", (accumulator, actual) -> accumulator + actual);
            Orders order = new Gson().fromJson(requestData, Orders.class);

            if (order == null || order.getProductName() == null || order.getProductPrice() <= 0) {
                throw new IllegalArgumentException("Invalid order data");
            }

            // Set the customer's username in the order
            order.setCustomerName(customerName);
            
            // Generate a confirmation number
            String confirmationNumber = UUID.randomUUID().toString();
            order.setConfirmationNumber(confirmationNumber);

            // Calculate delivery date based on delivery option
            LocalDate deliveryDate = LocalDate.now().plusDays("pickup".equals(order.getDeliveryOption()) ? 1 : 3);
            order.setDeliveryDate(deliveryDate.toString());

            // Generate a unique order ID and store the order
            String orderId = UUID.randomUUID().toString();
            orders.put(orderId, order);

            // Send the response with confirmation number and delivery date
            Map<String, String> responseMap = Map.of(
                "confirmationNumber", confirmationNumber,
                "deliveryDate", deliveryDate.toString()
            );

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write(new Gson().toJson(responseMap));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error processing order: " + e.getMessage());
            e.printStackTrace();
        }
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

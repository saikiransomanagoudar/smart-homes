package com.smarthomes;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@WebServlet("/orders")
public class OrderServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Enable CORS
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Content-Type", "application/json");

        // Retrieve orders from the saved data (this could be a file or database)
        List<Order> orders = getOrdersForUser(request);

        // Convert orders to JSON and send back to the client
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("orders", orders);
        response.getWriter().write(new Gson().toJson(responseData));
    }

    private List<Order> getOrdersForUser(HttpServletRequest request) {
        // Logic to retrieve orders for the user (e.g., from a file or database)
        // Here, you'd likely use the session or user ID to filter the orders
        HttpSession session = request.getSession();
        session.getId();  // Use session ID or user ID to get user-specific orders

        // Example dummy data
        List<Order> orders = new ArrayList<>();
        // Add code to fetch real data from file or database
        // Example Order: new Order("Product 1", 99.99, "12345", "2024-09-20", "pickup", "Store 1")
        return orders;
    }
}

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

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("username") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("User not logged in");
            return;
        }

        String username = (String) session.getAttribute("username");

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
        HttpSession session = request.getSession(false);
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

            order.setCustomerName(customerName);
            String confirmationNumber = UUID.randomUUID().toString();
            order.setConfirmationNumber(confirmationNumber);

            // Calculate delivery date and convert it to a String
            LocalDate deliveryDate = LocalDate.now().plusDays("pickup".equals(order.getDeliveryOption()) ? 1 : 3);
            order.setDeliveryDate(deliveryDate.toString()); // Convert LocalDate to String

            String orderId = UUID.randomUUID().toString();
            orders.put(orderId, order);

            Map<String, String> responseMap = Map.of(
                "confirmationNumber", confirmationNumber,
                "deliveryDate", deliveryDate.toString() // Send back as String
            );

            response.setContentType("application/json");
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
        String orderId = request.getPathInfo().substring(1);
        if (orders.remove(orderId) != null) {
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }
}

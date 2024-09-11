package com.smarthomes;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/checkout")
public class CheckoutServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Display checkout form
        response.setContentType("text/html");
        response.getWriter().println("<form action='/smarthomes/checkout' method='post'>"
            + "Name: <input type='text' name='name'><br>"
            + "Address: <input type='text' name='address'><br>"
            + "Credit Card: <input type='text' name='creditCard'><br>"
            + "Delivery Method: <select name='deliveryMethod'>"
            + "<option value='home'>Home Delivery</option>"
            + "<option value='store'>In-store Pickup</option>"
            + "</select><br>"
            + "<input type='submit' value='Submit Order'>"
            + "</form>");
    }

    @SuppressWarnings("unused")
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Process checkout information
        String name = request.getParameter("name");
        String address = request.getParameter("address");
        String creditCard = request.getParameter("creditCard");
        String deliveryMethod = request.getParameter("deliveryMethod");

        // Generate confirmation number and set pickup/delivery date (hardcoded)
        String confirmationNumber = "CONF" + System.currentTimeMillis();
        String deliveryDate = "2 weeks from now";

        // Display confirmation
        response.setContentType("text/html");
        response.getWriter().println("<h1>Order Confirmation</h1>");
        response.getWriter().println("<p>Confirmation Number: " + confirmationNumber + "</p>");
        response.getWriter().println("<p>Estimated Delivery/Pickup Date: " + deliveryDate + "</p>");
    }
}

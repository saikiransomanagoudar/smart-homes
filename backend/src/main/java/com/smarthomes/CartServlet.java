package com.smarthomes;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class CartServlet extends HttpServlet {
    
    @SuppressWarnings("unchecked")
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Get current session cart or create one
        HttpSession session = request.getSession();
        List<String> cart = (List<String>) session.getAttribute("cart");
        if (cart == null) {
            cart = new ArrayList<>();
            session.setAttribute("cart", cart);
        }
        
        response.setContentType("text/html");
        response.getWriter().println("<h1>Your Cart</h1>");
        for (String item : cart) {
            response.getWriter().println("<p>" + item + "</p>");
        }
    }

    @SuppressWarnings("unchecked")
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Add items to the shopping cart
        HttpSession session = request.getSession();
        List<String> cart = (List<String>) session.getAttribute("cart");
        if (cart == null) {
            cart = new ArrayList<>();
        }

        String productName = request.getParameter("productName");
        cart.add(productName);
        session.setAttribute("cart", cart);
        
        response.sendRedirect("/cart");
    }
}


package com.smarthomes;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.HashMap;

public class ProductServlet extends HttpServlet{
    private HashMap<String, Product> productCatalog;

    public void init() throws ServletException {
        // Initialize the product catalog (hardcode the initial product data)
        productCatalog = new HashMap<>();
        productCatalog.put("Smart Doorbell", new Product("Smart Doorbell", 199.99, "A smart doorbell with video"));
        productCatalog.put("Smart Speaker", new Product("Smart Speaker", 99.99, "A voice-activated smart speaker"));
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Display all products (For demo, output to console or HTML)
        response.setContentType("text/html");
        response.getWriter().println("<h1>Product List</h1>");
        for (String productName : productCatalog.keySet()) {
            response.getWriter().println("<p>" + productName + ": " + productCatalog.get(productName).getDescription() + " - $" + productCatalog.get(productName).getPrice() + "</p>");
        }
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Handle product creation, deletion, and updates (You can send form data for these)
        String action = request.getParameter("action");
        String productName = request.getParameter("name");
        String priceStr = request.getParameter("price");
        String description = request.getParameter("description");

        switch (action) {
            case "add":
                productCatalog.put(productName, new Product(productName, Double.parseDouble(priceStr), description));
                break;
            case "update":
                if (productCatalog.containsKey(productName)) {
                    productCatalog.put(productName, new Product(productName, Double.parseDouble(priceStr), description));
                }
                break;
            case "delete":
                productCatalog.remove(productName);
                break;
        }
        response.sendRedirect("/products");
    }
}

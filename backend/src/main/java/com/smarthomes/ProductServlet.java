package com.smarthomes;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/products")
public class ProductServlet extends HttpServlet {
    private Map<String, Product> productCatalog;

    @Override
    public void init() throws ServletException {
        // Initialize the product catalog with some products
        productCatalog = new HashMap<>();
        productCatalog.put("1", new Product("1", "Smart Doorbell", "199.99", "/images/smart-doorbell.jpg"));
        productCatalog.put("2", new Product("2", "Smart Speaker", "99.99", "/images/smart-speaker.jpg"));
        productCatalog.put("3", new Product("3", "Smart Doorlock", "149.99", "/images/smart-doorlock.jpg"));
        productCatalog.put("4", new Product("4", "Smart Lightings", "79.99", "/images/smart-lightings.jpg"));
        productCatalog.put("5", new Product("5", "Smart Thermostat", "249.99", "/images/smart-thermostat.jpg"));
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Display all products in the catalog in HTML format
        response.setContentType("text/html");
        response.getWriter().println("<h1>Product List</h1>");
        
        for (Product product : productCatalog.values()) {
            response.getWriter().println("<p><strong>" + product.name() + "</strong>: $" 
                + product.price() + " <img src='" + product.image() + "' alt='" 
                + product.name() + "' width='100'/></p>");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Handle product creation, deletion, and updates based on form action
        String action = request.getParameter("action");
        String id = request.getParameter("id");
        String name = request.getParameter("name");
        String price = request.getParameter("price");
        String image = request.getParameter("image");

        if (action != null && id != null && name != null && price != null && image != null) {
            switch (action.toLowerCase()) {
                case "add":
                    productCatalog.put(id, new Product(id, name, price, image));
                    break;
                case "update":
                    if (productCatalog.containsKey(id)) {
                        productCatalog.put(id, new Product(id, name, price, image));
                    }
                    break;
                case "delete":
                    productCatalog.remove(id);
                    break;
                default:
                    response.getWriter().println("Invalid action: " + action);
                    break;
            }
        } else {
            response.getWriter().println("Missing parameters!");
        }

        response.sendRedirect("/products");  // Redirect to the product list after operation
    }
}

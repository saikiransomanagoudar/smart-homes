package com.smarthomes;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import com.google.gson.Gson;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/cart")
public class CartServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @SuppressWarnings("unchecked")
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession();
        List<Product> cart = (List<Product>) session.getAttribute("cart");

        if (cart == null) {
            cart = new ArrayList<>();
        }

        // Convert the cart to JSON and send it to the frontend
        String jsonResponse = new Gson().toJson(cart);
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().write(jsonResponse);
    }

    @SuppressWarnings("unchecked")
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession();
        List<Product> cart = (List<Product>) session.getAttribute("cart");
    
        if (cart == null) {
            cart = new ArrayList<>();
        }
    
        // Retrieve product details from request parameters
        String productId = request.getParameter("id");
        String productName = request.getParameter("name");
        String productPrice = request.getParameter("price");
        String productImage = request.getParameter("image");
    
        // Convert productId to int
        int productIdInt = Integer.parseInt(productId);
    
        // Check if all required parameters are present
        if (productId == null || productName == null || productPrice == null || productImage == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\": \"Invalid product details\"}");
            return;
        }
    
        // Create a new Product object and add it to the cart
        Product newProduct = new Product(productIdInt, "SmartHomes", "doorbell", productName, productPrice, "Description placeholder", productImage, new ArrayList<>());
        cart.add(newProduct);
        session.setAttribute("cart", cart);
    
        // Respond with success message
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        response.getWriter().write("{\"message\": \"Product added to cart successfully\"}");
    }

    @SuppressWarnings("unchecked")
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession();
        List<Product> cart = (List<Product>) session.getAttribute("cart");

        String productId = request.getParameter("id");

        if (cart != null && productId != null) {
            int productIdInt = Integer.parseInt(productId);
            // Remove the product from the cart if it exists
            cart.removeIf(p -> p.id() == productIdInt);
            session.setAttribute("cart", cart);

            // Respond with success message
            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\": \"Product removed from cart successfully\"}");
        } else {
            // Respond with an error if the cart or productId is invalid
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\": \"Invalid request. No product found to delete.\"}");
        }
    }
}

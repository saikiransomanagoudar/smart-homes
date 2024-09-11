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
        String jsonResponse = new Gson().toJson(cart);
        response.setContentType("application/json");
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

        String productId = request.getParameter("id");
        String productName = request.getParameter("name");
        String productPrice = request.getParameter("price");
        String productImage = request.getParameter("image");

        Product newProduct = new Product(productId, productName, productPrice, productImage);
        cart.add(newProduct);

        session.setAttribute("cart", cart);
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
            cart.removeIf(p -> p.id().equals(productId));
            session.setAttribute("cart", cart);
        }

        response.setContentType("application/json");
        response.getWriter().write("{\"message\": \"Product removed from cart successfully\"}");
    }
}

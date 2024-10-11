package com.smarthomes;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.google.gson.Gson;

@WebServlet("/productDetails")
public class ProductDetailServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String productName = request.getParameter("name");  // Get product name from the request
        System.out.println("Product name received: " + productName);
        Product product = null;

        try (Connection conn = MySQLDataStoreUtilities.getConnection()) {
            String query = "SELECT id, name, price, description, image, category, quantity, onSale, hasRebate FROM Products WHERE name=?";
            try (PreparedStatement stmt = conn.prepareStatement(query)) {
                stmt.setString(1, productName);  // Set product name as query parameter
                ResultSet rs = stmt.executeQuery();
                if (rs.next()) {
                    // If product is found, populate product object with details
                    product = new Product();
                    product.setId(rs.getInt("id"));
                    product.setName(rs.getString("name"));
                    product.setPrice(rs.getDouble("price"));
                    product.setDescription(rs.getString("description"));
                    product.setImage(rs.getString("image")); // Assuming image is a URL or path
                    product.setCategory(rs.getString("category"));
                    product.setQuantity(rs.getInt("quantity"));
                    product.setOnSale(rs.getBoolean("onSale"));
                    product.setHasRebate(rs.getBoolean("hasRebate"));
                    System.out.println("Product found: " + product.getName());  // Debugging
                } else {
                    System.out.println("Product not found!");  // Debugging if no product is found
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        if (product == null) {
            System.out.println("No product found for name: " + productName);
        }
        
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        String json = new Gson().toJson(product);
        System.out.println("Sending response: " + json);  // Debugging
        out.print(json);
        out.flush();
        
    }
}

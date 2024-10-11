package com.smarthomes;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.google.gson.Gson;

@WebServlet("/autocomplete")
public class AjaxUtility extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private static HashMap<String, Product> productsMap = new HashMap<>();

    @Override
    public void init() throws ServletException {
        // Load products from the database into the hashmap when the server starts
        loadProductsFromDatabase();
    }

    // Handle CORS for preflight OPTIONS requests
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        enableCORS(response);
        response.setStatus(HttpServletResponse.SC_OK); // Send OK status
    }

    // Handle GET requests for auto-complete
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        enableCORS(response); // Ensure CORS headers are set for GET requests
        String searchKeyword = request.getParameter("query"); // Ensure 'query' matches frontend
        ArrayList<String> matchingProducts = new ArrayList<>();

        if (searchKeyword != null && !searchKeyword.isEmpty()) {
            for (String productName : productsMap.keySet()) {
                if (productName.toLowerCase().contains(searchKeyword.toLowerCase())) {
                    matchingProducts.add(productName);
                }
            }
        }

        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        String json = new Gson().toJson(matchingProducts);
        out.print(json);
        out.flush();
    }

    // Method to load products from the database
    private void loadProductsFromDatabase() {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = MySQLDataStoreUtilities.getConnection();
            String query = "SELECT id, name, price, description, category FROM Products";
            stmt = conn.prepareStatement(query);
            rs = stmt.executeQuery();

            while (rs.next()) {
                Product product = new Product();
                product.setId(rs.getInt("id"));
                product.setName(rs.getString("name"));
                product.setPrice(rs.getDouble("price"));
                product.setDescription(rs.getString("description"));
                product.setCategory(rs.getString("category"));

                productsMap.put(product.getName(), product); // Store products in hashmap
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // Close resources
            if (rs != null) {
                try {
                    rs.close();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            MySQLDataStoreUtilities.closePreparedStatement(stmt);
            MySQLDataStoreUtilities.closeConnection(conn);
        }
    }

    // Method to enable CORS headers
    private void enableCORS(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Allow requests from frontend
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Allowed methods
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization"); // Allowed headers
        response.setHeader("Access-Control-Allow-Credentials", "true"); // Allow credentials
    }
}

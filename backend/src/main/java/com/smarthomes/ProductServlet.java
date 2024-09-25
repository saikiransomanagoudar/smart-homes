package com.smarthomes;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/getProducts")
public class ProductServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        try {
            // Get the category from request parameter
            String category = request.getParameter("category");

            // Fetch products from the database
            List<Product> products = fetchProductsFromDatabase(category);

            // Convert products to JSON and send response
            String jsonResponse = new com.google.gson.Gson().toJson(products);
            out.print(jsonResponse);

        } catch (Exception e) {
            e.printStackTrace();
            out.print("{\"status\": \"error\", \"message\": \"Failed to load products.\"}");
        } finally {
            out.flush();
        }
    }

    // Fetch products from MySQL database
    private List<Product> fetchProductsFromDatabase(String category) throws SQLException {
        Connection conn = MySQLDataStoreUtilities.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<Product> products = new ArrayList<>();

        try {
            String query = "SELECT * FROM Products WHERE category = ?";
            ps = conn.prepareStatement(query);
            ps.setString(1, category);

            rs = ps.executeQuery();
            while (rs.next()) {
                Product product = new Product();
                product.setId(rs.getInt("id"));
                product.setName(rs.getString("name"));
                product.setPrice(rs.getDouble("price"));
                product.setDescription(rs.getString("description"));
                product.setImage(rs.getString("image"));
                product.setCategory(rs.getString("category"));

                // Fetch accessories for this product
                List<Product> accessories = fetchAccessoriesForProduct(product.getId());
                product.setAccessories(accessories);

                products.add(product);
            }
        } finally {
            MySQLDataStoreUtilities.closePreparedStatement(ps);
            MySQLDataStoreUtilities.closeConnection(conn);
        }

        return products;
    }

    // Fetch accessories for a given product
    private List<Product> fetchAccessoriesForProduct(int productId) throws SQLException {
        Connection conn = MySQLDataStoreUtilities.getConnection();
        PreparedStatement ps = null;
        ResultSet rs = null;
        List<Product> accessories = new ArrayList<>();

        try {
            String query = "SELECT a.id, a.name, a.price, a.image FROM Accessories a "
                    + "JOIN ProductAccessories pa ON a.id = pa.accessory_id WHERE pa.product_id = ?";
            ps = conn.prepareStatement(query);
            ps.setInt(1, productId);

            rs = ps.executeQuery();
            while (rs.next()) {
                Product accessory = new Product();
                accessory.setId(rs.getInt("id"));
                accessory.setName(rs.getString("name"));
                accessory.setPrice(rs.getDouble("price"));
                accessory.setImage(rs.getString("image"));
                accessory.setType("accessory");

                accessories.add(accessory);
            }
        } finally {
            MySQLDataStoreUtilities.closePreparedStatement(ps);
            MySQLDataStoreUtilities.closeConnection(conn);
        }

        return accessories;
    }
}

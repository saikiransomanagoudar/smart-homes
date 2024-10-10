package com.smarthomes;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Random;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.google.gson.Gson;

@WebServlet("/inventory")
public class InventoryServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            // MySQL database connection
            String url = "jdbc:mysql://localhost:3306/smarthomes";
            String user = "root";
            String password = "root";
            conn = DriverManager.getConnection(url, user, password);

            // Query to fetch products
            String sql = "SELECT id, name, price, retailer FROM Products"; 
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();

            ArrayList<Product> products = new ArrayList<>();
            Random random = new Random(); // Random generator for quantity, onSale, and hasRebate

            while (rs.next()) {
                Product product = new Product();
                product.setId(rs.getInt("id"));
                product.setName(rs.getString("name"));
                product.setPrice(rs.getDouble("price"));

                // Generate random values
                int randomQuantity = random.nextInt(50) + 1; // Random quantity between 1 and 50
                boolean randomOnSale = random.nextBoolean(); // Random onSale value (true/false)
                boolean randomHasRebate = random.nextBoolean(); // Random hasRebate value (true/false)

                product.setQuantity(randomQuantity);
                product.setOnSale(randomOnSale);
                product.setHasRebate(randomHasRebate);

                // Update the product in the database with random values for quantity, onSale, and hasRebate
                String updateSql = "UPDATE Products SET quantity = ?, onSale = ?, hasRebate = ? WHERE id = ?";
                PreparedStatement updateStmt = conn.prepareStatement(updateSql);
                updateStmt.setInt(1, randomQuantity);
                updateStmt.setBoolean(2, randomOnSale);
                updateStmt.setBoolean(3, randomHasRebate);
                updateStmt.setInt(4, product.getId());
                updateStmt.executeUpdate();

                products.add(product);
            }

            // Convert to JSON and send response
            String json = new Gson().toJson(products);
            out.print(json);
            out.flush();

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}

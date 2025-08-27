package com.smarthomes;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import com.google.gson.Gson;

@WebServlet(urlPatterns = { "/products/*" })
public class ProductManagementServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    // Enable CORS
    private void enableCORS(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Allow requests from frontend
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Allowed methods
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");
    }

    // Handle CORS preflight requests (OPTIONS method)
    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        enableCORS(response);
        response.setStatus(HttpServletResponse.SC_OK);
    }

    // Fetch all products
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        enableCORS(response); // Enable CORS for GET requests

        ArrayList<Product> products = new ArrayList<>();
        try (Connection conn = MySQLDataStoreUtilities.getConnection()) {
            String query = "SELECT * FROM Products";
            try (PreparedStatement stmt = conn.prepareStatement(query)) {
                ResultSet rs = stmt.executeQuery();
                while (rs.next()) {
                    Product product = new Product();
                    product.setId(rs.getInt("id"));
                    product.setName(rs.getString("name"));
                    product.setPrice(rs.getDouble("price"));
                    product.setDescription(rs.getString("description"));
                    product.setImage(rs.getString("image"));
                    product.setCategory(rs.getString("category"));
                    product.setQuantity(rs.getInt("quantity"));
                    product.setOnSale(rs.getBoolean("onSale"));
                    product.setHasRebate(rs.getBoolean("hasRebate"));
                    products.add(product);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        String json = new Gson().toJson(products);
        out.print(json);
        out.flush();
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        Gson gson = new Gson();
        Product newProduct = gson.fromJson(request.getReader(), Product.class);

        // Print the product for debugging
        System.out.println("Inserting Product: " + newProduct);

        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = MySQLDataStoreUtilities.getConnection(); // Establish database connection

            // Step 1: Find the maximum id in the Products table
            String maxIdQuery = "SELECT MAX(id) FROM Products";
            ps = conn.prepareStatement(maxIdQuery);
            rs = ps.executeQuery();
            int nextId = 1; // Default id if the table is empty
            if (rs.next()) {
                nextId = rs.getInt(1) + 1; // Increment the max id by 1
            }

            // Close the ResultSet and PreparedStatement for the maxIdQuery
            rs.close();
            ps.close();

            // Step 2: Insert the new product with the manually generated id
            String insertQuery = "INSERT INTO Products (id, name, price, description, image, category, retailer, quantity, onSale, hasRebate) "
                    +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            ps = conn.prepareStatement(insertQuery);

            // Set parameters
            ps.setInt(1, nextId); // Manually set the new id
            ps.setString(2, newProduct.getName());
            ps.setDouble(3, newProduct.getPrice());
            ps.setString(4, newProduct.getDescription());
            ps.setString(5, newProduct.getImage());
            ps.setString(6, newProduct.getCategory());
            ps.setString(7, "Smarthomes"); // Set default retailer to 'Smarthomes'
            ps.setInt(8, newProduct.getQuantity());
            ps.setBoolean(9, newProduct.isOnSale());
            ps.setBoolean(10, newProduct.isHasRebate());

            // Execute the insertion
            int rowsAffected = ps.executeUpdate();

            if (rowsAffected > 0) {
                response.setStatus(HttpServletResponse.SC_OK); // Success
                PrintWriter out = response.getWriter();
                String json = gson.toJson(newProduct); // Send inserted product back as JSON
                out.print(json);
                out.flush();
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); // Failed
            }

        } catch (SQLException e) {
            e.printStackTrace(); // Print the error stack trace
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); // 500 Error
        } finally {
            // Close resources
            MySQLDataStoreUtilities.closePreparedStatement(ps);
            MySQLDataStoreUtilities.closeConnection(conn);
        }
    }

    // Update product quantity
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        enableCORS(response); // Enable CORS for PUT requests

        String id = request.getPathInfo().substring(1); // Get product ID from URL

        try (Connection conn = MySQLDataStoreUtilities.getConnection()) {
            // Step 1: Fetch the current quantity of the product
            String selectQuery = "SELECT quantity FROM Products WHERE id = ?";
            int currentQuantity = 0;
            try (PreparedStatement selectStmt = conn.prepareStatement(selectQuery)) {
                selectStmt.setInt(1, Integer.parseInt(id));
                ResultSet rs = selectStmt.executeQuery();
                if (rs.next()) {
                    currentQuantity = rs.getInt("quantity"); // Get current quantity
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND); // Product not found
                    return;
                }
            }

            // Step 2: Increment the quantity by 1
            int newQuantity = currentQuantity + 1;

            // Step 3: Update the product with the new quantity
            String updateQuery = "UPDATE Products SET quantity = ? WHERE id = ?";
            try (PreparedStatement updateStmt = conn.prepareStatement(updateQuery)) {
                updateStmt.setInt(1, newQuantity);
                updateStmt.setInt(2, Integer.parseInt(id));
                int rowsAffected = updateStmt.executeUpdate(); // Returns the number of rows updated

                if (rowsAffected > 0) {
                    response.setStatus(HttpServletResponse.SC_OK); // Success
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND); // Product not found
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    // Delete product only if no associated orders exist
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        enableCORS(response); // Enable CORS for DELETE requests

        String id = request.getPathInfo().substring(1); // Get product ID from URL

        try (Connection conn = MySQLDataStoreUtilities.getConnection()) {
            // Step 1: Check if there are any orders associated with this product
            String checkOrdersQuery = "SELECT COUNT(*) AS order_count FROM Orders WHERE product_id = ?";
            try (PreparedStatement checkStmt = conn.prepareStatement(checkOrdersQuery)) {
                checkStmt.setInt(1, Integer.parseInt(id));
                ResultSet rs = checkStmt.executeQuery();
                if (rs.next() && rs.getInt("order_count") > 0) {
                    int orderCount = rs.getInt("order_count");
                    response.setStatus(HttpServletResponse.SC_CONFLICT); // HTTP 409 Conflict
                    response.getWriter()
                            .write("Cannot delete this product. It is associated with " + orderCount + " order(s).");
                    return;
                }
            }

            // Step 2: If no associated orders, proceed with deletion
            String query = "DELETE FROM Products WHERE id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(query)) {
                stmt.setInt(1, Integer.parseInt(id));
                int rowsAffected = stmt.executeUpdate();

                if (rowsAffected > 0) {
                    response.setStatus(HttpServletResponse.SC_NO_CONTENT); // Success
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND); // Product not found
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); // Error deleting product
        }
    }
}

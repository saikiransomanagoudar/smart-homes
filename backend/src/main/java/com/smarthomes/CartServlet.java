package com.smarthomes;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@WebServlet(urlPatterns = { "/cart", "/cart/product" })
public class CartServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        enableCORS(request, response);
        HttpSession session = request.getSession();
        int userId = getUserIdFromSession(session);

        BufferedReader reader = request.getReader();

        try {
            // Parse incoming CartItem from request body
            CartItem incomingItem = new Gson().fromJson(reader, CartItem.class);
            System.out.println("Product ID: " + incomingItem.getId());
            System.out.println("Received Type: " + incomingItem.getType());

            // Check if the cart already has the product or accessory
            int currentQuantity = getCartItemQuantity(userId, incomingItem.getId(), incomingItem.getType());

            if (currentQuantity > 0) {
                // Update the cart item quantity
                updateCartItemQuantity(userId, incomingItem.getId(),
                        currentQuantity + incomingItem.getQuantity(), incomingItem.getType());
            } else {
                // Insert new item into the cart
                insertCartItem(userId, incomingItem.getId(), incomingItem.getType(), incomingItem.getQuantity(), incomingItem.getImage());
            }

            // Send updated cart as JSON response
            List<CartItem> cart = getCartFromDB(userId);
            sendJsonResponse(response, cart);

        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(response, "Failed to add item to cart.");
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        enableCORS(request, response);
        HttpSession session = request.getSession();
        int userId = getUserIdFromSession(session);

        BufferedReader reader = request.getReader();

        try {
            CartItem incomingItem = new Gson().fromJson(reader, CartItem.class);

            if (incomingItem.getQuantity() > 0) {
                updateCartItemQuantity(userId, incomingItem.getId(), incomingItem.getQuantity(),
                        incomingItem.getType());
            } else if (incomingItem.getQuantity() == 0) {
                deleteCartItem(userId, incomingItem.getId(), incomingItem.getType());
            }

            List<CartItem> cart = getCartFromDB(userId);
            sendJsonResponse(response, cart);

        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(response, "Failed to update cart item.");
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        enableCORS(request, response);
        HttpSession session = request.getSession();
        int userId = getUserIdFromSession(session);

        // Retrieve the user's cart from the database
        List<CartItem> cart = getCartFromDB(userId);

        // Return the cart as JSON response
        sendJsonResponse(response, cart != null ? cart : new ArrayList<>());
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        enableCORS(request, response);
        HttpSession session = request.getSession();
        int userId = getUserIdFromSession(session);

        BufferedReader reader = request.getReader();

        try {
            CartItem incomingItem = new Gson().fromJson(reader, CartItem.class);
            deleteCartItem(userId, incomingItem.getId(), incomingItem.getType());

            List<CartItem> cart = getCartFromDB(userId);
            sendJsonResponse(response, cart);

        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(response, "Failed to delete cart item.");
        }
    }

    // Helper methods

    private int getUserIdFromSession(HttpSession session) {
        Object userIdAttr = session.getAttribute("userId");
        if (userIdAttr != null && userIdAttr instanceof Integer) {
            return (int) userIdAttr;
        }
        return -1;
    }

    private int getCartItemQuantity(int userId, int productId, String type) {
        String query = "SELECT quantity FROM cart WHERE user_id = ? AND product_id = ? AND type = ?";
        try (Connection conn = MySQLDataStoreUtilities.getConnection();
                PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, userId);
            ps.setInt(2, productId);
            ps.setString(3, type);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return rs.getInt("quantity");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    private void updateCartItemQuantity(int userId, int productId, int newQuantity, String type) {
        String query = "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ? AND type = ?";
        try (Connection conn = MySQLDataStoreUtilities.getConnection();
                PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, newQuantity);
            ps.setInt(2, userId);
            ps.setInt(3, productId);
            ps.setString(4, type);
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private void deleteCartItem(int userId, int productId, String type) {
        String query = "DELETE FROM cart WHERE user_id = ? AND product_id = ? AND type = ?";
        try (Connection conn = MySQLDataStoreUtilities.getConnection();
                PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, userId);
            ps.setInt(2, productId);
            ps.setString(3, type);
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private void insertCartItem(int userId, int productId, String type, int quantity, String image) {
        String query = "INSERT INTO cart (user_id, product_id, type, quantity, image) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = MySQLDataStoreUtilities.getConnection();
                PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, userId); // Set user_id
            ps.setInt(2, productId); // Set product_id (or accessory_id, depending on type)
            ps.setString(3, type); // Set type ('product' or 'accessory')
            ps.setInt(4, quantity); // Set the quantity
            ps.setString(5, image); // Set the image

            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private List<CartItem> getCartFromDB(int userId) {
        List<CartItem> cartItems = new ArrayList<>();
    
        // Use UNION to combine results for both products and accessories, including the image field
        String query = "SELECT c.product_id AS id, p.name AS name, p.price AS price, c.quantity AS quantity, 'product' AS type, p.image AS image "
                     + "FROM cart c "
                     + "JOIN Products p ON c.product_id = p.id "
                     + "WHERE c.user_id = ? AND c.type = 'product' "
                     + "UNION "
                     + "SELECT c.product_id AS id, a.name AS name, a.price AS price, c.quantity AS quantity, 'accessory' AS type, a.image AS image "
                     + "FROM cart c "
                     + "JOIN Accessories a ON c.product_id = a.id "
                     + "WHERE c.user_id = ? AND c.type = 'accessory'";
    
        try (Connection conn = MySQLDataStoreUtilities.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, userId); // Set the user_id for the first query
            ps.setInt(2, userId); // Set the user_id for the second query in UNION
    
            ResultSet rs = ps.executeQuery();
    
            while (rs.next()) {
                CartItem cartItem = new CartItem();
                cartItem.setId(rs.getInt("id"));
                cartItem.setName(rs.getString("name"));
                cartItem.setPrice(rs.getDouble("price"));
                cartItem.setQuantity(rs.getInt("quantity"));
                cartItem.setType(rs.getString("type"));
                cartItem.setImage(rs.getString("image")); // Set the image field
    
                cartItems.add(cartItem); // Add the item to the list
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    
        return cartItems;
    }
    

    private void sendJsonResponse(HttpServletResponse response, Object data) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(new Gson().toJson(data));
        response.getWriter().flush();
    }

    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"" + message + "\"}");
        response.getWriter().flush();
    }

    private void enableCORS(HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
        }
    }
}

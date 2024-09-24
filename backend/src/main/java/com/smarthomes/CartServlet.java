package com.smarthomes;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
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
        int userId = getUserIdFromSession(session); // Get user_id from session

        BufferedReader reader = request.getReader();

        try {
            // Parse incoming product from request body
            Product incomingProduct = new Gson().fromJson(reader, Product.class);

            // Load the full product details from ProductCatalog.xml using the product ID
            Product fullProduct = getProductById(incomingProduct.getId());
            if (fullProduct == null) {
                sendErrorResponse(response, "Product not found in catalog.");
                return;
            }

            // Add the selected product to the cart
            int currentQuantity = getCartItemQuantity(userId, fullProduct.getId());

            if (currentQuantity > 0) {
                // Update the cart item quantity
                updateCartItemQuantity(userId, fullProduct.getId(), currentQuantity + 1);
                System.out.println("Updated quantity for product " + fullProduct.getId() + " to " + (currentQuantity + 1));
            } else {
                // Insert new item into the cart
                insertCartItem(userId, fullProduct, incomingProduct.getQuantity());
                System.out.println("Inserted new item into cart: " + fullProduct.getId());
            }

            // Send updated cart as JSON response
            List<Product> cart = getCartFromDB(userId);
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
            Product incomingProduct = new Gson().fromJson(reader, Product.class);

            // Update the cart item quantity with the incoming quantity
            if (incomingProduct.getQuantity() > 0) {
                updateCartItemQuantity(userId, incomingProduct.getId(), incomingProduct.getQuantity());
                System.out.println("Updated quantity for product " + incomingProduct.getId() + " to " + incomingProduct.getQuantity());
            } else if (incomingProduct.getQuantity() == 0) {
                // Remove the item from the cart if the quantity becomes 0
                deleteCartItem(userId, incomingProduct.getId());
                System.out.println("Removed product " + incomingProduct.getId() + " from the cart.");
            }

            // Fetch the updated cart and return it as a response
            List<Product> cart = getCartFromDB(userId);
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
        int userId = getUserIdFromSession(session); // Ensure userId is fetched correctly

        // Retrieve the user's cart from the database
        List<Product> cart = getCartFromDB(userId);

        // Return the cart as JSON response
        sendJsonResponse(response, cart != null ? cart : new ArrayList<>());
    }

    // Helper methods

    private int getUserIdFromSession(HttpSession session) {
        Object userIdAttr = session.getAttribute("userId");
        if (userIdAttr != null && userIdAttr instanceof Integer) {
            return (int) userIdAttr;
        }
        return -1; // Return -1 if user ID is not found
    }

    private int getCartItemQuantity(int userId, int productId) {
        String query = "SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?";
        try (Connection conn = MySQLDataStoreUtilities.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, userId);
            ps.setInt(2, productId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return rs.getInt("quantity");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0; // Return 0 if no quantity found
    }

    private void updateCartItemQuantity(int userId, int productId, int newQuantity) {
        String query = "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?";
        try (Connection conn = MySQLDataStoreUtilities.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, newQuantity);
            ps.setInt(2, userId);
            ps.setInt(3, productId);
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private void deleteCartItem(int userId, int productId) {
        String query = "DELETE FROM cart WHERE user_id = ? AND product_id = ?";
        try (Connection conn = MySQLDataStoreUtilities.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, userId);
            ps.setInt(2, productId);
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private void insertCartItem(int userId, Product product, int quantity) {
        String query = "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)";
        try (Connection conn = MySQLDataStoreUtilities.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, userId);
            ps.setInt(2, product.getId());
            ps.setInt(3, quantity); // Use the quantity from incoming product
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private List<Product> getCartFromDB(int userId) {
        List<Product> cartItems = new ArrayList<>();
        String query = "SELECT product_id, quantity FROM cart WHERE user_id = ?";

        try (Connection conn = MySQLDataStoreUtilities.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                int productId = rs.getInt("product_id");
                int quantity = rs.getInt("quantity");

                Product product = getProductById(productId);
                if (product != null) {
                    product.setQuantity(quantity); // Update the quantity in the product object
                    cartItems.add(product);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return cartItems;
    }

    private Product getProductById(int productId) {
        try {
            SAXParserFactory factory = SAXParserFactory.newInstance();
            SAXParser saxParser = factory.newSAXParser();
            ProductSAXHandler handler = new ProductSAXHandler();

            InputStream xmlFile = getClass().getClassLoader().getResourceAsStream("ProductCatalog.xml");
            if (xmlFile == null) {
                System.out.println("ProductCatalog.xml not found.");
                return null;
            }

            saxParser.parse(xmlFile, handler);
            List<Product> products = handler.getProducts();

            for (Product product : products) {
                if (product.getId() == productId) {
                    return product;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
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

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
            List<Product> cart = getCartFromDB(userId);
            boolean productExists = false;

            // Check if the product already exists in the cart
            for (Product p : cart) {
                if (p.getId() == fullProduct.getId()) {
                    p.setQuantity(p.getQuantity() + incomingProduct.getQuantity());
                    updateCartItem(userId, p); // Update the cart item quantity in the database
                    productExists = true;
                    break;
                }
            }

            // If the product does not exist in the cart, insert it into the cart
            if (!productExists) {
                insertCartItem(userId, fullProduct); // Insert the product into the cart table
                cart.add(fullProduct);
            }

            sendJsonResponse(response, cart); // Send the updated cart as JSON

        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(response, "Failed to add item to cart.");
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        enableCORS(request, response);
        HttpSession session = request.getSession();
        int userId = getUserIdFromSession(session);

        // Retrieve the user's cart from the database
        List<Product> cart = getCartFromDB(userId);

        // Return the cart as a list of products (details will be pulled from
        // ProductCatalog.xml)
        sendJsonResponse(response, cart != null ? cart : new ArrayList<>());
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        enableCORS(request, response);
        HttpSession session = request.getSession();
        int userId = getUserIdFromSession(session); // Get user ID from session

        BufferedReader reader = request.getReader();

        try {
            // Parse the incoming product details
            Product incomingProduct = new Gson().fromJson(reader, Product.class);

            // Update the cart item quantity
            updateCartItem(userId, incomingProduct); // Update the product in the cart

            // Fetch the updated cart and return as response
            List<Product> cart = getCartFromDB(userId);
            sendJsonResponse(response, cart);
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(response, "Failed to update cart item.");
        }
    }

    // Helper methods

    private int getUserIdFromSession(HttpSession session) {
        // Get the user ID from the session attribute
        Object userIdAttr = session.getAttribute("userId");
        if (userIdAttr != null && userIdAttr instanceof Integer) {
            return (int) userIdAttr;
        }
        return -1; // Return -1 if user ID is not found or invalid
    }

    // Load product data from the XML file using ProductSAXHandler
    private Product getProductById(int productId) {
        try {
            // Initialize SAX parser to parse the ProductCatalog.xml
            SAXParserFactory factory = SAXParserFactory.newInstance();
            SAXParser saxParser = factory.newSAXParser();
            ProductSAXHandler handler = new ProductSAXHandler();

            // Load the ProductCatalog.xml from the resources
            InputStream xmlFile = getClass().getClassLoader().getResourceAsStream("ProductCatalog.xml");
            if (xmlFile == null) {
                System.out.println("ProductCatalog.xml not found in resources.");
                return null;
            }

            // Parse the XML file using the ProductSAXHandler
            saxParser.parse(xmlFile, handler);
            List<Product> products = handler.getProducts();

            // Search for the product by productId
            for (Product product : products) {
                if (product.getId() == productId) {
                    return product; // Return the matched product
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null; // Return null if the product is not found
    }

    // Fetch the user's cart from the database
    private List<Product> getCartFromDB(int userId) {
        List<Product> cartItems = new ArrayList<>();
        String query = "SELECT c.product_id, c.quantity FROM cart c WHERE c.user_id = ?";

        try (Connection conn = MySQLDataStoreUtilities.getConnection();
                PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                int productId = rs.getInt("product_id");
                int quantity = rs.getInt("quantity");

                // Load product details from ProductCatalog.xml
                Product product = getProductById(productId);
                if (product != null) {
                    product.setQuantity(quantity); // Set the cart quantity
                    cartItems.add(product);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return cartItems;
    }

    // Insert a product into the cart table
    private void insertCartItem(int userId, Product product) {
        String query = "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)";

        try (Connection conn = MySQLDataStoreUtilities.getConnection();
                PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, userId);
            ps.setInt(2, product.getId());
            ps.setInt(3, product.getQuantity());
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // Update the quantity of an existing cart item in the database
    private void updateCartItem(int userId, Product product) {
        String query = "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?";

        try (Connection conn = MySQLDataStoreUtilities.getConnection();
                PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, product.getQuantity());
            ps.setInt(2, userId);
            ps.setInt(3, product.getId());
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
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

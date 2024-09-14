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
import java.io.*;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/cart")
public class CartServlet extends HttpServlet {

    // Directory to store cart files
    private static final String CART_DIRECTORY = "C:/Users/saiki/smarthomes_data/";

    // List to store products loaded from the ProductCatalog.xml
    private List<Product> productCatalog = new ArrayList<>();

    @Override
    public void init() throws ServletException {
        // Load the products from ProductCatalog.xml during servlet initialization
        productCatalog = loadProductCatalog();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Add CORS headers
        enableCORS(request, response);

        HttpSession session = request.getSession();
        String userId = session.getId();
        System.out.println("User ID (POST): " + userId); // Log session/user ID

        try {
            BufferedReader reader = request.getReader();
            Product product = new Gson().fromJson(reader, Product.class);
            System.out.println("Product being added (POST): " + product); // Log the product being added

            // Validate product exists in the catalog
            if (!isProductInCatalog(product.getId())) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\": \"Product does not exist in the catalog.\"}");
                System.out.println("Product does not exist in catalog (POST): " + product.getId());
                return;
            }

            // Load user's cart from file
            List<Product> cart = loadCart(userId);
            System.out.println("Cart before adding product (POST): " + cart); // Log the cart before adding the product

            // Add or update product in the cart
            boolean productExists = false;
            for (Product p : cart) {
                if (p.getId() == product.getId()) {
                    cart.remove(p);
                    List<Accessory> updatedAccessories = new ArrayList<>(p.getAccessories());
                    updatedAccessories.addAll(product.getAccessories());
                    cart.add(new Product(p.getId(), p.getRetailer(), p.getCategory(), p.getNameP(), p.getPriceP(),
                            p.getDescription(), p.getImageP(), updatedAccessories));
                    productExists = true;
                    break;
                }
            }

            if (!productExists) {
                cart.add(product);
            }

            // Save the updated cart to the file
            saveCart(userId, cart);
            System.out.println("Cart after adding product (POST): " + cart); // Log the cart after adding the product

            // Return the updated cart as JSON
            response.setContentType("application/json");
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write(new Gson().toJson(cart));
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"Failed to add product to cart.\"}");
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Add CORS headers
        enableCORS(request, response);

        HttpSession session = request.getSession();
        String userId = session.getId();
        System.out.println("User ID (GET): " + userId); // Log session/user ID

        // Load the user's cart from the file
        List<Product> cart = loadCart(userId);
        System.out.println("Cart fetched (GET): " + cart); // Log the cart fetched

        // Return the cart as JSON
        response.setContentType("application/json");
        response.getWriter().write(new Gson().toJson(cart));
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Add CORS headers
        enableCORS(request, response);

        HttpSession session = request.getSession();
        String userId = session.getId();

        try {
            BufferedReader reader = request.getReader();
            Product[] updatedCart = new Gson().fromJson(reader, Product[].class); // Parse updated cart
            saveCart(userId, List.of(updatedCart)); // Save the updated cart
            response.setContentType("application/json");
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("{\"status\": \"success\"}");
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"Failed to update cart.\"}");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Add CORS headers
        enableCORS(request, response);

        HttpSession session = request.getSession();
        String userId = session.getId();

        // Parse the product to be removed
        BufferedReader reader = request.getReader();
        Product productToDelete = new Gson().fromJson(reader, Product.class);

        // Load user's cart from the file
        List<Product> cart = loadCart(userId);

        // Remove the product from the cart
        cart.removeIf(p -> p.getId() == productToDelete.getId());

        // Save the updated cart to the file
        saveCart(userId, cart);

        // Respond with the updated cart
        response.setContentType("application/json");
        response.getWriter().write(new Gson().toJson(cart));
    }

    // Helper method to add CORS headers
    private void enableCORS(HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Allow frontend origin
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Allow these methods
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true"); // Allow credentials (cookies)

        // Handle preflight (OPTIONS) requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
        }
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Enable CORS headers for preflight requests
        enableCORS(request, response);
        // Send OK response for OPTIONS requests
        response.setStatus(HttpServletResponse.SC_OK);
    }

    // Validate if the product is in the catalog
    private boolean isProductInCatalog(int productId) {
        for (Product p : productCatalog) {
            if (p.getId() == productId) {
                return true;
            }
        }
        return false;
    }

    // Load the products from ProductCatalog.xml using SAXParser
    private List<Product> loadProductCatalog() {
        List<Product> catalog = new ArrayList<>();
        try {
            // Get the SAX parser factory
            SAXParserFactory factory = SAXParserFactory.newInstance();
            SAXParser saxParser = factory.newSAXParser();

            // Create a handler for SAX parsing
            ProductSAXHandler handler = new ProductSAXHandler();

            // Parse the ProductCatalog.xml file
            InputStream inputFile = getClass().getClassLoader().getResourceAsStream("ProductCatalog.xml");
            if (inputFile == null) {
                throw new FileNotFoundException("ProductCatalog.xml file not found in resources folder.");
            }
            saxParser.parse(inputFile, handler);

            // Populate the catalog with parsed products
            catalog = handler.getProducts();

            System.out.println("Loaded product catalog with " + catalog.size() + " products.");

        } catch (Exception e) {
            e.printStackTrace();
        }
        return catalog;
    }

    // Method to load the cart from file
    @SuppressWarnings("unchecked")
    private List<Product> loadCart(String userId) {
        File cartFile = new File(CART_DIRECTORY + "cart_" + userId + ".txt");
        if (!cartFile.exists()) {
            System.out.println("Cart file not found, returning empty cart (LOAD): " + cartFile.getAbsolutePath());
            return new ArrayList<>(); // Return empty cart if file doesn't exist
        }

        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(cartFile))) {
            List<Product> cart = (List<Product>) ois.readObject();
            System.out.println("Cart loaded from file (LOAD): " + cart); // Log the cart loaded from file
            return cart;
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
            System.out.println("Error loading cart (LOAD), returning empty cart");
            return new ArrayList<>(); // Return empty cart in case of an error
        }
    }

    // Method to save the cart to a serialized file
    // Method to save the cart to a serialized file
    private void saveCart(String userId, List<Product> cart) {
        File directory = new File(CART_DIRECTORY);
        if (!directory.exists()) {
            boolean dirCreated = directory.mkdirs();
            if (!dirCreated) {
                System.err.println("Failed to create directory: " + CART_DIRECTORY);
                return;
            }
        }

        File cartFile = new File(CART_DIRECTORY + "cart_" + userId + ".txt"); // Always use the same file name for a
                                                                              // session

        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(cartFile))) {
            oos.writeObject(cart);
            System.out.println("Cart saved to file (SAVE): " + cart); // Log the cart saved to file
        } catch (IOException e) {
            e.printStackTrace();
            System.out.println("Error saving cart (SAVE)");
        }
    }
}

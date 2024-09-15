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

@WebServlet(urlPatterns = {"/cart", "/cart/product", "/cart/accessory"})
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

        enableCORS(request, response);
        HttpSession session = request.getSession();
        String userId = session.getId();
        BufferedReader reader = request.getReader();

        String path = request.getRequestURI();

        try {
            if (path.contains("/product")) {
                Product product = new Gson().fromJson(reader, Product.class);
                List<Product> cart = loadCart(userId);

                // Ensure the product exists in the catalog
                if (!isProductInCatalog(product.getId())) {
                    sendErrorResponse(response, "Product does not exist in the catalog.");
                    return;
                }

                boolean productExists = false;
                for (Product p : cart) {
                    if (p.getId() == product.getId()) {
                        p.setQuantity(p.getQuantity() + product.getQuantity());
                        productExists = true;
                        break;
                    }
                }

                if (!productExists) {
                    cart.add(product);
                }

                saveCart(userId, cart);

                // Return the updated cart
                sendJsonResponse(response, cart);

            } else if (path.contains("/accessory")) {
                Accessory accessory = new Gson().fromJson(reader, Accessory.class);
                List<Accessory> accessories = loadAccessories(userId);

                boolean accessoryExists = false;
                for (Accessory a : accessories) {
                    if (a.getNameA().equals(accessory.getNameA())) {
                        a.setQuantity(a.getQuantity() + accessory.getQuantity());
                        accessoryExists = true;
                        break;
                    }
                }

                if (!accessoryExists) {
                    accessories.add(accessory);
                }

                saveAccessories(userId, accessories);

                // Return the updated accessories
                sendJsonResponse(response, accessories);
            }
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
        String userId = session.getId();

        // Load the user's cart and accessories
        List<Product> cart = loadCart(userId);
        List<Accessory> accessories = loadAccessories(userId);

        CartResponse cartResponse = new CartResponse(
                cart != null ? cart : new ArrayList<>(),
                accessories != null ? accessories : new ArrayList<>());

        sendJsonResponse(response, cartResponse);
    }

    @Override
protected void doPut(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {

    enableCORS(request, response);  // Enable CORS headers for the request
    HttpSession session = request.getSession();  // Get user session
    String userId = session.getId();  // Get session ID as user ID
    BufferedReader reader = request.getReader();  // Read request data
    String path = request.getRequestURI();  // Extract the path to distinguish between products and accessories

    try {
        // Handle product update
        if (path.contains("/product")) {
            Product updatedProduct = new Gson().fromJson(reader, Product.class);  // Parse product from the request
            List<Product> cart = loadCart(userId);  // Load the user's cart

            boolean productUpdated = false;
            for (Product p : cart) {
                if (p.getId() == updatedProduct.getId()) {
                    p.setQuantity(updatedProduct.getQuantity());  // Update the quantity of the product
                    productUpdated = true;
                    break;
                }
            }

            if (!productUpdated) {
                cart.add(updatedProduct);  // If the product does not exist in the cart, add it
            }

            saveCart(userId, cart);  // Save the updated cart to the file
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(new Gson().toJson(cart));  // Send updated cart as JSON response
        }

        // Handle accessory update
        else if (path.contains("/accessory")) {
            Accessory updatedAccessory = new Gson().fromJson(reader, Accessory.class);  // Parse accessory from the request
            List<Accessory> accessories = loadAccessories(userId);  // Load the user's accessories

            boolean accessoryUpdated = false;
            for (Accessory a : accessories) {
                if (a.getNameA().equals(updatedAccessory.getNameA())) {
                    a.setQuantity(updatedAccessory.getQuantity());  // Update the quantity of the accessory
                    accessoryUpdated = true;
                    break;
                }
            }

            if (!accessoryUpdated) {
                accessories.add(updatedAccessory);  // If the accessory does not exist, add it
            }

            saveAccessories(userId, accessories);  // Save the updated accessories to the file
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(new Gson().toJson(accessories));  // Send updated accessories as JSON response
        }
    } catch (Exception e) {
        e.printStackTrace();
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"error\": \"Failed to update the cart.\"}");
    }
}

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        enableCORS(request, response);
        HttpSession session = request.getSession();
        String userId = session.getId();
        BufferedReader reader = request.getReader();

        String path = request.getRequestURI();

        if (path.contains("/product")) {
            Product productToRemove = new Gson().fromJson(reader, Product.class);
            List<Product> cart = loadCart(userId);

            cart.removeIf(p -> p.getId() == productToRemove.getId());
            saveCart(userId, cart);
            sendJsonResponse(response, cart);

        } else if (path.contains("/accessory")) {
            Accessory accessoryToRemove = new Gson().fromJson(reader, Accessory.class);
            List<Accessory> accessories = loadAccessories(userId);

            accessories.removeIf(a -> a.getNameA().equals(accessoryToRemove.getNameA()));
            saveAccessories(userId, accessories);
            sendJsonResponse(response, accessories);
        }
    }

    // Utility methods to send responses
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

    // Validate if the product or accessory is in the catalog
    private boolean isProductInCatalog(int productId) {
        for (Product p : productCatalog) {
            // Check if the product ID matches
            if (p.getId() == (productId)) {
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
    private void saveCart(String userId, List<Product> cart) {
        File directory = new File(CART_DIRECTORY);

        // Create the cart directory if it doesn't exist
        if (!directory.exists()) {
            boolean dirCreated = directory.mkdirs();
            if (!dirCreated) {
                System.err.println("Failed to create directory: " + CART_DIRECTORY);
                return;
            }
        }

        // Define the cart file path for the specific user
        File cartFile = new File(CART_DIRECTORY + "cart_" + userId + ".txt");

        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(cartFile))) {
            // Save the cart to the file
            oos.writeObject(cart);
            System.out.println("Cart saved to file (SAVE): " + cart); // Log the saved cart
        } catch (IOException e) {
            e.printStackTrace();
            System.out.println("Error saving cart (SAVE)");
        }
    }

    // Method to load accessories from the cart file
    @SuppressWarnings("unchecked")
    private List<Accessory> loadAccessories(String userId) {
        File accessoryFile = new File(CART_DIRECTORY + "accessories_" + userId + ".txt");
        if (!accessoryFile.exists()) {
            return new ArrayList<>(); // Return empty cart if file doesn't exist
        }

        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(accessoryFile))) {
            return (List<Accessory>) ois.readObject();
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    // Method to save accessories to a file
    private void saveAccessories(String userId, List<Accessory> accessories) {
        File directory = new File(CART_DIRECTORY);
        if (!directory.exists()) {
            boolean dirCreated = directory.mkdirs();
            if (!dirCreated) {
                System.err.println("Failed to create directory: " + CART_DIRECTORY);
                return;
            }
        }

        File accessoryFile = new File(CART_DIRECTORY + "accessories_" + userId + ".txt");

        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(accessoryFile))) {
            oos.writeObject(accessories);
            System.out.println("Accessories saved to file: " + accessories);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

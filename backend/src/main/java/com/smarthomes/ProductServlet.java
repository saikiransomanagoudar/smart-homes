package com.smarthomes;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import java.io.InputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@WebServlet("/getProducts")
public class ProductServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        enableCORS(request, response);
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        try {
            SAXParserFactory factory = SAXParserFactory.newInstance();
            SAXParser saxParser = factory.newSAXParser();

            // Use the same handler to parse both products and accessories
            ProductSAXHandler productHandler = new ProductSAXHandler();

            // Parse the single XML file that contains both products and accessories
            InputStream xmlFile = getClass().getClassLoader().getResourceAsStream("ProductCatalog.xml");
            if (xmlFile == null) {
                System.out.println("ProductCatalog.xml not found in the resources folder.");
                throw new IOException("Resource file not found");
            } else {
                System.out.println("ProductCatalog.xml successfully loaded.");
            }

            System.out.println("Starting to parse ProductCatalog.xml...");
            saxParser.parse(xmlFile, productHandler);
            System.out.println("XML parsing completed successfully.");

            // Get the parsed products and accessories
            List<Product> products = productHandler.getProducts();
            Map<Integer, Accessory> accessoryMap = productHandler.getAccessoryMap();  // Create accessory map

            // Map accessory references to actual accessories
            for (Product product : products) {
                List<Accessory> productAccessories = product.getAccessoryIds().stream()
                        .map(accessoryMap::get)  // Map each ID to an accessory
                        .collect(Collectors.toList());
                product.setAccessories(productAccessories);
            }

            // Filter products by category if the category parameter is provided
            String requestedCategory = request.getParameter("category");
            if (requestedCategory != null && !requestedCategory.isEmpty()) {
                System.out.println("Requested Category: " + requestedCategory); // Debug statement
                products = products.stream()
                        .filter(p -> p.getCategory().equalsIgnoreCase(requestedCategory))
                        .collect(Collectors.toList());
            }

            // Convert products to JSON response
            String jsonResponse = new com.google.gson.Gson().toJson(products);
            out.print(jsonResponse);

        } catch (Exception e) {
            e.printStackTrace();
            out.print("{\"status\": \"error\", \"message\": \"Failed to load products.\"}");
        } finally {
            out.flush();
        }
    }

    private void enableCORS(HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");
    }
}

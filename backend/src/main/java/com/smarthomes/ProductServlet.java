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
import java.util.stream.Collectors;

@WebServlet("/getProducts")
public class ProductServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Enable CORS for GET requests
        enableCORS(request, response);

        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        try {
            // Create SAXParser factory and instance
            SAXParserFactory factory = SAXParserFactory.newInstance();
            SAXParser saxParser = factory.newSAXParser();
            ProductSAXHandler handler = new ProductSAXHandler();

            // Load the XML file from the resources folder
            InputStream inputFile = getClass().getClassLoader().getResourceAsStream("ProductCatalog.xml");
            if (inputFile == null) {
                System.out.println("ProductCatalog.xml not found in the resources folder.");
                throw new IOException("Resource file not found");
            } else {
                System.out.println("ProductCatalog.xml successfully loaded.");
            }

            System.out.println("Starting to parse ProductCatalog.xml...");
            saxParser.parse(inputFile, handler);
            System.out.println("XML parsing completed successfully.");

            // Get the list of products from the handler
            List<Product> products = handler.getProducts();

            // Filter products by category if the category parameter is provided
            String requestedCategory = request.getParameter("category");
            if (requestedCategory != null && !requestedCategory.isEmpty()) {
                System.out.println("Requested Category: " + requestedCategory); // Debug statement
                products = products.stream()
                        .filter(p -> p.getCategory().equalsIgnoreCase(requestedCategory))
                        .collect(Collectors.toList());
            }

            // Convert the filtered products list to JSON
            String jsonResponse = convertToJson(products);
            out.print(jsonResponse);

        } catch (Exception e) {
            e.printStackTrace();
            out.print("{\"status\": \"error\", \"message\": \"Failed to load products.\"}");
        } finally {
            out.flush();
        }
    }

    // Method to convert the list of products to JSON format
    private String convertToJson(List<Product> products) {
        return new com.google.gson.Gson().toJson(products);
    }

    // Enable CORS for all methods
    private void enableCORS(HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Allow frontend origin
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Allow these methods
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization"); // Allow these headers
        response.setHeader("Access-Control-Allow-Credentials", "true"); // Allow credentials (cookies)
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        enableCORS(request, response);
        response.setStatus(HttpServletResponse.SC_OK); // Set status to OK for preflight request
    }
}

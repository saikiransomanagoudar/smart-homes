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
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        try {
            // Create SAXParser factory and instance
            SAXParserFactory factory = SAXParserFactory.newInstance();
            SAXParser saxParser = factory.newSAXParser();
            ProductSAXHandler handler = new ProductSAXHandler();

            // Load the XML file from the resources folder
            InputStream inputFile = getClass().getClassLoader().getResourceAsStream("productcategory.xml");
            if (inputFile == null) {
                throw new IOException("Resource file not found");
            }

            // Parse the XML file using the handler
            saxParser.parse(inputFile, handler);

            // Get the list of products from the handler
            List<Product> products = handler.getProducts();

            // Filter products by category if the category parameter is provided
            String requestedCategory = request.getParameter("category");
            if (requestedCategory != null && !requestedCategory.isEmpty()) {
                products = products.stream()
                        .filter(p -> p.category().equalsIgnoreCase(requestedCategory))
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
}

package com.smarthomes;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ProductSAXHandler extends DefaultHandler {

    private List<Product> products = null;
    private Product product = null;
    private StringBuilder data = null;

    // To store accessory references
    private List<Integer> accessoryRefs = null;

    // Getters
    public List<Product> getProducts() {
        return products;
    }

    @Override
    public void startDocument() throws SAXException {
        products = new ArrayList<>();
    }

    @Override
    public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException {
        if (qName.equalsIgnoreCase("doorbell") || qName.equalsIgnoreCase("doorlock") ||
                qName.equalsIgnoreCase("lighting") || qName.equalsIgnoreCase("speaker") ||
                qName.equalsIgnoreCase("thermostat")) {

            product = new Product();
            product.setType("product"); // Set type as product
            accessoryRefs = new ArrayList<>(); // Initialize accessory references list

            String idValue = attributes.getValue("id");
            if (idValue != null && !idValue.isEmpty()) {
                try {
                    product.setId(Integer.parseInt(idValue)); // Set product ID
                    System.out.println("Product ID: " + idValue); // Debugging
                } catch (NumberFormatException e) {
                    System.err.println("Invalid product ID: " + idValue);
                }
            }

            product.setCategory(attributes.getValue("category"));
            product.setRetailer(attributes.getValue("retailer"));

            // Debugging: Print category being processed
            System.out.println("Processing product with category: " + product.getCategory());

        } else if (qName.equalsIgnoreCase("accessoryRef")) {
            // Capture accessory references
            String accessoryId = attributes.getValue("id");
            if (accessoryId != null && !accessoryId.isEmpty()) {
                try {
                    int accessoryRefId = Integer.parseInt(accessoryId);
                    accessoryRefs.add(accessoryRefId); // Add accessory reference to the list
                    System.out.println("AccessoryRef ID: " + accessoryRefId); // Debugging
                } catch (NumberFormatException e) {
                    System.err.println("Invalid accessoryRef ID: " + accessoryId);
                }
            }
        }

        data = new StringBuilder();
    }

    @Override
    public void endElement(String uri, String localName, String qName) throws SAXException {
        if (product != null) {
            switch (qName) {
                case "nameP": // Product name
                case "nameA": // Accessory name
                    product.setName(data.toString());
                    break;
                case "priceP": // Product price
                case "priceA": // Accessory price
                    try {
                        product.setPrice(Double.parseDouble(data.toString()));
                    } catch (NumberFormatException e) {
                        System.err.println("Invalid price: " + data.toString());
                    }
                    break;
                case "description": // Product description
                    product.setDescription(data.toString());
                    break;
                case "imageP": // Product image
                case "imageA": // Accessory image
                    product.setImage(data.toString());
                    break;
                case "doorbell":
                case "doorlock":
                case "lighting":
                case "speaker":
                case "thermostat":
                    // Insert product into the database
                    if (!isProductInDatabase(product.getId())) {
                        insertProductIntoDatabase(); // relationships
                    }
                    insertProductAccessoryRelationship(product.getId(), accessoryRefs);
                    products.add(product);
                    product = null;
                    break;
            }
        }
    }

    @Override
    public void characters(char[] ch, int start, int length) throws SAXException {
        data.append(new String(ch, start, length));
    }

    // Check if product exists in the database before inserting
    private boolean isProductInDatabase(int productId) {
        Connection conn = MySQLDataStoreUtilities.getConnection();
        PreparedStatement ps = null;
        boolean exists = false;
        try {
            String query = "SELECT id FROM Products WHERE id = ?";
            ps = conn.prepareStatement(query);
            ps.setInt(1, productId);
            exists = ps.executeQuery().next();
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            MySQLDataStoreUtilities.closePreparedStatement(ps);
            MySQLDataStoreUtilities.closeConnection(conn);
        }
        return exists;
    }

    // Insert product into MySQL database
    private void insertProductIntoDatabase() {
        Connection conn = MySQLDataStoreUtilities.getConnection();
        PreparedStatement ps = null;
        try {
            // Insert product into Products table
            String query = "INSERT INTO Products (id, name, price, description, image, category, retailer) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?)";
            ps = conn.prepareStatement(query);
            ps.setInt(1, product.getId());
            ps.setString(2, product.getName());
            ps.setDouble(3, product.getPrice());
            ps.setString(4, product.getDescription());
            ps.setString(5, product.getImage());
            ps.setString(6, product.getCategory());
            ps.setString(7, product.getRetailer());

            ps.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            MySQLDataStoreUtilities.closePreparedStatement(ps);
            MySQLDataStoreUtilities.closeConnection(conn);
        }
    }

    // Check if product-accessory relationship exists in the database before inserting
    private boolean isProductAccessoryInDatabase(int productId, int accessoryId) {
        Connection conn = MySQLDataStoreUtilities.getConnection();
        PreparedStatement ps = null;
        boolean exists = false;
        try {
            String query = "SELECT * FROM ProductAccessories WHERE product_id = ? AND accessory_id = ?";
            ps = conn.prepareStatement(query);
            ps.setInt(1, productId);
            ps.setInt(2, accessoryId);
            exists = ps.executeQuery().next(); // Check if the relationship exists
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            MySQLDataStoreUtilities.closePreparedStatement(ps);
            MySQLDataStoreUtilities.closeConnection(conn);
        }
        return exists;
    }

    // Insert product-accessory relationships into ProductAccessories table
    private void insertProductAccessoryRelationship(int productId, List<Integer> accessoryIds) {
        if (accessoryIds == null || accessoryIds.isEmpty()) {
            System.out.println("No accessories found for Product ID: " + productId); // Debugging
            return; // No accessories to insert
        }

        System.out.println("Inserting accessories for Product ID: " + productId); // Debugging

        Connection conn = MySQLDataStoreUtilities.getConnection();
        PreparedStatement ps = null;
        try {
            String query = "INSERT INTO ProductAccessories (product_id, accessory_id) VALUES (?, ?)";
            ps = conn.prepareStatement(query);

            for (int accessoryId : accessoryIds) {
                // Check if the product-accessory relationship already exists
                if (!isProductAccessoryInDatabase(productId, accessoryId)) {
                    // Debugging: Print the product_id and accessory_id
                    System.out.println("Inserting into ProductAccessories - Product ID: " + productId
                            + ", Accessory ID: " + accessoryId);
                    ps.setInt(1, productId);
                    ps.setInt(2, accessoryId);
                    ps.addBatch(); // Add the query to batch for execution
                } else {
                    System.out.println("ProductAccessory relationship already exists for Product ID: " + productId
                            + ", Accessory ID: " + accessoryId);
                }
            }
            ps.executeBatch(); // Execute the batch of insertions

        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            MySQLDataStoreUtilities.closePreparedStatement(ps);
            MySQLDataStoreUtilities.closeConnection(conn);
        }
    }
}

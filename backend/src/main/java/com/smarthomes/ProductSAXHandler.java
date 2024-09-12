package com.smarthomes;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import java.util.ArrayList;
import java.util.List;

public class ProductSAXHandler extends DefaultHandler {

    // Temporary variables to hold the product data while parsing
    private int id;
    private String retailer;
    private String category;
    private String nameP;  // Product name
    private String priceP;  // Product price
    private String description;
    private String imageP;  // Product image
    private List<Accessory> accessories = new ArrayList<>();

    private Accessory currentAccessory;
    private StringBuilder content;

    private List<Product> products = new ArrayList<>();

    public List<Product> getProducts() {
        return products;
    }

    @Override
    public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException {
        content = new StringBuilder();

        // Check for the product tag
        if (qName.equals("doorbell") || qName.equals("doorlock") || qName.equals("lighting") || qName.equals("speaker") || qName.equals("thermostat")) {
            // Initialize product attributes from XML attributes
            id = Integer.parseInt(attributes.getValue("id"));
            retailer = attributes.getValue("retailer");
            category = attributes.getValue("category");  // Using category attribute from XML
            accessories = new ArrayList<>();  // Reset accessories list for the new product
        } else if (qName.equals("accessory")) {
            // Initialize a new accessory object
            currentAccessory = new Accessory(null, null, null);
        }
    }

    @Override
    public void endElement(String uri, String localName, String qName) throws SAXException {
        // Handle accessory fields
        if (currentAccessory != null) {
            if (qName.equals("nameA")) {  // Accessory name tag
                currentAccessory = new Accessory(content.toString(), currentAccessory.priceA(), currentAccessory.imageA());
            } else if (qName.equals("priceA")) {  // Accessory price tag
                currentAccessory = new Accessory(currentAccessory.nameA(), content.toString(), currentAccessory.imageA());
            } else if (qName.equals("imageA")) {  // Accessory image tag
                currentAccessory = new Accessory(currentAccessory.nameA(), currentAccessory.priceA(), content.toString());
            } else if (qName.equals("accessory")) {
                // Add the accessory to the current product's accessories list
                accessories.add(currentAccessory);
            }
        }

        // Handle product fields
        switch (qName) {
            case "nameP" -> nameP = content.toString();  // Product name tag
            case "priceP" -> priceP = content.toString();  // Product price tag
            case "description" -> description = content.toString();  // Product description remains the same
            case "imageP" -> {  // Product image tag
                imageP = content.toString();
                System.out.println("Parsed product image: " + imageP);
            }
            case "doorbell", "doorlock", "lighting", "speaker", "thermostat" -> {
                // Create the Product object and add it to the products list
                Product product = new Product(id, retailer, category, nameP, priceP, description, imageP, accessories);
                System.out.println("Parsed product: " + product);
                products.add(product);
            }
        }
    }

    @Override
    public void characters(char[] ch, int start, int length) throws SAXException {
        content.append(new String(ch, start, length));
    }
}

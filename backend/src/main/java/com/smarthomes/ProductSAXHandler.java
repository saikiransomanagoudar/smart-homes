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
    private String name;
    private String price;
    private String description;
    private String image;
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
        if (qName.equals("name") && currentAccessory != null) {
            currentAccessory = new Accessory(content.toString(), currentAccessory.price(), currentAccessory.image());
        } else if (qName.equals("price") && currentAccessory != null) {
            currentAccessory = new Accessory(currentAccessory.name(), content.toString(), currentAccessory.image());
        } else if (qName.equals("image") && currentAccessory != null) {
            currentAccessory = new Accessory(currentAccessory.name(), currentAccessory.price(), content.toString());
        } else if (qName.equals("accessory")) {
            accessories.add(currentAccessory);
        }

        // Handle product fields
        switch (qName) {
            case "name" -> name = content.toString();
            case "price" -> price = content.toString();
            case "description" -> description = content.toString();
            case "image" -> {
                image = content.toString();
                System.out.println("Parsed image: " + image);
            }
            case "doorbell", "doorlock", "lighting", "speaker", "thermostat" -> {
                // Create the Product record and add it to the list
                Product product = new Product(id, retailer, category, name, price, description, image, accessories);
                products.add(product);
            }
        }
    }

    @Override
    public void characters(char[] ch, int start, int length) throws SAXException {
        content.append(new String(ch, start, length));
    }
}
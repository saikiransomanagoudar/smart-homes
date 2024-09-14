package com.smarthomes;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import java.util.ArrayList;
import java.util.List;

public class ProductSAXHandler extends DefaultHandler {

    // Temporary variables to hold product data while parsing
    private int id;  // int for product id
    private String retailer;
    private String category;
    private String nameP;
    private double priceP;  // double for price
    private String description;
    private String imageP;
    private List<Accessory> accessories = new ArrayList<>();
    private int quantity = 1;  // Default quantity to 1

    private Accessory currentAccessory;
    private StringBuilder content;

    private List<Product> products = new ArrayList<>();

    public List<Product> getProducts() {
        return products;
    }

    @Override
    public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException {
        content = new StringBuilder();

        // Check for product tags (doorbell, doorlock, etc.)
        if (qName.equals("doorbell") || qName.equals("doorlock") || qName.equals("lighting") || qName.equals("speaker") || qName.equals("thermostat")) {
            id = Integer.parseInt(attributes.getValue("id"));  // Parse id as int
            retailer = attributes.getValue("retailer");
            category = attributes.getValue("category");
            quantity = 1;  // Default quantity when reading a new product
            accessories = new ArrayList<>();  // Reset accessories for each product
        } else if (qName.equals("accessory")) {
            currentAccessory = new Accessory(null, 0.0, null, 1);  // Default accessory quantity
        }
    }

    @Override
    public void endElement(String uri, String localName, String qName) throws SAXException {
        if (currentAccessory != null) {
            if (qName.equals("nameA")) {
                currentAccessory.setNameA(content.toString());
            } else if (qName.equals("priceA")) {
                currentAccessory.setPriceA(Double.parseDouble(content.toString()));
            } else if (qName.equals("imageA")) {
                currentAccessory.setImageA(content.toString());
            } else if (qName.equals("accessory")) {
                accessories.add(currentAccessory);
            }
        }

        switch (qName) {
            case "nameP":
                nameP = content.toString();
                break;
            case "priceP":
                priceP = Double.parseDouble(content.toString());  // Parse price as double
                break;
            case "description":
                description = content.toString();
                break;
            case "imageP":
                imageP = content.toString();
                break;
            case "doorbell":
            case "doorlock":
            case "lighting":
            case "speaker":
            case "thermostat":
                products.add(new Product(id, retailer, category, nameP, priceP, description, imageP, accessories, quantity));
                break;
        }
    }

    @Override
    public void characters(char[] ch, int start, int length) throws SAXException {
        content.append(new String(ch, start, length));
    }
}

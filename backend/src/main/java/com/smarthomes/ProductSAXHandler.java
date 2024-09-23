package com.smarthomes;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ProductSAXHandler extends DefaultHandler {

    private List<Product> products = null;
    private Product product = null;  // Common product object for both products and accessories
    private StringBuilder data = null;

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

        // Handle product elements (doorbell, doorlock, lighting, speaker, thermostat, accessory)
        if (qName.equalsIgnoreCase("doorbell") || qName.equalsIgnoreCase("doorlock") ||
            qName.equalsIgnoreCase("lighting") || qName.equalsIgnoreCase("speaker") ||
            qName.equalsIgnoreCase("thermostat") || qName.equalsIgnoreCase("accessory")) {

            product = new Product();
            String idValue = attributes.getValue("id");
            if (idValue != null && !idValue.isEmpty()) {
                try {
                    product.setId(Integer.parseInt(idValue));  // Set product/accessory ID
                    System.out.println("Product/Accessory ID: " + idValue);  // Debugging
                } catch (NumberFormatException e) {
                    System.err.println("Invalid product/accessory ID: " + idValue);
                }
            }

            product.setCategory(attributes.getValue("category"));
            product.setRetailer(attributes.getValue("retailer"));

            // Set type as accessory or product based on the XML element name
            if (qName.equalsIgnoreCase("accessory")) {
                product.setType("accessory");  // Set type as accessory
            } else {
                product.setType("product");  // Set type as product
            }
        }

        // Handle accessoryRef by extracting the id attribute
        if (qName.equalsIgnoreCase("accessoryRef")) {
            String accessoryRefId = attributes.getValue("id");
            if (accessoryRefId != null && !accessoryRefId.isEmpty()) {
                try {
                    product.addAccessoryId(Integer.parseInt(accessoryRefId));  // Add accessory ID reference
                    System.out.println("AccessoryRef added to Product ID " + product.getId() + ": " + accessoryRefId);  // Debugging
                } catch (NumberFormatException e) {
                    System.err.println("Invalid accessoryRef ID: " + accessoryRefId);
                }
            }
        }

        data = new StringBuilder();
    }

    @Override
    public void endElement(String uri, String localName, String qName) throws SAXException {
        if (product != null) {
            switch (qName) {
                case "nameP":  // For product names
                case "nameA":  // For accessory names
                    product.setName(data.toString());
                    break;
                case "priceP":  // For product prices
                case "priceA":  // For accessory prices
                    if (!data.toString().isEmpty()) {
                        try {
                            product.setPrice(Double.parseDouble(data.toString()));
                        } catch (NumberFormatException e) {
                            System.err.println("Invalid price: " + data.toString());
                        }
                    }
                    break;
                case "description":  // For product descriptions (accessories don't have descriptions)
                    product.setDescription(data.toString());
                    break;
                case "imageP":  // For product images
                case "imageA":  // For accessory images
                    product.setImage(data.toString());
                    break;
                case "doorbell":
                case "doorlock":
                case "lighting":
                case "speaker":
                case "thermostat":
                case "accessory":
                    // Now map accessory IDs to actual accessories if any
                    List<Product> productAccessories = product.getAccessoryIds().stream()
                        .map(id -> products.stream()
                            .filter(p -> p.getId() == id && p.getType().equals("accessory"))
                            .findFirst().orElse(null))
                        .filter(p -> p != null)  // Remove nulls
                        .collect(Collectors.toList());
                    product.setAccessories(productAccessories);  // Set accessories for the product
                    System.out.println("Product accessories mapped for Product ID " + product.getId() + ": " + productAccessories);  // Debugging
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
}

package com.smarthomes;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ProductSAXHandler extends DefaultHandler {

    private List<Product> products = null;
    private Map<Integer, Accessory> accessories = null; // Store accessories
    private Product product = null;
    private Accessory accessory = null;  // For accessory parsing
    private StringBuilder data = null;

    // Getters
    public List<Product> getProducts() {
        return products;
    }

    public Map<Integer, Accessory> getAccessoryMap() {
        return accessories;
    }

    @Override
    public void startDocument() throws SAXException {
        products = new ArrayList<>();
        accessories = new HashMap<>();
    }

    @Override
    public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException {
        // Handle accessory elements
        if (qName.equalsIgnoreCase("accessory")) {
            accessory = new Accessory();
            String idValue = attributes.getValue("id");
            if (idValue != null && !idValue.isEmpty()) {
                try {
                    accessory.setId(Integer.parseInt(idValue));  // Set accessory ID
                    System.out.println("Accessory ID: " + idValue);  // Debugging
                } catch (NumberFormatException e) {
                    System.err.println("Invalid accessory ID: " + idValue);
                }
            }
        }

        // Handle product elements (doorbell, doorlock, lighting, speaker, thermostat)
        if (qName.equalsIgnoreCase("doorbell") || qName.equalsIgnoreCase("doorlock") || qName.equalsIgnoreCase("lighting") || qName.equalsIgnoreCase("speaker") || qName.equalsIgnoreCase("thermostat")) {
            product = new Product();
            String idValue = attributes.getValue("id");
            if (idValue != null && !idValue.isEmpty()) {
                try {
                    product.setId(Integer.parseInt(idValue));  // Set product ID
                    System.out.println("Product ID: " + idValue);  // Debugging
                } catch (NumberFormatException e) {
                    System.err.println("Invalid product ID: " + idValue);
                }
            }
            product.setCategory(attributes.getValue("category"));
            product.setRetailer(attributes.getValue("retailer"));
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
        if (accessory != null) {
            switch (qName) {
                case "nameA":
                    accessory.setNameA(data.toString());
                    break;
                case "priceA":
                    if (!data.toString().isEmpty()) {
                        try {
                            accessory.setPriceA(Double.parseDouble(data.toString()));
                        } catch (NumberFormatException e) {
                            System.err.println("Invalid priceA: " + data.toString());
                        }
                    }
                    break;
                case "imageA":
                    accessory.setImageA(data.toString());
                    break;
                case "accessory":
                    // Add accessory to the map
                    accessories.put(accessory.getId(), accessory);
                    System.out.println("Accessory added: " + accessory);  // Debugging
                    accessory = null;
                    break;
            }
        }

        if (product != null) {
            switch (qName) {
                case "nameP":
                    product.setNameP(data.toString());
                    break;
                case "priceP":
                    if (!data.toString().isEmpty()) {
                        try {
                            product.setPriceP(Double.parseDouble(data.toString()));
                        } catch (NumberFormatException e) {
                            System.err.println("Invalid priceP: " + data.toString());
                        }
                    }
                    break;
                case "description":
                    product.setDescription(data.toString());
                    break;
                case "imageP":
                    product.setImageP(data.toString());
                    break;
                case "doorbell":
                case "doorlock":
                case "lighting":
                case "speaker":
                case "thermostat":
                    // Now map accessory IDs to actual Accessory objects and add them to the product
                    List<Accessory> productAccessories = product.getAccessoryIds().stream()
                        .map(accessories::get)  // Map IDs to Accessory objects
                        .filter(accessory -> accessory != null) // Avoid nulls in case of missing references
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

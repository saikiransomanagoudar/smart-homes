package com.smarthomes;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class Product implements Serializable {
    private static final long serialVersionUID = 1L;
    private int id;
    private String retailer;
    private String category;  // Use this to differentiate between products and accessories
    private String name;      // Unified name for both products and accessories (nameP or nameA)
    private double price;     // Unified price for both products and accessories (priceP or priceA)
    private String description;  // Optional: Products have description, accessories don't
    private String image;     // Unified image for both products and accessories (imageP or imageA)
    private List<Integer> accessoryIds;  // List of accessory IDs (if applicable)
    private List<Product> accessories;   // List of Product objects for accessories
    private int quantity;  // Quantity of the product or accessory
    private String type;  // Type of product or accessory (product or accessory)

    // No-argument constructor
    public Product() {
        this.accessoryIds = new ArrayList<>();  // Initialize the list of accessory IDs
        this.accessories = new ArrayList<>();  // Initialize the list of accessory objects
    }

    // Parameterized constructor
    public Product(int id, String retailer, String category, String name, double price, String description, String image, List<Integer> accessoryIds, int quantity, String type) {
        this.id = id;
        this.retailer = retailer;
        this.category = category;
        this.name = name;
        this.price = price;
        this.description = description;  // Products will have a description, accessories may leave it null
        this.image = image;
        this.accessoryIds = accessoryIds != null ? accessoryIds : new ArrayList<>();
        this.quantity = quantity;
        this.accessories = new ArrayList<>(); // Initialize an empty accessories list
        this.type = type;
    }

    // Getters and setters for accessories
    public List<Product> getAccessories() {
        return accessories;
    }

    public void setAccessories(List<Product> accessories) {
        this.accessories = accessories;
    }

    // Getters and setters for accessory IDs
    public List<Integer> getAccessoryIds() {
        return accessoryIds;
    }

    public void setAccessoryIds(List<Integer> accessoryIds) {
        this.accessoryIds = accessoryIds;
    }

    // Method to add a single accessory ID
    public void addAccessoryId(int accessoryId) {
        if (this.accessoryIds != null) {
            this.accessoryIds.add(accessoryId);
        }
    }

    // Other getters and setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getRetailer() {
        return retailer;
    }

    public void setRetailer(String retailer) {
        this.retailer = retailer;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    // Override toString to return a formatted string representation of Product
    @Override
    public String toString() {
        return "Product{" +
                "id=" + id +
                ", retailer='" + retailer + '\'' +
                ", category='" + category + '\'' +
                ", name='" + name + '\'' +
                ", price=" + price +
                ", description='" + description + '\'' +
                ", image='" + image + '\'' +
                ", accessoryIds=" + accessoryIds +
                ", accessories=" + accessories +
                ", quantity=" + quantity +
                ", type='" + type + '\'' +
                '}';
    }
}

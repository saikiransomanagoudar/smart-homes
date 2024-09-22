package com.smarthomes;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class Product implements Serializable {
    private static final long serialVersionUID = 1L;
    private int id;
    private String retailer;
    private String category;
    private String nameP;
    private double priceP;
    private String description;
    private String imageP;
    private List<Integer> accessoryIds;  // List of accessory IDs
    private List<Accessory> accessories; // List of Accessory objects
    private int quantity;  // Quantity of the product

    // No-argument constructor
    public Product() {
        this.accessoryIds = new ArrayList<>();  // Initialize the list of accessory IDs
        this.accessories = new ArrayList<>();  // Initialize the list of accessory objects
    }

    // Parameterized constructor
    public Product(int id, String retailer, String category, String nameP, double priceP, String description, String imageP, List<Integer> accessoryIds, int quantity) {
        this.id = id;
        this.retailer = retailer;
        this.category = category;
        this.nameP = nameP;
        this.priceP = priceP;
        this.description = description;
        this.imageP = imageP;
        this.accessoryIds = accessoryIds != null ? accessoryIds : new ArrayList<>();
        this.quantity = quantity;
        this.accessories = new ArrayList<>(); // Initialize an empty accessories list
    }

    // Getter and setter for accessories
    public List<Accessory> getAccessories() {
        return accessories;
    }

    public void setAccessories(List<Accessory> accessories) {
        this.accessories = accessories;
    }

    // Getter and setter for accessory IDs
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

    public String getNameP() {
        return nameP;
    }

    public void setNameP(String nameP) {
        this.nameP = nameP;
    }

    public double getPriceP() {
        return priceP;
    }

    public void setPriceP(double priceP) {
        this.priceP = priceP;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageP() {
        return imageP;
    }

    public void setImageP(String imageP) {
        this.imageP = imageP;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    // Override toString to return a formatted string representation of Product
    @Override
    public String toString() {
        return "Product{" +
                "id=" + id +
                ", retailer='" + retailer + '\'' +
                ", category='" + category + '\'' +
                ", nameP='" + nameP + '\'' +
                ", priceP=" + priceP +
                ", description='" + description + '\'' +
                ", imageP='" + imageP + '\'' +
                ", accessoryIds=" + accessoryIds +
                ", accessories=" + accessories +
                ", quantity=" + quantity +
                '}';
    }
}

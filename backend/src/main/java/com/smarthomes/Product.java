package com.smarthomes;

import java.io.Serializable;
import java.util.List;

public class Product implements Serializable {
    private static final long serialVersionUID = 1L;  // Add this to ensure version compatibility
    private String id;
    private String retailer;
    private String category;
    private String nameP;
    private String priceP;
    private String description;
    private String imageP;
    private List<Accessory> accessories;
    private int quantity;  // New field to track quantity of product

    // Constructor, getters, and setters
    public Product(String id, String retailer, String category, String nameP, String priceP, String description, String imageP, List<Accessory> accessories, int quantity) {
        this.id = id;
        this.retailer = retailer;
        this.category = category;
        this.nameP = nameP;
        this.priceP = priceP;
        this.description = description;
        this.imageP = imageP;
        this.accessories = accessories;
        this.quantity = quantity;  // Initialize quantity
    }

    // Getters and setters
    public String getId() { return id; }
    public String getRetailer() { return retailer; }
    public String getCategory() { return category; }
    public String getNameP() { return nameP; }
    public String getPriceP() { return priceP; }
    public String getDescription() { return description; }
    public String getImageP() { return imageP; }
    public List<Accessory> getAccessories() { return accessories; }
    public int getQuantity() { return quantity; }  // Getter for quantity

    public void setId(String id) { this.id = id; }
    public void setRetailer(String retailer) { this.retailer = retailer; }
    public void setCategory(String category) { this.category = category; }
    public void setNameP(String nameP) { this.nameP = nameP; }
    public void setPriceP(String priceP) { this.priceP = priceP; }
    public void setDescription(String description) { this.description = description; }
    public void setImageP(String imageP) { this.imageP = imageP; }
    public void setAccessories(List<Accessory> accessories) { this.accessories = accessories; }
    public void setQuantity(int quantity) { this.quantity = quantity; }  // Setter for quantity
}

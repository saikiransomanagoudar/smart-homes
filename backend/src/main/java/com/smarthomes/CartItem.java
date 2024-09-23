package com.smarthomes;

public class CartItem {
    private int productId;   // Unique ID for the product
    private String productName;     // Name of the product
    private double price;    // Price of the product
    private int quantity;    // Quantity of the product
    private String type;     // "product" or "accessory"
    private String category; // Category for the product (optional, but useful)

    // Default constructor
    public CartItem() {}

    // Constructor with parameters
    public CartItem(int productId, String productName, double price, int quantity, String type, String category) {
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.quantity = quantity;
        this.type = type;
        this.category = category;
    }

    // Getters and Setters
    public int getProductId() {
        return productId;
    }

    public void setProductId(int productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setName(String productName) {
        this.productName = productName;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}

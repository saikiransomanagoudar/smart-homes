package com.smarthomes;

import java.io.Serializable;

public class Orders implements Serializable {
    private int orderId;
    private int userId;
    private String customerName;
    private String customerAddress; // Shipping Address (Street, City, State, Zip)
    private String creditCardNo;
    private String confirmationNumber;
    private String purchaseDate;
    private String shipDate;

    private int productId;
    private String productName;
    private String category;
    private int quantity;
    private double price;
    private double shippingCost;
    private double discount;
    private double totalSales;

    private int storeId;
    private String storeAddress; // In-store pickup address
    private String deliveryOption; // pickup or delivery
    private String deliveryDate; // Delivery date

    // Constructors, getters, and setters for all fields
    public Orders(int orderId, int userId, String customerName, String customerAddress, String creditCardNo,
                  String confirmationNumber, String purchaseDate, String shipDate, int productId, String productName,
                  String category, int quantity, double price, double shippingCost, double discount, double totalSales,
                  int storeId, String storeAddress, String deliveryOption, String deliveryDate) {
        this.orderId = orderId;
        this.userId = userId;
        this.customerName = customerName;
        this.customerAddress = customerAddress;
        this.creditCardNo = creditCardNo;
        this.confirmationNumber = confirmationNumber;
        this.purchaseDate = purchaseDate;
        this.shipDate = shipDate;
        this.productId = productId;
        this.productName = productName;
        this.category = category;
        this.quantity = quantity;
        this.price = price;
        this.shippingCost = shippingCost;
        this.discount = discount;
        this.totalSales = totalSales;
        this.storeId = storeId;
        this.storeAddress = storeAddress;
        this.deliveryOption = deliveryOption;
        this.deliveryDate = deliveryDate;
    }

    // Add getter and setter methods for all fields.
    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerAddress() {
        return customerAddress;
    }
    
    public void setCustomerAddress(String customerAddress) {
        this.customerAddress = customerAddress;
    }

    public String getCreditCardNo() {
        return creditCardNo;
    }

    public void setCreditCardNo(String creditCardNo) {
        this.creditCardNo = creditCardNo;
    }

    public String getConfirmationNumber() {
        return confirmationNumber;
    }

    public void setConfirmationNumber(String confirmationNumber) {
        this.confirmationNumber = confirmationNumber;
    }

    public String getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(String purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public String getShipDate() {
        return shipDate;
    }

    public void setShipDate(String shipDate) {
        this.shipDate = shipDate;
    }

    public int getProductId() {
        return productId;
    }

    public void setProductId(int productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public double getShippingCost() {
        return shippingCost;
    }

    public void setShippingCost(double shippingCost) {
        this.shippingCost = shippingCost;
    }

    public double getDiscount() {
        return discount;
    }

    public void setDiscount(double discount) {
        this.discount = discount;
    }

    public double getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(double totalSales) {
        this.totalSales = totalSales;
    }

    public int getStoreId() {
        return storeId;
    }

    public void setStoreId(int storeId) {
        this.storeId = storeId;
    }

    public String getStoreAddress() {
        return storeAddress;
    }

    public void setStoreAddress(String storeAddress) {
        this.storeAddress = storeAddress;
    }

    public String getDeliveryOption() {
        return deliveryOption;
    }

    public void setDeliveryOption(String deliveryOption) {
        this.deliveryOption = deliveryOption;
    }

    public String getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(String deliveryDate) {
        this.deliveryDate = deliveryDate;
    }
}

package com.smarthomes;

import java.io.Serializable;

public class Orders implements Serializable {
    private int orderId;
    private String orderName;
    private double orderPrice;
    private String userAddress;
    private String creditCardNo;
    private String confirmationNumber;
    private String deliveryDate; // Changed LocalDate to String for easier serialization
    
    // New fields for product details
    private String productName;
    private double productPrice;
    private String productImage;
    private String productDescription;

    // Field for delivery option (pickup or home)
    private String deliveryOption;

    // Add customerName field
    private String customerName;

    public Orders(int orderId, String orderName, double orderPrice, String userAddress, String creditCardNo,
                 String confirmationNumber, String deliveryDate, String productName, double productPrice, 
                 String productImage, String productDescription, String deliveryOption, String customerName) {
        this.orderId = orderId;
        this.orderName = orderName;
        this.orderPrice = orderPrice;
        this.userAddress = userAddress;
        this.creditCardNo = creditCardNo;
        this.confirmationNumber = confirmationNumber;
        this.deliveryDate = deliveryDate;  // Assign delivery date correctly
        this.productName = productName;
        this.productPrice = productPrice;
        this.productImage = productImage;
        this.productDescription = productDescription;
        this.deliveryOption = deliveryOption;  // Initialize delivery option
        this.customerName = customerName;  // Initialize customer name
    }

    // Getters and Setters
    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }

    public String getOrderName() {
        return orderName;
    }

    public void setOrderName(String orderName) {
        this.orderName = orderName;
    }

    public double getOrderPrice() {
        return orderPrice;
    }

    public void setOrderPrice(double orderPrice) {
        this.orderPrice = orderPrice;
    }

    public String getUserAddress() {
        return userAddress;
    }

    public void setUserAddress(String userAddress) {
        this.userAddress = userAddress;
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

    public String getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(String deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public double getProductPrice() {
        return productPrice;
    }

    public void setProductPrice(double productPrice) {
        this.productPrice = productPrice;
    }

    public String getProductImage() {
        return productImage;
    }

    public void setProductImage(String productImage) {
        this.productImage = productImage;
    }

    public String getProductDescription() {
        return productDescription;
    }

    public void setProductDescription(String productDescription) {
        this.productDescription = productDescription;
    }

    public String getDeliveryOption() {
        return deliveryOption;
    }

    public void setDeliveryOption(String deliveryOption) {
        this.deliveryOption = deliveryOption;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
}

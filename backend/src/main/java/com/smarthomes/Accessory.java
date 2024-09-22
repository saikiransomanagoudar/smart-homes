package com.smarthomes;

import java.io.Serializable;

public class Accessory implements Serializable {

    private static final long serialVersionUID = 1L; // Serial version UID

    private int id; // Accessory ID
    private String nameA;
    private double priceA;
    private String imageA;
    private int quantity; // Quantity of the accessory

    // No-argument constructor
    public Accessory() {
        this.quantity = 1; // Set default quantity to 1
    }

    // Constructor with parameters
    public Accessory(int id, String nameA, double priceA, String imageA, int quantity) {
        this.id = id;
        this.nameA = nameA;
        this.priceA = priceA;
        this.imageA = imageA;
        this.quantity = quantity > 0 ? quantity : 1; // Ensure positive quantity, default to 1
    }

    // Getter and Setter methods for id
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    // Getter and Setter methods for nameA
    public String getNameA() {
        return nameA;
    }

    public void setNameA(String nameA) {
        this.nameA = nameA;
    }

    // Getter and Setter methods for priceA
    public double getPriceA() {
        return priceA;
    }

    public void setPriceA(double priceA) {
        this.priceA = priceA;
    }

    // Getter and Setter methods for imageA
    public String getImageA() {
        return imageA;
    }

    public void setImageA(String imageA) {
        this.imageA = imageA;
    }

    // Getter and Setter methods for quantity
    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        // Ensure the quantity is always at least 1
        this.quantity = quantity > 0 ? quantity : 1;
    }

    // Override toString to return a formatted string representation of Accessory
    @Override
    public String toString() {
        return "Accessory{" +
                "id=" + id +  // Include id in toString
                ", nameA='" + nameA + '\'' +
                ", priceA=" + priceA +
                ", imageA='" + imageA + '\'' +
                ", quantity=" + quantity +
                '}';
    }
}

package com.smarthomes;

import java.io.Serializable;

public class Accessory implements Serializable {

    private String nameA;
    private double priceA;
    private String imageA;
    private int quantity; // New quantity field

    // Constructor
    public Accessory(String nameA, double priceA, String imageA, int quantity) {
        this.nameA = nameA;
        this.priceA = priceA;
        this.imageA = imageA;
        this.quantity = quantity;
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
        this.quantity = quantity;
    }

    @Override
    public String toString() {
        return "Accessory{" +
                "nameA='" + nameA + '\'' +
                ", priceA='" + priceA + '\'' +
                ", imageA='" + imageA + '\'' +
                ", quantity=" + quantity +
                '}';
    }
}

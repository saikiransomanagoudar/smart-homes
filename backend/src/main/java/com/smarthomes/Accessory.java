package com.smarthomes;

import java.io.Serializable;

public class Accessory implements Serializable {
    private static final long serialVersionUID = 1L;  // Add this to ensure version compatibility
    private String nameA;
    private String priceA;
    private String imageA;

    // Constructor, getters, and setters
    public Accessory(String nameA, String priceA, String imageA) {
        this.nameA = nameA;
        this.priceA = priceA;
        this.imageA = imageA;
    }

    // Getters and setters
    public String getNameA() { return nameA; }
    public String getPriceA() { return priceA; }
    public String getImageA() { return imageA; }

    public void setNameA(String nameA) { this.nameA = nameA; }
    public void setPriceA(String priceA) { this.priceA = priceA; }
    public void setImageA(String imageA) { this.imageA = imageA; }
}

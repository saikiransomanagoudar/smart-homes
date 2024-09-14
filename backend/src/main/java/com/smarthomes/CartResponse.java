package com.smarthomes;

import java.io.Serializable;
import java.util.List;

public class CartResponse implements Serializable {
    private List<Product> products;
    private List<Accessory> accessories;

    // Constructor
    public CartResponse(List<Product> products, List<Accessory> accessories) {
        this.products = products;
        this.accessories = accessories;
    }

    // Getters
    public List<Product> getProducts() {
        return products;
    }

    public List<Accessory> getAccessories() {
        return accessories;
    }

    // Setters
    public void setProducts(List<Product> products) {
        this.products = products;
    }

    public void setAccessories(List<Accessory> accessories) {
        this.accessories = accessories;
    }
}


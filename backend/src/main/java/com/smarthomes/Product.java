package com.smarthomes;

import java.util.List;

public record Product(int id, String retailer, String category, String nameP, String priceP, String description, String imageP, List<Accessory> accessories) {
}

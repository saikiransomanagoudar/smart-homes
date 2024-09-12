package com.smarthomes;

import java.util.List;

public record Product(int id, String retailer, String category, String name, String price, String description, String image, List<Accessory> accessories) {
}

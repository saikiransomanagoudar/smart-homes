package com.smarthomes;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

public class MongoDBDataStoreUtilities {

    private static MongoClient mongoClient;
    private static MongoDatabase database;

    static {
        mongoClient = MongoClients.create("mongodb://localhost:27017"); // Make sure this matches your MongoDB configuration
        database = mongoClient.getDatabase("smarthomes"); // Database name is 'smarthomes'
    }

    public static void storeProductReview(String productName, String category, double price, String storeAddress, boolean productOnSale,
                                          boolean manufacturerRebate, String userId, int userAge, String userGender,
                                          String userOccupation, int reviewRating, String reviewDate, String reviewText) {
        // Get the 'reviews' collection
        MongoCollection<Document> reviewsCollection = database.getCollection("reviews");

        // Create a new review document
        Document review = new Document("productName", productName)
                .append("category", category)
                .append("price", price)
                .append("storeAddress", storeAddress)
                .append("productOnSale", productOnSale)
                .append("manufacturerRebate", manufacturerRebate)
                .append("userId", userId)
                .append("userAge", userAge)
                .append("userGender", userGender)
                .append("userOccupation", userOccupation)
                .append("reviewRating", reviewRating)
                .append("reviewDate", reviewDate)
                .append("reviewText", reviewText);

        // Insert the review into the collection
        reviewsCollection.insertOne(review);
    }
}

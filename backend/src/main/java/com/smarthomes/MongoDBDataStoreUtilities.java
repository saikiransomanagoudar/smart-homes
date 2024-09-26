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
        mongoClient = MongoClients.create("mongodb://localhost:27017");
        database = mongoClient.getDatabase("smarthomes");
    }

    // Method to store product review in MongoDB
    public static void storeProductReview(String productName, String category, double price, String storeId, String storeZip, 
                                          String storeCity, String storeState, boolean productOnSale, String manufacturerName, 
                                          boolean manufacturerRebate, String userId, int userAge, String userGender, String userOccupation, 
                                          int reviewRating, String reviewDate, String reviewText) {
        // Access the 'reviews' collection
        MongoCollection<Document> reviewsCollection = database.getCollection("reviews");

        // Create a new document with all the review fields
        Document review = new Document("productName", productName)
                .append("category", category)
                .append("price", price)
                .append("storeId", storeId)
                .append("storeZip", storeZip)
                .append("storeCity", storeCity)
                .append("storeState", storeState)
                .append("productOnSale", productOnSale)
                .append("manufacturerName", manufacturerName)
                .append("manufacturerRebate", manufacturerRebate)
                .append("userId", userId)
                .append("userAge", userAge)
                .append("userGender", userGender)
                .append("userOccupation", userOccupation)
                .append("reviewRating", reviewRating)
                .append("reviewDate", reviewDate)
                .append("reviewText", reviewText);

        // Insert the review document into the collection
        reviewsCollection.insertOne(review);
    }
}
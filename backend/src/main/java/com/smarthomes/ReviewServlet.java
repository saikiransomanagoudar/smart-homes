package com.smarthomes;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.Map;

@WebServlet("/api/review")  // This URL should match the POST request in your frontend
public class ReviewServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Read the request body
        BufferedReader reader = request.getReader();
        Gson gson = new Gson();
        
        // Parse the JSON from the request body into a Map
        @SuppressWarnings("unchecked")
        Map<String, Object> reviewData = gson.fromJson(reader, Map.class);

        // Extract individual fields from the reviewData Map
        String productName = (String) reviewData.get("productName");
        String category = (String) reviewData.get("category");
        double price = Double.parseDouble(reviewData.get("price").toString());
        String store_id = (String) reviewData.get("store_id");
        String zip_code = (String) reviewData.get("zip_code");
        String city = (String) reviewData.get("city");
        String state = (String) reviewData.get("state");
        boolean productOnSale = Boolean.parseBoolean(reviewData.get("productOnSale").toString());
        String manufacturerName = (String) reviewData.get("manufacturerName");
        boolean manufacturerRebate = Boolean.parseBoolean(reviewData.get("manufacturerRebate").toString());
        String userId = (String) reviewData.get("userId");
        int userAge = Integer.parseInt(reviewData.get("userAge").toString());
        String userGender = (String) reviewData.get("userGender");
        String userOccupation = (String) reviewData.get("userOccupation");
        int reviewRating = Integer.parseInt(reviewData.get("reviewRating").toString());
        String reviewDate = (String) reviewData.get("reviewDate");
        String reviewText = (String) reviewData.get("reviewText");

        // Store the review in MongoDB using MongoDBDataStoreUtilities
        MongoDBDataStoreUtilities.storeProductReview(productName, category, price, store_id, zip_code, city, state,
                productOnSale, manufacturerName, manufacturerRebate, userId, userAge, userGender, userOccupation, reviewRating, reviewDate, reviewText);

        // Respond with a success message
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().write("{\"message\":\"Review submitted successfully!\"}");
    }
}

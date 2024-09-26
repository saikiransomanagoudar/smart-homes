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

@WebServlet("/api/review")
public class ReviewServlet extends HttpServlet {

    @SuppressWarnings("unchecked")
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        enableCORS(request, response);

        // Parse the incoming request as JSON
        BufferedReader reader = request.getReader();
        Gson gson = new Gson();
        Map<String, Object> reviewData = gson.fromJson(reader, Map.class);

        try {
            // Extract and validate individual fields
            String productName = (String) reviewData.get("productName");
            String category = (String) reviewData.get("category");

            // Safely parse price
            double price = 0.0;
            if (reviewData.get("price") != null) {
                price = Double.parseDouble(reviewData.get("price").toString());
            }

            String storeAddress = (String) reviewData.get("storeAddress");
            boolean productOnSale = Boolean.parseBoolean(reviewData.get("productOnSale").toString());
            boolean manufacturerRebate = Boolean.parseBoolean(reviewData.get("manufacturerRebate").toString());
            String userId = (String) reviewData.get("userId");

            // Safely parse user age
            int userAge = 0;
            if (reviewData.get("userAge") != null) {
                userAge = Integer.parseInt(reviewData.get("userAge").toString());
            }

            String userGender = (String) reviewData.get("userGender");
            String userOccupation = (String) reviewData.get("userOccupation");

            // Safely parse review rating (1-5)
            int reviewRating = 0;
            if (reviewData.get("reviewRating") != null) {
                // Cast float-like strings (like "4.0") to integers
                reviewRating = (int) Double.parseDouble(reviewData.get("reviewRating").toString());

                // Ensure the rating is between 1 and 5
                if (reviewRating < 1 || reviewRating > 5) {
                    throw new IllegalArgumentException("Review rating must be between 1 and 5");
                }
            }

            String reviewDate = (String) reviewData.get("reviewDate");
            String reviewText = (String) reviewData.get("reviewText");

            // Store the review in MongoDB
            MongoDBDataStoreUtilities.storeProductReview(
                    productName, category, price, storeAddress,
                    productOnSale, manufacturerRebate, userId,
                    userAge, userGender, userOccupation, reviewRating,
                    reviewDate, reviewText);

            // Respond with success
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("{\"message\":\"Review submitted successfully\"}");

        } catch (NumberFormatException e) {
            // Handle number parsing issues
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"message\":\"Invalid number format: " + e.getMessage() + "\"}");
            e.printStackTrace();

        } catch (IllegalArgumentException e) {
            // Handle validation issues
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"message\":\"" + e.getMessage() + "\"}");
            e.printStackTrace();

        } catch (Exception e) {
            // Handle all other errors
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"message\":\"Error submitting review: " + e.getMessage() + "\"}");
            e.printStackTrace();
        }
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Handle CORS preflight (OPTIONS) request
        enableCORS(request, response);
        response.setStatus(HttpServletResponse.SC_OK);
    }

    private void enableCORS(HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");
    }
}

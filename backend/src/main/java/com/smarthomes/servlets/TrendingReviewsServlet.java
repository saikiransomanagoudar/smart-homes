package com.smarthomes;

import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import com.mongodb.client.model.Sorts;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/api/trending/reviews")
public class TrendingReviewsServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private Gson gson = new Gson();  // Use Gson for JSON serialization

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        enableCORS(req, resp);
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();
        List<JsonObject> topProductsList = new ArrayList<>();

        // Connect to MongoDB
        try (MongoClient mongoClient = MongoClients.create("mongodb://localhost:27017")) {
            MongoDatabase database = mongoClient.getDatabase("smarthomes");
            MongoCollection<Document> collection = database.getCollection("reviews");

            // Fetch top 5 products sorted by reviewRating in descending order
            List<Document> topProducts = collection.find()
                .sort(Sorts.descending("reviewRating"))
                .limit(5)
                .into(new ArrayList<>());

            // Convert MongoDB Documents to JSON
            for (Document product : topProducts) {
                JsonObject productJson = new JsonObject();
                productJson.addProperty("productName", product.getString("productName"));
                productJson.addProperty("reviewRating", product.getInteger("reviewRating"));
                productJson.addProperty("reviewText", product.getString("reviewText"));
                topProductsList.add(productJson);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Use Gson to convert the list to a JSON string
        String jsonResponse = gson.toJson(topProductsList);
        out.print(jsonResponse);
        out.flush();
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Handle CORS preflight (OPTIONS) request
        enableCORS(request, response);
        response.setStatus(HttpServletResponse.SC_OK);
    }

    private void enableCORS(HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Allow frontend origin
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Allow these methods
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true"); // Allow credentials (cookies)
    }
}

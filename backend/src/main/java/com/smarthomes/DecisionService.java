package com.smarthomes;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.MediaType;
import okhttp3.Response;

import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import com.google.gson.JsonParser;

import java.io.IOException;

public class DecisionService {
    private static final String API_KEY = System.getenv("OPENAI_API_KEY");
    private static final String API_URL = "https://api.openai.com/v1/chat/completions";

    public String getDecision(String description, String imagePath) throws IOException {
        OkHttpClient client = new OkHttpClient();

        JsonObject message = new JsonObject();
        message.addProperty("role", "user");
        message.addProperty("content", String.format(
            "You are an intelligent support assistant. Based on the provided image located at '%s' and the following description, analyze the product's level of damage and choose the most appropriate action from the options below. " +
            "Respond with only one of these options: 'Replace Order', 'Refund Order', or 'Escalate to Human Agent'.\n\n" +
            "1. **Replace Order**: Choose if the damage is significant but repairable, or if a replacement will likely satisfy the customer.\n" +
            "2. **Refund Order**: Choose if the damage is severe, irreparable, or if the customer is unlikely to accept a replacement.\n" +
            "3. **Escalate to Human Agent**: Choose if the damage is ambiguous, complex, or requires further investigation beyond automated support.\n\n" +
            "Description: %s\n\nPlease provide your response as one of the options only: 'Replace Order', 'Refund Order', or 'Escalate to Human Agent'.",
            imagePath, description
        ));

        JsonArray messages = new JsonArray();
        messages.add(message);

        // Prepare the request payload
        JsonObject payload = new JsonObject();
        payload.addProperty("model", "gpt-4o-mini");
        payload.add("messages", messages);
        payload.addProperty("max_tokens", 50);
        payload.addProperty("temperature", 0.5);

        RequestBody body = RequestBody.create(payload.toString(), MediaType.get("application/json; charset=utf-8"));
        Request request = new Request.Builder()
            .url(API_URL)
            .post(body)
            .addHeader("Authorization", "Bearer " + API_KEY)
            .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected code " + response);
            }

            String responseBody = response.body().string();
            JsonObject jsonResponse = JsonParser.parseString(responseBody).getAsJsonObject();
            JsonArray choices = jsonResponse.getAsJsonArray("choices");
            String decision = choices.get(0).getAsJsonObject().get("message").getAsJsonObject().get("content").getAsString().trim();

            return decision;
        }
    }
}

package com.smarthomes;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.MediaType;
import okhttp3.Response;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import io.github.cdimascio.dotenv.Dotenv;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class DecisionService {
    private static final Dotenv dotenv = Dotenv.configure().load();
    private static final String API_KEY = dotenv.get("OPENAI_API_KEY");
    private static final String API_URL = "https://api.openai.com/v1/chat/completions";
    private static final OkHttpClient client = new OkHttpClient();

    public Map<String, String> analyzeImageAndDecide(String imageBase64, String description, String ticketNumber) throws IOException {
        Map<String, String> decisionMap = new HashMap<>();
        int maxRetries = 3;
        int retryCount = 0;
        int backoff = 1000;

        // Construct payload
        JsonObject payload = new JsonObject();
        payload.addProperty("model", "gpt-3.5-turbo");

        JsonArray messages = new JsonArray();
        JsonObject messageContent = new JsonObject();
        messageContent.addProperty("role", "user");
        messageContent.addProperty("content", "You are a customer service assistant for a delivery service, equipped to analyze images of packages. "
                + "If a package appears damaged in the image, automatically process a refund according to policy. "
                + "If the package looks wet, initiate a replacement. "
                + "If the package appears normal and not damaged, escalate to agent. "
                + "For any other issues or unclear images, escalate to agent.");

        JsonObject imageMessage = new JsonObject();
        imageMessage.addProperty("role", "user");
        imageMessage.addProperty("content", "data:image/jpeg;base64," + imageBase64);

        messages.add(messageContent);
        messages.add(imageMessage);
        payload.add("messages", messages);

        JsonArray functions = new JsonArray();
        functions.add(createFunctionObject("refund_order", "Refund an order"));
        functions.add(createFunctionObject("replace_order", "Replace an order"));
        functions.add(createFunctionObject("escalate_to_agent", "Escalate to an agent"));
        payload.add("functions", functions);
        payload.addProperty("function_call", "auto");
        payload.addProperty("temperature", 0.0);

        System.out.println("Constructed Payload: " + payload.toString());

        // Start retry logic
        while (retryCount < maxRetries) {
            RequestBody body = RequestBody.create(payload.toString(), MediaType.get("application/json; charset=utf-8"));
            Request request = new Request.Builder()
                    .url(API_URL)
                    .post(body)
                    .addHeader("Authorization", "Bearer " + API_KEY)
                    .build();

            try (Response response = client.newCall(request).execute()) {
                if (response.isSuccessful()) {
                    String responseBody = response.body().string();
                    System.out.println("Response Body: " + responseBody);
                    JsonObject jsonResponse = JsonParser.parseString(responseBody).getAsJsonObject();
                    
                    JsonObject choice = jsonResponse.getAsJsonArray("choices").get(0).getAsJsonObject();
                    JsonObject message = choice.has("message") ? choice.getAsJsonObject("message") : null;
                    JsonObject functionCall = (message != null && message.has("function_call")) ? message.getAsJsonObject("function_call") : null;

                    if (functionCall == null) {
                        decisionMap.put("Error", "Function call data not found in response.");
                        return decisionMap;
                    }

                    String action = functionCall.get("name").getAsString();
                    JsonObject arguments = JsonParser.parseString(functionCall.get("arguments").getAsString()).getAsJsonObject();

                    decisionMap.put("Action", action);
                    decisionMap.put("Rationale", formatWithPeriod(arguments.get("rationale").getAsString()));
                    decisionMap.put("Image Description", formatWithPeriod(arguments.get("image_description").getAsString()));
                    
                    String actionResult;
                    if ("refund_order".equals(action)) {
                        actionResult = "Refund processed for ticket " + ticketNumber + ".";
                    } else if ("replace_order".equals(action)) {
                        actionResult = "Replacement processed for ticket " + ticketNumber + ".";
                    } else {
                        actionResult = "Escalated to human agent for ticket " + ticketNumber + ".";
                    }
                    decisionMap.put("Action Result", actionResult);

                    return decisionMap;
                } else if (response.code() == 429) {
                    // Handle rate limiting with exponential backoff
                    System.out.println("Rate limit exceeded. Retrying after " + backoff + "ms...");
                    Thread.sleep(backoff);
                    retryCount++;
                    backoff *= 2;
                } else {
                    throw new IOException("Unexpected response code: " + response);
                }
            } catch (IOException | InterruptedException e) {
                e.printStackTrace();
                decisionMap.put("Error", "Error processing response: " + e.getMessage());
                return decisionMap;
            }
        }

        decisionMap.put("Error", "Max retry attempts reached. Request failed.");
        return decisionMap;
    }

    private String formatWithPeriod(String text) {
        if (text != null && !text.trim().endsWith(".")) {
            return text.trim() + ".";
        }
        return text;
    }

    private JsonObject createFunctionObject(String name, String description) {
        JsonObject function = new JsonObject();
        function.addProperty("name", name);
        function.addProperty("description", description);

        JsonObject parameters = new JsonObject();
        parameters.addProperty("type", "object");

        JsonObject properties = new JsonObject();
        properties.add("rationale", createPropertyObject("string"));
        properties.add("image_description", createPropertyObject("string"));
        if (name.equals("escalate_to_agent")) {
            properties.add("message", createPropertyObject("string"));
        }

        parameters.add("properties", properties);
        function.add("parameters", parameters);

        return function;
    }

    private JsonObject createPropertyObject(String type) {
        JsonObject property = new JsonObject();
        property.addProperty("type", type);
        return property;
    }
}

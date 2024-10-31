package com.smarthomes;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.MediaType;
import okhttp3.Response;
import java.util.concurrent.TimeUnit;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import io.github.cdimascio.dotenv.Dotenv;
import net.coobird.thumbnailator.Thumbnails;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

public class DecisionService {
    private static final Dotenv dotenv = Dotenv.configure().load();
    private static final String API_KEY = dotenv.get("OPENAI_API_KEY");
    private static final String API_URL = "https://api.openai.com/v1/chat/completions";
    private static final OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build();


    public Map<String, String> analyzeImageAndDecide(InputStream imageInputStream, String description, String ticketNumber) throws IOException {
        Map<String, String> decisionMap = new HashMap<>();
        int maxRetries = 3;
        int retryCount = 0;
        int backoff = 1000;

        // Resize and encode image
        String imageBase64 = imageInputStream != null ? Base64.getEncoder().encodeToString(imageInputStream.readAllBytes()) : null;

        // Construct payload
        JsonObject payload = constructPayload(imageBase64);

        System.out.println("Constructed Payload: " + payload.toString());

        // Retry logic
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
                    processResponse(responseBody, decisionMap, ticketNumber);
                    return decisionMap;
                } else if (response.code() == 429) {
                    System.out.println("Rate limit exceeded. Retrying after " + backoff + "ms...");
                    Thread.sleep(backoff);
                    retryCount++;
                    backoff *= 2;
                } else {
                    System.out.println("Error Response Code: " + response.code());
                    System.out.println("Error Response Body: " + response.body().string());
                    decisionMap.put("Error", "Unexpected response code: " + response.code());
                    return decisionMap;
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

    // private String resizeAndEncodeImage(InputStream imageInputStream) throws IOException {
    //     ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    //     Thumbnails.of(imageInputStream)
    //             .size(500, 500)
    //             .outputFormat("jpg")
    //             .toOutputStream(outputStream);
    //     byte[] resizedImageBytes = outputStream.toByteArray();
    //     return Base64.getEncoder().encodeToString(resizedImageBytes);
    // }

    // Method to construct the payload for OpenAI API
    private JsonObject constructPayload(String imageBase64) {
        JsonObject payload = new JsonObject();
        payload.addProperty("model", "gpt-4o-mini");

        JsonArray messages = new JsonArray();
        JsonObject messageContent = new JsonObject();
        messageContent.addProperty("role", "user");
        String instructionPrompt = "You are a customer service assistant for a delivery service. Analyze images of packages and follow the instructions below to determine the correct action. " +
            "Instructions: " +
            "1. If you see clear structural damage to the package (such as deep dents, large tears, holes, or crushed areas that affect the package's shape), respond with 'refund_order' and provide a detailed description of the damage observed. " +
            "2. If the package appears wet, cracked, or has any sign that the contents inside might be compromised (e.g., leakage), respond with 'replace_order' and explain the specific issue observed. " +
            "3. If the package contains visible labels, text, tape, or minor surface markings but has no physical damage to its structure (meaning no dents, tears, holes, or crushed areas), respond with 'escalate_to_agent' and state that the package appears normal and undamaged. " +
            "4. If the package looks completely intact with no signs of damage or compromise, respond with 'escalate_to_agent' and mention that the package appears normal and undamaged. " +
            "5. For unclear images, images that only partially show the package, or if you are unsure about the condition of the package, respond with 'escalate_to_agent' for further human review. " +
            "Only structural damage should trigger 'refund_order,' while all normal or unclear conditions should be escalated. Be precise in your assessment and provide a clear, concise rationale for each decision.";

        messageContent.addProperty("content", instructionPrompt);

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

        return payload;
    }

    private void processResponse(String responseBody, Map<String, String> decisionMap, String ticketNumber) {
        JsonObject jsonResponse = JsonParser.parseString(responseBody).getAsJsonObject();
        JsonObject choice = jsonResponse.getAsJsonArray("choices").get(0).getAsJsonObject();
        JsonObject message = choice.has("message") ? choice.getAsJsonObject("message") : null;

        if (message != null) {
            // Check if `content` is available
            if (message.has("content") && !message.get("content").isJsonNull()) {
                // Use `content` field for non-structured responses
                String content = message.get("content").getAsString();
                decisionMap.put("Action Result", content);
            } else if (message.has("function_call") && !message.get("function_call").isJsonNull()) {
                // Use `function_call` when structured data is available
                JsonObject functionCall = message.getAsJsonObject("function_call");
                String action = functionCall.has("name") ? functionCall.get("name").getAsString() : "No action provided";
                JsonObject arguments = functionCall.has("arguments") && !functionCall.get("arguments").isJsonNull() ?
                        JsonParser.parseString(functionCall.get("arguments").getAsString()).getAsJsonObject() : new JsonObject();

                // Setting up decision details based on response
                decisionMap.put("Action", action);
                decisionMap.put("Rationale", arguments.has("rationale") && !arguments.get("rationale").isJsonNull()
                        ? formatWithPeriod(arguments.get("rationale").getAsString()) : "No rationale provided");
                decisionMap.put("Image Description", arguments.has("image_description") && !arguments.get("image_description").isJsonNull()
                        ? formatWithPeriod(arguments.get("image_description").getAsString()) : "No description provided");

                // Decide on Action Result based on action type
                String actionResult;
                if ("refund_order".equals(action)) {
                    actionResult = "Refund processed for ticket " + ticketNumber + " due to structural damage to the package.";
                } else if ("replace_order".equals(action)) {
                    actionResult = "Replacement processed for ticket " + ticketNumber + " due to compromised package contents.";
                } else if ("escalate_to_agent".equals(action)) {
                    String rationale = arguments.has("rationale") && !arguments.get("rationale").isJsonNull()
                            ? arguments.get("rationale").getAsString().toLowerCase() : "";
                    if (rationale.contains("normal") || rationale.contains("undamaged")) {
                        actionResult = "Escalated to human agent for ticket " + ticketNumber + ": package appears intact and undamaged.";
                    } else {
                        actionResult = "Escalated to human agent for ticket " + ticketNumber + ": further review needed for unclear condition.";
                    }
                } else {
                    actionResult = "Action could not be determined for ticket " + ticketNumber + ".";
                }
                decisionMap.put("Action Result", actionResult);
            } else {
                // Handle unexpected format with a generic error message
                decisionMap.put("Error", "Unexpected response format.");
            }
        } else {
            decisionMap.put("Error", "No message data in response.");
        }
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
        if ("escalate_to_agent".equals(name)) {
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

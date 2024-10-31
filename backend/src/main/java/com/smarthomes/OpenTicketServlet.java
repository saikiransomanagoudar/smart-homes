package com.smarthomes;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;
import jakarta.servlet.ServletException;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import com.google.gson.JsonObject;
import com.google.gson.Gson;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;


@WebServlet("/open-ticket")
@MultipartConfig
public class OpenTicketServlet extends HttpServlet {
    private final DecisionService decisionService = new DecisionService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        enableCORS(response);

        int userId = Integer.parseInt(request.getParameter("userId"));
        String description = request.getParameter("description");
        Part imagePart = request.getPart("image");

        String ticketNumber = UUID.randomUUID().toString();
        String base64Image = convertToBase64(imagePart);
        Map<String, String> decisionMap = decisionService.analyzeImageAndDecide(base64Image, description, ticketNumber);

        String imageFilePath = saveImageFile(imagePart, ticketNumber);

        try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/smarthomes", "root", "root")) {
            String sql = "INSERT INTO Tickets (user_id, ticket_number, description, image_path, decision, rationale, image_description, action_result) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, userId);
            stmt.setString(2, ticketNumber);
            stmt.setString(3, description);
            stmt.setString(4, imageFilePath);
            stmt.setString(5, decisionMap.get("Action"));
            stmt.setString(6, decisionMap.get("Rationale"));
            stmt.setString(7, decisionMap.get("Image Description"));
            stmt.setString(8, decisionMap.get("Action Result"));
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error storing ticket in the database.");
            return;
        }

        response.setContentType("application/json");
        JsonObject jsonResponse = new JsonObject();
        jsonResponse.addProperty("ticketNumber", ticketNumber);
        jsonResponse.addProperty("decision", decisionMap.get("Action"));
        response.getWriter().write(new Gson().toJson(jsonResponse));
    }

    private String convertToBase64(Part imagePart) throws IOException {
        try (InputStream inputStream = imagePart.getInputStream()) {
            byte[] bytes = inputStream.readAllBytes();
            return Base64.getEncoder().encodeToString(bytes);
        }
    }

    private String saveImageFile(Part imagePart, String ticketNumber) throws IOException {
        String imagesDirPath = getServletContext().getRealPath("/images");
        File imagesDir = new File(imagesDirPath);

        if (!imagesDir.exists()) {
            imagesDir.mkdirs();
        }

        String imageFileName = ticketNumber + "_" + imagePart.getSubmittedFileName();
        File imageFile = new File(imagesDir, imageFileName);

        try (InputStream inputStream = imagePart.getInputStream()) {
            Files.copy(inputStream, imageFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
        }
        
        return "images/" + imageFileName;
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws IOException {
        enableCORS(response);
        response.setStatus(HttpServletResponse.SC_OK);
    }

    private void enableCORS(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");
    }
}

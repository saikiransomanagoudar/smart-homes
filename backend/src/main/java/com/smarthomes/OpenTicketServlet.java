package com.smarthomes;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;
import jakarta.servlet.ServletException;

import java.io.File;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.UUID;
import com.google.gson.JsonObject;
import com.google.gson.Gson;

@WebServlet("/open-ticket")
@MultipartConfig
public class OpenTicketServlet extends HttpServlet {
    private DecisionService decisionService = new DecisionService();

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        enableCORS(request, response);
        int userId = Integer.parseInt(request.getParameter("userId"));
        String description = request.getParameter("description");
        Part imagePart = request.getPart("image");

        String ticketNumber = UUID.randomUUID().toString();

        String imageFileName = "images/" + ticketNumber + "_" + imagePart.getSubmittedFileName();
        File imageFile = new File(getServletContext().getRealPath("/") + imageFileName);
        imagePart.write(imageFile.getAbsolutePath());

        String decision;
        try {
            decision = decisionService.getDecision(description, imageFile.getAbsolutePath());
        } catch (Exception e) {
            decision = "Unable to process request";
            e.printStackTrace();
        }

        try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/smarthomes", "root", "root")) {
            String sql = "INSERT INTO Tickets (user_id, ticket_number, description, image_path, decision) VALUES (?, ?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, userId);
            stmt.setString(2, ticketNumber);
            stmt.setString(3, description);
            stmt.setString(4, imageFileName);
            stmt.setString(5, decision);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }

        response.setContentType("application/json");
        JsonObject jsonResponse = new JsonObject();
        jsonResponse.addProperty("ticketNumber", ticketNumber);
        jsonResponse.addProperty("decision", decision);
        
        response.getWriter().write(new Gson().toJson(jsonResponse));
    }

    private void enableCORS(HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");
    }
}

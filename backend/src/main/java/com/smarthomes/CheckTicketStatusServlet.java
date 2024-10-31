package com.smarthomes;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import com.google.gson.JsonObject;
import com.google.gson.Gson;

@WebServlet("/ticket-status")
public class CheckTicketStatusServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        enableCORS(response);
        String ticketNumber = request.getParameter("ticketNumber");

        JsonObject jsonResponse = new JsonObject();

        try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/smarthomes", "root", "root")) {
            String sql = "SELECT decision, rationale, image_description, action_result FROM Tickets WHERE ticket_number = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, ticketNumber);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                jsonResponse.addProperty("status", "success");
                jsonResponse.addProperty("decision", rs.getString("decision"));
                jsonResponse.addProperty("rationale", rs.getString("rationale"));
                jsonResponse.addProperty("image_description", rs.getString("image_description"));
                jsonResponse.addProperty("action_result", rs.getString("action_result"));
            } else {
                jsonResponse.addProperty("status", "error");
                jsonResponse.addProperty("message", "Ticket not found");
            }
        } catch (Exception e) {
            e.printStackTrace();
            jsonResponse.addProperty("status", "error");
            jsonResponse.addProperty("message", "Error retrieving ticket information.");
        }

        response.setContentType("application/json");
        response.getWriter().write(new Gson().toJson(jsonResponse));
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

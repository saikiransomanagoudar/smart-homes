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
import jakarta.servlet.ServletException;
import com.google.gson.JsonObject;
import com.google.gson.Gson;

@WebServlet("/ticket-status")
public class CheckTicketStatusServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        enableCORS(request, response);
        String ticketNumber = request.getParameter("ticketNumber");

        String decision = "Ticket not found";
        JsonObject jsonResponse = new JsonObject();

        try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/smarthomes", "root", "root")) {
            String sql = "SELECT decision FROM Tickets WHERE ticket_number = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, ticketNumber);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                decision = rs.getString("decision");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        jsonResponse.addProperty("ticketNumber", ticketNumber);
        jsonResponse.addProperty("decision", decision);

        response.setContentType("application/json");
        response.getWriter().write(new Gson().toJson(jsonResponse));
    }

    private void enableCORS(HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");
    }
}

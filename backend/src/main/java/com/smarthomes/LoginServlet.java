package com.smarthomes;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.*;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@WebServlet("/signin")
public class LoginServlet extends HttpServlet {

    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Set response content type to application/json
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        // Get the user parameters from the request
        String email = request.getParameter("email");
        String password = request.getParameter("password");

        String error_msg = null;

        // Validate input fields
        if (email == null || password == null || email.isEmpty() || password.isEmpty()) {
            // Respond with HTTP 400 Bad Request if any field is missing or invalid
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{ \"error\": \"Invalid input. Email and Password are required.\" }");
            out.flush();
            return;
        }

        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            // Establish connection to MySQL database
            conn = MySQLDataStoreUtilities.getConnection();

            // Query to check if the user exists with the provided email and password
            String query = "SELECT id, email FROM users WHERE email = ? AND password = ?";
            ps = conn.prepareStatement(query);
            ps.setString(1, email);
            ps.setString(2, password);
            rs = ps.executeQuery();

            if (rs.next()) {
                // User exists and password matches, login successful
                int userId = rs.getInt("id");  // Get the user ID from the result set

                // Set user in session
                HttpSession session = request.getSession(true);
                session.setAttribute("userId", userId);  // Store the userId in session for later use
                session.setAttribute("email", email);  // Store the email for session use if needed

                System.out.println("User ID set in session: " + session.getAttribute("userId"));

                // Send success response with userId
                response.setStatus(HttpServletResponse.SC_OK);
                out.print("{ \"message\": \"Login successful\", \"userId\": \"" + userId + "\", \"email\": \"" + email + "\" }");

            } else {
                // Invalid email or password
                error_msg = "Invalid email or password!";
            }

        } catch (SQLException e) {
            e.printStackTrace();
            error_msg = "An error occurred during login!";
        } finally {
            // Close the database connection
            MySQLDataStoreUtilities.closeConnection(conn);
        }

        // Return JSON response for error
        if (error_msg != null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("{ \"error\": \"" + error_msg + "\" }");
        }
        out.flush();
    }
}

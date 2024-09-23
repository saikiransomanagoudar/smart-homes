package com.smarthomes;

import java.io.*;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@WebServlet("/signup")
public class RegistrationServlet extends HttpServlet {

    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Set response content type to application/json
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        // Get the user parameters from the request
        String name = request.getParameter("name");
        String email = request.getParameter("email");
        String password = request.getParameter("password");

        String error_msg = null;

        // Validate input fields
        if (name == null || email == null || password == null || name.isEmpty() || email.isEmpty() || password.isEmpty()) {
            // Respond with HTTP 400 Bad Request if any field is missing or invalid
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("Invalid input. Username, Email, and Password are required.");
            out.flush();
            return;
        }

        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            // Establish connection to MySQL database
            conn = MySQLDataStoreUtilities.getConnection();

            // Check if the email already exists in the database
            String checkQuery = "SELECT * FROM users WHERE email = ?";
            ps = conn.prepareStatement(checkQuery);
            ps.setString(1, email);
            rs = ps.executeQuery();

            if (rs.next()) {
                // Email already exists
                System.out.println("Conflict: Email already exists: " + email);
                error_msg = "Email already exists!";
            } else {
                // Insert new user into the database
                String insertQuery = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
                ps = conn.prepareStatement(insertQuery, PreparedStatement.RETURN_GENERATED_KEYS);
                ps.setString(1, name);
                ps.setString(2, email);
                ps.setString(3, password);
                ps.executeUpdate();

                // Retrieve the generated user_id
                ResultSet generatedKeys = ps.getGeneratedKeys();
                int userId = -1;
                if (generatedKeys.next()) {
                    userId = generatedKeys.getInt(1);  // Get the generated user_id
                    System.out.println("User registered successfully with user_id: " + userId);
                }

                // Insert the user into customers table with the generated user_id
                if (userId != -1) {
                    String customerInsertQuery = "INSERT INTO customers (user_id, customer_name, street, city, state, zip_code) VALUES (?, ?, ?, ?, ?, ?)";
                    PreparedStatement psCustomers = conn.prepareStatement(customerInsertQuery);
                    psCustomers.setInt(1, userId);
                    psCustomers.setString(2, name);  // Use the user's name as customer name
                    psCustomers.setString(3, "Default Street");  // You can replace with actual input for street
                    psCustomers.setString(4, "Default City");    // Same for city, state, zip code
                    psCustomers.setString(5, "Default State");
                    psCustomers.setString(6, "12345");
                    psCustomers.executeUpdate();

                    System.out.println("Customer entry created for user_id: " + userId);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            error_msg = "An error occurred during registration!";
        } finally {
            // Close the database connection
            MySQLDataStoreUtilities.closeConnection(conn);
        }

        // Return JSON response
        if (error_msg == null) {
            response.setStatus(HttpServletResponse.SC_OK);
            out.print("Registration successful!");
        } else {
            response.setStatus(HttpServletResponse.SC_CONFLICT);
            out.print(error_msg);
        }

        out.flush();
    }
}

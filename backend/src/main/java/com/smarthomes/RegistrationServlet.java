package com.smarthomes;

import java.io.*;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.util.HashMap;

@WebServlet("/signup")
public class RegistrationServlet extends HttpServlet {

    @SuppressWarnings("unchecked")
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Set response content type to application/json
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        // Get the user parameters from the request
        String username = request.getParameter("username");
        String email = request.getParameter("email");
        String password = request.getParameter("password");

        String error_msg = null;
        String filePath = "C:\\Users\\saiki\\smarthomes_data\\UserDetails.txt";

        // Validate input fields
        if (username == null || email == null || password == null || username.isEmpty() || email.isEmpty() || password.isEmpty()) {
            // Respond with HTTP 400 Bad Request if any field is missing or invalid
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"status\": \"error\", \"message\": \"Invalid input. All fields are required.\"}");
            out.flush();
            return;
        }

        // Create a HashMap to store users
        HashMap<String, User> hm = new HashMap<>();

        try {
            // Read the user details from the file
            File userFile = new File(filePath);

            if (userFile.exists()) {
                FileInputStream fileInputStream = new FileInputStream(userFile);
                ObjectInputStream objectInputStream = new ObjectInputStream(fileInputStream);
                hm = (HashMap<String, User>) objectInputStream.readObject();
                objectInputStream.close();
                fileInputStream.close();

                // Log current users in the system
                System.out.println("Existing users in system: " + hm.keySet());
            }

            // Check if username or email already exists
            boolean userExists = hm.values().stream().anyMatch(user -> user.username().equals(username) || user.email().equals(email));
            if (userExists) {
                System.out.println("Conflict: Username or email already exists: " + username + " or " + email);
                error_msg = "Username or Email already exists!";
            } else {
                // If not, create a new user and store it in the HashMap
                User newUser = new User(username, email, password);
                hm.put(username, newUser);

                // Save the updated HashMap back to the file
                FileOutputStream fileOutputStream = new FileOutputStream(userFile);
                ObjectOutputStream objectOutputStream = new ObjectOutputStream(fileOutputStream);
                objectOutputStream.writeObject(hm);
                objectOutputStream.flush();
                objectOutputStream.close();
                fileOutputStream.close();

                // Log successful registration
                System.out.println("User registered successfully: " + username);
            }
        } catch (Exception e) {
            e.printStackTrace();
            error_msg = "An error occurred during registration!";
        }

        // Return JSON response
        if (error_msg == null) {
            response.setStatus(HttpServletResponse.SC_OK);
            out.print("{\"status\": \"success\", \"message\": \"Registration successful.\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_CONFLICT); // Conflict if username or email already exists
            out.print("{\"status\": \"error\", \"message\": \"" + error_msg + "\"}");
        }

        out.flush(); // Response body is written to the client
    }
}

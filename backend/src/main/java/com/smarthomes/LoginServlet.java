package com.smarthomes;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.*;
import java.util.HashMap;

@WebServlet("/signin")
public class LoginServlet extends HttpServlet {

    @SuppressWarnings("unchecked")
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Set response content type to application/json
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        // Get the user parameters from the request (either username or email and password)
        String usernameOrEmail = request.getParameter("usernameOrEmail");
        String password = request.getParameter("password");

        String error_msg = null;
        String filePath = "C:\\Users\\saiki\\smarthomes_data\\UserDetails.txt";

        // Validate input fields
        if (usernameOrEmail == null || password == null || usernameOrEmail.isEmpty() || password.isEmpty()) {
            // Respond with HTTP 400 Bad Request if any field is missing or invalid
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"status\": \"error\", \"message\": \"Invalid input. Username/Email and Password are required.\"}");
            out.flush();
            return;
        }

        HashMap<String, User> hm = new HashMap<String, User>();

        try {
            // Read the user details from the file
            File userFile = new File(filePath);
            if (userFile.exists()) {
                FileInputStream fileInputStream = new FileInputStream(userFile);
                ObjectInputStream objectInputStream = new ObjectInputStream(fileInputStream);
                hm = (HashMap<String, User>) objectInputStream.readObject();
                objectInputStream.close();
                fileInputStream.close();
            }

            // Check if username or email exists and password matches
            boolean validCredentials = false;
            User loggedInUser = null;

            for (User user : hm.values()) {
                // Check if username or email matches and if the password is correct
                if ((user.username().equals(usernameOrEmail) || user.email().equals(usernameOrEmail)) &&
                    user.password().equals(password)) {
                    validCredentials = true;
                    loggedInUser = user;
                    break;
                }
            }

            if (validCredentials) {
                // User successfully logged in
                response.setStatus(HttpServletResponse.SC_OK);
                out.print("{\"status\": \"success\", \"message\": \"Login successful!\", \"username\": \"" + loggedInUser.username() + "\"}");
            } else {
                // Incorrect username/email or password
                error_msg = "Invalid username/email or password!";
            }

        } catch (Exception e) {
            e.printStackTrace();
            error_msg = "An error occurred during login!";
        }

        // Return JSON response for error
        if (error_msg != null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // Unauthorized if login failed
            out.print("{\"status\": \"error\", \"message\": \"" + error_msg + "\"}");
        }

        out.flush(); // Ensure the response body is written to the client
    }
}

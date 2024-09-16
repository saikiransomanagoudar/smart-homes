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

        // Get the user parameters from the request (either email and password)
        String email = request.getParameter("email");
        String password = request.getParameter("password");

        String error_msg = null;
        String filePath = "C:\\Users\\saiki\\smarthomes_data\\UserDetails.txt";

        // Validate input fields
        if (email == null || password == null || email.isEmpty() || password.isEmpty()) {
            // Respond with HTTP 400 Bad Request if any field is missing or invalid
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("Invalid input. Email and Password are required.");
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

                // Debugging: Print all users in the system
                System.out.println("Users in system: ");
                hm.values().forEach(user -> System.out.println(user.email()));
            }

            // Check if email exists and password matches
            User loggedInUser = hm.get(email);
            
            // Check if user exists and password matches
            if (loggedInUser != null && loggedInUser.password().equals(password)) {
                response.setStatus(HttpServletResponse.SC_OK);
                out.print("{ \"message\": \"Login successful\", \"email\": \"" + loggedInUser.email() + "\" }");

                // Set user in session
                HttpSession session = request.getSession(true);
                session.setAttribute("username", loggedInUser.email());
                System.out.println("Username set in session: " + session.getAttribute("username"));
            } else {
                // Incorrect email or password
                error_msg = "Invalid email or password!";
            }

        } catch (Exception e) {
            e.printStackTrace();
            error_msg = "An error occurred during login!";
        }

        // Return JSON response for error
        if (error_msg != null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("{ \"error\": \"" + error_msg + "\" }");
        }

        out.flush(); 
    }
}

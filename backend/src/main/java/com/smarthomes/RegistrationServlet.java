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
        String name = request.getParameter("name");
        String email = request.getParameter("email");
        String password = request.getParameter("password");

        String error_msg = null;
        String filePath = "C:\\Users\\saiki\\smarthomes_data\\UserDetails.txt";

        // Validate input fields
        if (name == null || email == null || password == null || name.isEmpty() || email.isEmpty() || password.isEmpty()) {
            // Respond with HTTP 400 Bad Request if any field is missing or invalid
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("Invalid input. Username, Email, and Password are required.");
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

            // Check if email already exists (use email as the unique identifier)
            boolean emailExists = hm.values().stream().anyMatch(user -> user.email().equals(email));
            if (emailExists) {
                System.out.println("Conflict: Email already exists: " + email);
                error_msg = "Email already exists!";
            } else {
                // If not, create a new user and store it in the HashMap
                User newUser = new User(name, email, password);
                hm.put(email, newUser);  // Using email as the key instead of name

                // Save the updated HashMap back to the file
                FileOutputStream fileOutputStream = new FileOutputStream(userFile);
                ObjectOutputStream objectOutputStream = new ObjectOutputStream(fileOutputStream);
                objectOutputStream.writeObject(hm);
                objectOutputStream.flush();
                objectOutputStream.close();
                fileOutputStream.close();

                // Log successful registration
                System.out.println("User registered successfully: " + name);
            }
        } catch (Exception e) {
            e.printStackTrace();
            error_msg = "An error occurred during registration!";
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

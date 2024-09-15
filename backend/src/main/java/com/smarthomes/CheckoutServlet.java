package com.smarthomes;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@WebServlet("/checkout")
public class CheckoutServlet extends HttpServlet {

    // Define the file path to store payment details
    private static final String PAYMENT_FILE_PATH = "C:/Users/saiki/smarthomes_data/PaymentDetails.txt";
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Enable CORS
        enableCORS(request, response);

        // Read request data
        BufferedReader reader = request.getReader();
        Order order = new Gson().fromJson(reader, Order.class);

        // Generate confirmation number and delivery date
        String confirmationNumber = UUID.randomUUID().toString();
        LocalDate deliveryDate = LocalDate.now().plusWeeks(2);

        // Save the order details (including product details like image, name)
        saveOrder(order, confirmationNumber, deliveryDate);

        // Prepare the response data, including product details
        Map<String, String> responseData = new HashMap<>();
        responseData.put("confirmationNumber", confirmationNumber);
        responseData.put("deliveryDate", deliveryDate.toString());
        responseData.put("productName", order.getProductName());
        responseData.put("productPrice", String.valueOf(order.getProductPrice()));
        responseData.put("productImage", order.getProductImage()); // Assuming the image is a URL or base64 encoded string
        responseData.put("productDescription", order.getProductDescription());

        // Send response
        response.getWriter().write(new Gson().toJson(responseData));
    }

    private void enableCORS(HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Allow frontend origin
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Allow these methods
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true"); // Allow credentials (cookies)

        // Handle preflight (OPTIONS) requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
        }
    }

    @SuppressWarnings("unchecked")
    private void saveOrder(Order order, String confirmationNumber, LocalDate deliveryDate) {
        // Create a new order object with additional product details
        Order orderPayment = new Order(order.getOrderId(), order.getOrderName(),
                order.getOrderPrice(), order.getUserAddress(), order.getCreditCardNo(),
                confirmationNumber, deliveryDate, order.getProductName(), 
                order.getProductPrice(), order.getProductImage(), order.getProductDescription());

        // Initialize the HashMap to store payments
        HashMap<Integer, ArrayList<Order>> orderPayments = new HashMap<>();

        // Load existing payments from the file
        try (FileInputStream fileInputStream = new FileInputStream(PAYMENT_FILE_PATH);
             ObjectInputStream objectInputStream = new ObjectInputStream(fileInputStream)) {
            orderPayments = (HashMap<Integer, ArrayList<Order>>) objectInputStream.readObject();
        } catch (FileNotFoundException e) {
            // If the file doesn't exist, we will create a new one
            System.out.println("Payment file not found, creating a new one.");
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
        }

        // Check if the order ID already exists, otherwise create a new list
        if (!orderPayments.containsKey(order.getOrderId())) {
            orderPayments.put(order.getOrderId(), new ArrayList<>());
        }

        // Add the new order payment to the list
        ArrayList<Order> paymentList = orderPayments.get(order.getOrderId());
        paymentList.add(orderPayment);

        // Save the updated payments back to the file
        try (FileOutputStream fileOutputStream = new FileOutputStream(PAYMENT_FILE_PATH);
             ObjectOutputStream objectOutputStream = new ObjectOutputStream(fileOutputStream)) {
            objectOutputStream.writeObject(orderPayments);
            objectOutputStream.flush();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

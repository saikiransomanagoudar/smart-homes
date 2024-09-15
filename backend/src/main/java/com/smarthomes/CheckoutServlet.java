package com.smarthomes;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.ArrayList;

@WebServlet("/checkout")
public class CheckoutServlet extends HttpServlet {

    private static final String PAYMENT_FILE_PATH = "C:/Users/saiki/smarthomes_data/PaymentDetails.txt";

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        enableCORS(request, response);

        try {
            BufferedReader reader = request.getReader();
            Orders order = new Gson().fromJson(reader, Orders.class);

            // Validate that the order contains the required fields
            if (order == null || order.getProductName() == null || order.getProductPrice() == 0.0) {
                throw new IllegalArgumentException("Product name or price is invalid");
            }

            // Generate confirmation number and delivery date
            String confirmationNumber = UUID.randomUUID().toString();
            String deliveryDate = LocalDate.now().plusWeeks(2).toString(); // Save as String

            // Save the order details
            saveOrder(order, confirmationNumber, deliveryDate);

            // Prepare the response data
            Map<String, String> responseData = new HashMap<>();
            responseData.put("confirmationNumber", confirmationNumber);
            responseData.put("deliveryDate", deliveryDate);
            responseData.put("productName", order.getProductName());
            responseData.put("productPrice", String.valueOf(order.getProductPrice()));
            responseData.put("productImage", order.getProductImage());
            responseData.put("productDescription", order.getProductDescription());

            response.setContentType("application/json");
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write(new Gson().toJson(responseData));

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("application/json");
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error processing your order: " + e.getMessage());
            response.getWriter().write(new Gson().toJson(errorResponse));
        }
    }

    private void enableCORS(HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
        }
    }

    @SuppressWarnings("unchecked")
    private void saveOrder(Orders order, String confirmationNumber, String deliveryDate) throws IOException {
        File paymentFile = new File(PAYMENT_FILE_PATH);

        if (!paymentFile.exists()) {
            paymentFile.getParentFile().mkdirs();
            paymentFile.createNewFile();
        }

        HashMap<Integer, ArrayList<Orders>> orderPayments = new HashMap<>();
        if (paymentFile.length() > 0) {
            try (FileInputStream fileInputStream = new FileInputStream(paymentFile);
                 ObjectInputStream objectInputStream = new ObjectInputStream(fileInputStream)) {
                orderPayments = (HashMap<Integer, ArrayList<Orders>>) objectInputStream.readObject();
            } catch (FileNotFoundException e) {
                System.out.println("Payment file not found, creating a new one.");
            } catch (ClassNotFoundException e) {
                System.out.println("Class not found during deserialization: " + e.getMessage());
            } catch (IOException e) {
                System.out.println("Error reading from the file: " + e.getMessage());
            }
        }

        // Add the new order to the list
        orderPayments.computeIfAbsent(order.getOrderId(), k -> new ArrayList<>()).add(
                new Orders(order.getOrderId(), order.getOrderName(), order.getOrderPrice(),
                        order.getUserAddress(), order.getCreditCardNo(), confirmationNumber, deliveryDate,
                        order.getProductName(), order.getProductPrice(), order.getProductImage(),
                        order.getProductDescription(), order.getDeliveryOption(), order.getCustomerName())
        );

        // Save the updated payments back to the file
        try (FileOutputStream fileOutputStream = new FileOutputStream(paymentFile);
             ObjectOutputStream objectOutputStream = new ObjectOutputStream(fileOutputStream)) {
            objectOutputStream.writeObject(orderPayments);
        } catch (IOException e) {
            System.out.println("Error writing to the file: " + e.getMessage());
        }
        System.out.println("Order saved successfully to " + PAYMENT_FILE_PATH);
    }
}
package com.smarthomes;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/api/trending/most-sold-overall")
public class TrendingSalesServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        enableCORS(req, resp);
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();
        List<JsonObject> mostSoldList = new ArrayList<>();

        // Database credentials
        String url = "jdbc:mysql://localhost:3306/smarthomes";
        String username = "root";
        String password = "root";

        try (Connection conn = DriverManager.getConnection(url, username, password)) {
            // SQL query to fetch most sold products
            String query = "SELECT product_name, total_sales FROM orders ORDER BY total_sales DESC LIMIT 5";
            try (PreparedStatement stmt = conn.prepareStatement(query)) {
                ResultSet rs = stmt.executeQuery();

                // Convert SQL ResultSet to JSON
                while (rs.next()) {
                    JsonObject productJson = new JsonObject();
                    productJson.addProperty("product_name", rs.getString("product_name"));
                    productJson.addProperty("total_sales", rs.getInt("total_sales"));
                    mostSoldList.add(productJson);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Convert the list to JSON using Gson
        String jsonResponse = gson.toJson(mostSoldList);
        out.print(jsonResponse);
        out.flush();
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Handle CORS preflight (OPTIONS) request
        enableCORS(request, response);
        response.setStatus(HttpServletResponse.SC_OK);
    }

    private void enableCORS(HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Allow frontend origin
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Allow these methods
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true"); // Allow credentials (cookies)
    }
}

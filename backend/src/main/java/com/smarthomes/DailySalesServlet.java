package com.smarthomes;

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
import com.google.gson.Gson;

@WebServlet("/daily-sales")
public class DailySalesServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            // Connect to MySQL
            String url = "jdbc:mysql://localhost:3306/smarthomes";
            String user = "root";
            String password = "root";
            conn = DriverManager.getConnection(url, user, password);

            // Query to fetch total daily sales, calculating sales as (price * quantity)
            String dailySalesQuery = "SELECT purchase_date, SUM(price * quantity) AS total_daily_sales " +
                                     "FROM Orders WHERE status != 'Cancelled' " +
                                     "GROUP BY purchase_date";
            stmt = conn.prepareStatement(dailySalesQuery);
            rs = stmt.executeQuery();

            ArrayList<DailySales> dailySalesList = new ArrayList<>();
            while (rs.next()) {
                DailySales ds = new DailySales();
                ds.setPurchaseDate(rs.getString("purchase_date"));
                ds.setTotalDailySales(rs.getDouble("total_daily_sales"));
                dailySalesList.add(ds);
            }

            // Convert list to JSON
            String json = new Gson().toJson(dailySalesList);
            out.print(json);
            out.flush();

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}

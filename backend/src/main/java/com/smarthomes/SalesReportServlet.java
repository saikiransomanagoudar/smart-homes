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

@WebServlet("/sales-report")
public class SalesReportServlet extends HttpServlet {
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

            // Query to fetch total sales per product
            String productSalesQuery = "SELECT product_name, price, SUM(quantity) AS items_sold, SUM(total_sales) AS total_sales " +
                                       "FROM Orders WHERE status != 'Cancelled' GROUP BY product_name, price";
            stmt = conn.prepareStatement(productSalesQuery);
            rs = stmt.executeQuery();

            ArrayList<ProductSales> productSalesList = new ArrayList<>();
            while (rs.next()) {
                ProductSales ps = new ProductSales();
                ps.setProductName(rs.getString("product_name"));
                ps.setPrice(rs.getDouble("price"));
                ps.setItemsSold(rs.getInt("items_sold"));
                ps.setTotalSales(rs.getDouble("total_sales"));
                productSalesList.add(ps);
            }

            // Convert list to JSON
            String json = new Gson().toJson(productSalesList);
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


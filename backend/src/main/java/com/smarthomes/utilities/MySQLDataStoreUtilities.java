package com.smarthomes;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class MySQLDataStoreUtilities {
    // Database connection parameters
    private static final String URL = "jdbc:mysql://localhost:3306/smarthomes";
    private static final String USERNAME = "root";
    private static final String PASSWORD = "root";

    // Method to establish a connection with the database
    public static Connection getConnection() {
        Connection conn = null;
        try {
            // Load MySQL JDBC Driver
            Class.forName("com.mysql.cj.jdbc.Driver");
            // Establish connection to the database
            conn = DriverManager.getConnection(URL, USERNAME, PASSWORD);
        } catch (ClassNotFoundException e) {
            System.err.println("JDBC Driver not found: " + e.getMessage());
        } catch (SQLException e) {
            System.err.println("SQL Exception while establishing connection: " + e.getMessage());
        }
        return conn;
    }

    // Method to close connection
    public static void closeConnection(Connection conn) {
        if (conn != null) {
            try {
                conn.close();  // Close the connection
            } catch (SQLException e) {
                System.err.println("Error closing connection: " + e.getMessage());
            }
        }
    }

    // Method to close PreparedStatement
    public static void closePreparedStatement(PreparedStatement ps) {
        if (ps != null) {
            try {
                ps.close();  // Close the PreparedStatement
            } catch (SQLException e) {
                System.err.println("Error closing PreparedStatement: " + e.getMessage());
            }
        }
    }
}

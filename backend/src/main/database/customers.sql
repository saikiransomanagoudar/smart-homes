-- Create the customers table with the necessary fields
CREATE TABLE IF NOT EXISTS customers (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    street VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL
) ENGINE=InnoDB;

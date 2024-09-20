-- Create the orders table
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_address VARCHAR(255) NOT NULL,
    credit_card_no VARCHAR(20) NOT NULL,
    confirmation_number VARCHAR(50) NOT NULL,
    purchase_date DATE NOT NULL,
    ship_date DATE NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    price DOUBLE NOT NULL,
    shipping_cost DOUBLE DEFAULT 0.0,
    discount DOUBLE DEFAULT 0.0,
    total_sales DOUBLE NOT NULL,
    store_id INT DEFAULT NULL,
    store_address VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES customers(user_id)
);
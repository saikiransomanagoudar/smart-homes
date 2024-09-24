-- Create the orders table with an AUTO_INCREMENT starting from 1
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,  -- AUTO_INCREMENT starts from 1
    user_id INT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_address VARCHAR(255) NOT NULL,
    credit_card_no VARCHAR(20) NOT NULL,
    confirmation_number VARCHAR(50) NOT NULL,
    purchase_date DATE NOT NULL,
    ship_date DATE NOT NULL,
    product_id INT NOT NULL,
    category VARCHAR(100),
    quantity INT NOT NULL,
    price DOUBLE NOT NULL,
    shipping_cost DOUBLE DEFAULT 0.0,
    discount DOUBLE DEFAULT 0.0,
    total_sales INT NOT NULL,
    store_id INT DEFAULT NULL,
    store_address VARCHAR(255) DEFAULT NULL,
    deliveryDate DATE DEFAULT NULL,
    deliverOption VARCHAR(50) DEFAULT 'home',
    -- Setting the foreign key to CASCADE on delete
    FOREIGN KEY (user_id) REFERENCES customers(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Set the starting value for the auto_increment field (optional)
ALTER TABLE orders AUTO_INCREMENT = 1;

-- Add an index on the foreign key column to improve performance
CREATE INDEX idx_user_id ON orders(user_id);
-- Create the SmartHomes Database and Tables

-- Switch to the SmartHomes database (create if not exists)
CREATE DATABASE IF NOT EXISTS smarthomes;
USE smarthomes;

-- Create Accessories table
CREATE TABLE IF NOT EXISTS Accessories (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    price DECIMAL(10, 2),
    image VARCHAR(255)
);

-- Create Products table
CREATE TABLE IF NOT EXISTS Products (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    price DECIMAL(10, 2),
    description TEXT,
    image VARCHAR(255),
    category VARCHAR(255),
    retailer VARCHAR(255),
    quantity INT,
    onSale BOOLEAN,
    hasRebate BOOLEAN
);

-- Create ProductAccessories table (for relationship between Products and Accessories)
CREATE TABLE IF NOT EXISTS ProductAccessories (
    product_id INT,
    accessory_id INT,
    FOREIGN KEY (product_id) REFERENCES Products(id),
    FOREIGN KEY (accessory_id) REFERENCES Accessories(id)
);

-- Confirm tables have been created
SHOW TABLES;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- AUTO_INCREMENT starts from 1 by default
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100)
) ENGINE=InnoDB;

-- Recreate the customers table with a foreign key reference to users
CREATE TABLE IF NOT EXISTS customers (
    user_id INT,  -- This will store the id from the users table
    customer_name VARCHAR(100) NOT NULL,
    street VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    PRIMARY KEY (user_id),  -- Make user_id the primary key

    -- Foreign key constraint to reference the id from the users table
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,  -- AUTO_INCREMENT starts from 1
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    type varchar(100),
    category varchar(100),
    quantity INT DEFAULT 1,
    image varchar(255),

    -- Setting the foreign key to CASCADE on delete
    FOREIGN KEY (user_id) REFERENCES customers(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Create the orders table with an AUTO_INCREMENT starting from 1
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
    product_name VARCHAR(255) NOT NULL,
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
    status VARCHAR(20) DEFAULT 'Processing',
    -- Setting the foreign key to CASCADE on delete
    FOREIGN KEY (user_id) REFERENCES customers(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Set the starting value for the auto_increment field
ALTER TABLE orders AUTO_INCREMENT = 1;

-- Add an index on the foreign key column to improve performance
CREATE INDEX idx_user_id ON orders(user_id);

SELECT Products.id AS product_id, Products.name AS product_name, 
       Accessories.id AS accessory_id, Accessories.name AS accessory_name,
       Accessories.price AS accessory_price
FROM ProductAccessories
JOIN Products ON ProductAccessories.product_id = Products.id
JOIN Accessories ON ProductAccessories.accessory_id = Accessories.id
WHERE Accessories.id = ?; -- the accessory_id you're searching for


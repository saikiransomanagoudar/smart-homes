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

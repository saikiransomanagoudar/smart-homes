CREATE TABLE IF NOT EXISTS cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,  -- AUTO_INCREMENT starts from 1
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,

    -- Setting the foreign key to CASCADE on delete
    FOREIGN KEY (user_id) REFERENCES customers(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

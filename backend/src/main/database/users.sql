CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- AUTO_INCREMENT starts from 1 by default
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100)
) ENGINE=InnoDB;

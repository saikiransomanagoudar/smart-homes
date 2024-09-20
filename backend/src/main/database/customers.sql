-- Create the customers table
CREATE TABLE IF NOT EXISTS customers (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    street VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL
);

-- Insert 20 sample customers
INSERT INTO customers (customer_name, street, city, state, zip_code) VALUES
('John Doe', '123 Main St', 'Chicago', 'IL', '60601'),
('Jane Smith', '456 Oak St', 'New York', 'NY', '10001'),
('Alice Johnson', '789 Maple Ave', 'San Francisco', 'CA', '94105'),
('Bob Brown', '321 Pine St', 'Austin', 'TX', '73301'),
('Mary Clark', '555 Elm St', 'Seattle', 'WA', '98101'),
('David Davis', '777 Walnut St', 'Boston', 'MA', '02101'),
('Susan Miller', '999 Cherry St', 'Miami', 'FL', '33101'),
('James Wilson', '222 Cedar St', 'Denver', 'CO', '80201'),
('Patricia Moore', '123 Birch St', 'Las Vegas', 'NV', '89101'),
('Linda Taylor', '456 Spruce St', 'Phoenix', 'AZ', '85001'),
('Chris Lee', '789 Fir St', 'Philadelphia', 'PA', '19101'),
('Nancy Anderson', '987 Willow St', 'Dallas', 'TX', '75201'),
('Lisa Martinez', '111 Ash St', 'Portland', 'OR', '97201'),
('Kevin White', '333 Poplar St', 'Houston', 'TX', '77001'),
('Sharon Jackson', '444 Sycamore St', 'Atlanta', 'GA', '30301'),
('Brian Martin', '555 Redwood St', 'Charlotte', 'NC', '28201'),
('Laura Clark', '666 Cypress St', 'Columbus', 'OH', '43201'),
('Henry Lewis', '777 Dogwood St', 'Detroit', 'MI', '48201'),
('Karen Walker', '888 Magnolia St', 'Indianapolis', 'IN', '46201'),
('Jason Scott', '999 Beech St', 'Los Angeles', 'CA', '90001');

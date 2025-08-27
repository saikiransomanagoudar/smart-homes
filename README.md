# SmartHomes E-Commerce Application

![image](https://github.com/user-attachments/assets/d3c5e227-d092-4e03-b4fe-70e01a44928d)

## Project Description
SmartHomes is a full-stack e-commerce web application developed using Java Servlets (backend), React.js (frontend), and Python services for integrating Gen AI tools and Elasticsearch. The platform supports various functionalities for customers, salesmen, and store managers. Features include product management, order placement, reviews, analytics, ticket handling, and advanced search and recommendations using AI-powered tools.

The application provides comprehensive user management and order processing capabilities.

## Features

### Core Features
- **User Roles**: StoreManager, Customers, Salesmen
- **Product Management**: Add/Delete/Update products with XML and CSV support
- **Customer Account Management**: Create/Delete/Update accounts
- **Order Management**: Place, cancel, and check the status of orders
- **Product Reviews**: Customers can submit and view reviews
- **Cart Management**: Add or remove items in the cart within the session
- **Session Handling**: Secure user sessions with authentication filters

### Advanced Features
- **Customer Service**:
  - Open tickets with images and text
  - Status check of tickets (Refund, Replace, or Escalate)
  - Decision-making using AI services
- **Search and Recommendations**:
  - Product search and filtering
  - Trending products analysis
  - Sales analytics and reporting
- **Reports**:
  - Inventory and Sales Reports with Google Charts
  - Daily sales tracking
  - Trending analysis by zip codes and reviews
- **Data Management**:
  - Product catalog management via XML
  - CSV data import/export
  - Database utilities for MySQL and MongoDB

## Prerequisites
Ensure you have the following installed:

- **Java**: OpenJDK 17.0.12 or above
- **Apache Tomcat**: 9.x
- **Node.js**: v18 or higher
- **Python**: 3.8 or higher
- **MySQL**: 8.x
- **MongoDB**: Compass preferred for GUI
- **npm**: for React dependencies

## Installation and Setup

### Clone the Repository
```bash
git clone https://github.com/YourUsername/smart-homes.git
cd smart-homes
```

### Backend (Java Servlets)
1. **Compile the Java Servlets**:
   ```bash
   cd backend
   mvn clean compile
   ```

2. **Deploy the WAR file to Tomcat**:
   - Place the generated WAR file in `webapps/` of your Tomcat directory
   - Start Tomcat server:
     ```bash
     catalina.sh start
     ```

### Frontend (React.js)
1. **Navigate to the frontend folder**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the React development server**:
   ```bash
   npm start
   ```

### Python Services
1. **Navigate to the Python services directory**:
   ```bash
   cd python_services/app
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the Python Flask API**:
   ```bash
   python run.py
   ```

### Databases
1. **MySQL**:
   - Import the provided `smarthomes.sql` file to set up tables
   ```bash
   mysql -u root -p < backend/src/main/db/database/smarthomes.sql
   ```

2. **MongoDB**:
   - Run the Python script `pr_records.py` to populate the MongoDB database
   ```bash
   cd python_services/notebooks
   python pr_records.py
   ```

## Configuration

### Environment Variables
Set up the following environment variables in your system:

- **MySQL**: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- **MongoDB**: `MONGO_URI`


### Database Configuration
- Update database connection settings in `MySQLDataStoreUtilities.java` and `MongoDBDataStoreUtilities.java`
- Configure Elasticsearch settings in `elastic_search_config.py`

## Usage

### Access the Application
- **Frontend**: Open `http://localhost:3000` in your browser
- **Backend**: Ensure the Tomcat server is running on port 8080
- **Python API**: Ensure Flask API is running on port 5000

### Key Functionalities
1. **Customer Service**:
   - Navigate to the "Customer Service" tab
   - Submit a ticket with text and an image
   - View ticket status and decisions

2. **Search and Recommendations**:
   - Use product search functionality
   - View trending products and sales analytics

3. **Order Management**:
   - Add items to the cart and proceed to checkout
   - Manage order status and cancellations

4. **Inventory and Sales Reports**:
   - Accessible via the Store Manager dashboard
   - View daily sales and trending analysis

## Project Structure

```
SmartHomes/
├── frontend/                 # React.js frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── routes/          # Application routes
│   │   └── styles/          # CSS and styling
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── .eslintrc.json       # ESLint configuration
├── backend/                  # Java backend application
│   ├── src/main/java/com/smarthomes/
│   │   ├── servlets/        # Java servlet classes
│   │   ├── models/          # Data models
│   │   └── utilities/       # Database utilities
│   ├── src/main/db/         # Database schemas and data
│   ├── src/main/resources/  # Configuration files
│   └── pom.xml             # Maven configuration
├── python_services/          # Python services and notebooks
│   ├── app/                 # Python Flask services
│   └── notebooks/           # Jupyter notebooks and scripts
└── README.md               # Project documentation
```

## Key Classes and Scripts

### Java Backend
- **`MySQLDataStoreUtilities.java`**: MySQL database operations
- **`MongoDBDataStoreUtilities.java`**: MongoDB operations
- **`ProductServlet.java`**: Product management operations
- **`OrderServlet.java`**: Order processing and management
- **`CartServlet.java`**: Shopping cart functionality
- **`ReviewServlet.java`**: Product review management
- **`OpenTicketServlet.java`**: Customer service ticket handling
- **`DecisionService.java`**: AI-powered decision making
- **`SalesReportServlet.java`**: Sales analytics and reporting

### Python Services
- **`app/routes.py`**: Flask API endpoints
- **`app/similarity.py`**: Similarity calculations
- **`app/utils.py`**: Utility functions
- **`pr_records.py`**: MongoDB data population
- **`product_records.ipynb`**: Jupyter notebook for data analysis

### Frontend Components
- **`Auth/`**: Authentication components
- **`Products/`**: Product browsing and management
- **`Cart/`**: Shopping cart functionality
- **`Checkout/`**: Order processing
- **`Orders/`**: Order management
- **`OpenTicket/`**: Customer service interface
- **`SalesReport/`**: Analytics and reporting
- **`Trending/`**: Trending products analysis

## Technologies Used

- **Frontend**: React.js, Tailwind CSS, React Router
- **Backend**: Java Servlets, Jakarta EE, Maven
- **Database**: MySQL, MongoDB
- **Python Services**: Flask, Jupyter Notebooks
- **Build Tools**: Maven, npm
- **Styling**: Tailwind CSS, FontAwesome
- **Charts**: React Google Charts



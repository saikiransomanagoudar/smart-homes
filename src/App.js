import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './components/Auth/LoginForm';
import Register from './components/Auth/Register';
import Home from './routes/Home';
import Cart from './components/Cart/Cart';
import Checkout from './components/Checkout/Checkout';
import './styles/globals.css';
import { useState } from 'react';
import ProductsPage from './components/Products/ProductsPage';
import Orders from './components/Orders/Orders';
import Trending from './components/Trending/Trending';
import Inventory from './components/Inventory/Inventory';
import SalesReport from './components/SalesReport/SalesReport';

function App() {
  const [cart, setCart] = useState([]);

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        {/* Route for product categories, dynamically loading products based on the category */}
        <Route path="/products/:category" element={<ProductsPage cart={cart} setCart={setCart} />} />
        <Route path="/signin" element={<LoginForm />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout cart={cart} setCart={setCart} />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/sales-report" element={<SalesReport />} />
      </Routes>
    </Router>
  );
}

export default App;

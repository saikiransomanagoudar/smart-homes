import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './components/Auth/LoginForm';
import Register from './components/Auth/Register';
import PrivateRoute from './components/Auth/PrivateRoute';
import Home from './routes/Home';
import Cart from './components/Cart/Cart';
import Checkout from './components/Checkout/Checkout';
import './styles/globals.css';
import { useState } from 'react';
import ProductsPage from './components/Products/ProductsPage';
import Orders from './components/Orders/Orders';

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
        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          }
        />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout cart={cart} setCart={setCart} />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </Router>
  );
}

export default App;

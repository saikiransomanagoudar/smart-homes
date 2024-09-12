import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './components/Auth/LoginForm';
import Register from './components/Auth/Register';
import Home from './routes/Home';
import Cart from './components/Cart/Cart';
import './styles/globals.css';
import { useState } from 'react';
import ProductsPage from './components/Products/ProductsPage';

function App() {
  const [cart, setCart] = useState([]);

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        {/* Route for product categories, dynamically loading products based on the category */}
        <Route path="/products/:category" element={<ProductsPage cart={cart} setCart={setCart} />} />
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
        <Route path="/signin" element={<LoginForm />} /> {/* Use your custom LoginForm */}
        <Route path="/signup" element={<Register />} /> {/* Use your custom Register */}
        {/* Add other routes as necessary */}
      </Routes>
    </Router>
  );
}

export default App;

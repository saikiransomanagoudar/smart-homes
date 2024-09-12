import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Doorbells from './components/Products/Doorbells';
import Doorlocks from './components/Products/Doorlocks';
import Lightings from './components/Products/Lightings';
import Speakers from './components/Products/Speakers';
import Thermostats from './components/Products/Thermostats';
import LoginForm from './components/Auth/LoginForm'; 
import Register from './components/Auth/Register';
import Home from './routes/Home';
import Cart from './components/Cart/Cart';
import './styles/globals.css';
import { useState } from 'react';

function App() {

  const [cart, setCart] = useState([]);

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/products/doorbells" element={<Doorbells cart={cart} setCart={setCart} />} />
        <Route path="/products/doorlocks" element={<Doorlocks cart={cart} setCart={setCart} />} />
        <Route path="/products/speakers" element={<Speakers cart={cart} setCart={setCart} />} />
        <Route path="/products/lightings" element={<Lightings cart={cart} setCart={setCart} />} />
        <Route path="/products/thermostats" element={<Thermostats cart={cart} setCart={setCart} />} />
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
        <Route path="/signin" element={<LoginForm />} /> {/* Use your custom LoginForm */}
        <Route path="/signup" element={<Register />} /> {/* Use your custom Register */}
        {/* Add other routes as necessary */}
      </Routes>
    </Router>
  );
}

export default App;

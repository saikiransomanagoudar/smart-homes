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
import SearchResult from './components/SearchResult/SearchResult';
import ProductsUpdate from './components/ProductsUpdate/ProductsUpdate';
import OpenTicket from './components/OpenTicket/OpenTicket';
import CheckTicketStatus from './components/CheckTicketStatus/CheckTicketStatus';

function App() {
  const [cart, setCart] = useState([]);

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/products/:category" element={<ProductsPage cart={cart} setCart={setCart} />} />
        <Route path="/signin" element={<LoginForm />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout cart={cart} setCart={setCart} />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/sales-report" element={<SalesReport />} />
        <Route path="/search" element={<SearchResult />} />
        <Route path="/update-product" element={<ProductsUpdate />} />
        <Route path="/customer-service/open-ticket" element={<OpenTicket />} />
        <Route path="/customer-service/ticket-status" element={<CheckTicketStatus />} />
      </Routes>
    </Router>
  );
}

export default App;

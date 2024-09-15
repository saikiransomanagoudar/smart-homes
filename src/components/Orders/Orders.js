import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the list of orders from the backend
    fetch('http://localhost:8080/smarthomes/orders', {
      method: 'GET',
      credentials: 'include', // to include cookies if necessary
    })
      .then((response) => response.json())
      .then((data) => {
        setOrders(data.orders); // Assume orders array returned from backend
      })
      .catch(() => {
        setError('Error fetching orders. Please try again.');
      });
  }, []);

  return (
    <div className="orders">
      <h2>My Orders</h2>
      {error && <p>{error}</p>}
      {orders.length > 0 ? (
        <ul>
          {orders.map((order, index) => (
            <li key={index} className="order-item">
              <p>Order Number: {order.confirmationNumber}</p>
              <p>Product Name: {order.productName}</p>
              <p>Order Price: ${order.orderPrice.toFixed(2)}</p>
              <p>Delivery/Pickup Date: {order.deliveryDate}</p>
              <p>Delivery Option: {order.deliveryOption}</p>
              {order.deliveryOption === 'pickup' && <p>Pickup Location: {order.storeLocation}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p>You have no orders yet.</p>
      )}

      <button onClick={() => navigate('/')}>Back to Homepage</button>
    </div>
  );
}

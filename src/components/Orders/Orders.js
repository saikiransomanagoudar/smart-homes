import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Orders() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract order details passed from the Checkout page via state
  // Use default values if state is undefined
  const {
    name = 'Guest',
    address = 'No Address Provided',
    deliveryOption = 'home',
    storeLocation = 'Not Provided',
    cartItems = [],
    totalPrice = 0
  } = location.state || {};

  // Initialize orders state with the received order or an empty array
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (location.state) {
      setOrders([{
        name,
        address,
        deliveryOption,
        storeLocation,
        cartItems,
        totalPrice,
      }]);
    }
  }, [location.state, name, address, deliveryOption, storeLocation, cartItems, totalPrice]);

  // Handle order cancellation
  const cancelOrder = (index) => {
    const updatedOrders = [...orders];
    updatedOrders.splice(index, 1); // Remove the selected order
    setOrders(updatedOrders);
  };

  return (
    <div className="orders max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Your Orders</h2>

      {orders.length > 0 ? (
        orders.map((order, index) => (
          <div key={index} className="order mb-8 p-4 border rounded bg-gray-100">
            <h3 className="text-xl font-semibold mb-2">Order for {order.name}</h3>
            <p>Address: {order.address}</p>
            <p>Delivery Option: {order.deliveryOption === 'pickup' ? 'In-store Pickup' : 'Home Delivery'}</p>
            {order.deliveryOption === 'pickup' && <p>Store Location: {order.storeLocation}</p>}

            <div className="mt-4">
              <h4 className="font-semibold">Items Purchased:</h4>
              {order.cartItems.length > 0 ? (
                order.cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center mb-4">
                    <img src={item.imageP} alt={item.nameP} className="w-20 h-20 object-contain mr-4" />
                    <div>
                      <p><strong>{item.nameP}</strong></p>
                      <p>Price: ${item.priceP}</p>
                      <p>Quantity: {item.quantity}</p>

                      {/* Show accessories if any */}
                      {item.accessories && item.accessories.length > 0 && (
                        <div className="mt-2">
                          <h4 className="font-semibold">Accessories:</h4>
                          <ul>
                            {item.accessories.map((acc, idx) => (
                              <li key={idx}>
                                {acc.nameA} - ${acc.priceA.toFixed(2)} (x{acc.quantity})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>No items in cart.</p>
              )}
            </div>
            <p className="mt-2 font-bold">Total Price: ${order.totalPrice.toFixed(2)}</p>

            {/* Cancel order button */}
            <button
              onClick={() => cancelOrder(index)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Cancel Order
            </button>
          </div>
        ))
      ) : (
        <p>No orders available.</p>
      )}

      {/* Button to go back to homepage */}
      <button onClick={() => navigate('/')} className="mt-8 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Go back to homepage
      </button>
    </div>
  );
}

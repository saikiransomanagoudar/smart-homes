import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  // Fetch orders from backend
  useEffect(() => {
    fetch("http://localhost:8080/smarthomes/orders", {
      method: "GET",
      credentials: "include" // Include credentials (cookies) in request
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Orders: ", data.orders);
        setOrders(data.orders);
      })
      .catch((err) => {
        setError("Failed to fetch orders. Please try again.");
        console.error(err);
      });
  }, []);

  // Handle order cancellation
  const cancelOrder = (orderId) => {
    fetch(`http://localhost:8080/smarthomes/orders/${orderId}`, {
      method: 'DELETE',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.error || 'Failed to cancel the order');
          });
        }
        return response.json(); // Parse JSON response
      })
      .then((data) => {
        console.log('Order cancelled successfully', data);
        // After successful cancellation, update the UI without refreshing
        const updatedOrders = orders.map(order => 
          order.orderId === orderId ? { ...order, status: 'Cancelled' } : order
        );
        setOrders(updatedOrders); // Update state with the new order status
      })
      .catch((error) => {
        console.error('Error:', error.message);
        // Handle error
      });
  };
  
  return (
    <div className="orders max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
  
      {error && <p className="text-red-500">{error}</p>}
  
      {orders.length > 0 ? (
        orders.map((order, index) => (
          <div
            key={index}
            className="order mb-8 p-4 border rounded bg-gray-100"
          >
            <h3 className="text-xl font-semibold mb-2">
              Order for {order.customerName || "Unknown"}
            </h3>
            <p>Address: {order.customerAddress || "No address provided"}</p>
            <p>
              Delivery Option:{" "}
              {order.deliveryOption === "pickup" ? "In-store Pickup" : "Home Delivery"}
            </p>
            {order.deliveryOption === "pickup" && order.storeLocation && (
              <p>Store Location: {order.storeLocation.storeAddress}</p>
            )}
  
            <div className="mt-4">
              <h4 className="font-semibold">
                {order.quantity === 1 ? "Item Purchased:" : "Items Purchased:"}
              </h4>
              <p>Product Name: {order.name || "No product name available"}</p>
              <p>Category: {order.category || "No category available"}</p>
              <p>Quantity: {order.quantity || 1}</p>
              <p>Total Price: ${order.price}</p>
              <p>Status: {order.status || "Processing"}</p> {/* Show order status */}
            </div>
  
            {/* Cancel order button */}
            {order.status === "Processing" && (
              <button
                onClick={() => cancelOrder(order.orderId)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Cancel Order
              </button>
            )}
          </div>
        ))
      ) : (
        <p>No orders available.</p>
      )}
  
      {/* Button to go back to homepage */}
      <button
        onClick={() => navigate("/")}
        className="mt-8 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Go back to homepage
      </button>
    </div>
  );  
}

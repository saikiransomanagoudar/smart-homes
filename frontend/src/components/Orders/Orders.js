import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]); // Initialize orders as an empty array
  const [error, setError] = useState(null);
  const [loginType, setLoginType] = useState(null);

  // Fetch orders and determine login type
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const storedLoginType = localStorage.getItem("loginType");

    if (!isLoggedIn) {
      // If not logged in, redirect to the login page
      navigate("/signin");
      return;
    }

    // Set loginType from localStorage
    setLoginType(storedLoginType);

    // Fetch orders from backend
    fetch("http://localhost:8080/smarthomes/orders", {
      method: "GET",
      credentials: "include" // Include credentials (cookies) in request
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          setOrders(data);
        } else {
          setOrders([]); // If no orders are found, set an empty array
        }
      })
      .catch((err) => {
        setError("Failed to fetch orders. Please try again.");
        console.error(err);
      });
  }, [navigate]);

  // Handle order cancellation (for Customers)
  const cancelOrder = (orderId) => {
    fetch(`http://localhost:8080/smarthomes/orders/${orderId}`, {
      method: "PUT",
      credentials: "include", // Include cookies
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "cancelOrder" // Customers send this action to cancel the order
      })
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.error || "Failed to cancel the order");
          });
        }
        return response.json(); // Parse JSON response
      })
      .then((data) => {
        console.log("Order cancelled successfully", data);
        // Update the orders state to reflect the cancellation
        const updatedOrders = orders.map((order) =>
          order.orderId === orderId ? { ...order, status: "Cancelled" } : order
        );
        setOrders(updatedOrders); // Update state with the new order status
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  };

  // Handle updating the quantity of an order (for Store Managers)
  const updateOrderQuantity = (orderId) => {
    fetch(`http://localhost:8080/smarthomes/orders/${orderId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "incrementQuantity" // Store Managers send this action to increment quantity
      })
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.error || "Failed to update order quantity");
          });
        }
        return response.json(); // Parse JSON response
      })
      .then((data) => {
        console.log("Order quantity updated successfully", data);
        // Update the orders state with the new quantity
        setOrders(
          orders.map((order) =>
            order.orderId === orderId
              ? { ...order, quantity: order.quantity + 1 }
              : order
          )
        );
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  };

  // Handle order deletion (for Store Managers)
  const deleteOrder = (orderId) => {
    fetch(`http://localhost:8080/smarthomes/orders/${orderId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.error || "Failed to delete the order");
          });
        }
        return response.json(); // Parse JSON response
      })
      .then((data) => {
        console.log("Order deleted successfully", data);
        // Remove the deleted order from the orders state
        setOrders(orders.filter((order) => order.orderId !== orderId));
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  };

  return (
    <div className="orders max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Orders</h2>
        {loginType === "StoreManager" && (
          <Link
            to="/trending"
            className="text-sm sm:text-base flex items-center"
          >
            <FontAwesomeIcon icon={faFire} className="mr-2" />
            Trending Products
          </Link>
        )}
      </div>
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
              {order.deliveryOption === "pickup"
                ? "In-store Pickup"
                : "Home Delivery"}
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
              <p>Status: {order.status || "Processing"}</p>
            </div>

            {/* Customer: Cancel Order Button */}
            {loginType === "Customer" && order.status === "Processing" && (
              <button
                onClick={() => cancelOrder(order.orderId)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Cancel Order
              </button>
            )}

            {/* Store Manager: Add, Update, and Delete Buttons */}
            {loginType === "StoreManager" && (
              <div className="mt-4">
                <button
                  onClick={() => navigate(`/`)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Add Order
                </button>

                <button
                  onClick={() => updateOrderQuantity(order.orderId)}
                  className="ml-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Update Order
                </button>

                <button
                  onClick={() => deleteOrder(order.orderId)}
                  className="ml-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Delete Order
                </button>
              </div>
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

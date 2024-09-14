import React, { useEffect, useState } from "react";
import { Img } from "react-image";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  // Fetch cart items from the backend
  useEffect(() => {
    if (isLoggedIn === "true") {
      fetch("http://localhost:8080/smarthomes/cart", {
        method: "GET",
        credentials: "include",  // Include credentials (cookies) in request
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Cart items fetched:", data);
          // Ensure every item has a quantity property
          const updatedItems = data.map(item => ({
            ...item,
            quantity: item.quantity || 1, // Default quantity to 1 if not present
          }));
          setCartItems(updatedItems);
        })
        .catch((error) => console.error("Error fetching cart:", error));
    } else {
      navigate("/signin"); // Redirect to sign-in if not logged in
    }
  }, [isLoggedIn, navigate]);

  // Function to increase the quantity of an item (product or accessory)
  const handleAddItem = (id) => {
    const updatedCart = cartItems.map((item) => {
      if (item.id === id) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });
    setCartItems(updatedCart);

    // Send updated cart data to backend to persist the state
    const updatedItem = updatedCart.find((item) => item.id === id);
    updateCartItemBackend(updatedItem);
  };

  // Function to decrease the quantity of an item (product or accessory)
  const handleRemoveItem = (id) => {
    const updatedCart = cartItems.map((item) => {
      if (item.id === id && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    }).filter(item => item.quantity > 0);
    setCartItems(updatedCart);

    // If quantity > 0, update the backend, else delete from backend
    const updatedItem = updatedCart.find((item) => item.id === id);
    if (updatedItem) {
      updateCartItemBackend(updatedItem);
    } else {
      deleteCartItemBackend(id);
    }
  };

  // Function to persist the updated item in the backend
  const updateCartItemBackend = (item) => {
    fetch("http://localhost:8080/smarthomes/cart", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Item updated in cart:", data);
      })
      .catch((error) => console.error("Error updating item in cart:", error));
  };

  // Function to remove the item from the backend
  const deleteCartItemBackend = (id) => {
    fetch("http://localhost:8080/smarthomes/cart", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Item removed from cart:", data);
      })
      .catch((error) => console.error("Error removing item from cart:", error));
  };

  // Calculate subtotal
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.priceP * item.quantity, 0);
  };

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center bg-white p-4 shadow">
              <Img
                src={item.imageP} // Ensure using the correct image property
                alt={item.nameP}
                className="w-20 h-20 object-cover mr-4"
              />
              <div className="flex-grow">
                <h3 className="text-lg font-bold">{item.nameP}</h3>
                <p>{item.priceP}</p> {/* Price should be formatted properly */}
                <p>Quantity: {item.quantity}</p>
                <p>Accessories:</p>
                <ul>
                  {item.accessories.map((acc) => (
                    <li key={acc.nameA}>
                      <Img
                        src={acc.imageA}
                        alt={acc.nameA}
                        className="w-10 h-10 object-cover inline-block"
                      />
                      {` ${acc.nameA} - ${acc.priceA}`}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col items-center">
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded mb-1"
                  onClick={() => handleAddItem(item.id)}
                >
                  Add
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Your cart is empty.</p>
      )}

      {/* Subtotal and checkout */}
      {cartItems.length > 0 && (
        <div className="mt-4">
          <p>
            Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
            items): ${calculateTotal().toFixed(2)}
          </p>
          <button
            className="bg-blue-500 text-white px-4 py-2 mt-4"
            onClick={() => navigate("/checkout")}
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}

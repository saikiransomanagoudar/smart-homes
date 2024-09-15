import React, { useEffect, useState } from "react";
import { Img } from "react-image";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  const handleUpdateCartCount = () => {
    const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    localStorage.setItem("cartCount", totalCount);
  };

  useEffect(() => {
    handleUpdateCartCount();
  }, [cartItems]);

  useEffect(() => {
    if (isLoggedIn === "true") {
      fetch("http://localhost:8080/smarthomes/cart", {
        method: "GET",
        credentials: "include", // Include credentials (cookies) in request
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Cart items fetched:", data);

          const { products = [], accessories = [] } = data;

          const combinedItems = [
            ...products.map((item) => ({
              ...item,
              quantity: item.quantity || 1,
              isAccessory: false,
            })),
            ...accessories.map((acc) => ({
              id: `accessory-${acc.nameA}`,
              nameP: acc.nameA,
              priceP: acc.priceA,
              imageP: acc.imageA,
              quantity: acc.quantity || 1,
              isAccessory: true,
            })),
          ];

          setCartItems(combinedItems);
        })
        .catch((error) => console.error("Error fetching cart:", error));
    } else {
      navigate("/signin");
    }
  }, [isLoggedIn, navigate]);

  const updateCartBackend = (updatedCart) => {
    console.log("Updating cart:", updatedCart);

    fetch("http://localhost:8080/smarthomes/cart", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedCart),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => console.error("Error updating cart:", error));
  };

  const handleAddItem = (id) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );

    setCartItems(updatedCart);
    updateCartBackend(updatedCart);
  };

  const handleRemoveItem = (id) => {
    const updatedCart = cartItems
      .map((item) => {
        if (item.id === id && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        } else if (item.id === id && item.quantity === 1) {
          return null;
        }
        return item;
      })
      .filter((item) => item !== null);

    setCartItems(updatedCart);
    updateCartBackend(updatedCart);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.priceP || 0) * item.quantity;
    }, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      navigate("/checkout", { state: { cartItems } });
    } else {
      alert("Your cart is empty!");
    }
  };

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {cartItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="flex items-center bg-white p-4 shadow"
            >
              <Img
                src={item.imageP}
                alt={item.nameP}
                className="w-20 h-20 object-cover mr-4"
              />
              <div className="flex-grow">
                <h3 className="text-lg font-bold">{item.nameP}</h3>
                <p>${item.priceP.toFixed(2)}</p>
                <p>Quantity: {item.quantity}</p>
                <p>{item.isAccessory ? "Accessory" : "Product"}</p>
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

      {cartItems.length > 0 && (
        <div className="mt-4">
          <p>
            Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
            items): ${calculateTotal().toFixed(2)}
          </p>
          <button
            className="bg-blue-500 text-white px-4 py-2 mt-4"
            onClick={handleCheckout}
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}

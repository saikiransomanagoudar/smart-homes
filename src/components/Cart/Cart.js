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
        credentials: "include" // Include credentials (cookies) in request
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Cart items fetched:", data);
          // Ensure every item has a quantity property
          const updatedItems = data.map((item) => ({
            ...item,
            quantity: item.quantity || 1, // Default quantity to 1 if not present
            accessories: item.accessories.map((acc) => ({
              ...acc,
              quantity: acc.quantity || 1 // Default quantity for accessories
            }))
          }));
          setCartItems(updatedItems);
        })
        .catch((error) => console.error("Error fetching cart:", error));
    } else {
      navigate("/signin"); // Redirect to sign-in if not logged in
    }
  }, [isLoggedIn, navigate]);

  // Function to update the cart on the backend
  const updateCartBackend = (updatedCart) => {
    setCartItems(updatedCart);
    fetch("http://localhost:8080/smarthomes/cart", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedCart)
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Cart updated:", data);
      })
      .catch((error) => console.error("Error updating cart:", error));
  };

  // Function to handle adding a product or accessory
  const handleAddItem = (id, isAccessory = false, accName = null) => {
    const updatedCart = cartItems.map((item) => {
      if (
        isAccessory &&
        item.accessories.some((acc) => acc.nameA === accName)
      ) {
        const updatedAccessories = item.accessories.map((acc) => {
          if (acc.nameA === accName) {
            return { ...acc, quantity: acc.quantity + 1 };
          }
          return acc;
        });
        return { ...item, accessories: updatedAccessories };
      } else if (item.id === id) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });

    updateCartBackend(updatedCart);
  };

  const handleRemoveItem = (id, isAccessory = false, accName = null) => {
    const updatedCart = cartItems
      .map((item) => {
        if (
          isAccessory &&
          item.accessories.some((acc) => acc.nameA === accName)
        ) {
          const updatedAccessories = item.accessories
            .map((acc) => {
              if (acc.nameA === accName) {
                return { ...acc, quantity: acc.quantity - 1 };
              }
              return acc;
            })
            .filter((acc) => acc.quantity > 0); // Remove accessory if its quantity reaches 0
          return { ...item, accessories: updatedAccessories };
        } else if (item.id === id) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      })
      .filter(
        (item) =>
          item.quantity > 0 || (item.accessories && item.accessories.length > 0)
      ); // Remove product if quantity is 0 and no accessories are left

    updateCartBackend(updatedCart);
  };

  // Calculate subtotal (includes products and accessories)
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal = parseFloat(item.priceP) * item.quantity;
      const accessoriesTotal = item.accessories.reduce(
        (accSum, acc) => accSum + parseFloat(acc.priceA) * acc.quantity,
        0
      );
      return total + itemTotal + accessoriesTotal;
    }, 0);
  };

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center bg-white p-4 shadow"
            >
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
                    <li key={acc.nameA} className="mb-2">
                      <Img
                        src={acc.imageA}
                        alt={acc.nameA}
                        className="w-10 h-10 object-cover inline-block"
                      />
                      {` ${acc.nameA} - ${acc.priceA}`}
                      <div className="flex space-x-2 mt-1">
                        <button
                          className="bg-green-500 text-white px-2 py-1 rounded"
                          onClick={() =>
                            handleAddItem(item.id, true, acc.nameA)
                          }
                        >
                          Add
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded"
                          onClick={() =>
                            handleRemoveItem(item.id, true, acc.nameA)
                          }
                        >
                          Remove
                        </button>
                      </div>
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
          {/* Subtotal calculation */}
          <p>
            Subtotal (
            {(cartItems || []).reduce((sum, item) => sum + item.quantity, 0)}{" "}
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

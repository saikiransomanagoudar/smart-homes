import React, { useEffect, useState } from "react";
import { Img } from "react-image";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  const handleUpdateCartCount = () => {
    const newCartCount = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    localStorage.setItem("cartCount", newCartCount); // Store updated cart count
  };

  useEffect(() => {
    handleUpdateCartCount();
  }, [cartItems]);

  useEffect(() => {
    if (isLoggedIn === "true") {
      fetch("http://localhost:8080/smarthomes/cart", {
        method: "GET",
        credentials: "include" // Include credentials (cookies) in request
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
              accessories: item.accessories || []
            })),
            ...accessories.map((acc) => ({
              ...acc,
              quantity: acc.quantity || 1
            }))
          ];

          setCartItems(combinedItems);
        })
        .catch((error) => console.error("Error fetching cart:", error));
    } else {
      navigate("/signin"); // Redirect to sign-in if not logged in
    }
  }, [isLoggedIn, navigate]);

  const updateCartBackend = (updatedCart) => {
    console.log("Updating cart:", updatedCart);

    fetch("http://localhost:8080/smarthomes/cart", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedCart)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Cart updated:", data);
      })
      .catch((error) => console.error("Error updating cart:", error));
  };

  const handleAddItem = (id, isAccessory = false, accName = null) => {
    const updatedCart = cartItems.map((item) => {
      if (isAccessory && item.accessories && item.accessories.some((acc) => acc.nameA === accName)) {
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
    
    setCartItems(updatedCart);
    updateCartBackend(updatedCart);
  };
  

  const handleRemoveItem = (id, isAccessory = false, accName = null) => {
    const updatedCart = cartItems
      .map((item) => {
        if (isAccessory && item.accessories && item.accessories.some((acc) => acc.nameA === accName)) {
          const updatedAccessories = item.accessories
            .map((acc) => {
              if (acc.nameA === accName && acc.quantity > 1) {
                return { ...acc, quantity: acc.quantity - 1 };
              } else if (acc.nameA === accName && acc.quantity === 1) {
                return null;
              }
              return acc;
            })
            .filter((acc) => acc !== null);
          return { ...item, accessories: updatedAccessories };
        } else if (item.id === id && item.quantity > 1) {
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
      let itemTotal = item.priceP * item.quantity;
      const accessoriesTotal = item.accessories ? item.accessories.reduce(
        (accSum, acc) => accSum + acc.priceA * acc.quantity,
        0
      ) : 0;
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
                src={item.imageP}
                alt={item.nameP}
                className="w-20 h-20 object-cover mr-4"
              />
              <div className="flex-grow">
                <h3 className="text-lg font-bold">{item.nameP}</h3>
                <p>${item.priceP !== undefined ? item.priceP.toFixed(2) : "0.00"}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Accessories:</p>
                <ul>
                  {Array.isArray(item.accessories) && item.accessories.map((acc) => (
                    <li key={acc.nameA} className="mb-2">
                      <Img
                        src={acc.imageA}
                        alt={acc.nameA}
                        className="w-10 h-10 object-cover inline-block"
                      />
                      {` ${acc.nameA} - $${acc.priceA !== undefined ? acc.priceA.toFixed(2) : "0.00"}`}
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

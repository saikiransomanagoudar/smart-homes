import React, { useEffect, useState } from "react";
import { Img } from "react-image";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  const handleUpdateCartCount = () => {
    const totalCount = products.reduce((sum, item) => sum + item.quantity, 0) +
                       accessories.reduce((sum, acc) => sum + acc.quantity, 0);
    localStorage.setItem("cartCount", totalCount);
  };

  useEffect(() => {
    handleUpdateCartCount();
  }, [products, accessories]);

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

          // Set products and accessories separately
          setProducts(data.products || []);
          setAccessories(data.accessories || []);
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
      credentials: "include",
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

  const handleAddProduct = (id) => {
    const updatedProducts = products.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setProducts(updatedProducts);
    updateCartBackend({ products: updatedProducts, accessories });
  };

  const handleRemoveProduct = (id) => {
    const updatedProducts = products
      .map((item) => {
        if (item.id === id && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        } else if (item.id === id && item.quantity === 1) {
          return null;
        }
        return item;
      })
      .filter((item) => item !== null);

    setProducts(updatedProducts);
    updateCartBackend({ products: updatedProducts, accessories });
  };

  const handleAddAccessory = (nameA) => {
    const updatedAccessories = accessories.map((acc) =>
      acc.nameA === nameA ? { ...acc, quantity: acc.quantity + 1 } : acc
    );
    setAccessories(updatedAccessories);
    updateCartBackend({ products, accessories: updatedAccessories });
  };

  const handleRemoveAccessory = (nameA) => {
    const updatedAccessories = accessories
      .map((acc) => {
        if (acc.nameA === nameA && acc.quantity > 1) {
          return { ...acc, quantity: acc.quantity - 1 };
        } else if (acc.nameA === nameA && acc.quantity === 1) {
          return null;
        }
        return acc;
      })
      .filter((acc) => acc !== null);

    setAccessories(updatedAccessories);
    updateCartBackend({ products, accessories: updatedAccessories });
  };

  // Calculate the total cost
  const calculateTotal = () => {
    const productTotal = products.reduce((total, item) => {
      return total + (item.priceP || 0) * item.quantity;
    }, 0);

    const accessoryTotal = accessories.reduce((total, acc) => {
      return total + (acc.priceA || 0) * acc.quantity;
    }, 0);

    return productTotal + accessoryTotal;
  };

  // Handle checkout action
  const handleCheckout = () => {
    if (products.length > 0 || accessories.length > 0) {
      navigate("/checkout", { state: { products, accessories } });
    } else {
      alert("Your cart is empty!");
    }
  };

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {/* Render products section */}
      {products.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Products:</h2>
          <div className="grid grid-cols-1 gap-4">
            {products.map((item, index) => (
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
                  <p>${item.priceP?.toFixed(2) || "N/A"}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded mb-1"
                    onClick={() => handleAddProduct(item.id)}
                  >
                    Add
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleRemoveProduct(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Render accessories section */}
      {accessories.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Accessories:</h2>
          <div className="grid grid-cols-1 gap-4">
            {accessories.map((acc, index) => (
              <div
                key={`${acc.nameA}-${index}`}
                className="flex items-center bg-white p-4 shadow"
              >
                <Img
                  src={acc.imageA}
                  alt={acc.nameA}
                  className="w-20 h-20 object-cover mr-4"
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-bold">{acc.nameA}</h3>
                  <p>${acc.priceA?.toFixed(2) || "N/A"}</p>
                  <p>Quantity: {acc.quantity}</p>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded mb-1"
                    onClick={() => handleAddAccessory(acc.nameA)}
                  >
                    Add
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleRemoveAccessory(acc.nameA)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtotal and Checkout */}
      {(products.length > 0 || accessories.length > 0) && (
        <div className="mt-4">
          <p>
            Subtotal (
            {products.reduce((sum, item) => sum + item.quantity, 0) +
              accessories.reduce((sum, acc) => sum + acc.quantity, 0)}{" "}
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

      {/* Empty cart message */}
      {products.length === 0 && accessories.length === 0 && (
        <p>Your cart is empty.</p>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Img } from "react-image";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]); // Treat products and accessories as items
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  const handleUpdateCartCount = () => {
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    localStorage.setItem("cartCount", totalCount);
  };

  useEffect(() => {
    handleUpdateCartCount();
  }, [items]);

  useEffect(() => {
    if (isLoggedIn === "true") {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        setItems(JSON.parse(storedCart));
      } else {
        fetch("http://localhost:8080/smarthomes/cart", {
          method: "GET",
          credentials: "include" // Include credentials (cookies) in request
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            if (response.status === 204) {
              // No content returned, meaning an empty cart
              return { products: [], accessories: [] };
            }
            return response.json();
          })
          .then((data) => {
            const allItems = [...data.products, ...data.accessories];
            setItems(allItems);
            localStorage.setItem("cart", JSON.stringify(allItems));
            handleUpdateCartCount();
          })
          .catch((error) => console.error("Error fetching cart:", error));
      }
    } else {
      navigate("/signin");
    }
  }, [isLoggedIn, navigate]);

  const handleAddItem = (id) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setItems(updatedItems);
    localStorage.setItem("cart", JSON.stringify(updatedItems));
  
    const updatedItem = updatedItems.find((item) => item.id === id);
    // Send updated item to the backend to increase quantity
    fetch("http://localhost:8080/smarthomes/cart/product", {
      method: "PUT", // Use PUT to increase the item quantity in the backend
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: updatedItem.id,
        quantity: updatedItem.quantity,
        type: updatedItem.type, // Ensure type is sent (accessory or product)
        userId: localStorage.getItem("userId"), // Ensure the userId is sent to backend
      }),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update item quantity.");
      }
    })
    .catch((error) => {
      console.error("Error updating cart:", error);
    });
  };
  
  const handleRemoveItem = (id) => {
    const updatedItems = items
      .map((item) => {
        if (item.id === id && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 }; // Decrease quantity
        } else if (item.id === id && item.quantity === 1) {
          return null; // Remove the item if the quantity is 1
        }
        return item;
      })
      .filter((item) => item !== null); // Filter out items where quantity is 0
  
    setItems(updatedItems);
    localStorage.setItem("cart", JSON.stringify(updatedItems));
  
    const removedItem = items.find((item) => item.id === id);
    
    if (removedItem && removedItem.quantity === 1) {
      // Send DELETE request if quantity is 1 and removed
      fetch("http://localhost:8080/smarthomes/cart/product", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: removedItem.id,
          type: removedItem.type,
          userId: localStorage.getItem("userId"),
        }),
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to remove item from cart.");
        }
      })
      .catch((error) => {
        console.error("Error deleting item from cart:", error);
      });
    } else if (removedItem && removedItem.quantity > 1) {
      // Update backend when quantity is reduced
      fetch("http://localhost:8080/smarthomes/cart/product", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: removedItem.id,
          quantity: removedItem.quantity - 1, // Ensure the new quantity is sent
          type: removedItem.type,
          userId: localStorage.getItem("userId"),
        }),
      })
      .catch((error) => {
        console.error("Error updating cart:", error);
      });
    }
  };  

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0); // Simplified price calculation
  };

  const handleCheckout = () => {
    if (items.length > 0) {
      navigate("/checkout", {
        state: { products: items }
      });
    } else {
      alert("Your cart is empty!");
    }
  };

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {items.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Items:</h2>
          <div className="grid grid-cols-1 gap-4">
            {items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex items-center bg-white p-4 shadow">
                <Img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover mr-4"
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-bold">{item.name}</h3>
                  <p>${item.price.toFixed(2)}</p>
                  <p>Quantity: {item.quantity}</p>
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
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-4">
          <p>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items): ${calculateTotal().toFixed(2)}</p>
          <button className="bg-blue-500 text-white px-4 py-2 mt-4" onClick={handleCheckout}>
            Checkout
          </button>
        </div>
      )}

      {items.length === 0 && <p>Your cart is empty.</p>}
    </div>
  );
}

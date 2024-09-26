import React, { useEffect, useState } from "react";
import { Img } from "react-image";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]); // Treat products and accessories as items
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  const discountProducts = {
    1: { discount: 10, rebate: 5 }, // Blink Video Doorbell
    3: { discount: 20, rebate: 10 }, // Ring Video Doorbell
    10: { discount: 15, rebate: 7 }, // Philips Wi-Fi Smart Door Lock
    14: { discount: 18, rebate: 5 }, // GE Cync A19 Smart LED Light Bulbs
    23: { discount: 25, rebate: 15 }, // Sonos Roam - White
    26: { discount: 30, rebate: 20 }, // Sensis Lite Smart Thermostat
    4: { discount: 12, rebate: 6 }, // Google Nest Doorbell
    11: { discount: 22, rebate: 12 }, // Yale Assure Lock 2 Wi-Fi Smart Door Lock
    16: { discount: 17, rebate: 8 }, // Amazon Echo Studio
    18: { discount: 25, rebate: 10 }, // Google Nest Mini (2nd Gen)
    28: { discount: 20, rebate: 10 }, // Vine Thermostat for Home
    5: { discount: 18, rebate: 9 } // Smart Doorlock
  };

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

  // Handle adding a new item to the cart
  const handleAddItem = (id, type) => {
    const existingItem = items.find(
      (item) => item.id === id && item.type === type
    );

    if (existingItem) {
      // If the item is already in the cart, increase its quantity
      const updatedItems = items.map((item) =>
        item.id === id && item.type === type
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setItems(updatedItems);
      localStorage.setItem("cart", JSON.stringify(updatedItems));

      const updatedItem = updatedItems.find(
        (item) => item.id === id && item.type === type
      );

      // Send PUT request to update the quantity
      fetch("http://localhost:8080/smarthomes/cart/product", {
        method: "PUT", // Use PUT to increase the item quantity in the backend
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          id: updatedItem.id,
          quantity: updatedItem.quantity,
          type: updatedItem.type, // Ensure type is sent (accessory or product)
          userId: localStorage.getItem("userId") // Ensure the userId is sent to backend
        })
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to update item quantity.");
          }
        })
        .catch((error) => {
          console.error("Error updating cart:", error);
        });
    } else {
      // If the item is not in the cart, add it
      const newItem = { id, type, quantity: 1 };

      // Send POST request to add a new item
      fetch("http://localhost:8080/smarthomes/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          ...newItem,
          userId: localStorage.getItem("userId")
        })
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to add item to cart.");
          }
          return response.json();
        })
        .then(() => {
          // Update local state and storage with the newly added item
          const updatedItems = [...items, newItem];
          setItems(updatedItems);
          localStorage.setItem("cart", JSON.stringify(updatedItems));
        })
        .catch((error) => {
          console.error("Error adding item to cart:", error);
        });
    }
  };

  // Handle removing an item from the cart
  const handleRemoveItem = (id, type) => {
    const updatedItems = items
      .map((item) => {
        if (item.id === id && item.quantity > 1 && item.type === type) {
          return { ...item, quantity: item.quantity - 1 }; // Decrease quantity
        } else if (
          item.id === id &&
          item.quantity === 1 &&
          item.type === type
        ) {
          return null; // Remove the item if the quantity is 1
        }
        return item;
      })
      .filter((item) => item !== null); // Filter out items where quantity is 0

    setItems(updatedItems);
    localStorage.setItem("cart", JSON.stringify(updatedItems));

    const removedItem = items.find(
      (item) => item.id === id && item.type === type
    );

    if (removedItem && removedItem.quantity === 1) {
      // Send DELETE request if quantity is 1 and removed
      fetch("http://localhost:8080/smarthomes/cart/product", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          id: removedItem.id,
          type: removedItem.type,
          userId: localStorage.getItem("userId")
        })
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
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          id: removedItem.id,
          quantity: removedItem.quantity - 1, // Ensure the new quantity is sent
          type: removedItem.type,
          userId: localStorage.getItem("userId")
        })
      }).catch((error) => {
        console.error("Error updating cart:", error);
      });
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const discount = discountProducts[item.id]?.discount || 0;
      const itemPrice = typeof item.price === "number" ? item.price : 0; 
      const discountedPrice = itemPrice - (itemPrice * discount) / 100;
  
      return total + discountedPrice * item.quantity;
    }, 0); // Ensure total starts at 0
  };
  

  const handleCheckout = () => {
    if (items.length > 0) {
      // Separate products and accessories if necessary
      const products = items.filter((item) => item.type === "product");
      const accessories = items.filter((item) => item.type === "accessory");

      console.log("Products being sent to checkout:", products);
      console.log("Accessories being sent to checkout:", accessories);

      // Navigate to checkout with both products and accessories
      navigate("/checkout", {
        state: {
          products: products,
          accessories: accessories // Send accessories to the checkout page
        }
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
            {items.map((item, index) => {
              const discount = discountProducts[item.id]?.discount || 0;
              const itemPrice = typeof item.price === "number" ? item.price : 0;
              const discountedPrice =
                item.price - (item.price * discount) / 100;

              return (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center bg-white p-4 shadow"
                >
                  <Img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover mr-4"
                  />
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    {discount > 0 ? (
                      <>
                        <p className="line-through text-red-500">
                          ${itemPrice.toFixed(2)}
                        </p>
                        <p>
                          ${discountedPrice.toFixed(2)}{" "}
                          <span className="text-green-500">
                            ({discount}% OFF)
                          </span>
                        </p>
                      </>
                    ) : (
                      <p>${item.price?.toFixed(2)}</p>
                    )}
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded mb-1"
                      onClick={() => handleAddItem(item.id, item.type)}
                    >
                      Add
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleRemoveItem(item.id, item.type)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-4">
          <p>
            Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
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

      {items.length === 0 && <p>Your cart is empty.</p>}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Img } from "react-image";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom"; // Ensure this is imported correctly

export default function Cart() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  // Fetch cart items from the backend
  useEffect(() => {
    if (isSignedIn) {
      fetch("http://localhost:8080/smarthomes/cart") // Change the URL if your API runs on a different port
        .then((response) => response.json())
        .then((data) => setCartItems(data))
        .catch((error) => console.error("Error fetching cart:", error));
    } else {
      navigate("/signin"); // Redirect to sign-in if not logged in
    }
  }, [isSignedIn, navigate]);

  // Function to remove items from the cart (DELETE request)
  const handleRemoveItem = (id) => {
    // fetch(`http://localhost:8080/smarthomes/cart?id=${id}`, { method: "DELETE" })
    //   .then((response) => response.json())
    //   .then(() => {
    //     setCartItems(cartItems.filter((item) => item.id !== id));
    //   })
    //   .catch((error) => console.error("Error removing item:", error));
    if (id.startsWith("accessory")) {
      handleDeleteAccessoryFromCart(cart.find((item) => item.id === id));
    } else {
      handleDeleteProductFromCart(cart.find((item) => item.id === id));
    }
  };

  const handleDeleteAccessoryFromCart = (accessory) => {
    const accessoryCartId = `accessory-${accessory.id}`; // Use the same unique identifier
    fetch("http://localhost:8080/smarthomes/cart", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: accessoryCartId,
        name: accessory.name,
        price: accessory.price,
        image: accessory.image
      })
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Accessory deleted from cart:", data);
        const accessoryInCart = cart.find(
          (cartItem) => cartItem.id === accessoryCartId
        );
        if (accessoryInCart && accessoryInCart.quantity > 1) {
          setCart(
            cart.map((cartItem) =>
              cartItem.id === accessoryCartId
                ? { ...cartItem, quantity: cartItem.quantity - 1 }
                : cartItem
            )
          );
        } else {
          setCart(cart.filter((cartItem) => cartItem.id !== accessoryCartId));
        }
      })
      .catch((error) => console.error("Error deleting accessory:", error));
  };

  const handleDeleteProductFromCart = (product) => {
    fetch("http://localhost:8080/smarthomes/cart", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      })
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Product deleted from cart:", data);
        const productInCart = cart.find(
          (cartItem) => cartItem.id === product.id
        );
        if (productInCart) {
          setCart(
            cart.map((cartItem) =>
              cartItem.id === product.id
                ? { ...cartItem, quantity: cartItem.quantity - 1 }
                : cartItem
            )
          );
        } else {
          setCart([...cart, { ...product, quantity: 1 }]);
        }
      })
      .catch((error) => console.error("Error deleting product:", error));
  };

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center bg-white p-4 shadow">
              <Img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover mr-4"
              />
              <div className="flex-grow">
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p>{item.price}</p>
              </div>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => handleRemoveItem(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>Your cart is empty.</p>
      )}
      {cartItems.length > 0 && (
        <button
          className="bg-blue-500 text-white px-4 py-2 mt-4"
          onClick={() => navigate("/checkout")}
        >
          Checkout
        </button>
      )}
    </div>
  );
}

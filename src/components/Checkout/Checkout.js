import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    creditCard: "",
    deliveryOption: "home", // Default to home delivery
    storeLocation: "" // Store location for in-store pickup
  });
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState("");
  const [cartItems, setCartItems] = useState([]); // For cart items or product
  const [totalPrice, setTotalPrice] = useState(0); // Track the total price

  // Retrieve product details from location state (for Buy Now)
  const productDetails = location.state?.product || null;

  // Load cart items if no product details (coming from Cart page)
  useEffect(() => {
    if (isLoggedIn === "true") {
      if (!productDetails) {
        // Fetch cart items from the backend
        fetch("http://localhost:8080/smarthomes/cart", {
          method: "GET",
          credentials: "include" // Include credentials (cookies) in request
        })
          .then((response) => response.json())
          .then((data) => {
            const products = data || [];
            setCartItems(products); // Add accessories to cart items
            calculateTotalPrice(products); // Update price calculation
          })
          .catch((error) => {
            console.error("Error fetching cart items:", error);
          });
      } else {
        // If it's a Buy Now, set the product as the only item in cartItems
        setCartItems([{ ...productDetails, quantity: 1 }]);
        setTotalPrice(productDetails.price); // Set initial price for Buy Now
      }
    } else {
      navigate("/signin");
    }
  }, [productDetails, isLoggedIn, navigate]);

  // Hardcoded store locations for pickup
  const storeLocations = [
    "Store 1: 1001 Main St, ZIP: 12345",
    "Store 2: 1501 Maple Ave, ZIP: 12346",
    "Store 3: 2001 Oak St, ZIP: 12347",
    "Store 4: 2501 Pine St, ZIP: 12348",
    "Store 5: 3001 Elm St, ZIP: 12349",
    "Store 6: 3501 Cedar St, ZIP: 12350",
    "Store 7: 4001 Birch St, ZIP: 12351",
    "Store 8: 4501 Walnut St, ZIP: 12352",
    "Store 9: 5001 Chestnut St, ZIP: 12353",
    "Store 10: 5501 Spruce St, ZIP: 12354"
  ];

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calculate total price based on cart items
  const calculateTotalPrice = (products) => {
    const total = products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  };

  const calculateTotalSales = (products) => {
    const totalSales = products.reduce((sum, item) => sum + item.quantity, 0);
    return totalSales;
  };  

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate inputs
    if (
      !formData.name ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zip ||
      !formData.creditCard
    ) {
      setError("Please fill out all required fields.");
      return;
    }

    // Ensure each cart item contains product_name (name field)
    const updatedCartItems = cartItems.map((item) => ({
      ...item,
      product_name: item.name // Assign 'name' to 'product_name' for each cart item
    }));

    const shippingCost = formData.deliveryOption === "home" ? 5.0 : 0.0;

    // Prepare order data
    const orderData = {
      userId: parseInt(localStorage.getItem("userId")), // Ensure the user ID is passed correctly
      customerName: formData.name,
      customerAddress: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zip}`,
      creditCardNo: formData.creditCard,
      deliveryOption: formData.deliveryOption,
      cartItems: updatedCartItems, // Ensure cart items now contain 'product_name'
      totalSales: calculateTotalSales(cartItems),
      shippingCost: shippingCost,
      discount: 0.0,
      storeId: formData.deliveryOption === "pickup" ? 1 : null,
      storeAddress: formData.storeLocation || ""
    };

    // Send order data to the backend
    fetch("http://localhost:8080/smarthomes/checkout", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    })
      .then(async (response) => {
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Unknown error");
        }
        return response.json();
      })
      .then((data) => {
        setConfirmation({
          confirmationNumber: data.confirmationNumber,
          deliveryDate: data.deliveryDate
        });
      })
      .catch((error) => {
        console.error("Error:", error.message);
        setError(
          error.message || "Error processing your order. Please try again."
        );
      });
  };

  // Confirmation page after placing the order
  if (confirmation) {
    return (
      <div className="confirmation p-10 text-center">
        <h2 className="text-3xl font-bold text-green-600">
          Thank you for your order!
        </h2>
        <p className="text-lg mt-4">
          Your confirmation number is:{" "}
          <span className="font-bold">{confirmation.confirmationNumber}</span>
        </p>
        <p className="text-lg">
          Your delivery/pickup date is:{" "}
          <span className="font-bold">{confirmation.deliveryDate}</span>
        </p>
        <p className="text-lg">
          Delivery Option:{" "}
          <span className="font-bold">
            {formData.deliveryOption === "home"
              ? "Home Delivery"
              : `Store Pickup at: ${formData.storeLocation}`}
          </span>
        </p>
        <div className="mt-6">
          <h3 className="text-xl font-semibold">Order Details</h3>
          {cartItems.map((item, index) => (
            <div key={index} className="flex items-center mb-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-contain mr-4"
              />
              <div>
                <p>
                  <strong>{item.name}</strong>
                </p>
                <p>Price: ${item.price ? item.price.toFixed(2) : "N/A"}</p>
                <p>Quantity: {item.quantity || 1}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate("/orders")} // Redirect to orders page
          className="mt-8 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          View Orders
        </button>{" "}
        <button
          onClick={() => navigate("/")}
          className="mt-8 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Go back to homepage
        </button>
      </div>
    );
  }

  return (
    <div className="checkout max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full mt-2 p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Address:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full mt-2 p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">City:</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full mt-2 p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">State:</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="w-full mt-2 p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">ZIP Code:</label>
          <input
            type="text"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            required
            className="w-full mt-2 p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Credit Card:</label>
          <input
            type="text"
            name="creditCard"
            value={formData.creditCard}
            onChange={handleChange}
            required
            className="w-full mt-2 p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Delivery Option:</label>
          <select
            name="deliveryOption"
            value={formData.deliveryOption}
            onChange={handleChange}
            className="w-full mt-2 p-2 border border-gray-300 rounded"
          >
            <option value="home">Home Delivery</option>
            <option value="pickup">In-store Pickup</option>
          </select>
        </div>

        {formData.deliveryOption === "pickup" && (
          <div className="mb-4">
            <label className="block text-gray-700">
              Select Store Location:
            </label>
            <select
              name="storeLocation"
              value={formData.storeLocation}
              onChange={handleChange}
              required
              className="w-full mt-2 p-2 border border-gray-300 rounded"
            >
              {storeLocations.map((location, index) => (
                <option key={index} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Place Order
        </button>
      </form>

      {/* Display cart or product summary */}
      {cartItems.length > 0 && (
        <div className="mt-8 p-4 border rounded bg-gray-100">
          <h3 className="text-lg font-semibold">Product Summary</h3>
          {cartItems.map((item, index) => (
            <div key={index} className="flex items-center mb-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-contain mr-4"
              />
              <div>
                <p>
                  <strong>{item.name}</strong>
                </p>
                <p>Price: ${item.price}</p>
                <p>Quantity: {item.quantity || 1}</p>
              </div>
            </div>
          ))}
          <div className="mt-4 text-right font-bold">
            <p>Total Price: ${totalPrice.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

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
        fetch("http://localhost:8080/smarthomes/cart", {
          method: "GET",
          credentials: "include"
        })
          .then((response) => response.json())
          .then((data) => {
            const products = data || [];
            setCartItems(products);  // Set cart items from backend
            calculateTotalPrice(products);  // Update total price
          })
          .catch((error) => {
            console.error("Error fetching cart items:", error);
          });
      } else {
        setCartItems([{ ...productDetails, quantity: 1 }]);  // For "Buy Now" flow
        setTotalPrice(productDetails.price);  // Set price for a single product
      }
    } else {
      navigate("/signin");
    }
  }, [productDetails, isLoggedIn, navigate, cartItems]);  // Add `cartItems` as dependency
  

  // Hardcoded store locations for pickup
  const storeLocations = [
    { id: 1, address: "1001 Main St, ZIP: 12345" },
    { id: 2, address: "1501 Maple Ave, ZIP: 12346" },
    { id: 3, address: "2001 Oak St, ZIP: 12347" },
    { id: 4, address: "2501 Pine St, ZIP: 12348" },
    { id: 5, address: "3001 Elm St, ZIP: 12349" },
    { id: 6, address: "3501 Cedar St, ZIP: 12350" },
    { id: 7, address: "4001 Birch St, ZIP: 12351" },
    { id: 8, address: "4501 Walnut St, ZIP: 12352" },
    { id: 9, address: "5001 Chestnut St, ZIP: 12353" },
    { id: 10, address: "5501 Spruce St, ZIP: 12354" }
  ];

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calculate total price based on cart items
  const calculateTotalPrice = (products) => {
    const total = products.reduce((sum, item) => {
      const discountedPrice = calculateDiscountedPrice(item);
      return sum + discountedPrice * item.quantity;
    }, 0);
    setTotalPrice(total);
  };
  
  const calculateTotalSales = (products) => {
    const totalSales = products.reduce((sum, item) => sum + item.quantity, 0);
    return totalSales;
  };

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

  // Function to calculate the discounted price of an item
  function calculateDiscountedPrice(item) {
    // Ensure price is a number
    const price = parseFloat(item.price);

    // If price is not valid, return 0 to avoid errors
    if (isNaN(price)) {
      return 0;
    }

    const discountProduct = discountProducts[item.id];

    // Check if the product has a discount, and calculate accordingly
    if (discountProduct) {
      const discountAmount = (price * discountProduct.discount) / 100;
      const finalPrice = price - discountAmount;

      return isNaN(finalPrice) ? 0 : finalPrice; // Ensure finalPrice is a valid number
    }

    // If no discount, return the original price
    return price;
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

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

    const selectedStore = formData.storeLocation;
    // Prepare order data
    const orderData = {
      userId: parseInt(localStorage.getItem("userId")),
      customerName: formData.name,
      customerAddress: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zip}`,
      creditCardNo: formData.creditCard,
      deliveryOption: formData.deliveryOption,
      cartItems: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        image: item.image,
        price: calculateDiscountedPrice(item),
        quantity: item.quantity,
        discount: discountProducts[item.id]?.discount || 0
      })),
      totalSales: calculateTotalSales(cartItems),
      shippingCost: formData.deliveryOption === "home" ? 5.0 : 0.0,
      discount: cartItems.reduce(
        (sum, item) => sum + (discountProducts[item.id]?.discount || 0),
        0
      ),
      storeLocation:
        formData.deliveryOption === "pickup" && selectedStore
          ? { storeId: selectedStore.id, storeAddress: selectedStore.address }
          : null
    };

    console.log("Order Data:", orderData);
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
    console.log("Order Data:", orderData);
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
              : `Store Pickup at: ${formData.storeLocation.address}`}
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
                {discountProducts[item.id] ? (
                  <>
                    <p className="line-through text-red-500">
                      ${parseFloat(item.price * item.quantity).toFixed(2)}{" "}
                      {/* Multiply by quantity */}
                    </p>
                    <p>
                      $
                      {(calculateDiscountedPrice(item) * item.quantity).toFixed(
                        2
                      )}{" "}
                      <span className="text-green-500">
                        ({discountProducts[item.id]?.discount}% OFF)
                      </span>
                    </p>
                  </>
                ) : (
                  <p>Price: ${(item.price * item.quantity).toFixed(2)}</p>
                )}
                <p>Quantity: {item.quantity || 1}</p>{" "}
                {/* Ensure quantity is shown */}
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
              value={formData.storeLocation ? formData.storeLocation.id : ""} // Safely check if storeLocation exists
              onChange={(e) => {
                const selectedStore = storeLocations.find(
                  (location) => location.id === parseInt(e.target.value)
                );
                setFormData({
                  ...formData,
                  storeLocation: selectedStore // Store the entire selected store object
                });
              }}
              required
              className="w-full mt-2 p-2 border border-gray-300 rounded"
            >
              <option value="">Select Store</option>
              {storeLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.address}
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
                {discountProducts[item.id] ? (
                  <>
                    <p className="line-through text-red-500">
                      ${parseFloat(item.price * item.quantity).toFixed(2)}{" "}
                      {/* Multiply by quantity */}
                    </p>
                    <p>
                      $
                      {(calculateDiscountedPrice(item) * item.quantity).toFixed(
                        2
                      )}{" "}
                      <span className="text-green-500">
                        ({discountProducts[item.id]?.discount}% OFF)
                      </span>
                    </p>
                  </>
                ) : (
                  <p>Price: ${(item.price * item.quantity).toFixed(2)}</p>
                )}
                <p>Quantity: {item.quantity || 1}</p>{" "}
                {/* Ensure quantity is shown */}
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

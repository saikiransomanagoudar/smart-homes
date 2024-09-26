import React, { useState, useEffect } from "react";
import { Img } from "react-image";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

export default function ProductsPage({ cart, setCart }) {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false); // State to handle modal visibility
  const [reviewForm, setReviewForm] = useState({
    productName: "",
    category: "",
    price: "",
    storeId: "",
    storeZip: "",
    storeCity: "",
    storeState: "",
    productOnSale: true,
    manufacturerName: "",
    manufacturerRebate: false,
    userId: "",
    userAge: "",
    userGender: "",
    userOccupation: "",
    reviewRating: 0,
    reviewDate: "",
    reviewText: ""
  });
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userId = localStorage.getItem("userId");

  const storeAddresses = [
    { address: "1001 Main St", zip: "12345" },
    { address: "1501 Maple Ave", zip: "12346" },
    { address: "2001 Oak St", zip: "12347" },
    { address: "2501 Pine St", zip: "12348" },
    { address: "3001 Elm St", zip: "12349" },
    { address: "3501 Cedar St", zip: "12350" },
    { address: "4001 Birch St", zip: "12351" },
    { address: "4501 Walnut St", zip: "12352" },
    { address: "5001 Chestnut St", zip: "12353" },
    { address: "5501 Spruce St", zip: "12354" }
  ];

  // Fetch products by category from the backend
  useEffect(() => {
    fetch(`http://localhost:8080/smarthomes/getProducts?category=${category}`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      })
      .catch((error) => {
        console.error(`Error fetching ${category} products:`, error);
      });
  }, [category]);

  // Fetch cart data when the user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetch("http://localhost:8080/smarthomes/cart", {
        method: "GET",
        credentials: "include"
      })
        .then((response) => response.json())
        .then((data) => {
          setCart(data);
          localStorage.setItem("cart", JSON.stringify(data));
        })
        .catch((error) => {
          console.error("Error fetching cart:", error);
        });
    }
  }, [isLoggedIn, setCart]);

  // Load cart from localStorage if available
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, [setCart]);

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

  const calculateDiscountedPrice = (product) => {
    const discountInfo = discountProducts[product.id];
    if (!discountInfo) return product.price;

    const discountAmount = (product.price * discountInfo.discount) / 100;
    const finalPrice = product.price - discountAmount - discountInfo.rebate;
    return finalPrice.toFixed(2); // Return price with 2 decimals
  };

  // Handle form field changes
  const handleReviewFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReviewForm({
      ...reviewForm,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // Handle submission of review form
  const handleSubmitReview = (e) => {
    e.preventDefault();

    const reviewData = {
      productName: reviewForm.productName,
      category: reviewForm.category,
      price: reviewForm.price,
      storeAddress: reviewForm.storeAddress,
      productOnSale: reviewForm.productOnSale, // "Yes" for all products
      manufacturerRebate: reviewForm.manufacturerRebate, // "Yes" if applicable
      userId: userId, // From the session
      userAge: reviewForm.userAge,
      userGender: reviewForm.userGender,
      userOccupation: reviewForm.userOccupation,
      reviewRating: reviewForm.reviewRating,
      reviewDate: reviewForm.reviewDate,
      reviewText: reviewForm.reviewText
    };

    fetch("http://localhost:8080/smarthomes/api/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(reviewData)
    })
      .then((response) => {
        if (response.ok) {
          alert("Review submitted successfully!");
          setShowReviewModal(false);
        } else {
          alert("Error submitting review");
        }
      })
      .catch((error) => {
        console.error("Error submitting review:", error);
      });
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleBuyNow = (product) => {
    if (isLoggedIn) {
      const discountedPrice = calculateDiscountedPrice(product);
      const productData = {
        id: product.id, // This will be product_id or accessory_id
        name: product.name,
        price: discountedPrice,
        description: product.description || "",
        image: product.image,
        type: product.type, // Type will either be 'product' or 'accessory'
        quantity: quantities[product.id] || 1, // Default to 1 if not specified
        discount: discountProducts[product.id]?.discount || 0,
        category: product.category
      };

      // Direct the user to the checkout page with the selected product
      navigate("/checkout", {
        state: {
          product: productData
        }
      });
    } else {
      navigate("/signin");
    }
  };

  // Handle opening the review modal
  const handleWriteReviewClick = (product) => {
    setReviewForm({
      productName: product.name,
      category: product.category,
      price: product.price,
      discountedPrice: product.discountedPrice || product.price,
      productOnSale: true,
      storeId: "",
      storeZip: "",
      storeCity: "",
      storeState: "",
      manufacturerName: "",
      manufacturerRebate: false,
      userId: "",
      userAge: "",
      userGender: "",
      userOccupation: "",
      reviewRating: 0,
      reviewDate: "",
      reviewText: ""
    });
    setShowReviewModal(true); // Open modal
  };

  const handleAddProductToCart = (item, isAccessory = false) => {
    console.log("Adding item to cart:", item);

    if (!userId) {
      navigate("/signin");
      return;
    }

    const discountedPrice = calculateDiscountedPrice(item);

    const existingItem = cart.find(
      (cartItem) =>
        cartItem.id === item.id &&
        cartItem.type === (isAccessory ? "accessory" : "product")
    );

    if (existingItem) {
      const updatedCart = cart.map((cartItem) =>
        cartItem.id === item.id &&
        cartItem.type === (isAccessory ? "accessory" : "product")
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));

      fetch("http://localhost:8080/smarthomes/cart/product", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          id: existingItem.id,
          quantity: existingItem.quantity + 1,
          price: discountedPrice,
          type: isAccessory ? "accessory" : "product",
          category: existingItem.category,
          userId
        })
      }).catch((error) => {
        console.error("Error updating item in cart:", error);
      });
    } else {
      const newItem = {
        id: item.id,
        name: item.name,
        price: discountedPrice,
        image: item.image,
        quantity: 1,
        type: isAccessory ? "accessory" : "product",
        category: item.category,
        userId
      };

      fetch("http://localhost:8080/smarthomes/cart/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(newItem)
      })
        .then(() => {
          const updatedCart = [...cart, newItem];
          setCart(updatedCart);
          localStorage.setItem("cart", JSON.stringify(updatedCart));
        })
        .catch((error) => {
          console.error("Error adding item to cart:", error);
        });
    }

    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [item.id]: (prevQuantities[item.id] || 0) + 1
    }));
  };

  const handleIncreaseQuantity = (id) => {
    const product = cart.find((item) => item.id === id);

    if (product) {
      fetch("http://localhost:8080/smarthomes/cart/product", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          id: product.id,
          userId,
          quantity: product.quantity + 1 // Increase quantity
        })
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to increase item quantity.");
          }
          return response.json();
        })
        .then(() => {
          const updatedCart = cart.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
          );
          setCart(updatedCart);
          localStorage.setItem("cart", JSON.stringify(updatedCart)); // Save to localStorage
        })
        .catch((error) => {
          console.error("Error increasing item quantity:", error);
        });
    }
    // Update the UI quantity
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [id]: (prevQuantities[id] || 0) + 1 // Increase quantity
    }));
  };

  const handleDecreaseQuantity = (id) => {
    const product = cart.find((item) => item.id === id);

    if (product) {
      if (product.quantity > 1) {
        fetch("http://localhost:8080/smarthomes/cart/product", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            id: product.id,
            userId,
            quantity: product.quantity - 1
          })
        })
          .then(() => {
            const updatedCart = cart.map((item) =>
              item.id === id ? { ...item, quantity: item.quantity - 1 } : item
            );
            setCart(updatedCart);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
            setQuantities((prevQuantities) => ({
              ...prevQuantities,
              [id]: prevQuantities[id] - 1 // Decrease quantity
            }));
          })
          .catch((error) => {
            console.error("Error decreasing item quantity:", error);
          });
      } else if (product.quantity === 1) {
        fetch("http://localhost:8080/smarthomes/cart/product", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({ id: product.id, userId })
        })
          .then(() => {
            const updatedCart = cart.filter((item) => item.id !== id);
            setCart(updatedCart);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
            const updatedQuantities = { ...quantities };
            delete updatedQuantities[id]; // Remove quantity from UI tracking
            setQuantities(updatedQuantities);
          })
          .catch((error) => {
            console.error("Error deleting item from cart:", error);
          });
      }
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen overflow-x-hidden">
      <header className="bg-[#550403] text-white p-4">
        <div className="container mx-auto flex justify-between items-center flex-wrap">
          <h1 className="text-3xl sm:text-4xl font-bold">
            <nav>
              <Link to="/">Smart Homes</Link>
            </nav>
          </h1>
          <nav className="flex space-x-2 sm:space-x-4 items-center">
            <Link
              to="https://github.com/saikiransomanagoudar/smart-homes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm sm:text-base"
            >
              About
            </Link>
            <Link
              to="https://www.linkedin.com/in/saikiransomanagoudar/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm sm:text-base"
            >
              Contact
            </Link>
            <Link to="/orders" className="text-sm sm:text-base">
              View Orders
            </Link>
            <div className="ml-4 text-sm sm:text-base">
              {isLoggedIn ? (
                <>
                  <Link to="/cart" className="text-white">
                    <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                    Cart Items:{" "}
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem("isLoggedIn");
                      navigate("/");
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded ml-2 text-sm sm:text-base"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="bg-green-500 text-white px-4 py-2 rounded ml-2 text-sm sm:text-base"
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/signin"
                    className="bg-blue-500 text-white px-4 py-2 rounded ml-2 text-sm sm:text-base"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
      <main className="container mx-auto py-4 sm:py-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            {`Smart ${category.charAt(0).toUpperCase() + category.slice(1)}`}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-8">
            {`Discover the range of smart ${category} that keep your home safe and secure.`}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.length > 0 ? (
            products.map((product) => {
              const productQuantity = quantities[product.id] || 0;
              const discount = discountProducts[product.id]?.discount || 0;
              const discountedPrice =
                product.price - (product.price * discount) / 100;

              return (
                <div
                  key={product.id}
                  className="p-4 bg-white shadow rounded flex flex-col justify-between"
                  onClick={() => handleProductClick(product)}
                >
                  <h3 className="text-lg sm:text-xl font-bold">
                    {product.name || "Unknown Product"}
                  </h3>
                  <Img
                    src={product.image || "/default-image.png"}
                    alt={product.name || "Product Image"}
                    loader={<div>Loading...</div>}
                    unloader={<div>Image not found</div>}
                    className="h-40 w-auto object-contain mx-auto mt-2"
                  />
                  <p className="mt-2 text-sm sm:text-base">
                    {product.description || "No description available"}
                  </p>
                  <p className="text-lg font-bold mt-2">
                    {discount > 0 ? (
                      <>
                        <span className="line-through text-red-500">
                          ${product.price.toFixed(2)}
                        </span>{" "}
                        {/* Original price struck-through */}
                        &nbsp;
                        <span className="text-green-500">
                          ${discountedPrice.toFixed(2)} {/* Discounted price */}
                          ({discount}% OFF)
                        </span>
                      </>
                    ) : (
                      `$${product.price ? product.price.toFixed(2) : "N/A"}` // Regular price for non-discounted items
                    )}
                  </p>
                  {productQuantity > 0 ? (
                    <div className="flex items-center justify-between mt-4">
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDecreaseQuantity(product.id);
                        }}
                      >
                        -
                      </button>
                      <span>{productQuantity}</span>
                      <button
                        className="bg-green-500 text-white px-2 py-1 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIncreaseQuantity(product.id);
                        }}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        className="bg-green-500 text-white px-2 py-2 mt-2 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddProductToCart(product, false);
                        }}
                      >
                        Add to Cart
                      </button>

                      <button
                        className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow(product);
                        }}
                      >
                        Buy Now
                      </button>
                      {/* Write Review and View Review buttons */}
                      <button
                        className="bg-yellow-500 text-white px-4 py-2 mt-4 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWriteReviewClick(product);
                        }}
                      >
                        Write Review
                      </button>
                      <button
                        className="bg-gray-500 text-white px-4 py-2 mt-4 rounded"
                        onClick={(e) => e.stopPropagation}
                      >
                        View Reviews
                      </button>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <p>No products available for this category.</p>
          )}
        </div>

        {/* Review Form Modal */}
        {showReviewModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowReviewModal(false)}
          >
            <div
              className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] relative overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-700 text-xl"
                onClick={() => setShowReviewModal(false)}
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4">Write Review</h3>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-2">
                  <label className="block text-sm font-medium">
                    Product Name:
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={reviewForm.productName}
                    onChange={handleReviewFieldChange}
                    className="w-full p-2 border rounded"
                    readOnly
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium">Category:</label>
                  <input
                    type="text"
                    name="category"
                    value={reviewForm.category}
                    onChange={handleReviewFieldChange}
                    className="w-full p-2 border rounded"
                    readOnly
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium">Price:</label>
                  <input
                    type="text"
                    name="price"
                    value={
                      reviewForm.productOnSale && reviewForm.discountedPrice
                        ? `$${reviewForm.discountedPrice.toFixed(2)}`
                        : `$${reviewForm.price.toFixed(2)}`
                    }
                    onChange={handleReviewFieldChange}
                    className="w-full p-2 border rounded"
                    readOnly
                  />
                </div>

                {/* Product On Sale */}
                <div className="mb-2">
                  <label className="block text-sm font-medium">
                    Product On Sale:
                  </label>
                  <input
                    type="text"
                    name="productOnSale"
                    value="Yes"
                    className="w-full p-2 border rounded"
                    readOnly
                  />
                </div>

                {/* Manufacturer Rebate */}
                <div className="mb-2">
                  <label className="block text-sm font-medium">
                    Manufacturer Rebate:
                  </label>
                  <input
                    type="text"
                    name="manufacturerRebate"
                    value={reviewForm.manufacturerRebate ? "Yes" : "No"}
                    onChange={handleReviewFieldChange}
                    className="w-full p-2 border rounded"
                    readOnly
                  />
                </div>

                {/* User ID - Retrieved from session */}
                <div className="mb-2">
                  <label className="block text-sm font-medium">User ID:</label>
                  <input
                    type="text"
                    name="userId"
                    value={userId}
                    className="w-full p-2 border rounded"
                    readOnly
                  />
                </div>

                {/* User Age - Let the user enter */}
                <div className="mb-2">
                  <label className="block text-sm font-medium">User Age:</label>
                  <input
                    type="number"
                    name="userAge"
                    value={reviewForm.userAge}
                    min="0"
                    onChange={handleReviewFieldChange}
                    className="w-full p-2 border rounded"
                    placeholder="Enter your age"
                  />
                </div>

                {/* User Gender - Dropdown with Male, Female, Other */}
                <div className="mb-2">
                  <label className="block text-sm font-medium">
                    User Gender:
                  </label>
                  <select
                    name="userGender"
                    value={reviewForm.userGender}
                    onChange={handleReviewFieldChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* User Occupation - Let the user enter */}
                <div className="mb-2">
                  <label className="block text-sm font-medium">
                    User Occupation:
                  </label>
                  <input
                    type="text"
                    name="userOccupation"
                    value={reviewForm.userOccupation}
                    onChange={handleReviewFieldChange}
                    className="w-full p-2 border rounded"
                    placeholder="Enter your occupation"
                  />
                </div>
                {/* Store Address Dropdown */}
                <div className="mb-2">
                  <label className="block text-sm font-medium">
                    Store Address:
                  </label>
                  <select
                    name="storeAddress"
                    value={reviewForm.storeAddress}
                    onChange={(e) => {
                      const selectedStore = storeAddresses.find(
                        (store) => store.address === e.target.value
                      );
                      setReviewForm({
                        ...reviewForm,
                        storeAddress: selectedStore.address,
                        storeZip: selectedStore.zip
                      });
                    }}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Store Address</option>
                    {storeAddresses.map((store) => (
                      <option key={store.zip} value={store.address}>
                        {store.address}, ZIP: {store.zip}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Add other fields similarly */}
                <div className="mb-2">
                  <label className="block text-sm font-medium">
                    Review Rating:
                  </label>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <label key={rating} className="mr-2">
                      <input
                        type="radio"
                        name="reviewRating"
                        value={rating}
                        checked={reviewForm.reviewRating === rating}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            reviewRating: parseInt(e.target.value)
                          })
                        }
                      />
                      {rating}
                    </label>
                  ))}
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium">
                    Review Date:
                  </label>
                  <input
                    type="date"
                    name="reviewDate"
                    value={reviewForm.reviewDate}
                    onChange={handleReviewFieldChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium">
                    Review Text:
                  </label>
                  <textarea
                    name="reviewText"
                    value={reviewForm.reviewText}
                    onChange={handleReviewFieldChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        )}
        {selectedProduct && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleCloseModal}
          >
            <div
              className="bg-white p-6 rounded-lg shadow-lg w-96 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-700 text-xl"
                onClick={handleCloseModal}
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4">
                {selectedProduct.name || "Unknown Product"}
              </h3>
              <Img
                src={selectedProduct.image || "/default-image.png"}
                alt={selectedProduct.name || "Product Image"}
                className="w-full h-40 object-contain mb-4"
              />

              {selectedProduct.description && (
                <p className="text-sm mb-4">{selectedProduct.description}</p>
              )}
              <p className="text-lg font-bold mt-2">
                {selectedProduct.productOnSale &&
                selectedProduct.discountedPrice
                  ? `$${selectedProduct.discountedPrice.toFixed(2)}`
                  : `$${selectedProduct.price.toFixed(2)}`}
              </p>

              {/* Rendering Accessories */}
              {selectedProduct.accessories &&
              selectedProduct.accessories.length > 0 ? (
                <div className="mb-4">
                  <h4 className="text-base font-semibold mb-2">Accessories:</h4>
                  <ul className="flex flex-wrap gap-4">
                    {selectedProduct.accessories.map((accessory, index) => (
                      <li key={index} className="flex flex-col items-center">
                        <h5 className="text-sm font-semibold">
                          {accessory.name || "Unknown Accessory"}
                        </h5>
                        <p className="text-sm font-bold">
                          Price: $
                          {accessory.price ? accessory.price.toFixed(2) : "N/A"}
                        </p>
                        <Img
                          src={accessory.image || "/default-image.png"}
                          alt={accessory.name || "Accessory Image"}
                          className="w-20 h-20 object-contain"
                          loader={<div>Loading...</div>}
                          unloader={<div>Image not found</div>}
                        />
                        <button
                          className="bg-green-500 text-white px-2 py-2 mt-2 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddProductToCart(accessory, true); // Add accessory to cart
                          }}
                        >
                          Add to Cart
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>No accessories available for this product.</p>
              )}

              <button
                className="bg-green-500 text-white px-4 py-2 mt-4 rounded w-full"
                onClick={() => {
                  handleAddProductToCart(selectedProduct, false);
                  handleCloseModal();
                }}
              >
                Add to Cart
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 mt-4 rounded w-full"
                onClick={() => handleBuyNow(selectedProduct)}
              >
                Buy Now
              </button>
            </div>
          </div>
        )}
      </main>
      <footer className="bg-[#550403] text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Smart Homes. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

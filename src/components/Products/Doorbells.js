import React, { useState, useEffect } from "react";
import { Img } from "react-image";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

// Example list of doorbell products with accessories
const doorbellProducts = [
  {
    id: 1,
    name: "Blink Video Doorbell",
    price: "$59.99",
    description:
      "Blink Video Doorbell | Two-way audio, HD video, motion and chime app alerts and Alexa enabled — wired or wire-free (Black)",
    image: "/images/doorbells/doorbell1.jpg",
    accessories: [
      {
        id: 1,
        name: "Wall Mount Kit",
        price: "$15.99",
        image: "/images/doorbells/accessories/wall_mount.jpg"
      },
      {
        id: 2,
        name: "Cover Ring",
        price: "$14.99",
        image: "/images/doorbells/accessories/cover_ring.jpg"
      }
    ]
  },
  {
    id: 2,
    name: "Tapo TP-Link Smart Doorbell",
    price: "$89.99",
    description:
      "Tapo TP-Link Smart Video Doorbell Camera, Battery Powered, Chime Included, 2K 5MP, Color Night Vision, 2-Way Audio",
    image: "/images/doorbells/doorbell2.jpg",
    accessories: [
      {
        id: 1,
        name: "Wall Mount Kit",
        price: "$15.99",
        image: "/images/doorbells/accessories/wall_mount.jpg"
      },
      {
        id: 2,
        name: "Cover Ring",
        price: "$14.99",
        image: "/images/doorbells/accessories/cover_ring.jpg"
      }
    ]
  },
  {
    id: 3,
    name: "Ring Video Doorbell",
    price: "$59.99",
    description:
      "Ring Video Doorbell - 1080p HD video, improved motion detection, easy installation (2020 release) – Satin Nickel",
    image: "/images/doorbells/doorbell3.jpg",
    accessories: [
      {
        id: 1,
        name: "Wall Mount Kit",
        price: "$15.99",
        image: "/images/doorbells/accessories/wall_mount.jpg"
      },
      {
        id: 2,
        name: "Cover Ring",
        price: "$14.99",
        image: "/images/doorbells/accessories/cover_ring.jpg"
      }
    ]
  },
  {
    id: 4,
    name: "Google Nest Doorbell",
    price: "$137.31",
    description: "Google Nest Doorbell (Battery) - Ash",
    image: "/images/doorbells/doorbell4.jpg",
    accessories: [
      {
        id: 1,
        name: "Wall Mount Kit",
        price: "$15.99",
        image: "/images/doorbells/accessories/wall_mount.jpg"
      },
      {
        id: 2,
        name: "Cover Ring",
        price: "$14.99",
        image: "/images/doorbells/accessories/cover_ring.jpg"
      }
    ]
  },
  {
    id: 5,
    name: "Smart Video Doorbell Camera Wireless",
    price: "$13.99",
    description:
      "Smart Video Doorbell Camera Wireless, AI Human Detection and Instant Alerts, Night Vision, 2-Way Audio, Battery Powered, Cloud Storage, 2.4G WiFi",
    image: "/images/doorbells/doorbell5.jpg",
    accessories: [
      {
        id: 1,
        name: "Wall Mount Kit",
        price: "$15.99",
        image: "/images/doorbells/accessories/wall_mount.jpg"
      },
      {
        id: 2,
        name: "Cover Ring",
        price: "$14.99",
        image: "/images/doorbells/accessories/cover_ring.jpg"
      }
    ]
  }
];

export default function Doorbells() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]); // To track cart items
  const navigate = useNavigate(); // Hook to navigate programmatically
  const [isSignedIn, setIsSignedIn] = useState(false); // Track if user is signed in

  // Check if user is signed in (you can replace this with your actual authentication logic)
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsSignedIn(true);
    } else {
      setIsSignedIn(false);
    }
  }, []);

  // Redirect to SignIn if not signed in
  const checkSignIn = (action) => {
    if (!isSignedIn) {
      navigate("/signin");
    } else {
      action();
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product); // Set selected product to show in modal
  };

  const handleCloseModal = () => {
    setSelectedProduct(null); // Close modal when clicking outside
  };

  const handleBuyNow = () => {
    window.location.href = "/payment"; // Redirect to payment page if signed in
  };

  const handleAddProductToCart = (product) => {
    fetch("http://localhost:8080/smarthomes/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Product added to cart:", data);
        const productInCart = cart.find((cartItem) => cartItem.id === product.id);
        if (productInCart) {
          setCart(
            cart.map((cartItem) =>
              cartItem.id === product.id
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            )
          );
        } else {
          setCart([...cart, { ...product, quantity: 1 }]);
        }
      })
      .catch((error) => console.error("Error adding product to cart:", error));
  };

  const handleAddAccessoryToCart = (accessory) => {
    const accessoryCartId = `accessory-${accessory.id}`; // Use a unique identifier for accessories
    fetch("http://localhost:8080/smarthomes/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: accessoryCartId,
        name: accessory.name,
        price: accessory.price,
        image: accessory.image,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Accessory added to cart:", data);
        const accessoryInCart = cart.find(
          (cartItem) => cartItem.id === accessoryCartId
        );
        if (accessoryInCart) {
          setCart(
            cart.map((cartItem) =>
              cartItem.id === accessoryCartId
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            )
          );
        } else {
          setCart([...cart, { ...accessory, id: accessoryCartId, quantity: 1 }]);
        }
      })
      .catch((error) => console.error("Error adding accessory to cart:", error));
  };

  const handleDeleteAccessoryFromCart = (accessory) => {
    const accessoryCartId = `accessory-${accessory.id}`; // Use the same unique identifier
    fetch("http://localhost:8080/smarthomes/cart", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: accessoryCartId,
        name: accessory.name,
        price: accessory.price,
        image: accessory.image,
      }),
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

  return (
    <div className="bg-[#f5f5f5] min-h-screen overflow-x-hidden">
      {/* Header */}
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
            <div className="ml-4 text-sm sm:text-base">
              <nav>
                <Link to="/cart" className="text-white">
                  <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                  Cart Items:{" "}
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </Link>
              </nav>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-4 sm:py-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Smart Doorbells
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-8">
            Discover the range of smart doorbells that keep your home safe and
            secure.
          </p>
        </div>

        {/* Doorbell Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {doorbellProducts.map((product) => (
            <div
              key={product.id}
              className="p-4 bg-white shadow rounded flex flex-col justify-between"
              onClick={() => handleProductClick(product)} // Click to show modal
            >
              <h3 className="text-lg sm:text-xl font-bold">{product.name}</h3>
              <Img
                src={product.image}
                alt={product.name}
                loader={<div>Loading...</div>}
                unloader={<div>Image not found</div>}
                className="h-40 w-auto object-contain mx-auto mt-2"
              />
              <p className="mt-2 text-sm sm:text-base">{product.description}</p>
              <p className="text-lg font-bold mt-2">{product.price}</p>

              <button
                className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent modal opening
                  checkSignIn(() => handleBuyNow());
                }}
              >
                Buy Now
              </button>

              <button
                className="bg-green-500 text-white px-4 py-2 mt-4 rounded"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent modal opening
                  checkSignIn(() => handleAddProductToCart(product));
                }}
              >
                Add to Cart
              </button>

              {/* Display quantity adjustment if the product is already in the cart */}
              {cart.find((cartItem) => cartItem.id === product.id)?.quantity >
                0 && (
                <div className="flex items-center justify-between mt-2">
                  <button
                    className="text-gray-500 text-xl"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent modal opening
                      handleAddProductToCart(product);
                    }}
                  >
                    +
                  </button>
                  <span>
                    {
                      cart.find((cartItem) => cartItem.id === product.id)
                        ?.quantity
                    }
                  </span>
                  <button
                    className="text-gray-500 text-xl"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent modal opening
                      handleDeleteAccessoryFromCart(product);
                    }}
                  >
                    -
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal for selected product */}
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
              <h3 className="text-xl font-bold mb-4">{selectedProduct.name}</h3>
              <Img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-40 object-contain mb-4"
              />
              <p className="text-sm mb-4">{selectedProduct.description}</p>
              <p className="text-lg font-bold mb-4">{selectedProduct.price}</p>

              {/* Displaying accessories horizontally */}
              {selectedProduct.accessories && (
                <div className="mb-4">
                  <h4 className="text-base font-semibold mb-2">Accessories:</h4>
                  <div className="flex space-x-4">
                    {selectedProduct.accessories.map((accessory) => {
                      const accessoryCartId = `accessory-${accessory.id}`;
                      const accessoryInCart = cart.find(
                        (cartItem) => cartItem.id === accessoryCartId
                      );

                      return (
                        <div key={accessory.id} className="text-center">
                          <Img
                            src={accessory.image}
                            alt={accessory.name}
                            className="w-20 h-20 object-cover"
                          />
                          <p className="text-sm mt-2">{accessory.name}</p>
                          <p className="text-sm font-bold">{accessory.price}</p>

                          {accessoryInCart?.quantity > 0 && (
                            <div className="flex items-center justify-between mt-2">
                              <button
                                className="text-gray-500 text-xl"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  checkSignIn(() => handleDeleteAccessoryFromCart(accessory));
                                }}
                              >
                                -
                              </button>
                              <span>{accessoryInCart.quantity}</span>
                              <button
                                className="text-gray-500 text-xl"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  checkSignIn(() => handleAddAccessoryToCart(accessory));
                                }}
                              >
                                +
                              </button>
                            </div>
                          )}

                          {!accessoryInCart && (
                            <button
                              className="bg-green-500 text-white px-4 py-2 mt-4 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                checkSignIn(() => handleAddAccessoryToCart(accessory));
                              }}
                            >
                              Add to Cart
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <button
                className="bg-blue-500 text-white px-4 py-2 mt-4 rounded w-full"
                onClick={() => checkSignIn(() => handleBuyNow())}
              >
                Buy Now
              </button>

              <button
                className="bg-green-500 text-white px-4 py-2 mt-4 rounded w-full"
                onClick={() => {
                  checkSignIn(() => handleAddProductToCart(selectedProduct));
                  handleCloseModal(); // Close modal after adding to cart
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#550403] text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Smart Homes. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
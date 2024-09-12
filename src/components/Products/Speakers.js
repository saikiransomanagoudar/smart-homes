import React, { useState } from "react";
import { Img } from "react-image";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

// Example list of speaker products with accessories
const speakerProducts = [
  {
    id: 1,
    name: "Amazon Echo Studio",
    price: "$199.99",
    description:
      "Amazon Echo Studio | Our best-sounding smart speaker ever - With Dolby Atmos, spatial audio processing technology, and Alexa | Charcoal",
    image: "/images/speakers/speaker1.jpg",
    accessories: [
      {
        id: 1,
        name: "Gravity SACC 35",
        price: "$3.99",
        image: "/images/speakers/accessories/accessory1.jpg"
      },
      {
        id: 2,
        name: "4 Pack Speaker Harness",
        price: "$7.99",
        image: "/images/speakers/accessories/accessory2.jpg"
      }
    ]
  },
  {
    id: 2,
    name: "NOTABRICK Bluetooth Speakers",
    price: "$49.99",
    description:
      "NOTABRICK Bluetooth Speakers, 15W Portable Speakers Bluetooth Wireless V5.0 with Stereo Sound, Active Extra Bass, IPX6 Waterproof Shower Speaker",
    image: "/images/speakers/speaker2.jpg",
    accessories: [
      {
        id: 1,
        name: "Gravity SACC 35",
        price: "$3.99",
        image: "/images/speakers/accessories/accessory1.jpg"
      },
      {
        id: 2,
        name: "4 Pack Speaker Harness",
        price: "$7.99",
        image: "/images/speakers/accessories/accessory2.jpg"
      }
    ]
  },
  {
    id: 3,
    name: "Google Nest Mini",
    price: "$47.00",
    description:
      "Google Nest Mini 2nd Generation Smart Speaker with Google Assistant - Charcoal",
    image: "/images/speakers/speaker3.jpg",
    accessories: [
      {
        id: 1,
        name: "Gravity SACC 35",
        price: "$3.99",
        image: "/images/speakers/accessories/accessory1.jpg"
      },
      {
        id: 2,
        name: "4 Pack Speaker Harness",
        price: "$7.99",
        image: "/images/speakers/accessories/accessory2.jpg"
      }
    ]
  },
  {
    id: 4,
    name: "Sonos Era 100",
    price: "$244.85",
    description:
      "Sonos Era 100 - White - Wireless, Alexa Enabled Smart Speaker",
    image: "/images/speakers/speaker4.jpg",
    accessories: [
      {
        id: 1,
        name: "Gravity SACC 35",
        price: "$3.99",
        image: "/images/speakers/accessories/accessory1.jpg"
      },
      {
        id: 2,
        name: "4 Pack Speaker Harness",
        price: "$7.99",
        image: "/images/speakers/accessories/accessory2.jpg"
      }
    ]
  },
  {
    id: 5,
    name: "Anker Soundcore 2 Portable Bluetooth Speaker",
    price: "$27.99",
    description:
      "Anker Soundcore 2 Portable Bluetooth Speaker with 12W Stereo Sound, Bluetooth 5, Bassup, IPX7 Waterproof, 24-Hour Playtime, Wireless Stereo Pairing",
    image: "/images/speakers/speaker5.jpg",
    accessories: [
      {
        id: 1,
        name: "Gravity SACC 35",
        price: "$3.99",
        image: "/images/speakers/accessories/accessory1.jpg"
      },
      {
        id: 2,
        name: "4 Pack Speaker Harness",
        price: "$7.99",
        image: "/images/speakers/accessories/accessory2.jpg"
      }
    ]
  },
  {
    id: 6,
    name: "Edifier WiFi Smart Speaker",
    price: "$113.99",
    description:
      "Edifier WiFi Smart Speaker Without Microphone, Works with Alexa, Supports AirPlay 2, Spotify Connect, Tidal Connect, 40W RMS One-Piece Wi-Fi and Bluetooth Sound System",
    image: "/images/speakers/speaker6.jpg",
    accessories: [
      {
        id: 1,
        name: "Gravity SACC 35",
        price: "$3.99",
        image: "/images/speakers/accessories/accessory1.jpg"
      },
      {
        id: 2,
        name: "4 Pack Speaker Harness",
        price: "$7.99",
        image: "/images/speakers/accessories/accessory2.jpg"
      }
    ]
  }
];

export default function Speakers() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleBuyNow = () => {
    window.location.href = "/payment";
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
      .then(() => {
        const productInCart = cart.find(
          (cartItem) => cartItem.id === product.id
        );
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
      .catch((error) =>
        console.error("Error adding product to cart:", error)
      );
  };

  const handleAddAccessoryToCart = (accessory) => {
    const accessoryCartId = `accessory-${accessory.id}`;
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
      .then(() => {
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
      .catch((error) =>
        console.error("Error adding accessory to cart:", error)
      );
  };

  const handleDeleteAccessoryFromCart = (accessory) => {
    const accessoryCartId = `accessory-${accessory.id}`;
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
      .then(() => {
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
      .catch((error) =>
        console.error("Error deleting accessory:", error)
      );
  };

  const handleDeleteProductFromCart = (product) => {
    fetch("http://localhost:8080/smarthomes/cart", {
      method: "DELETE",
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
      .then(() => {
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
      .catch((error) =>
        console.error("Error deleting product:", error)
      );
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
              <Link to="/cart" className="text-white">
                <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                Cart Items: {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-4 sm:py-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Smart Speakers
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-8">
            Discover the range of smart speakers that keep your home safe and
            secure.
          </p>
        </div>

        {/* Speaker Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {speakerProducts.map((product) => (
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
                  handleBuyNow();
                }}
              >
                Buy Now
              </button>

              <button
                className="bg-green-500 text-white px-4 py-2 mt-4 rounded"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent modal opening
                  handleAddProductToCart(product);
                }}
              >
                Add to Cart
              </button>

              {cart.find((cartItem) => cartItem.id === product.id)?.quantity >
                0 && (
                <div className="flex items-center justify-between mt-2">
                  <button
                    className="text-gray-500 text-xl"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent modal opening
                      handleDeleteProductFromCart(product);
                    }}
                  >
                    -
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
                      handleAddProductToCart(product);
                    }}
                  >
                    +
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

              {/* Display accessories horizontally */}
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
                                  handleDeleteAccessoryFromCart(accessory);
                                }}
                              >
                                -
                              </button>
                              <span>{accessoryInCart.quantity}</span>
                              <button
                                className="text-gray-500 text-xl"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddAccessoryToCart(accessory);
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
                                handleAddAccessoryToCart(accessory);
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
                onClick={handleBuyNow}
              >
                Buy Now
              </button>

              <button
                className="bg-green-500 text-white px-4 py-2 mt-4 rounded w-full"
                onClick={() => {
                  handleAddProductToCart(selectedProduct);
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
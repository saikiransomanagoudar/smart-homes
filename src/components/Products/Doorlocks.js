import React, { useState } from "react";
import { Img } from "react-image";
import { Link, useNavigate } from "react-router-dom";
import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

// Example list of doorlock products with accessories
const doorlockProducts = [
  {
    id: 1,
    name: "TMEZON Smart Door Lock",
    price: "$59.99",
    description:
      "TMEZON Smart Door Lock Fingerprint, Keyless Entry Door Lock with Handle, APP/IC Cards/Codes/Keys/Fingerprints Biometric Electronic Keyless Entry",
    image: "/images/doorlocks/doorlock1.jpg",
    accessories: [
      {
        id: 1,
        name: "Changshan Door Lock",
        price: "$47.99",
        image: "/images/doorlocks/accessories/accessory1.jpg"
      },
      {
        id: 2,
        name: "Xenocam",
        price: "$39.99",
        image: "/images/doorlocks/accessories/accessory2.jpg"
      }
    ]
  },
  {
    id: 2,
    name: "Philips Wi-Fi Smart Door Lock",
    price: "$139.99",
    description:
      "Philips Wi-Fi Smart Door Lock, Keyless Entry Door Lock with App Control,Fingerprint ID,Auto Unlock,Keypad Deadbolt with Wi-Fi Bridge Adaptor",
    image: "/images/doorlocks/doorlock2.jpg",
    accessories: [
      {
        id: 1,
        name: "Fiudmsi Door Lock",
        price: "$31.99",
        image: "/images/doorlocks/accessories/accessory3.jpg"
      },
      {
        id: 2,
        name: "Veise Door Lock",
        price: "$30.99",
        image: "/images/doorlocks/accessories/accessory4.jpg"
      }
    ]
  },
  {
    id: 3,
    name: "Keypad Smart Door Lock ",
    price: "$79.99",
    description:
      "Keypad Smart Door Lock with Handle: Kucacci Keyless Entry Door Lock - Digtal Door Lock with Keypad Code - Fingerprint Door Lever Lock Deadbolt",
    image: "/images/doorlocks/doorlock3.jpg",
    accessories: [
      {
        id: 1,
        name: "Changshan Door Lock",
        price: "$47.99",
        image: "/images/doorlocks/accessories/accessory1.jpg"
      },
      {
        id: 2,
        name: "Xenocam",
        price: "$39.99",
        image: "/images/doorlocks/accessories/accessory2.jpg"
      }
    ]
  },
  {
    id: 4,
    name: "eufy Smart Lock C30",
    price: "$59.99",
    description:
      "eufy Smart Lock C30, Keyless Entry Door Lock, Built-in WiFi Deadbolt, Smart Lock for Front Door, No Bridge Required, Easy Installation",
    image: "/images/doorlocks/doorlock4.jpg",
    accessories: [
      {
        id: 1,
        name: "Changshan Door Lock",
        price: "$47.99",
        image: "/images/doorlocks/accessories/accessory1.jpg"
      },
      {
        id: 2,
        name: "Xenocam",
        price: "$39.99",
        image: "/images/doorlocks/accessories/accessory2.jpg"
      }
    ]
  },
  {
    id: 5,
    name: "Yale Assure Lock 2 with Wi-Fi",
    price: "$239.99",
    description:
      "Yale Assure Lock 2 with Wi-Fi, Black Connected Keypad Smart Lock for Front Door or Back, Door Lock with Code and Back-Up Key",
    image: "/images/doorlocks/doorlock5.jpg",
    accessories: [
      {
        id: 1,
        name: "Changshan Door Lock",
        price: "$47.99",
        image: "/images/doorlocks/accessories/accessory1.jpg"
      },
      {
        id: 2,
        name: "Xenocam",
        price: "$39.99",
        image: "/images/doorlocks/accessories/accessory2.jpg"
      }
    ]
  },
  {
    id: 6,
    name: "Keyless Entry Door Lock with Handle",
    price: "$66.49",
    description:
      "Keyless Entry Door Lock with Handle, Hornbill Smart Front Door Lock Set, Electronic Keypad Deadbolt Lock, Alexa Front Door Handle Set",
    image: "/images/doorlocks/doorlock6.jpg",
    accessories: [
      {
        id: 1,
        name: "Veise Smart Door Lock 2",
        price: "$17.99",
        image: "/images/doorlocks/accessories/accessory5.jpg"
      },
      {
        id: 2,
        name: "Veise Smart Door Lock 3",
        price: "$19.99",
        image: "/images/doorlocks/accessories/accessory6.jpg"
      }
    ]
  }
];

export default function Doorlocks() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleBuyNow = () => {
    if (!isSignedIn) {
      navigate("/signin");
    } else {
      window.location.href = "/payment";
    }
  };

  const handleAddProductToCart = (product) => {
    if (!isSignedIn) {
      navigate("/signin");
    } else {
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
    }
  };

  const handleAddAccessoryToCart = (accessory) => {
    const accessoryInCart = cart.find(
      (cartItem) => cartItem.id === `accessory-${accessory.id}`
    );

    if (accessoryInCart) {
      // If accessory is already in the cart, increase its quantity
      setCart(
        cart.map((cartItem) =>
          cartItem.id === `accessory-${accessory.id}`
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      // If accessory is not in the cart, add it with a unique ID
      setCart([
        ...cart,
        { ...accessory, id: `accessory-${accessory.id}`, quantity: 1 }
      ]);
    }
  };

  const handleIncreaseQuantity = (item) => {
    setCart(
      cart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      )
    );
  };

  const handleDecreaseQuantity = (item) => {
    if (item.quantity === 1) {
      setCart(cart.filter((cartItem) => cartItem.id !== item.id));
    } else {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      );
    }
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
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link
                to="/signin"
                className="bg-green-500 text-white px-3 py-2 rounded ml-2 text-sm sm:text-base"
              >
                Sign In
              </Link>
            </SignedOut>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-4 sm:py-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Smart Doorlocks
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-8">
            Discover the range of smart doorlocks that keep your home safe and
            secure.
          </p>
        </div>

        {/* Doorlock Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {doorlockProducts.map((product) => (
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
                      handleDecreaseQuantity(product);
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
                      handleIncreaseQuantity(product);
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
                    {selectedProduct.accessories.map((accessory) => (
                      <div
                        key={accessory.id}
                        className="text-center"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent modal opening
                          handleAddAccessoryToCart(accessory); // Call the modified function
                        }}
                      >
                        <Img
                          src={accessory.image}
                          alt={accessory.name}
                          className="w-20 h-20 object-cover"
                        />
                        <p className="text-sm mt-2">{accessory.name}</p>
                        <p className="text-sm font-bold">{accessory.price}</p>

                        {cart.find(
                          (cartItem) =>
                            cartItem.id === `accessory-${accessory.id}`
                        )?.quantity > 0 && (
                          <div className="flex items-center justify-between mt-2">
                            <button
                              className="text-gray-500 text-xl"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDecreaseQuantity({
                                  ...accessory,
                                  id: `accessory-${accessory.id}`
                                });
                              }}
                            >
                              -
                            </button>
                            <span>
                              {
                                cart.find(
                                  (cartItem) =>
                                    cartItem.id === `accessory-${accessory.id}`
                                )?.quantity
                              }
                            </span>
                            <button
                              className="text-gray-500 text-xl"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIncreaseQuantity({
                                  ...accessory,
                                  id: `accessory-${accessory.id}`
                                });
                              }}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
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

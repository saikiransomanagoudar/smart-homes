import React, { useState } from "react";
import { Img } from "react-image";
import { Link, useNavigate } from "react-router-dom";
import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

// Example list of lighting products with accessories
const lightingProducts = [
  {
    id: 1,
    name: "Govee Smart Light Bulbs",
    price: "$34.99",
    description:
      "Govee Smart Light Bulbs, Color Changing Light Bulb, Work with Alexa and Google Assistant, 16 Million Colors RGBWW, WiFi & Bluetooth LED Light Bulbs, Music Sync, A19, 800 Lumens, 4 Pack",
    image: "/images/lightings/lighting1.jpg",
    accessories: [
      {
        id: 1,
        name: "LED Strip Connector Kit",
        price: "$12.98",
        image: "/images/lightings/accessories/accessory1.jpg"
      },
      {
        id: 2,
        name: "Under Cabinet Lighting",
        price: "$15.98",
        image: "/images/lightings/accessories/accessory2.jpg"
      }
    ]
  },
  {
    id: 2,
    name: "GE CYNC A19 Smart LED Light Bulbs",
    price: "$14.95",
    description:
      "GE CYNC A19 Smart LED Light Bulbs, Color Changing Room Décor, Bluetooth and WiFi Light Bulbs, 60W Equivalent, Work with Amazon Alexa and Google Home (2 Pack)",
    image: "/images/lightings/lighting2.jpg",
    accessories: [
      {
        id: 1,
        name: "LED Strip Connector Kit",
        price: "$12.98",
        image: "/images/lightings/accessories/accessory1.jpg"
      },
      {
        id: 2,
        name: "Under Cabinet Lighting",
        price: "$15.98",
        image: "/images/lightings/accessories/accessory2.jpg"
      }
    ]
  },
  {
    id: 3,
    name: "Touch Bedside Table Lamp",
    price: "$23.99",
    description:
      "Touch Bedside Table Lamp, [Sleek Design & RGB Mode] 3 Way Dimmable Small Lamp for Bedroom, LED Lamp with Warm White Lights, Multi-Color Smart Nightstand Lamp",
    image: "/images/lightings/lighting3.jpg",
    accessories: [
      {
        id: 1,
        name: "LED Strip Connector Kit",
        price: "$12.98",
        image: "/images/lightings/accessories/accessory1.jpg"
      },
      {
        id: 2,
        name: "Under Cabinet Lighting",
        price: "$15.98",
        image: "/images/lightings/accessories/accessory2.jpg"
      }
    ]
  },
  {
    id: 4,
    name: "Echo Glow",
    price: "$29.99",
    description: "Echo Glow - Multicolor smart lamp, Works with Alexa",
    image: "/images/lightings/lighting4.jpg",
    accessories: [
      {
        id: 1,
        name: "LED Strip Connector Kit",
        price: "$12.98",
        image: "/images/lightings/accessories/accessory1.jpg"
      },
      {
        id: 2,
        name: "Under Cabinet Lighting",
        price: "$15.98",
        image: "/images/lightings/accessories/accessory2.jpg"
      }
    ]
  },
  {
    id: 5,
    name: "Govee RGBIC Floor Lamp",
    price: "$99.99",
    description:
      "Govee RGBIC Floor Lamp, LED Corner Lamp Works with Alexa, Smart Modern Floor Lamp with Music Sync and 16 Million DIY Colors",
    image: "/images/lightings/lighting5.jpg",
    accessories: [
      {
        id: 1,
        name: "LED Strip Connector Kit",
        price: "$12.98",
        image: "/images/lightings/accessories/accessory1.jpg"
      },
      {
        id: 2,
        name: "Under Cabinet Lighting",
        price: "$15.98",
        image: "/images/lightings/accessories/accessory2.jpg"
      }
    ]
  }
];

export default function Lightings() {
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
            Smart Lightings
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-8">
            Discover the range of smart lightings that keep your home safe and
            secure.
          </p>
        </div>

        {/* Lighting Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {lightingProducts.map((product) => (
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

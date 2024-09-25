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
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userId = localStorage.getItem("userId");

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

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleBuyNow = (product) => {
    if (isLoggedIn) {
      const productData = {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description || "",
        image: product.image,
        quantity: product.quantity || 1
      };
      navigate("/checkout", { state: { product: productData } });
    } else {
      navigate("/signin");
    }
  };

  const handleAddProductToCart = (item, isAccessory = false) => {
    if (!userId) {
      navigate("/signin");
      return;
    }

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
          type: isAccessory ? "accessory" : "product",
          userId
        })
      }).catch((error) => {
        console.error("Error updating item in cart:", error);
      });
    } else {
      const newItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1,
        type: isAccessory ? "accessory" : "product",
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
                    ${product.price ? product.price.toFixed(2) : "N/A"}
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
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <p>No products available for this category.</p>
          )}
        </div>

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
              <p className="text-lg font-bold mb-4">
                $
                {selectedProduct.price !== undefined &&
                selectedProduct.price !== null
                  ? selectedProduct.price.toFixed(2)
                  : "N/A"}
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

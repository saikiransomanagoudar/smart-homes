import React, { useState, useEffect } from "react";
import { Img } from "react-image";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

export default function ProductsPage({ cart, setCart }) {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch products based on category
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
      .catch((error) =>
        console.error(`Error fetching ${category} products:`, error)
      );
  }, [category]);

  const handleProductClick = (product) => {
    setSelectedProduct(product); // Set selected product for modal display
  };

  const handleCloseModal = () => {
    setSelectedProduct(null); // Close the modal
  };

  const handleBuyNow = () => {
    window.location.href = "/payment"; // Proceed to payment directly
  };

  const handleAddProductToCart = (product) => {
    const updatedQuantities = { ...quantities, [product.id]: 1 };
    setQuantities(updatedQuantities);
    setCart([...cart, { ...product, quantity: 1 }]);
  };

  const handleAddAccessoryToCart = (accessory) => {
    const accessoryCartId = `accessory-${accessory.nameA}`;
    const accessoryInCart = cart.find((item) => item.id === accessoryCartId);

    if (accessoryInCart) {
      setCart(
        cart.map((item) =>
          item.id === accessoryCartId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: accessoryCartId,
          name: accessory.nameA,
          price: accessory.priceA,
          image: accessory.imageA,
          quantity: 1
        }
      ]);
    }
  };

  const handleIncreaseQuantity = (id) => {
    const updatedQuantities = {
      ...quantities,
      [id]: (quantities[id] || 0) + 1
    };
    setQuantities(updatedQuantities);

    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecreaseQuantity = (id) => {
    if (quantities[id] > 1) {
      const updatedQuantities = {
        ...quantities,
        [id]: quantities[id] - 1
      };
      setQuantities(updatedQuantities);

      setCart(
        cart.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
      );
    } else {
      const updatedQuantities = { ...quantities };
      delete updatedQuantities[id];
      setQuantities(updatedQuantities);

      setCart(cart.filter((item) => item.id !== id));
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
              <Link to="/cart" className="text-white">
                <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                Cart Items: {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </Link>
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
                  onClick={() => handleProductClick(product)} // Trigger modal on click
                >
                  <h3 className="text-lg sm:text-xl font-bold">
                    {product.nameP}
                  </h3>
                  <Img
                    src={product.imageP}
                    alt={product.nameP}
                    loader={<div>Loading...</div>}
                    unloader={<div>Image not found</div>}
                    className="h-40 w-auto object-contain mx-auto mt-2"
                  />
                  <p className="mt-2 text-sm sm:text-base">
                    {product.description}
                  </p>
                  <p className="text-lg font-bold mt-2">{product.priceP}</p>

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
                        className="bg-green-500 text-white px-4 py-2 mt-4 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddProductToCart(product);
                        }}
                      >
                        Add to Cart
                      </button>
                      <button
                        className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow();
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
              <h3 className="text-xl font-bold mb-4">
                {selectedProduct.nameP}
              </h3>
              <Img
                src={selectedProduct.imageP}
                alt={selectedProduct.nameP}
                className="w-full h-40 object-contain mb-4"
              />
              <p className="text-sm mb-4">{selectedProduct.description}</p>
              <p className="text-lg font-bold mb-4">{selectedProduct.priceP}</p>

              {/* Display Accessories */}
              {selectedProduct.accessories &&
                selectedProduct.accessories.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-base font-semibold mb-2">
                      Accessories:
                    </h4>
                    <ul className="flex flex-wrap gap-4">
                      {selectedProduct.accessories.map((accessory, index) => {
                        const accessoryCartId = `accessory-${accessory.nameA}`;
                        const accessoryQuantity =
                          quantities[accessoryCartId] || 0;

                        return (
                          <li
                            key={index}
                            className="flex flex-col items-center"
                          >
                            <h5 className="text-sm font-semibold">
                              {accessory.nameA}
                            </h5>
                            <p className="text-sm font-bold">
                              Price: {accessory.priceA}
                            </p>
                            <Img
                              src={accessory.imageA}
                              alt={accessory.nameA}
                              className="w-20 h-20 object-contain"
                              loader={<div>Loading...</div>}
                              unloader={<div>Image not found</div>}
                            />
                            {accessoryQuantity > 0 ? (
                              <div className="flex items-center justify-between mt-2">
                                <button
                                  className="bg-red-500 text-white px-2 py-1 rounded"
                                  onClick={() =>
                                    handleDecreaseQuantity(accessoryCartId)
                                  }
                                >
                                  -
                                </button>
                                <span>{accessoryQuantity}</span>
                                <button
                                  className="bg-green-500 text-white px-2 py-1 rounded"
                                  onClick={() =>
                                    handleIncreaseQuantity(accessoryCartId)
                                  }
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                className="bg-green-500 text-white px-2 py-2 mt-2 rounded"
                                onClick={() =>
                                  handleAddAccessoryToCart(accessory)
                                }
                              >
                                Add to Cart
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
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
                  handleCloseModal();
                }}
              >
                Add to Cart
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

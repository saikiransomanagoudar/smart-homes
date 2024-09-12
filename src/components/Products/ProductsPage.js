import React, { useState, useEffect } from "react";
import { Img } from "react-image";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

export default function ProductsPage({ cart, setCart }) {
  const { category } = useParams(); // Dynamically get the category from the URL
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // For modal display

  // Fetch the products based on the category from the backend
  useEffect(() => {
    fetch(`http://localhost:8080/smarthomes/getProducts?category=${category}`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          console.log(data); // Check the data structure
          setProducts(data);
        } else {
          console.error("Data is not an array:", data);
          setProducts([]);
        }
      })
      .catch((error) =>
        console.error(`Error fetching ${category} products:`, error)
      );
  }, [category]);

  const handleProductClick = (product) => {
    setSelectedProduct(product); // Set the selected product for modal display
  };

  const handleCloseModal = () => {
    setSelectedProduct(null); // Close the modal
  };

  const handleBuyNow = () => {
    window.location.href = "/payment"; // Proceed to payment directly
  };

  const handleAddProductToCart = (product) => {
    fetch("http://localhost:8080/smarthomes/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: product.id,
        name: product.nameP, // Updated to use nameP
        price: product.priceP, // Updated to use priceP
        image: product.imageP // Updated to use imageP
      })
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
      .catch((error) => console.error("Error adding product to cart:", error));
  };

  const handleAddAccessoryToCart = (accessory) => {
    const accessoryCartId = `accessory-${accessory.id}`;
    fetch("http://localhost:8080/smarthomes/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: accessoryCartId,
        name: accessory.name, // Updated to use nameA
        price: accessory.price, // Updated to use priceA
        image: accessory.imageA // Updated to use imageA
      })
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
          setCart([
            ...cart,
            { ...accessory, id: accessoryCartId, quantity: 1 }
          ]);
        }
      })
      .catch((error) =>
        console.error("Error adding accessory to cart:", error)
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
            {`Smart ${category.charAt(0).toUpperCase() + category.slice(1)}`}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-8">
            {`Discover the range of smart ${category} that keep your home safe and secure.`}
          </p>
        </div>

        {/* Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.length > 0 ? (
            products.map((product) => {
              return (
                <div
                  key={product.id}
                  className="p-4 bg-white shadow rounded flex flex-col justify-between"
                  onClick={() => handleProductClick(product)} // Trigger modal on click
                >
                  <h3 className="text-lg sm:text-xl font-bold">
                    {product.nameP} {/* Updated to use nameP */}
                  </h3>
                  {/* Image component with loader and unloader */}
                  <Img
                    src={product.imageP} // Updated to use imageP
                    alt={product.nameP} // Updated to use nameP
                    loader={<div>Loading...</div>}
                    unloader={<div>Image not found</div>}
                    className="h-40 w-auto object-contain mx-auto mt-2"
                  />
                  <p className="mt-2 text-sm sm:text-base">
                    {product.description}
                  </p>
                  <p className="text-lg font-bold mt-2">{product.priceP}</p>{" "}
                  {/* Updated to use priceP */}
                  <button
                    className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuyNow();
                    }}
                  >
                    Buy Now
                  </button>
                  <button
                    className="bg-green-500 text-white px-4 py-2 mt-4 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddProductToCart(product);
                    }}
                  >
                    Add to Cart
                  </button>
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
            onClick={handleCloseModal} // Close modal when clicking outside
          >
            <div
              className="bg-white p-6 rounded-lg shadow-lg w-96 relative"
              onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
            >
              <button
                className="absolute top-2 right-2 text-gray-700 text-xl"
                onClick={handleCloseModal}
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4">
                {selectedProduct.nameP}
              </h3>{" "}
              {/* Updated to use nameP */}
              <Img
                src={selectedProduct.imageP} // Updated to use imageP
                alt={selectedProduct.nameP} // Updated to use nameP
                className="w-full h-40 object-contain mb-4"
              />
              <p className="text-sm mb-4">{selectedProduct.description}</p>
              <p className="text-lg font-bold mb-4">
                {selectedProduct.priceP}
              </p>{" "}
              {/* Updated to use priceP */}
              {/* Display Accessories */}
              {selectedProduct.accessories &&
                selectedProduct.accessories.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-base font-semibold mb-2">
                      Accessories:
                    </h4>
                    <ul className="flex flex-wrap gap-4">
                      {" "}
                      {/* Changed layout to flex with some gap */}
                      {selectedProduct.accessories.map((accessory, index) => (
                        <li key={index} className="flex flex-col items-center">
                          {" "}
                          {/* Each accessory will appear in a column */}
                          <h5 className="text-sm font-semibold">
                            {accessory.nameA}
                          </h5>{" "}
                          {/* Updated to use nameA */}
                          <p className="text-sm font-bold">
                            Price: {accessory.priceA}
                          </p>{" "}
                          {/* Updated to use priceA */}
                          <Img
                            src={accessory.imageA} // Updated to use imageA
                            alt={accessory.nameA} // Updated to use nameA
                            className="w-20 h-20 object-contain"
                            loader={<div>Loading...</div>}
                            unloader={<div>Image not found</div>}
                          />
                          <button
                            className="bg-green-500 text-white px-2 py-2 mt-2 rounded"
                            onClick={() => handleAddAccessoryToCart(accessory)}
                          >
                            Add to Cart
                          </button>
                        </li>
                      ))}
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

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function SearchResult() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);  // Extract query parameters
  const name = queryParams.get("name");  // Get the 'name' from the query string
  const [product, setProduct] = useState(null);

  // Fetch product details when the component loads
  useEffect(() => {
    fetch(`http://localhost:8080/smarthomes/productDetails?name=${name}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched product details:", data);
        setProduct(data);
      })
      .catch((error) => {
        console.error("Error fetching product details:", error);
      });
  }, [name]);

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-4">{product.name}</h2>
      <div className="flex space-x-4">
        <img src={product.image} alt={product.name} className="w-1/3" />
        <div>
          <p><strong>Price:</strong> ${product.price}</p>
          <p><strong>Description:</strong> {product.description}</p>
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Quantity:</strong> {product.quantity}</p>
          <p><strong>On Sale:</strong> {product.onSale ? "Yes" : "No"}</p>
          <p><strong>Has Rebate:</strong> {product.hasRebate ? "Yes" : "No"}</p>
        </div>
      </div>
    </div>
  );
}

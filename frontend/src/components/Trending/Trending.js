import React, { useEffect, useState } from "react";
// import Typical from "react-typical";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faFire, faMapMarkerAlt, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

export default function Trending() {
  const [topProducts, setTopProducts] = useState([]);
  const [mostSoldByZip, setMostSoldByZip] = useState([]);
  const [mostSoldOverall, setMostSoldOverall] = useState([]);

  useEffect(() => {
    // Fetch top 5 products based on reviews from MongoDB
    fetch("http://localhost:8080/smarthomes/api/trending/reviews")
      .then((response) => response.json())
      .then((data) => setTopProducts(data))
      .catch((error) => console.error("Error fetching top products:", error));

    // Fetch most sold products by zip code from MySQL
    fetch("http://localhost:8080/smarthomes/api/trending/most-sold-zipcode")
      .then((response) => response.json())
      .then((data) => setMostSoldByZip(data))
      .catch((error) =>
        console.error("Error fetching most sold by zip:", error)
      );

    // Fetch most sold products overall from MySQL
    fetch("http://localhost:8080/smarthomes/api/trending/most-sold-overall")
      .then((response) => response.json())
      .then((data) => setMostSoldOverall(data))
      .catch((error) =>
        console.error("Error fetching most sold overall:", error)
      );
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 lg:px-8">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-8">
      Trending Products
      </h2>

      {/* Top Products by User Reviews */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold mb-4 text-center">
          <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-2" />
          Top 5 Products by User Reviews
        </h3>
        <ul className="space-y-4">
          {topProducts.map((product, index) => (
            <li key={index} className="bg-white shadow-lg rounded-lg p-4 flex items-center hover:shadow-xl transition-shadow">
              <FontAwesomeIcon icon={faFire} className="text-red-500 text-xl mr-4" />
              <div>
                <p className="text-lg font-semibold">{product.productName}</p>
                <p className="text-sm text-gray-500">Rating: {product.reviewRating} stars</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Most Sold Products by Zip Code */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold mb-4 text-center">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-500 mr-2" />
          Most Sold Products by Zip Code
        </h3>
        <ul className="space-y-4">
          {mostSoldByZip.map((product, index) => (
            <li key={index} className="bg-white shadow-lg rounded-lg p-4 flex items-center hover:shadow-xl transition-shadow">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-500 text-xl mr-4" />
              <div>
                <p className="text-lg font-semibold">{product.product_name}</p>
                <p className="text-sm text-gray-500">Zip Code: {product.zip_code}</p>
                <p className="text-sm text-gray-500">Sold: {product.total_sales}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Most Sold Products Overall */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 text-center">
          <FontAwesomeIcon icon={faShoppingCart} className="text-blue-500 mr-2" />
          Most Sold Products Overall
        </h3>
        <ul className="space-y-4">
          {mostSoldOverall.map((product, index) => (
            <li key={index} className="bg-white shadow-lg rounded-lg p-4 flex items-center hover:shadow-xl transition-shadow">
              <FontAwesomeIcon icon={faShoppingCart} className="text-blue-500 text-xl mr-4" />
              <div>
                <p className="text-lg font-semibold">{product.product_name}</p>
                <p className="text-sm text-gray-500">Total Sold: {product.total_sales}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

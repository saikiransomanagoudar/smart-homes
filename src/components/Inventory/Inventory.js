import React, { useEffect, useState } from 'react';
import { Chart } from "react-google-charts";
import { useNavigate } from 'react-router-dom';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loginType = localStorage.getItem('loginType');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (!isLoggedIn) {
      navigate("/signin");
      return;
    }

    if (loginType !== 'StoreManager') {
      alert("Unauthorized access. You must be a Store Manager to access this page.");
      navigate("/");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    fetch("http://localhost:8080/smarthomes/inventory")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching inventory data:", error);
        setLoading(false);
      });
  }, []);

  const generateBarChart = () => {
    // Prepare chart data
    const chartData = [
      ["Product", "Available Quantity"],
      ...products.map((product) => [product.name, product.quantity ? product.quantity : 0])
    ];
  
    // Chart options
    const chartOptions = {
      title: "Available Product Inventory",
      hAxis: { title: "Available Quantity" },
      vAxis: { title: "Product", textStyle: { fontSize: 12 }, slantedText: true, slantedTextAngle: 45 },
      chartArea: { width: "50%" },
      bar: { groupWidth: "75%" },
    };

    const chartHeight = 400 + products.length * 50;
  
    return (
      <div>
  
        <Chart
          chartType="BarChart"
          data={chartData}
          options={chartOptions}
          width="100%"
          height={`${chartHeight}px`} // Dynamic height
        />
      </div>
    );
  };    

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Store Inventory</h1>
      {loading ? <p>Loading inventory...</p> : (
        <div>
          {/* Product table */}
          <table className="min-w-full table-auto mb-4">
            <thead>
              <tr>
                <th className="px-4 py-2">Product Name</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Quantity Available</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="border px-4 py-2">{product.name}</td>
                  <td className="border px-4 py-2">${product.price}</td>
                  <td className="border px-4 py-2">{product.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bar chart */}
          {generateBarChart()}

          {/* Products on sale */}
          <h2 className="text-xl font-bold mt-6">Products on Sale</h2>
          <table className="min-w-full table-auto mb-4">
            <thead>
              <tr>
                <th className="px-4 py-2">Product Name</th>
                <th className="px-4 py-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {products.filter((product) => product.onSale).map((product) => (
                <tr key={product.id}>
                  <td className="border px-4 py-2">{product.name}</td>
                  <td className="border px-4 py-2">${product.price}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Products with manufacturer rebates */}
          <h2 className="text-xl font-bold mt-6">Products with Manufacturer Rebates</h2>
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2">Product Name</th>
                <th className="px-4 py-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {products.filter((product) => product.hasRebate).map((product) => (
                <tr key={product.id}>
                  <td className="border px-4 py-2">{product.name}</td>
                  <td className="border px-4 py-2">${product.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

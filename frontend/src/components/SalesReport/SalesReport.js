import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import { useNavigate } from "react-router-dom";

export default function SalesReport() {
  const [salesData, setSalesData] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loginType = localStorage.getItem('loginType');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    // If user is not logged in at all, redirect to sign-in page
    if (!isLoggedIn) {
      navigate("/signin");
      return;
    }

    // If user is logged in but not a StoreManager, show alert and redirect to home page
    if (loginType !== 'StoreManager') {
      alert("Unauthorized access. You must be a Store Manager to access this page.");
      navigate("/");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    // Fetch sales data
    fetch("http://localhost:8080/smarthomes/sales-report")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setSalesData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching sales data:", error);
        setLoading(false);
      });

    // Fetch daily sales data
    fetch("http://localhost:8080/smarthomes/daily-sales")
      .then((response) => response.json())
      .then((data) => {
        setDailySales(data);
      })
      .catch((error) => {
        console.error("Error fetching daily sales data:", error);
      });
  }, []);

  const generateBarChart = () => {
    // Ensure salesData is in the correct format and handle undefined data
    const chartData = [
      ["Product", "Total Sales"],
      ...salesData.map((product) => [
        product.productName || "Unknown Product",
        product.price * product.itemsSold
      ])
    ];

    // Debugging: Log the chart data to ensure it's correctly formatted
    console.log("Chart Data: ", chartData);

    // Chart options without animation
    const chartOptions = {
      title: "Total Sales per Product",
      hAxis: { title: "Total Sales" },
      vAxis: {
        title: "Product",
        textStyle: { fontSize: 12 },
        slantedText: true,
        slantedTextAngle: 45
      },
      chartArea: { width: "65%", height: "85%" }, // Adjust the chart area to fill more space
      bar: { groupWidth: "70%" }, // Adjust bar width for better spacing
      height: 400 + salesData.length * 60 // Adjust height dynamically based on the number of products
    };

    return (
      <Chart
        chartType="BarChart"
        data={chartData}
        options={chartOptions}
        width="100%"
        height={`${chartOptions.height}px`} // Dynamic height
      />
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sales Report</h1>
      {loading ? (
        <p>Loading sales data...</p>
      ) : (
        <div>
          {/* Sales Table */}
          <table className="min-w-full table-auto mb-4">
            <thead>
              <tr>
                <th className="px-4 py-2">Product Name</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Items Sold</th>
                <th className="px-4 py-2">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((product, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">
                    {product.productName || "Unknown Product"}
                  </td>
                  <td className="border px-4 py-2">
                    ${product.price?.toFixed(2) || "0.00"}
                  </td>
                  <td className="border px-4 py-2">{product.itemsSold || 0}</td>
                  <td className="border px-4 py-2">
                    $
                    {((product.price || 0) * (product.itemsSold || 0)).toFixed(
                      2
                    )}{" "}
                    {/* Correct calculation */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bar Chart */}
          {salesData.length > 0 ? (
            generateBarChart()
          ) : (
            <p>No sales data available to display in the chart.</p>
          )}

          {/* Daily Sales Table */}
          <h2 className="text-xl font-bold mt-6">Daily Sales Transactions</h2>
          <table className="min-w-full table-auto mb-4">
            <thead>
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {dailySales.map((day, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{day.purchaseDate}</td>
                  <td className="border px-4 py-2">
                    ${day.totalDailySales?.toFixed(2) || "0.00"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

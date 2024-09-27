import React, { useState, useEffect } from "react";
import { Img } from "react-image";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  const navigate = useNavigate();
  // State for login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // eslint-disable-next-line
  const [storedName, setStoredName] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) {
      setStoredName(storedName);
    }
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loggedInStatus === "true");
  }, []);
  const loginType = localStorage.getItem("loginType");

  // Handle Shop Now navigation without the sign-in check
  const handleShopNow = (category) => {
    navigate(`/products/${category}`);
  };

  const handleSignOut = () => {
    localStorage.removeItem("isLoggedIn"); // Clear the logged-in status
    setIsLoggedIn(false); // Update state
    navigate("/"); // Redirect to the home page
  };

  return (
    <div className="bg-[#f5f5f5] overflow-x-hidden">
      {/* Header */}
      <header className="bg-[#550403] text-white p-4">
        <div className="container mx-auto flex justify-between items-center flex-wrap">
          <h1 className="text-3xl sm:text-4xl font-bold">
            <Link to="/">Smart Homes</Link>
          </h1>
          <nav className="flex space-x-2 sm:space-x-4 items-center">
            {isLoggedIn &&
              (loginType === "StoreManager" ? (
                <span className="text-sm sm:text-base">Hello, Manager!</span>
              ) : (
                <span className="text-sm sm:text-base">Hello, Customer!</span>
              ))}
            <Link
              to="/trending"
              className="text-sm sm:text-base flex items-center"
            >
              <FontAwesomeIcon icon={faFire} className="mr-2" />
              Trending Products
            </Link>
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
            {isLoggedIn ? (
              <>
                <Link to="/orders" className="text-sm sm:text-base">
                  View Orders
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 text-white px-4 py-2 rounded text-sm sm:text-base"
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
                  className="bg-blue-500 text-white px-4 py-2 rounded text-sm sm:text-base"
                >
                  Sign In
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-4 sm:py-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Welcome to Smart Homes
          </h2>
          <p className="text-base sm:text-lg lg:text-xl">
            Your one-stop solution for all smart devices at home. Shop now for
            Smart Doorbells, Smart Speakers, and more.
          </p>
        </div>

        {/* Product Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
          {/* Smart Doorbells */}
          <div className="p-4 bg-white shadow rounded flex flex-col justify-between">
            <h3 className="text-lg sm:text-xl font-bold">Smart Doorbells</h3>
            <Img
              src="/images/smart-doorbell.jpg"
              alt="Smart Doorbells"
              loader={<div>Loading...</div>} // Fallback while loading
              unloader={<div>Image not found</div>} // Fallback in case of error
              className="w-full h-auto object-cover mt-2"
            />
            <button
              className="text-blue-500 mt-2 block text-center"
              onClick={() => handleShopNow("doorbells")}
            >
              Shop Now
            </button>
          </div>

          {/* Smart Doorlocks */}
          <div className="p-4 bg-white shadow rounded flex flex-col justify-between">
            <h3 className="text-lg sm:text-xl font-bold">Smart Doorlocks</h3>
            <Img
              src="/images/smart-doorlock.jpg"
              alt="Smart Doorlocks"
              loader={<div>Loading...</div>}
              unloader={<div>Image not found</div>}
              className="w-full h-auto object-cover mt-2"
            />
            <button
              className="text-blue-500 mt-2 block text-center"
              onClick={() => handleShopNow("doorlocks")}
            >
              Shop Now
            </button>
          </div>

          {/* Smart Speakers */}
          <div className="p-4 bg-white shadow rounded flex flex-col justify-between">
            <h3 className="text-lg sm:text-xl font-bold">Smart Speakers</h3>
            <Img
              src="/images/smart-speaker.jpg"
              alt="Smart Speakers"
              loader={<div>Loading...</div>}
              unloader={<div>Image not found</div>}
              className="w-full h-auto object-cover mt-2"
            />
            <button
              className="text-blue-500 mt-2 block text-center"
              onClick={() => handleShopNow("speakers")}
            >
              Shop Now
            </button>
          </div>

          {/* Smart Lightings */}
          <div className="p-4 bg-white shadow rounded flex flex-col justify-between">
            <h3 className="text-lg sm:text-xl font-bold">Smart Lightings</h3>
            <Img
              src="/images/smart-lighting.jpg"
              alt="Smart Lightings"
              loader={<div>Loading...</div>}
              unloader={<div>Image not found</div>}
              className="w-full h-auto object-cover mt-2"
            />
            <button
              className="text-blue-500 mt-2 block text-center"
              onClick={() => handleShopNow("lightings")}
            >
              Shop Now
            </button>
          </div>

          {/* Smart Thermostats */}
          <div className="p-4 bg-white shadow rounded flex flex-col justify-between">
            <h3 className="text-lg sm:text-xl font-bold">Smart Thermostats</h3>
            <Img
              src="/images/smart-thermostat.jpg"
              alt="Smart Thermostats"
              loader={<div>Loading...</div>}
              unloader={<div>Image not found</div>}
              className="w-full h-auto object-cover mt-2"
            />
            <button
              className="text-blue-500 mt-2 block text-center"
              onClick={() => handleShopNow("thermostats")}
            >
              Shop Now
            </button>
          </div>
        </div>
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

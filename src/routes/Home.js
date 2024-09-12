import React, { useState, useEffect } from "react";
import { Img } from "react-image";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const navigate = useNavigate();

  // Check if the user is signed in (using localStorage for demonstration purposes)
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsSignedIn(true);
    }
  }, []);

  // Handle sign-out
  const handleSignOut = () => {
    // Remove user from localStorage or handle sign-out logic
    localStorage.removeItem("user");
    setIsSignedIn(false);
    navigate("/"); // Navigate to home after sign-out
  };

  const handleShopNowDoorbells = (e) => {
    e.preventDefault();
    if (!isSignedIn) {
      navigate("/signin"); // Navigate to SignIn if not signed in
    } else {
      window.location.href = "/products/doorbells"; // Redirect to product page if signed in
    }
  };

  const handleShopNowDoorlocks = (e) => {
    e.preventDefault();
    if (!isSignedIn) {
      navigate("/signin"); // Navigate to SignIn if not signed in
    } else {
      window.location.href = "/products/doorlocks"; // Redirect to product page if signed in
    }
  };

  const handleShopNowSpeakers = (e) => {
    e.preventDefault();
    if (!isSignedIn) {
      navigate("/signin"); // Navigate to SignIn if not signed in
    } else {
      window.location.href = "/products/speakers"; // Redirect to product page if signed in
    }
  };

  const handleShopNowLightings = (e) => {
    e.preventDefault();
    if (!isSignedIn) {
      navigate("/signin"); // Navigate to SignIn if not signed in
    } else {
      window.location.href = "/products/lightings"; // Redirect to product page if signed in
    }
  };

  const handleShopNowThermostats = (e) => {
    e.preventDefault();
    if (!isSignedIn) {
      navigate("/signin"); // Navigate to SignIn if not signed in
    } else {
      window.location.href = "/products/thermostats"; // Redirect to product page if signed in
    }
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

            {!isSignedIn ? (
              <>
                <Link
                  to="/signup"
                  className="bg-green-500 text-white px-3 py-2 rounded ml-2 text-sm sm:text-base"
                >
                  Sign Up
                </Link>
                <Link
                  to="/signin"
                  className="bg-blue-500 text-white px-3 py-2 rounded text-sm sm:text-base"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <button
                onClick={handleSignOut}
                className="bg-red-500 text-white px-3 py-2 rounded text-sm sm:text-base"
              >
                Sign Out
              </button>
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
            <Link
              to="/products/doorbells"
              className="text-blue-500 mt-2 block text-center"
              onClick={handleShopNowDoorbells}
            >
              Shop Now
            </Link>
          </div>

          {/* Other products */}
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
            <Link
              to="/products/doorlocks"
              className="text-blue-500 mt-2 block text-center"
              onClick={handleShopNowDoorlocks}
            >
              Shop Now
            </Link>
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
            <Link
              to="/products/speakers"
              className="text-blue-500 mt-2 block text-center"
              onClick={handleShopNowSpeakers}
            >
              Shop Now
            </Link>
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
            <Link
              to="/products/lightings"
              className="text-blue-500 mt-2 block text-center"
              onClick={handleShopNowLightings}
            >
              Shop Now
            </Link>
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
            <Link
              to="/products/thermostats"
              className="text-blue-500 mt-2 block text-center"
              onClick={handleShopNowThermostats}
            >
              Shop Now
            </Link>
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

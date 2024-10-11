import React, { useState, useEffect, useRef } from "react";
import { Img } from "react-image";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFire,
  faDolly,
  faClipboardList,
  faSearch
} from "@fortawesome/free-solid-svg-icons";
// import axios from "axios";

export default function Home() {
  const navigate = useNavigate();
  // State for login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // eslint-disable-next-line
  const [storedName, setStoredName] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [searchResults, setSearchResults] = useState([]); // State for auto-complete suggestions
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef(null);

  useEffect(() => {
    // Detect clicks outside the search box
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]); // Close dropdown if click is outside search box or dropdown
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      // Move down in the list
      setHighlightedIndex((prevIndex) =>
        prevIndex < searchResults.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (event.key === "ArrowUp") {
      // Move up in the list
      setHighlightedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : prevIndex
      );
    } else if (event.key === "Enter" && highlightedIndex >= 0) {
      // If Enter is pressed, select the highlighted item
      handleSearchItemClick(searchResults[highlightedIndex]);
    }
  };

  const handleSearch = (event) => {
    const searchTerm = event.target.value;
    setSearchTerm(searchTerm);

    if (searchTerm.length > 1) {
      fetch(
        `http://localhost:8080/smarthomes/autocomplete?query=${searchTerm}`,
        {
          credentials: "include"
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch");
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
          setSearchResults(data); // Store fetched products in searchResults state
        })
        .catch((error) => {
          console.error("Error fetching search results:", error);
        });
    } else {
      setSearchResults([]); // Clear results if input is empty or too short
    }
  };

  const handleSearchItemClick = (productName) => {
    setSearchTerm(productName);
    setSearchResults([]);
    navigate(`/search?name=${productName}`);
  };
  

  return (
    <div className="bg-[#f5f5f5] overflow-x-hidden">
      {/* Header */}
      <header className="bg-[#550403] text-white p-4">
        <div className="container mx-auto flex justify-between items-center flex-wrap">
          <h1 className="text-3xl sm:text-4xl font-bold">
            <Link to="/">Smart Homes</Link>
          </h1>
          <div className="flex-grow w-64 ml-4">
            {/* Search Input */}
            <div className="flex items-center mr-8">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                onKeyDown={handleKeyDown}
                placeholder="Search for all products..."
                className="border border-gray-300 p-2 pl-4 pr-12 rounded-full w-full text-black bg-white focus:outline-none"
                style={{ color: "black", width: "250px" }}
              />
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded-full ml-2 text-sm sm:text-base flex items-center"
                onClick={() => {
                  if (searchTerm.trim() === "") {
                    alert("Please start typing the product name"); // Display pop-up when search bar is empty
                  } else {
                    handleSearchItemClick(searchTerm);
                  }
                }}
              >
                Search
                <span style={{ marginLeft: "5px" }}>
                  {" "}
                  {/* Add space between the word and the icon */}
                  <FontAwesomeIcon icon={faSearch} />
                </span>
              </button>
            </div>

            {searchResults.length > 0 && (
              <ul className="absolute bg-white border border-gray-300 rounded mt-1 z-10">
                {searchResults.map((result, index) => (
                  <li
                    key={index}
                    className={`p-2 cursor-pointer hover:bg-gray-200 ${
                      highlightedIndex === index ? "bg-blue-500 text-white" : ""
                    }`}
                    onMouseEnter={() => setHighlightedIndex(index)} // Highlight the item on mouse enter
                    style={{ color: "black" }} // Force the text color to black
                    onClick={() => handleSearchItemClick(result)}
                  >
                    {result} {/* Render the product name */}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <nav className="flex space-x-2 sm:space-x-4 items-center">
            {isLoggedIn &&
              (loginType === "StoreManager" ? (
                <>
                  <span
                    className="text-sm sm:text-base font-bold"
                    style={{ fontStyle: "italic" }}
                  >
                    Hello, Manager!
                  </span>
                  <Link to="/sales-report" className="text-sm sm:text-base">
                    <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
                    Sales Report
                  </Link>
                  <Link to="/inventory" className="text-sm sm:text-base">
                    <FontAwesomeIcon icon={faDolly} className="mr-2" />
                    Inventory
                  </Link>
                  <Link
                    to="/trending"
                    className="text-sm sm:text-base flex items-center"
                  >
                    <FontAwesomeIcon icon={faFire} className="mr-2" />
                    Trending Products
                  </Link>
                </>
              ) : (
                <span
                  className="text-sm sm:text-base font-bold"
                  style={{ fontStyle: "italic" }}
                >
                  Hello, Customer!
                </span>
              ))}
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

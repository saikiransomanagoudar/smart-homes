import React from "react";
import { Img } from 'react-image';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

// Example list of doorbell products with accessories
const doorbellProducts = [
  {
    id: 1,
    name: "Blink Video Doorbell",
    price: "$59.99",
    description:
      "Blink Video Doorbell | Two-way audio, HD video, motion and chime app alerts and Alexa enabled — wired or wire-free (Black)",
    image: "/images/doorbells/doorbell1.jpg",
    accessories: [
      {
        id: 1,
        name: "Chime Accessory",
        price: "$19.99",
        image: "/images/chime.jpg"
      },
      {
        id: 2,
        name: "Extra Battery",
        price: "$29.99",
        image: "/images/battery.jpg"
      }
    ]
  },
  {
    id: 2,
    name: "Tapo TP-Link Smart Doorbell",
    price: "$89.99",
    description: "Tapo TP-Link Smart Video Doorbell Camera, Battery Powered, Chime Included, 2K 5MP, Color Night Vision, 2-Way Audio",
    image: "/images/doorbells/doorbell2.jpg",
    accessories: [
      {
        id: 1,
        name: "Wall Mount Kit",
        price: "$9.99",
        image: "/images/mount.jpg"
      },
      {
        id: 2,
        name: "Solar Charger",
        price: "$39.99",
        image: "/images/solar.jpg"
      }
    ]
  },
  {
    id: 3,
    name: "Ring Video Doorbell",
    price: "$59.99",
    description: "Ring Video Doorbell - 1080p HD video, improved motion detection, easy installation (2020 release) – Satin Nickel",
    image: "/images/doorbells/doorbell3.jpg",
    accessories: [
      {
        id: 1,
        name: "Wall Mount Kit",
        price: "$9.99",
        image: "/images/mount.jpg"
      },
      {
        id: 2,
        name: "Solar Charger",
        price: "$39.99",
        image: "/images/solar.jpg"
      }
    ]
  },
  {
    id: 4,
    name: "Smart Video Doorbell Camera",
    price: "$13.99",
    description: "Smart Video Doorbell Camera Wireless, AI Human Detection and Instant Alerts, Night Vision, 2-Way Audio, Battery Powered",
    image: "/images/doorbells/doorbell4.jpg",
    accessories: [
      {
        id: 1,
        name: "Wall Mount Kit",
        price: "$9.99",
        image: "/images/mount.jpg"
      },
      {
        id: 2,
        name: "Solar Charger",
        price: "$39.99",
        image: "/images/solar.jpg"
      }
    ]
  },
  {
    id: 5,
    name: "Smart Doorbell Model 5",
    price: "$159.99",
    description: "Two-way audio, remote access, and cloud storage.",
    image: "/images/doorbells/doorbell5.jpg",
    accessories: [
      {
        id: 1,
        name: "Wall Mount Kit",
        price: "$9.99",
        image: "/images/mount.jpg"
      },
      {
        id: 2,
        name: "Solar Charger",
        price: "$39.99",
        image: "/images/solar.jpg"
      }
    ]
  }
];

export default function Doorbells() {
  return (
    <div className="bg-[#f5f5f5] min-h-screen overflow-x-hidden">
      {/* Header */}
      <header className="bg-[#550403] text-white p-4">
        <div className="container mx-auto flex justify-between items-center flex-wrap">
          <h1 className="text-3xl sm:text-4xl font-bold">Smart Homes</h1>
          <nav className="flex space-x-2 sm:space-x-4 items-center">
            <Link to="/" className="text-sm sm:text-base">
              Home
            </Link>
            <Link to="/about" className="text-sm sm:text-base">
              About
            </Link>
            <Link to="/contact" className="text-sm sm:text-base">
              Contact
            </Link>
            <Link to="/" className="text-sm sm:text-base">
              All Products
            </Link>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
              {/* Sign out button for signed-in users */}
            </SignedIn>

            <SignedOut>
              <Link
                to="/signin"
                className="bg-green-500 text-white px-3 py-2 rounded ml-2 text-sm sm:text-base"
              >
                Sign In
              </Link>
            </SignedOut>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-4 sm:py-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Smart Doorbells
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-8">
            Discover the range of smart doorbells that keep your home safe and
            secure.
          </p>
        </div>

        {/* Doorbell Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {doorbellProducts.map((product) => (
            <div
              key={product.id}
              className="p-4 bg-white shadow rounded flex flex-col justify-between"
            >
              <h3 className="text-lg sm:text-xl font-bold">{product.name}</h3>
              <Img
                src={product.image}
                alt={product.name}
                className="h-40 w-auto object-contain mx-auto mt-2"
              />
              <p className="mt-2 text-sm sm:text-base">{product.description}</p>
              <p className="text-lg font-bold mt-2">{product.price}</p>

              {/* Display Accessories */}
              {product.accessories && product.accessories.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-base sm:text-lg font-semibold mb-2">
                    Accessories:
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {product.accessories.map((accessory) => (
                      <div
                        key={accessory.id}
                        className="p-2 bg-gray-100 shadow rounded flex flex-col items-center w-1/4 sm:w-1/3 md:w-1/4"
                      >
                        <Img
                          src={accessory.image}
                          alt={accessory.name}
                          className="object-cover"
                          width={100}
                          height={100}
                        />
                        <p className="text-sm mt-2">{accessory.name}</p>
                        <p className="text-sm font-bold">{accessory.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="bg-blue-500 text-white px-4 py-2 mt-4 rounded">
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#550403] text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Smart Homes. All rights reserved.</p>
          <div className="mt-4">
            <Link to="/terms">Terms of Service</Link> |{" "}
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

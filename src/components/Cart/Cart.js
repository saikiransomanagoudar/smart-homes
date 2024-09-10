import React from 'react';
import { Link } from 'react-router-dom';

// Assuming cart is passed as props or retrieved from context
export default function Cart({ cart, handleIncreaseQuantity, handleDecreaseQuantity }) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Your Cart</h1>

      {totalItems === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cart.map((item) => (
            <div key={item.id} className="p-4 bg-white shadow rounded">
              {/* Assuming `item.image` is the image URL and it's used */}
              <img
                src={item.image}
                alt={item.name}
                className="h-40 w-auto object-contain mx-auto"
              />
              <h3 className="text-lg font-bold">{item.name}</h3>
              <p className="text-sm">{item.description}</p>
              <p className="text-lg font-bold">{item.price}</p>

              <div className="flex items-center justify-between mt-2">
                <button
                  className="text-gray-500 text-xl"
                  onClick={() => handleDecreaseQuantity(item)}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  className="text-gray-500 text-xl"
                  onClick={() => handleIncreaseQuantity(item)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link
          to="/checkout"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}

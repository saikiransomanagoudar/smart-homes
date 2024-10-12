import React, { useEffect, useState, useRef } from "react";

export default function ProductsUpdate() {
  const [products, setProducts] = useState([]);
  const [showInsertForm, setShowInsertForm] = useState(false);
  const formRef = useRef(null);

  // Fetch the products from the backend
  useEffect(() => {
    fetch("http://localhost:8080/smarthomes/products")
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  // Function to handle update quantity
  const handleUpdate = (productId) => {
    const updatedProduct = products.find((product) => product.id === productId);
    updatedProduct.quantity = 1;

    fetch(`http://localhost:8080/smarthomes/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProduct),
    })
    .then((response) => {
      if (response.ok) {
        alert("Product updated!");
        window.location.reload(); // Optionally refresh the page to show updated data
      } else {
        alert("Failed to update product.");
      }
    })
    .catch((error) => console.error("Error updating product:", error));
};

  // Function to handle delete
  const handleDelete = (productId) => {
    fetch(`http://localhost:8080/smarthomes/products/${productId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.status === 409) { // HTTP 409 Conflict
          return response.text().then((message) => {
            alert(`Warning: ${message}`); // Warning from the backend
          });
        } else if (response.status === 204) { // Success, product deleted
          setProducts(products.filter((product) => product.id !== productId));
          alert("Product deleted!");
        } else {
          alert("Error deleting product.");
        }
      })
      .catch((error) => console.error("Error deleting product:", error));
  };
  

  // Insert new product function
  const handleInsert = (event) => {
    event.preventDefault();
    const formData = new FormData(formRef.current);
    const newProduct = {
      name: formData.get("name"),
      price: formData.get("price"),
      description: formData.get("description"),
      image: formData.get("image"),
      category: formData.get("category"),
      quantity: formData.get("quantity"),
      onSale: formData.get("onSale") === "yes",
      hasRebate: formData.get("hasRebate") === "yes",
    };

    fetch("http://localhost:8080/smarthomes/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    })
      .then(() => {
        alert("Product inserted!");
        setShowInsertForm(false); // Close form
        window.location.reload(); // Refresh page to show new product
      })
      .catch((error) => console.error("Error inserting product:", error));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Manage Products</h1>

      <div className="flex justify-center">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden w-3/4">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Price</th>
              <th className="py-3 px-4 text-left">Description</th>
              <th className="py-3 px-4 text-left">Image</th>
              <th className="py-3 px-4 text-left">Category</th>
              <th className="py-3 px-4 text-left">Quantity</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={product.id}
                className={`${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-gray-100`}
              >
                <td className="py-3 px-4 border-b">{product.id}</td>
                <td className="py-3 px-4 border-b">{product.name}</td>
                <td className="py-3 px-4 border-b">${product.price.toFixed(2)}</td>
                <td className="py-3 px-4 border-b truncate">{product.description}</td>
                <td className="py-3 px-4 border-b">
                  <img src={product.image} alt={product.name} className="w-12 h-12 rounded" />
                </td>
                <td className="py-3 px-4 border-b">{product.category}</td>
                <td className="py-3 px-4 border-b">{product.quantity}</td>
                <td className="py-3 px-4 border-b space-x-2">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300"
                    onClick={() => handleUpdate(product.id)}
                  >
                    Update
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-700 transition duration-300"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-right mt-4">
        <button
          className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-700 transition duration-300"
          onClick={() => setShowInsertForm(true)}
        >
          Insert Product
        </button>
      </div>

      {showInsertForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Insert New Product</h2>
            <form ref={formRef} onSubmit={handleInsert} className="space-y-4">
              <div>
                <label>Product Name</label>
                <input name="name" type="text" className="border p-2 rounded w-full" required />
              </div>
              <div>
                <label>Product Price</label>
                <input name="price" type="number" className="border p-2 rounded w-full" required />
              </div>
              <div>
                <label>Product Description</label>
                <input
                  name="description"
                  type="text"
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label>Product Image</label>
                <input name="image" type="text" className="border p-2 rounded w-full" required />
              </div>
              <div>
                <label>Product Category</label>
                <input name="category" type="text" className="border p-2 rounded w-full" required />
              </div>
              <div>
                <label>Quantity</label>
                <input name="quantity" type="number" className="border p-2 rounded w-full" required />
              </div>
              <div>
                <label>On Sale</label>
                <select name="onSale" className="border p-2 rounded w-full" required>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label>Has Rebate</label>
                <select name="hasRebate" className="border p-2 rounded w-full" required>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="text-right">
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-2 rounded-full mr-2"
                  onClick={() => setShowInsertForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-full">
                  Insert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

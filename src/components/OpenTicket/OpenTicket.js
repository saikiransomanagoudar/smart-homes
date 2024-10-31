import React, { useState } from "react";
import { ExclamationCircleIcon, CheckCircleIcon } from "@heroicons/react/solid";

export default function OpenTicket() {
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState("success");

    const handleImageUpload = (event) => {
        setImage(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append("userId", localStorage.getItem("userId"));
        formData.append("description", description);
        formData.append("image", image);
    
        try {
            const response = await fetch("http://localhost:8080/smarthomes/open-ticket", {
                method: "POST",
                body: formData,
                mode: "cors",
                credentials: "include",
            });
    
            // Check if the response is OK (status 200-299)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            // Check if response is JSON
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const result = await response.json();
                setAlertType("success");
                setAlertMessage(`Ticket submitted successfully! Ticket Number: ${result.ticketNumber}`);
    
                // Store image and ticket details in local storage
                localStorage.setItem("ticketImage", URL.createObjectURL(image));
                localStorage.setItem("ticketNumber", result.ticketNumber);
            } else {
                throw new Error("Expected JSON response from server, but received a different format.");
            }
            
            // Clear the message after 20 seconds
            setTimeout(() => setAlertMessage(null), 20000);
        } catch (error) {
            console.error("Error submitting ticket:", error);
            setAlertType("error");
            setAlertMessage("Failed to submit ticket due to an error. Please try again later.");
            setTimeout(() => setAlertMessage(null), 20000);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Open a Support Ticket</h2>
                
                {alertMessage && (
                    <div className={`flex items-center p-4 mb-4 rounded-lg shadow-md ${alertType === "success" ? "bg-green-100 border border-green-400 text-green-700" : "bg-red-100 border border-red-400 text-red-700"}`}>
                        {alertType === "success" ? (
                            <CheckCircleIcon className="h-10 w-10 mr-2" />
                        ) : (
                            <ExclamationCircleIcon className="h-10 w-10 mr-2" />
                        )}
                        <span className="flex-grow">{alertMessage}</span>
                        <button onClick={() => setAlertMessage(null)} className="text-gray-500 hover:text-gray-700">
                            &times;
                        </button>
                    </div>
                )}

                <label className="block mb-4">
                    <span className="text-gray-700 font-medium">Describe the Issue</span>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring focus:ring-blue-200"
                        placeholder="Provide details of the issue here"
                    />
                </label>

                <label className="block mb-4">
                    <span className="text-gray-700 font-medium">Upload Image</span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        required
                        className="mt-2 p-2 border border-gray-300 rounded-lg w-full text-gray-700 bg-white focus:outline-none focus:ring focus:ring-blue-200"
                    />
                </label>

                <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
                >
                    Submit Ticket
                </button>
            </form>
        </div>
    );
}

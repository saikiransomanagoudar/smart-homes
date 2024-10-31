import React, { useState } from "react";

export default function CheckTicketStatus() {
    const [ticketNumber, setTicketNumber] = useState("");
    const [ticketData, setTicketData] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const handleCheckStatus = async () => {
        try {
            const response = await fetch(`http://localhost:8080/smarthomes/ticket-status?ticketNumber=${ticketNumber}`);
            const result = await response.json();

            if (result.status === "success") {
                setTicketData({
                    ticketNumber: ticketNumber,
                    decision: result.decision,
                    rationale: result.rationale,
                    imageDescription: result.image_description,
                    actionResult: result.action_result,
                    imagePath: `http://localhost:8080/${result.image_path}`, // Assuming image path is relative
                });
                setErrorMessage("");
            } else {
                setTicketData(null);
                setErrorMessage("Ticket not found");
            }
        } catch (error) {
            console.error("Error fetching ticket status:", error);
            setErrorMessage("Ticket not found");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Check Ticket Status</h2>

                <label className="block mb-4">
                    <span className="text-gray-700 font-medium">Enter Ticket Number:</span>
                    <input
                        type="text"
                        value={ticketNumber}
                        onChange={(e) => setTicketNumber(e.target.value)}
                        required
                        className="mt-2 p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring focus:ring-blue-200"
                        placeholder="Enter your ticket number"
                    />
                </label>

                <button
                    onClick={handleCheckStatus}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
                >
                    Check Status
                </button>

                {errorMessage && (
                    <div className="mt-4 p-3 text-center rounded-lg bg-red-100 text-red-700">
                        {errorMessage}
                    </div>
                )}

                {ticketData && (
                    <div className="mt-6 bg-blue-50 p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Ticket Details</h3>
                        <p className="text-gray-700 mb-2"><strong>Ticket Number:</strong> {ticketData.ticketNumber}</p>
                        
                        <div className="mb-4">
                            <strong>Submitted Image:</strong>
                            {ticketData.imagePath ? (
                                <img src={`http://localhost:8080/smarthomes/images/${ticketData.imagePath}`} alt="Submitted Image" className="mt-2 rounded-lg w-full h-40 object-cover" />
                            ) : (
                                <p className="text-gray-500">No image available</p>
                            )}
                        </div>
                        
                        <p className="text-gray-700 mb-2"><strong>Action:</strong> {ticketData.decision}</p>
                        <p className="text-gray-700 mb-2"><strong>Image Description:</strong> {ticketData.imageDescription}</p>
                        <p className="text-gray-700 mb-2"><strong>Rationale:</strong> {ticketData.rationale}</p>
                        <p className="text-gray-700"><strong>Action Result:</strong> {ticketData.actionResult}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

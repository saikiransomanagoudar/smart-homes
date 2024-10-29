import React, { useState } from "react";

export default function CheckTicketStatus() {
    const [ticketNumber, setTicketNumber] = useState("");
    const [status, setStatus] = useState("");
    const [ticketFound, setTicketFound] = useState(true);

    const handleCheckStatus = async () => {
        try {
            const response = await fetch(`http://localhost:8080/smarthomes/ticket-status?ticketNumber=${ticketNumber}`);
            const result = await response.json();

            if (result.decision) {
                setStatus(result.decision);
                setTicketFound(true);
            } else {
                setStatus("Ticket not found");
                setTicketFound(false);
            }
        } catch (error) {
            console.error("Error fetching ticket status:", error);
            setStatus("Ticket not found");
            setTicketFound(false);
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

                {status && (
                    <div className="mt-4 p-3 text-center rounded-lg bg-blue-100 text-blue-700">
                        {ticketFound ? (
                            <span>
                                Decision: <strong>{status}</strong>
                            </span>
                        ) : (
                            status
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

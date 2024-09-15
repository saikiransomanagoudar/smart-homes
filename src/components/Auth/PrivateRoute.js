import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state while checking the session

  useEffect(() => {
    // Fetch current session or token to check if the user is logged in
    fetch("http://localhost:8080/smarthomes/session", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setIsLoggedIn(data.loggedIn); // Adjust based on your backend response
        setLoading(false);
      })
      .catch(() => {
        setIsLoggedIn(false);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while the session is being checked
  }

  // If logged in, render the children (the protected component)
  // Otherwise, redirect to the login page
  return isLoggedIn ? children : <Navigate to="/signin" />;
}

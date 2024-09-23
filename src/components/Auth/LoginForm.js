import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState("Customer"); // Track login type (Customer or Salesman)
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loginHandler = async () => {
    setError("");
    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    // If Salesman is selected, navigate to the signup page
    if (loginType === "Salesman") {
      navigate("/signup");
      return;
    }

    // Create form data to send to backend (for Customer login)
    const formData = new URLSearchParams();
    formData.append("email", email);
    formData.append("password", password);

    try {
      // Send POST request to the Java servlet backend
      const response = await fetch("http://localhost:8080/smarthomes/signin", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (response.ok) {
        const data = await response.json(); // Parse the response as JSON
        console.log(data);

        // Store userId and email in localStorage after successful login
        localStorage.setItem("userId", data.userId); 
        localStorage.setItem("email", data.email);
        localStorage.setItem("isLoggedIn", "true"); 

        // Redirect to home or dashboard
        navigate("/");
      } else {
        const data = await response.json(); // Parse error message
        setError(data.error || "Login failed.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("Login failed. Please try again.");
    }
  };

  return (
    <main className="flex lg:h-[100vh]">
      <div className="w-full lg:w-[60%] p-8 md:p-14 flex flex-col items-center justify-center lg:justify-start">
        <h1 className="text-3xl font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg shadow-md mb-6">
          Smart Homes
        </h1>
        <div className="p-8 w-full flex flex-col items-center">
          <h2 className="text-6xl font-semibold">Login</h2>
          <p className="mt-6">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="underline hover:text-blue-400 cursor-pointer">
              Sign Up
            </a>
          </p>
          {error && <div className="text-red-500">{error}</div>}
          
          {/* Add Dropdown Menu for selecting login type */}
          <div className="mt-6 w-full">
            <label>Select Role</label>
            <select
              value={loginType}
              onChange={(e) => setLoginType(e.target.value)}
              className="font-medium border-b border-black p-4 outline-0 focus-within:border-blue-400 w-full"
            >
              <option value="Customer">Customer Login</option>
              <option value="Salesman">Salesman Login</option>
            </select>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="w-full flex flex-col items-center"
          >
            <div className="mt-10 w-full">
              <label>Email</label>
              <input
                type="email"
                className="font-medium border-b border-black p-4 outline-0 focus-within:border-blue-400 w-full"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mt-10 w-full">
              <label>Password</label>
              <input
                type="password"
                className="font-medium border-b border-black p-4 outline-0 focus-within:border-blue-400 w-full"
                required
                autoComplete="on"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              onClick={loginHandler}
              className="bg-black text-white w-44 py-4 mt-10 rounded-full transition-transform hover:bg-black/[0.8] active:scale-90"
            >
              Login
            </button>
          </form>
        </div>
      </div>
      <div
        className="w-[100%] bg-slate-400 bg-cover bg-right-top hidden lg:block"
        style={{ backgroundImage: "url('/image.jpg')" }}
      ></div>
    </main>
  );
};

export default LoginForm;

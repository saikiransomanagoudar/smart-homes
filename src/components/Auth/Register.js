import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const signUpHandler = async () => {
    setError("");

    // Validate input
    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    // Create form data to send to backend
    const formData = new URLSearchParams();
    formData.append("username", name);
    formData.append("email", email);
    formData.append("password", password);

    try {
      // Send POST request to the Java servlet backend
      const response = await fetch("http://localhost:8080/smarthomes/signup", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      console.log(response);
      if (response.ok) {
        // Registration successful, redirect to login or homepage
        navigate("/signin");
      } else if (response.status === 409) {
        // Handle 409 Conflict (duplicate username or email)
        const data = await response.text();
        setError(data.message || "Username or Email already exists.");
      } else {
        const data = await response.text();
        setError(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <main className="flex lg:h-[100vh]">
      <div className="w-full lg:w-[60%] p-8 md:p-14 flex flex-col items-center justify-center lg:justify-start">
        <h1 className="text-3xl font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg shadow-md mb-6">
          Smart Homes
        </h1>
        <div className="w-full flex flex-col items-center">
          <h2 className="text-6xl font-semibold">Sign Up</h2>
          <p className="mt-6">
            Already have an account?{" "}
            <a
              href="/signin"
              className="underline hover:text-blue-400 cursor-pointer"
            >
              Login
            </a>
          </p>
          {error && <div className="text-red-500">{error}</div>}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="w-full flex flex-col items-center"
          >
            <div className="mt-10 w-full">
              <label>Name</label>
              <input
                type="text"
                className="font-medium border-b border-black p-4 outline-0 focus-within:border-blue-400 w-full"
                required
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
              onClick={signUpHandler}
              className="bg-black text-white w-44 py-4 mt-10 rounded-full transition-transform hover:bg-black/[0.8] active:scale-90"
            >
              Sign Up
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

export default RegisterForm;

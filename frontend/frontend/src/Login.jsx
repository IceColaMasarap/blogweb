import TS from "./assets/tsaaritsa.png";
import "./Login.css"; // Importing the CSS file
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Use axios for making HTTP requests

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message

    if (!email || !password) {
      setError("Please fill in both fields");
      return;
    }

    try {
      // Send a POST request to the login endpoint
      const response = await axios.post("http://localhost:5005/api/login", {
        email,
        password,
      });

      const data = response.data;

      console.log("Logged in user data:", data); // Log user data here

      // Check if login is successful
      if (data.error) {
        setError("Invalid credentials, please try again.");
      } else {
        // Save only the necessary user details to localStorage
        localStorage.setItem("userId", data.user.id); // Save user ID
        if (data.user.isModerator !== undefined) {
          localStorage.setItem("isModerator", data.user.isModerator.toString());
        }

        // Check if isModerator is "Admin", count it as wrong regardless of the credentials
        if (data.user.isModerator === "Admin") {
          setError("An error occurred during login.");
        } else {
          // Redirect based on user role
          if (data.user.email === "admin@gmail.com") {
            navigate("/adminpage/"); // Redirect to admin page
          } else {
            navigate("/home"); // Redirect to homepage for regular users
          }
        }
      }
    } catch (err) {
      setError("An error occurred during login");
      console.log("Error logging in:", err);
    }
  };

  return (
    <div className="container">
      {/* Left Section */}
      <div className="left-sectionl">
        <div className="logo-container">
          <div className="logo">
            <img
              src={TS} // Placeholder for the tea cup logo
              alt="Tsaaritsa"
              className="logo-image"
            />
          </div>
          <h1 className="brand-titler">Tsaaritsa.</h1>
        </div>
      </div>

      {/* Right Section */}
      <div className="right-sectionl">
        <h1 className="main-headingr">Everyone’s cup</h1>
        <h1 className="main-headingr">of tea 🍃</h1>
        <p className="sub-headingr">Welcome back!</p>
        <form className="form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            required
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="buttonr">
            Login
          </button>
          {error && (
            <p className="errormsg" style={{ color: "red" }}>
              {error}
            </p>
          )}{" "}
          <div className="linkers">
            <label className="linklabel1">No account yet? </label>
            <label
              className="linklabel2"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              Signup here.
            </label>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;

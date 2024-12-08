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

      // Check if login is successful
      if (data.error) {
        setError("Invalid credentials, please try again.");
      } else {
        // Redirect based on user role
        if (data.email === "admin@gmail.com") {
          navigate("/adminpage/"); // Redirect to admin page
        } else {
          navigate("/home"); // Redirect to homepage for regular users
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
      <div className="left-section">
        <div className="logo-container">
          <div className="logo">
            <img
              src={TS} // Placeholder for the tea cup logo
              alt="Tsaaritsa"
              className="logo-image"
            />
          </div>
          <h1 className="brand-title">Tsaaritsa.</h1>
        </div>
      </div>

      {/* Right Section */}
      <div className="right-section">
        <h1 className="main-heading">Everyone’s cup of tea</h1>
        <p className="sub-heading">Welcome back!</p>
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
          <button type="submit" className="lbutton">
            Login
          </button>
          <p className="register-link">
            No account?&nbsp;
            <span
              className="registerlabelnav"
              id="tologin"
              style={{ cursor: "pointer", color: "blue" }}
              onClick={() => {
                navigate("/");
              }}
            >
              Register
            </span>
          </p>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error */}
      </div>
    </div>
  );
}

export default Login;

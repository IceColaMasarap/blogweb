import TS from "./assets/tsaaritsa.png";
import "./Login.css"; // Importing the CSS file
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Use axios for making HTTP requests

function AdminLogin() {
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
      const response = await axios.post(
        "http://localhost:5005/api/adminlogin",
        {
          email,
          password,
        }
      );

      const data = response.data;

      console.log("Logged in user data:", data); // Log user data here

      // Check if login is successful
      if (data.error) {
        setError("Invalid credentials, please try again.");
      } else {
        localStorage.setItem("userId", data.id); // Save the user ID

        // Log the user info on successful login
        console.log("User Info:", {
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          dateofbirth: data.dateofbirth,
          isModerator: data.isModerator,
        });
        localStorage.setItem("isModerator", data.isModerator.toString()); // Save as string

        navigate("/adminpage/"); // Redirect to admin page
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
      <div className="right-sectionl0">
        <h1 className="main-headingr">Admin Login</h1>
        <p className="sub-headingr">Welcome back, Admin!</p>
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
        </form>
        <div className="linkerss">
          <label className="linklabel1">Not an admin? </label>
          <label
            className="linklabel2"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            Sign in here.
          </label>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;

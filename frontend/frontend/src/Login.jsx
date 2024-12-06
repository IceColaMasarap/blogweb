import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Use axios for making HTTP requests
import "./App.css"; // Make sure the styles are applied

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
        if (data.isModerator) {
          navigate("/adminpage/"); // Redirect to admin page
        } else {
          navigate("/phhomepage"); // Redirect to homepage for regular users
        }
      }

    } catch (err) {
      setError("An error occurred during login");
      console.log("Error logging in:", err);
    }
  };

  return (
    <div className="loginpage">
      <form className="loginForm" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="e.g. johndoe@gmail.com"
          required
          className="formInput"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="e.g. johndoe123"
          required
          className="formInput"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="formButton">
          Login
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error */}
      <label className="registerlabel">No account yet? </label>
      <label
        className="registerlabelnav"
        id="tologin"
        onClick={() => {
          navigate("/"); // Navigate to register route
        }}
      >
        Sign up here
      </label>
    </div>
  );
}

export default Login;

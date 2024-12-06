import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import axios from "axios"; // Use axios for making HTTP requests

function PhHomepage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
      console.log("User data from backend:", data);

      // Store user data in sessionStorage (excluding sensitive info like password)
      sessionStorage.setItem("user", JSON.stringify(data));

      // Redirect based on user role
      if (data.is_admin) {
        navigate("/adminpage");
      } else {
        navigate("/homepage");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error);
      } else {
        setError("An error occurred during login");
      }
      console.log("Error logging in:", err);
    }
  };



  return (
    <div className="loginpage">
      return <div>Welcome to PH Homepage!</div>;
    </div>
  );
}

export default PhHomepage;

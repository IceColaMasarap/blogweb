import { useNavigate } from "react-router-dom";
import "./App.css";
import axios from "axios";
import React, { useState } from "react";

function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateofbirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage('');
    if (
      !firstName ||
      !lastName ||
      !dateofbirth ||
      !email ||
      !password ||
      !confirmPassword
) {
      setError("Please fill in all fields");
      return;
    }


    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5005/api/register",{
        firstName,
        lastName,
        email,
        dateofbirth,
        password,
        
      });
      setSuccessMessage(response.data.message);
      setTimeout(()=> navigate("/login", 2000));

    }
    catch(err){
      setError(
        err.response ? err.response.data.message  : "Error occured during registration"
      );
      console.log(err);
    }

  };


  const navigate = useNavigate();
  return (
    <div className="loginpage">
      <form className="loginForm" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="First Name"
          required
          className="formInput"
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          required
          className="formInput"
          onChange={(e) => setLastName(e.target.value)}
        />
        <input type="date" required className="formInput" 
        onChange={(e) => setDateOfBirth(e.target.value)}
        />
        <input
          type="email"
          placeholder="e.g. johndoe@gmail.com"
          required
          className="formInput"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          className="formInput"
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          required
          className="formInput"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit" className="formButton">
          Login
        </button>
        <br />
        {error && <p style={{ color: "red" }}>{error}</p>}
        {successMessage && <p style={{ color: "#15bc11" }}>{successMessage}</p>}

      </form>
      <label className="registerlabel">Already have an account? </label>
      <label
        className="registerlabelnav"
        id="tologin"
        onClick={() => {
          navigate("/login");
        }}
      >
        Log in here
      </label>
    </div>
  );
}
export default Signup;

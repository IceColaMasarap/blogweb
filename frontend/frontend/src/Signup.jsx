import { useNavigate } from "react-router-dom";
import "./Signup.css";
import TS from './assets/tsaaritsa.png';
import axios from "axios";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar
} from "@fortawesome/free-solid-svg-icons";
import bcrypt from 'bcryptjs';  // Import bcryptjs

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

    const hashedEmail = bcrypt.hashSync(email, 10);

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
    <div className="containerr">
      {/* Left Section */}
      <div className="left-sectionr">
        <div className="logo-containerr">
        <div className="logor">
          <img
            src={TS} // Placeholder for the tea cup logo
            alt="Tsaaritsa"
            className="logo-imager"
          />
        </div>
        <h1 className="brand-titler">Tsaaritsa.</h1>
      </div>
      </div>

      {/* Right Section */}
      <div className="right-sectionr">
        <h1 className="main-headingr">Everyone’s cup of tea </h1>
        
        <p className="sub-headingr">Join Today.</p>
        <form className="formr" onSubmit={handleSubmit}>
          <div className="form-rowr">
            <input type="text" placeholder="First Name" className="input" onChange={(e) => setFirstName(e.target.value)}/>
            <input type="text" placeholder="Last Name" className="input" onChange={(e) => setLastName(e.target.value)}/>
            <input type="date" className="input" onChange={(e) => setDateOfBirth(e.target.value)}/>
          </div>
          <input type="email" placeholder="Email" className="input" onChange={(e) => setEmail(e.target.value)}/>
          <div className="form-rowr">
            <input type="password" placeholder="Password" className="input" onChange={(e) => setPassword(e.target.value)}/>
            <input type="password" placeholder="Confirm Password" className="input" onChange={(e) => setConfirmPassword(e.target.value)}/>
          </div>
          <button type="submit" className="buttonr">
            Register
          </button>
          
        {error && <p style={{ color: "red" }}>{error}</p>}
        {successMessage && <p style={{ color: "#15bc11" }}>{successMessage}</p>}
        <p className="login-linkr">
          Already have an account?&nbsp;
          <span
            className="registerlabelnav"
            id="tologin"
            onClick={() => navigate("/login")}
            style={{ cursor: "pointer", color: "blue" }}
          >
            Log in here
          </span>
        </p>
        </form>
      </div>
    </div>
  );
}
export default Signup;

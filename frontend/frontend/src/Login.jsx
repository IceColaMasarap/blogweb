import React from "react";
import TS from './assets/tsaaritsa.png';
import "./Login.css"; // Importing the CSS file

function Login() {
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
        <form className="form">
          <input type="email" placeholder="Email" className="input" />
          <input type="password" placeholder="Password" className="input" />
          <button type="submit" className="lbutton">
            Login
          </button>
          <p className="register-link">
            No account? <a href="#">Register</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;

import React from "react";
import { useNavigate } from "react-router-dom"; // Import React Router's useNavigate
import TS from './assets/tsaaritsa.png';
import LO from './assets/LogOut.png';
import "./NavigationBar.css"; // Import the CSS for styling

const NavigationBar = () => {
  const navigate = useNavigate(); // Hook for navigation

  const handleLogout = () => {
    // Clear session data (e.g., remove token from localStorage)
    localStorage.removeItem("authToken"); // Replace with your actual key if needed
    // Redirect to login page
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="tsaaritsa">
          <img src={TS} alt="Tsaaritsa Logo" className="logo" /> Tsaaritsa
        </div>
        <input type="text" placeholder="Search..." className="nav-link-search-input" />
        <img 
          src={LO} 
          alt="Log Out" 
          className="logout-btn" 
          onClick={handleLogout} 
        />
      </div>
    </nav>
  );
};

export default NavigationBar;

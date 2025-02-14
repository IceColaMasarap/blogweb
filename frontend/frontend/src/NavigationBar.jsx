import React from "react";
import { useNavigate } from "react-router-dom"; // Import React Router's useNavigate
import TS from "./assets/logo.png";
import LO from "./assets/LogOut.png";
import "./NavigationBar.css"; // Import the CSS for styling

const NavigationBar = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  // Define the logout function
  const logout = () => {
    console.log("Logging out...");
  
    // Remove all user-related data from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("isModerator");
  
    // Navigate to the login page
    navigate("/login");
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="tsaaritsa">
          <img src={TS} alt="Tsaaritsa Logo" className="logo" /> Tsaaritsa.
        </div>
        <input
          type="text"
          placeholder="Search..."
          className="nav-link-search-input"
        />
        <img src={LO} alt="Log Out" className="logout-btn" onClick={logout} />
      </div>
    </nav>
  );
};

export default NavigationBar;

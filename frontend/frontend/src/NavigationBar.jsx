import React from "react";
import { useNavigate } from "react-router-dom"; // Import React Router's useNavigate
import TS from "./assets/tsaaritsa.png";
import LO from "./assets/LogOut.png";
import "./NavigationBar.css"; // Import the CSS for styling

const NavigationBar = () => {
  const navigate = useNavigate(); // Hook for navigation

  async function logout() {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include", // Send cookies with the logout request
      });
      const data = await response.json();

      if (response.ok) {
        console.log(data.message);
        navigate("/login"); // Redirect only if logout succeeds
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="tsaaritsa">
          <img src={TS} alt="Tsaaritsa Logo" className="logo" /> Tsaaritsa
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

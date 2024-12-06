// NavigationBar.jsx
import React from "react";
import TS from './assets/tsaaritsa.png';
import "./NavigationBar.css"; // Import the CSS for styling

const NavigationBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="tsaaritsa">
        <img src={TS} alt="Tsaaritsa Logo" className="logo" /> Tsaaritsa
        </div>
        <input type="text" placeholder="Search..." className="nav-link-search-input" />
        <a href="#" className="nav-link">Menu</a>
        
      </div>
    </nav>
  );
};

export default NavigationBar;
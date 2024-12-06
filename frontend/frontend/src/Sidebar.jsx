import { useState } from "react";
import { useNavigate } from "react-router-dom";
import img from "../src/assets/logo.png";
import img1 from "../src/assets/logobg.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faAddressCard,
  faComment,
} from "@fortawesome/free-solid-svg-icons";

import "./App.css";

function Sidebar() {
  const [activeButton, setActiveButton] = useState(null);
  const navigate = useNavigate();

  const handleClick = (buttonName) => {
    setActiveButton(buttonName); // Set active button by name
  };

  return (
    <div className="maincontent">
      <div className="sidebarbg">
        <div className="sidebartop">
          <img src={img1} alt="background1" className="background1" />
          <img src={img} alt="logo" className="logo1" />
          <label className="label1">Tsaaritsa</label>
        </div>
        <div className="sidebarmiddle">
          <div className="menu-items">
            <button
              className={`button ${
                activeButton === "dashboard" ? "active" : ""
              }`}
              onClick={() => {
                handleClick("dashboard");
                navigate("/adminpage/");
              }}
            >
              <FontAwesomeIcon icon={faHome} />
              Dashboard
            </button>
            <button
              className={`button ${activeButton === "posts" ? "active" : ""}`}
              onClick={() => {
                handleClick("posts");
                navigate("/adminpage/posts");
              }}
            >
              <FontAwesomeIcon icon={faAddressCard} />
              Posts
            </button>
            <button
              className={`button ${
                activeButton === "accounts" ? "active" : ""
              }`}
              onClick={() => {
                handleClick("accounts");
                navigate("/adminpage/accounts");
              }}
            >
              <FontAwesomeIcon icon={faComment} />
              Accounts
            </button>
          </div>
          <div className="logout-container">
            <button
              className="logoutbtn"
              onClick={() => {
                navigate("/");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import img from "../src/assets/logo.png";
import img1 from "../src/assets/logobg.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faAddressCard,
  faComment,
  faUserTie,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";

import "./App.css";

function Sidebar() {
  const [activeButton, setActiveButton] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set active button based on the current path
    const currentPath = location.pathname;
    if (currentPath.includes("/adminpage/posts")) {
      setActiveButton("posts");
    } else if (currentPath.includes("/adminpage/accounts")) {
      setActiveButton("accounts");
    } else if (currentPath === "/adminpage/adminaccounts") {
      setActiveButton("adminaccount");
    } else if (currentPath === "/adminpage/adminlogs") {
      setActiveButton("adminlogs");
    } else if (currentPath === "/adminpage/") {
      setActiveButton("dashboard");
    }
  }, [location]);

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
              className={`button ${activeButton === "dashboard" ? "active" : ""
                }`}
              onClick={() => navigate("/adminpage/")}
            >
              <FontAwesomeIcon icon={faHome} />
              Dashboard
            </button>
            <button
              className={`button ${activeButton === "posts" ? "active" : ""}`}
              onClick={() => navigate("/adminpage/posts")}
            >
              <FontAwesomeIcon icon={faAddressCard} />
              Posts
            </button>
            <button
              className={`button ${activeButton === "accounts" ? "active" : ""
                }`}
              onClick={() => navigate("/adminpage/accounts")}
            >
              <FontAwesomeIcon icon={faComment} />
              Accounts
            </button>
            <button
              className={`button ${activeButton === "adminaccount" ? "active" : ""
                }`}
              onClick={() => navigate("/adminpage/adminaccounts")}
            >
              <FontAwesomeIcon icon={faUserTie} />
              Admin Accounts
            </button>

            <button
              className={`button ${activeButton === "adminlogs" ? "active" : ""}`}
              onClick={() => navigate("/adminpage/adminlogs")}
            >
              <FontAwesomeIcon icon={faClipboardList} />
              Admin Logs
            </button>


          </div>



          <div className="logout-container">
            <button
              className="logoutbtn"
              onClick={() => {
                navigate("/adminlogin");
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

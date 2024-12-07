import React from "react";
import HM from './assets/Home.png';
import PS from './assets/PostSettings.png';
import IP from './assets/Photos.png';
import LK from './assets/Like.png';
import DP from './assets/DP.jpg';
import GI from './assets/GI.jpg';
import CS from './assets/CLASS SCHEDULE BSIT PHONE 1.png';
import POSTSAMPLE from './assets/GENSHIN 4TH ANNIVERSARY.jpg';
import NavigationBar from "./Navigationbar.jsx";
import "./NavigationBar.css";
import { useNavigate } from "react-router-dom";
// Adjust the path as needed
import "./Homepage.css"; // Add styles for the sections if needed

const Homepage = () => {

  const trends = [
    { category: "Politics", topic: "Impeachment Talks", description: "Discussions intensify over VP Duterte's impeachment." },
    { category: "Territorial Disputes", topic: "West Philippine Sea", description: "Tensions rise amid China’s continued aggression." },
    { category: "Food", topic: "Adobo Reinventions", description: "Filipino cuisine gains global recognition with adobo twists." },
    { category: "Tourism", topic: "Philippine Airlines", description: "Boosting connectivity through new international partnerships." },
    { category: "Holidays", topic: "Christmas in Metro Manila", description: "Security tightened with 8,000 police deployed." },
    { category: "Environment", topic: "Carbon-Neutral Shipping", description: "Sails return as shipping embraces eco-friendly solutions." },
    { category: "Road Safety", topic: "Metro Manila Accidents", description: "Spike in road mishaps prompts calls for reforms." },
    { category: "Tech", topic: "AI in Hospitality", description: "Advanced tech reshapes tourism and service industries." },
  ];

  return (
    <div>
      {/* Add the Navigation Bar */}
      <NavigationBar />

      <div className="HomePage">
        {/* Left Sidebar */}
        <div className="left-sidebar">
          <div className="sidebar-menu">
            <div className="profile-image">
              <button className="menu-button">
                <img src={DP} alt="Profile" />
                <span>Profile</span>
              </button>
            </div>

            <button className="menu-button2">
              <img src={HM} alt="Profile" />
              <span>Home</span>
            </button>

            <div className="footnotes">
              <p><sup></sup>Privacy  · Terms  · Advertising  · Ad Choices   · Cookies</p>
              <p><sup></sup> Tsaaritsa © 2024</p>
            </div>

          </div>
        </div>

        {/* Main Content */}
        <main className="content">
          {/* Post Input */}
          <div className="post">
            <div className="post-input">
              <div className="profile-image">
                <img src={DP} alt="Profile" />
                <input
                  type="text"
                  className="input-box"
                  placeholder="What is happening?!"
                />
              </div>
            </div>
            <div className="post-btn">
              <div className="pv">
                <button className="pv-btn">
                  <img src={IP} alt="Profile" />
                </button>
              </div>
              <div className="p-btn">
                <button>Post</button>
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="post">
            <div className="post-header">
              <div className="profile-image">
                <img src={GI} alt="Profile" />
                <span className="post-user">Genshin Impact</span>
                <span className="post-time">1h</span>
              </div>
              <button className="post-settings">
                <img src={PS} alt="Profile" />
              </button>
            </div>
            <div className="post-body">Genhsin 4th Anniversary!</div>
            <div className="post-image">
              <img src={POSTSAMPLE} alt="NU Pep Squad" />
            </div>
            <button className="lk-btn">
              <img src={LK} alt="Like" />
            </button>
          </div>

          <div className="post">
            <div className="post-header">
              <div className="profile-image">
                <img src={GI} alt="Profile" />
                <span className="post-user">Genshin Impact</span>
                <span className="post-time">1h</span>
              </div>
              <div className="post-settings">
                <img src={PS} alt="Profile" />
              </div>
            </div>
            <div className="post-body">Genhsin 4th Anniversary!</div>
            <div className="post-image">
              <img src={CS} alt="NU Pep Squad" />
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <div className="right-sidebar">
          <div className="trends-container">
            <h2 className="trends-title">What’s happening</h2>
            <ul className="trends-list">
              {trends.map((trend, index) => (
                <li key={index} className="trend-item">
                  <p className="trend-category">{trend.category} · Trending</p>
                  <p className="trend-topic">{trend.topic}</p>
                  <p className="trend-description">{trend.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Homepage;

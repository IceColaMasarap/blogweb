import React, { useState, useEffect } from "react";
import axios from "axios";
import "./profile.css";
import HM from "./assets/Home.png";
import PS from "./assets/PostSettings.png";
import IP from "./assets/Photos.png";
import LK from "./assets/Like.png";
import DP from "./assets/DP.jpg";
import GI from "./assets/Iicon.png";
import CS from "./assets/CLASS SCHEDULE BSIT PHONE 1.png";
import POSTSAMPLE from "./assets/GENSHIN 4TH ANNIVERSARY.jpg";
import NavigationBar from "./Navigationbar.jsx";
import "./NavigationBar.css";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

function ProfilePage() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    dateofbirth: "",
    email: "",
    password: "",
    confirmpassword: "",
  });
  const [originalData, setOriginalData] = useState({});

useEffect(() => {
  const userId = localStorage.getItem("userId");
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`http://localhost:5005/api/user/${userId}`);
      const userData = response.data;
  
      // Format dateofbirth to YYYY-MM-DD
      const formattedDate = userData.dateofbirth
      ? new Date(new Date(userData.dateofbirth).getTime() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
      : "";
    
  
      setOriginalData(userData); // Save the original data
      setFormData({
        firstname: userData.firstname || "",
        lastname: userData.lastname || "",
        dateofbirth: formattedDate, // Set formatted date
        email: userData.email || "",
        password: "",
        confirmpassword: "",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  

  if (userId) {
    fetchUserData();
  }
}, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const changes = [];
    const updates = {};
  
    // Check for changes in the input fields
    if (formData.firstname !== originalData.firstname) {
      changes.push("First Name");
      updates.firstname = formData.firstname;
    }
    if (formData.lastname !== originalData.lastname) {
      changes.push("Last Name");
      updates.lastname = formData.lastname;
    }
    if (formData.dateofbirth !== originalData.dateofbirth) {
      changes.push("Date of Birth");
      updates.dateofbirth = formData.dateofbirth;
    }
    if (formData.email !== originalData.email) {
      changes.push("Email");
      updates.email = formData.email;
    }
  
    // Handle password changes
    if (formData.password || formData.confirmpassword) {
      if (formData.password !== formData.confirmpassword) {
        alert("Passwords do not match!");
        return;
      }
      changes.push("Password");
      updates.password = formData.password;
    }
  
    // If no changes, alert the user
    if (changes.length === 0) {
      alert("No changes were made.");
      return;
    }
  
    // Send the update request
    const userId = localStorage.getItem("userId");
    try {
      const response = await axios.put(`http://localhost:5005/api/user/${userId}`, updates);
      if (response.status === 200) {
        alert(`The following fields were updated: ${changes.join(", ")}`);
        setOriginalData({ ...originalData, ...updates }); // Update the original data
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      alert("Failed to update user data. Please try again.");
    }
  };
  return (
    <div className="maincontentpost">
    {/* Add the Navigation Bar */}
    <NavigationBar />

    <div className="HomePage">
      {/* Left Sidebar */}
      <div className="left-sidebar">
        <div className="sidebar-menu">
          <div className="profile-image">
            <button className="menu-button">
              <img src={GI} alt="Profile" />
              <span>Profile</span>
            </button>
          </div>

          <button className="menu-button2">
            <img src={HM} alt="Profile" />
            <span>Home</span>
          </button>

          <div className="footnotes">
            <p>
              <sup></sup>Privacy · Terms · Advertising · Ad Choices · Cookies
            </p>
            <p>
              <sup></sup> Tsaaritsa © 2024
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="content">
        {/* Profile Section */}
      <div className="profile-header">
         
        <div className="profile-details">
          <img
            className="profile-picture"
            src={GI}
            alt="Profile"
          />
          <div className="profile-info">
            <h2 className="profile-name">Emergency Food </h2>
            
          </div>
          
        </div>
        

        <div className="bottomBorder">
        <p className="profile-name">Post</p>
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
<div className="edit-container">
  <h2 className="about-title">Edit Profile</h2>
  <form className="edit-form">
    {/* First Name */}
    <div className="eform-group">
      <label className="elabel" htmlFor="firstname">First Name</label>
      <input className="edittxt" type="text"
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
          placeholder="Enter First Name" />
    </div>

    {/* Last Name */}
    <div className="eform-group">
      <label className="elabel" htmlFor="lastname">Last Name</label>
      <input className="edittxt" type="text"
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
          placeholder="Enter Last Name" />
    </div>

    {/* Date of Birth */}
    <div className="eform-group">
      <label className="elabel" htmlFor="dob">Date of Birth</label>
      <input className="edittxt" type="date"
          name="dateofbirth"
          value={formData.dateofbirth}
          onChange={handleChange} />
    </div>

    {/* Email */}
    <div className="eform-group">
      <label className="elabel" htmlFor="email">Email</label>
      <input className="edittxt" type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter Email" />
    </div>

    {/* Password */}
    <div className="eform-group">
      <label className="elabel" htmlFor="password">Password</label>
      <input className="edittxt" type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter Password"
           autoComplete="new-password" />
    </div>

    {/* Confirm Password */}
    <div className="eform-group">
      <label className="elabel" htmlFor="confirm-password">Confirm Password</label>
      <input className="edittxt" type="password"
          name="confirmpassword"
          value={formData.confirmpassword}
          onChange={handleChange}
          placeholder="Confirm Password" />
    </div>
    <button type="submit" className="update-button">Update</button>
    
  </form>
</div>
</div>


    </div>
  </div>
);
};

export default ProfilePage;

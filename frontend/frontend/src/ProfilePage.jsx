import React, { useState, useEffect } from "react";
import axios from "axios";
import "./profile.css";

function ProfilePage() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    dateofbirth: "",
    email: "",
    password: "",
    confirmpassword: "",
  });

  useEffect(() => {
    // Retrieve the user ID from localStorage
    const userId = localStorage.getItem("userId");

    // Fetch the user data from the server
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:5005/api/user/${userId}`);
        const userData = response.data;

        // Update formData with the retrieved user data
        setFormData({
          ...formData,
          firstname: userData.firstname || "",
          lastname: userData.lastname || "",
          dateofbirth: userData.dateofbirth || "",
          email: userData.email || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    // You can add your submit logic here
  };

  return (
    <div id="profile-page">
      <h2>Profile Page Draft</h2>
      <form onSubmit={handleSubmit}>
        <label>
          First Name:
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            placeholder="Enter First Name"
          />
        </label>
        <br />
        <label>
          Last Name:
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            placeholder="Enter Last Name"
          />
        </label>
        <br />
        <label>
          Date of Birth:
          <input
            type="date"
            name="dateofbirth"
            value={formData.dateofbirth}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Email"
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter Password"
          />
        </label>
        <br />
        <label>
          Confirm Password:
          <input
            type="password"
            name="confirmpassword"
            value={formData.confirmpassword}
            onChange={handleChange}
            placeholder="Confirm Password"
          />
        </label>
        <br />
        <button type="submit">Update</button>
      </form>
    </div>
  );
}

export default ProfilePage;

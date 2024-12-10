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
             autoComplete="new-password"
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

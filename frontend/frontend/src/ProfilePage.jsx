import React, { useState, useEffect } from "react";
import axios from "axios";
import "./profile.css";
import HM from "./assets/Home.png";
import PS from "./assets/PostSettings.png";
import IP from "./assets/Photos.png";
import LK from "./assets/Like.png";
import DP from "./assets/DP.jpg";
import GI from "./assets/Iicon.png";
import EI from "./assets/Edit.png";
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
    created_at: "",
  });
  const [originalData, setOriginalData] = useState({});
  const [posts, setPosts] = useState([]); // State to store all posts
  const [postContent, setPostContent] = useState(""); // State for post content
  const [isPosting, setIsPosting] = useState(false); // State for button loading
  const [isToggled, setIsToggled] = useState(false); // State to track button toggle
  const [postContentTitle, setPostContentTitle] = useState("");
  const [likedPosts, setLikedPosts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5005/api/showposts") // Fetch all posts
      .then((response) => {
        const sortedPosts = response.data.sort(
          (a, b) => new Date(b.postdate) - new Date(a.postdate)
        );
        setPosts(sortedPosts);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
      });
  }, []);
  const autoResize = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto"; // Resetting the height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set the height dynamically
  };

  const handleToggle = async (postId) => {
    const userId = localStorage.getItem("userId"); // Retrieve the logged-in user ID
  
    try {
      const isLiked = likedPosts[postId] || false; // Check if the post is already liked
  
      // Optimistically update the UI before the server response
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, like_count: post.like_count + (isLiked ? -1 : 1) }
            : post
        )
      );
  
      setLikedPosts((prevState) => ({
        ...prevState,
        [postId]: !isLiked, // Toggle like state
      }));
  
      // Send the request to the server
      const response = await axios.post("http://localhost:5005/api/like-post", {
        postId,
        userId,
        action: isLiked ? "unlike" : "like", // Determine action
      });
  
      if (response.status !== 200) {
        // Revert the changes if the server request fails
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, like_count: post.like_count + (isLiked ? 1 : -1) }
              : post
          )
        );
        setLikedPosts((prevState) => ({
          ...prevState,
          [postId]: isLiked, // Revert like state
        }));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
  
      // Revert the changes if an error occurs
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, like_count: post.like_count + (isLiked ? 1 : -1) }
            : post
        )
      );
      setLikedPosts((prevState) => ({
        ...prevState,
        [postId]: isLiked, // Revert like state
      }));
    }
  };



  const handlePost = async () => {
    const userId = localStorage.getItem("userId"); // Retrieve the logged-in user ID
    if (!postContent.trim() || !postContentTitle.trim()) {
      alert("Both Title and Content cannot be empty!");
      return;
    }

    const fileInput = document.querySelector(".file-input");
    const file = fileInput?.files[0];

    const formData = new FormData();
    formData.append("title", postContentTitle);
    formData.append("content", postContent);
    formData.append("userId", userId); // Add the userId to the form data
    if (file) {
      formData.append("file", file);
    }

    try {
      setIsPosting(true);

      const response = await axios.post(
        "http://localhost:5005/api/create-post",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 201) {
        alert("Post submitted!");
        setPostContent("");
        setPostContentTitle("");
        window.location.reload(); // Refresh the entire page

        fileInput.value = ""; // Clear file input
      } else {
        console.error("Error creating post:", response.data.message);
      }
    } catch (error) {
      console.error("Error creating post:", error.message);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };
  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Selected file:", file);
      // Process the file (e.g., upload to server or display preview)
    }
  };


  



  useEffect(() => {
    const userId = localStorage.getItem("userId"); // Get the logged-in user's ID
    if (!userId) {
      console.error("No user ID found in localStorage");
      return;
    }
  
    axios
      .get(`http://localhost:5005/api/userposts/${userId}`)
      .then((response) => {
        const sortedPosts = response.data.sort(
          (a, b) => new Date(b.postdate) - new Date(a.postdate)
        );
        setPosts(sortedPosts);
      })
      .catch((error) => {
        console.error("Error fetching user posts:", error);
      });
  }, []);

  
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5005/api/user/${userId}`
        );
        const userData = response.data;
  
        // Format dateofbirth to YYYY-MM-DD
        const formattedDateOfBirth = userData.dateofbirth
          ? new Date(new Date(userData.dateofbirth).getTime() + 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          : "";
  
          const formattedCreatedAt = userData.created_at
          ? new Date(userData.created_at).toLocaleString('en-US', { month: 'long', year: 'numeric' })
          : "";
        
  
        setOriginalData(userData); // Save the original data
        setFormData({
          firstname: userData.firstname || "",
          lastname: userData.lastname || "",
          dateofbirth: formattedDateOfBirth, // Set formatted dateofbirth
          email: userData.email || "",
          password: "",
          confirmpassword: "",
          created_at: formattedCreatedAt, // Set formatted created_at
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
      const response = await axios.put(
        `http://localhost:5005/api/user/${userId}`,
        updates
      );
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
              <button className="menu-button"
              onClick={() => navigate('/profile')}>
                <img src={GI} alt="Profile" />
                <span>Profile</span>
              </button>
            </div>

            <button className="menu-button2"
            onClick={() => navigate('/home')}>
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
              <div className="info-containers">
                <div className="profile-info">
                <h2 className="profile-name">{formData.firstname || 'First Name'} {formData.lastname || 'Last Name'}</h2>
                  <p className="profile-name">{formData.email} </p>
                  <p className="profile-name">Joined {formData.created_at} </p>
                </div>

                <div className="edit-button">
                  <button>
                  Edit 
                    <img
                      src={EI}
                      alt="edit icon"
                      className="edit-icon"
                    />
                  </button>
                </div>
              </div>
            </div>




            <div className="bottomBorder">
              <p className="profile-name">Post</p>
            </div>
          </div>


          {/* Post Input */}
          <div className="post-mlg">
            <div className="post-input">
              <div className="postsomething1">
                <label className="sdasda">What's your tea?</label>
              </div>
              <div className="profile-imagexs"></div>
              <div className="post-input">
                <textarea
                  type="text"
                  rows={1}
                  className="input-title"
                  placeholder="Title"
                  value={postContentTitle}
                  onChange={(e) => {
                    setPostContentTitle(e.target.value);
                    autoResize(e);
                  }}
                  onInput={autoResize}
                  style={{ overflow: "hidden", resize: "none" }} // Prevent manual resize
                />
                {/* Description textarea */}
                <textarea
                  rows={2}
                  type="text"
                  className="input-desc"
                  placeholder="Description"
                  value={postContent}
                  onChange={(e) => {
                    setPostContent(e.target.value);
                    autoResize(e);
                  }}
                  onInput={autoResize}
                  style={{ overflow: "hidden", resize: "none" }} // Prevent manual resize
                />
              </div>
            </div>
            <div className="pv">
              <div className="div12">
                <label className="insertimg">Add to your post</label>
                <img className="imgupd" src={IP} alt="Profile" />
              </div>

              <input
                type="file"
                className="file-input"
                accept="image/*" // Optional: restrict to images only
                onChange={(e) => handleFileInput(e)}
              />
            </div>
            <button className="p-btn" onClick={handlePost} disabled={isPosting}>
              {isPosting ? "Posting..." : "Post"}
            </button>
          </div>

          {/* Posts */}
          <div className="posts">
            {posts.map((post) => (
              <div className="post" key={post.id}>
                {/* Post Header */}
                <div className="post-header">
                  <div className="profile-image">
                    <img src={GI} alt="Profile" />
                    <div className="authorname">
                      <label className="post-user">{post.firstname}</label>
                      <label className="post-user">{post.lastname}</label>
                    </div>
                    <label className="post-time">
                      {new Date(post.postdate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </label>
                  </div>
                  <button className="post-settings">
                    <img src={PS} alt="Settings" />
                  </button>
                </div>

                <div className="post-body">
                  <label className="posttitle">{post.title}</label>
                  <label className="postdesc">{post.content}</label>
                </div>

                {post.imageurl && (
                  <div className="post-image">
                    <img
                      className="postimg"
                      src={`http://localhost:5005/uploads/${post.imageurl}`}
                      alt="Post"
                    />
                  </div>
                )}

                <label
                  className="likebtn"
                  onClick={handleToggle}
                  style={{
                    color: isToggled ? "red" : "white", // Toggle color for demonstration
                  }}
                >
                  <FontAwesomeIcon icon={faHeart} />
                  {post.like_count}
                </label>
              </div>
            ))}
          </div>
        </main>

        {/* Right Sidebar */}
        <div className="right-sidebar">
          <div className="edit-container">
            <h2 className="about-title">Edit Profile</h2>
            <form className="edit-form">
              {/* First Name */}
              <div className="eform-group">
                <label className="elabel" htmlFor="firstname">
                  First Name
                </label>
                <input
                  className="edittxt"
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  placeholder="Enter First Name"
                />
              </div>

              {/* Last Name */}
              <div className="eform-group">
                <label className="elabel" htmlFor="lastname">
                  Last Name
                </label>
                <input
                  className="edittxt"
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Enter Last Name"
                />
              </div>

              {/* Date of Birth */}
              <div className="eform-group">
                <label className="elabel" htmlFor="dob">
                  Date of Birth
                </label>
                <input
                  className="edittxt"
                  type="date"
                  name="dateofbirth"
                  value={formData.dateofbirth}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div className="eform-group">
                <label className="elabel" htmlFor="email">
                  Email
                </label>
                <input
                  className="edittxt"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Email"
                />
              </div>

              {/* Password */}
              <div className="eform-group">
                <label className="elabel" htmlFor="password">
                  Password
                </label>
                <input
                  className="edittxt"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter Password"
                  autoComplete="new-password"
                />
              </div>

              {/* Confirm Password */}
              <div className="eform-group">
                <label className="elabel" htmlFor="confirm-password">
                  Confirm Password
                </label>
                <input
                  className="edittxt"
                  type="password"
                  name="confirmpassword"
                  value={formData.confirmpassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                />
              </div>
              <button type="submit" className="update-button">
                Update
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
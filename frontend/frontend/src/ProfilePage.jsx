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
import NavigationBar from "./NavigationBar.jsx";
import "./NavigationBar.css";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faPen } from "@fortawesome/free-solid-svg-icons";

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
  const [email, setEmail] = useState(""); // State to store email filter value
  const [startDate, setStartDate] = useState(""); // State to store start date
  const [endDate, setEndDate] = useState(""); // State to store end date
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [isModalOpen2, setIsModalOpen2] = useState(false); // State to control modal visibility
  const [maxDate, setMaxDate] = useState("");
  const [selectedPost, setSelectedPost] = useState(null); // State to track the selected post

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleRowClick = (post) => {
    console.log("Row clicked:", post); // Debug log
    setSelectedPost(post);
    setIsModalOpen2(true);
    console.log("selectedPost:", selectedPost);
    console.log("isModalOpen2 state after click:", isModalOpen2);
  };
  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    window.location.reload(); // Refreshes the page
  };
  useEffect(() => {
    const userId = localStorage.getItem("userId"); // Get the current user's ID from local storage

    axios
      .get("http://localhost:5005/api/showposts") // Fetch all posts
      .then((response) => {
        const userPosts = response.data
          .filter((post) => post.author_id === userId) // Filter posts by the current user's ID
          .sort((a, b) => new Date(b.postdate) - new Date(a.postdate)); // Sort by date (latest to oldest)
        setPosts(userPosts);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
      });
  }, []);

  const handleUpdatePost = async () => {
    try {
      console.log("Update data:", {
        post_id: selectedPost?.id,
        title: selectedPost?.title,
        content: selectedPost?.content,
      });
      const response = await axios.put(
        "http://localhost:5005/api/updatepost2",
        {
          post_id: selectedPost.id,
          title: selectedPost.title,
          content: selectedPost.content,
        }
      );
      alert("Post updated successfully");
      setIsModalOpen2(false);
      setSelectedPost(null);
      // Optionally, refresh the posts
      window.location.reload(); // Refresh the entire page
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post.");
    }
  };

  // Handle Delete Post
  const handleDeletePost = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:5005/api/deletepost2/${selectedPost.id}`
      );
      alert("Post deleted successfully");
      setIsModalOpen2(false);
      setSelectedPost(null);
      // Optionally, refresh the posts
      window.location.reload(); // Refresh the entire page
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post.");
    }
  };
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
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // Format date as YYYY-MM-DD
    setMaxDate(formattedDate);
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
          ? new Date(
              new Date(userData.dateofbirth).getTime() + 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0]
          : "";

        const formattedCreatedAt = userData.created_at
          ? new Date(userData.created_at).toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })
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

  // Update the title and content dynamically
  const handleChange2 = (field, value) => {
    setSelectedPost((prev) => ({
      ...prev,
      [field]: value,
    }));
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

        // Close the modal
        handleCloseModal();
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
              <button
                className="menu-button"
                onClick={() => navigate("/profile")}
              >
                <img src={GI} alt="Profile" />
                <span>Profile</span>
              </button>
            </div>

            <button className="menu-button2" onClick={() => navigate("/home")}>
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
              <img className="profile-picture" src={GI} alt="Profile" />
              <div className="info-containers">
                <div className="profile-info">
                  <h2 className="profile-name">
                    {formData.firstname || "First Name"}{" "}
                    {formData.lastname || "Last Name"}
                  </h2>
                  <p className="profile-name">{formData.email} </p>
                  <p className="profile-name">Joined {formData.created_at} </p>
                </div>

                <div>
                  {/* Edit Button */}
                  <div className="edit-button">
                    <button onClick={handleEditClick}>
                      Edit
                      <img src={EI} alt="edit icon" className="edit-icon" />
                    </button>
                  </div>

                  {/* Modal */}
                  {isModalOpen && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                      <div
                        className="modal-container"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="modal-header">
                          <h2>Edit Profile</h2>
                        </div>
                        <form className="edit-form" onSubmit={handleSubmit}>
                          {/* First Name */}
                          <div className="usernames">
                            <div className="usernames2">
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
                            <div className="usernames2">
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
                          </div>

                          {/* Last Name */}

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
                              max={maxDate} // Set the max date to today's date
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
                            <label className="elabel" htmlFor="confirmpassword">
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
                          <div className="buttonsupdate">
                            <button
                              className="update-button"
                              onClick={handleCloseModal}
                            >
                              Cancel
                            </button>
                            <button type="submit" className="update-button">
                              Update
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bottomBorder">
              <p className="profile-name2">Post</p>
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
              <div className="postxx" key={post.id}>
                {/* Post Header */}
                <div className="post-header">
                  <div className="profile-image">
                    <img src={GI} alt="Profile" />
                    <div className="authorname">
                      <label className="post-user">{formData.firstname}</label>
                      <label className="post-user">{formData.lastname}</label>
                    </div>
                    <label className="post-time">
                      {new Date(post.postdate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </label>
                  </div>
                  {/* Post Settings Button */}
                  <button
                    className="post-settings"
                    onClick={() => handleRowClick(post)}
                  >
                    <FontAwesomeIcon icon={faPen} />
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
        <div className="right-sidebar"></div>
      </div>
      {isModalOpen2 && selectedPost && (
        <div className="editpostoverlay show">
          <div className="overlaycontainer">
            <form className="overlayform">
              <div className="headeroverlay">
                <h2 className="overlaylabel2">Edit Post</h2>
              </div>
              <label className="overlaylabel">Title</label>
              <input
                className="addpostforminput"
                type="text"
                value={selectedPost.title}
                onChange={(e) =>
                  setSelectedPost({ ...selectedPost, title: e.target.value })
                }
              />
              <label className="overlaylabel">Content</label>
              <textarea
                className="addpostforminput"
                rows="4"
                value={selectedPost.content}
                onChange={(e) =>
                  setSelectedPost({
                    ...selectedPost,
                    content: e.target.value,
                  })
                }
              />
              <div className="overlaybutton">
                <button
                  className="close-buttons"
                  onClick={() => setIsModalOpen2(false)}
                >
                  Close
                </button>
                <button
                  className="submit-button"
                  type="button"
                  onClick={handleUpdatePost}
                >
                  Update
                </button>
                <button
                  className="submit-button"
                  type="button"
                  onClick={handleDeletePost}
                >
                  Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;

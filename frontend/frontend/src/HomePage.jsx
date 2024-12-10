import React, { useState, useEffect } from "react";
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
import "./Homepage.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

const Homepage = () => {
  const [posts, setPosts] = useState([]); // State to store all posts
  const [postContent, setPostContent] = useState(""); // State for post content
  const [isPosting, setIsPosting] = useState(false); // State for button loading
  const [isToggled, setIsToggled] = useState(false); // State to track button toggle
  const [postContentTitle, setPostContentTitle] = useState("");

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
  const handleToggle = () => {
    setIsToggled((prev) => !prev); // Toggle state
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

  const trends = [
    {
      category: "Politics",
      topic: "Impeachment Talks",
      description: "Discussions intensify over VP Duterte's impeachment.",
    },
    {
      category: "Territorial Disputes",
      topic: "West Philippine Sea",
      description: "Tensions rise amid China’s continued aggression.",
    },
    {
      category: "Food",
      topic: "Adobo Reinventions",
      description:
        "Filipino cuisine gains global recognition with adobo twists.",
    },
    {
      category: "Tourism",
      topic: "Philippine Airlines",
      description:
        "Boosting connectivity through new international partnerships.",
    },
    {
      category: "Holidays",
      topic: "Christmas in Metro Manila",
      description: "Security tightened with 8,000 police deployed.",
    },
    {
      category: "Environment",
      topic: "Carbon-Neutral Shipping",
      description: "Sails return as shipping embraces eco-friendly solutions.",
    },
    {
      category: "Road Safety",
      topic: "Metro Manila Accidents",
      description: "Spike in road mishaps prompts calls for reforms.",
    },
    {
      category: "Tech",
      topic: "AI in Hospitality",
      description: "Advanced tech reshapes tourism and service industries.",
    },
  ];

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
                <img src={DP} alt="Profile" />
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
          {/* Post Input */}
          <div className="post-mlg">
            <div className="post-input">
              <div className="profile-image">
                <img src={DP} alt="Profile" />
                <label className="postsomething">What's your tea?</label>
                <div className="p-btn">
                  <button
                    className="p-btn"
                    onClick={handlePost}
                    disabled={isPosting}
                  >
                    {isPosting ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
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
                  rows={1}
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
            <div className="post-btn">
              <div className="pv">
                <label className="pv-btn">
                  <input
                    type="file"
                    className="file-input"
                    accept="image/*"
                    onChange={(e) => handleFileInput(e)}
                  />

                  <img
                    src={IP}
                    alt="Profile"
                    className="file-img"
                    onClick={() =>
                      document.querySelector(".file-input").click()
                    }
                  />
                </label>
              </div>
            </div>
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

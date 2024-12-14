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
import {
  faFlag,
  faEyeSlash,
  faHeart,
  faComment,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";

const Homepage = () => {
  const [comment, setComment] = useState("");
  const [posts, setPosts] = useState([]); // State to store all posts
  const [postContent, setPostContent] = useState(""); // State for post content
  const [isPosting, setIsPosting] = useState(false); // State for button loading
  const [isToggled, setIsToggled] = useState(false); // State to track button toggle
  const [postContentTitle, setPostContentTitle] = useState("");
  const [likedPosts, setLikedPosts] = useState({});
  const [commentc, setCommentc] = useState({});

  const [comments, setComments] = useState([]);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState({}); // State for menu visibility by post ID
  const [showReportModal, setShowReportModal] = useState(false); // State to manage the modal
  const [reportedPostId, setReportedPostId] = useState(null); // To track the reported post ID
  const [isModerator, setIsModerator] = useState(false); // Moderator status

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const isMod = localStorage.getItem("isModerator");
    setIsModerator(isMod === "Moderator");

    axios
      .get(`http://localhost:5005/api/showposts?userId=${userId}`)
      .then((response) => {
        const sortedPosts = response.data.sort(
          (a, b) => new Date(b.postdate) - new Date(a.postdate) // Sort by postdate, newest first
        );

        // Filter posts based on isHidden and isModerator
        const visiblePosts =
          isMod === "Moderator"
            ? sortedPosts
            : sortedPosts.filter((post) => !post.isHidden);

        setPosts(visiblePosts);

        const initialLikes = {};
        visiblePosts.forEach((post) => {
          initialLikes[post.id] = post.liked; // Initialize liked state for each post
        });
        setLikedPosts(initialLikes);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
      });
  }, []);

  const toggleMenu = (postId) => {
    setShowMenu((prev) => ({
      ...prev,
      [postId]: !prev[postId], // Toggle menu for specific post
    }));
  };

  const autoResize = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto"; // Resetting the height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set the height dynamically
  };
  const handleOptionClick = (option, postId) => {
    if (option === "report") {
      setReportedPostId(postId); // Track the reported post ID
      setShowReportModal(true); // Show the modal
      reportPost(postId); // Call the function to update the server
    } else if (option === "hide") {
      alert(`Hide selected for post ID: ${postId}`);
    }
    setShowMenu((prev) => ({
      ...prev,
      [postId]: false, // Close the menu after selection
    }));
  };
  const reportPost = async (postId) => {
    try {
      const response = await axios.post(
        "http://localhost:5005/api/report-post",
        { postId }
      );
      if (response.status === 200) {
        console.log("Post reported successfully");
        setTimeout(() => {
          window.location.reload(); // Refresh the entire page after 1.5 seconds
        }, 1500); // 1500 milliseconds = 1.5 seconds
      } else {
        console.error("Error reporting post:", response.data.message);
      }
    } catch (error) {
      console.error("Error reporting post:", error.message);
    }
  };
  const handleHidePost = async (postId) => {
    try {
      await axios.post("http://localhost:5005/api/hide-post", { postId });
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const updatedPost = { ...post, isHidden: true };
            console.log(`Post ${postId} isHidden state:`, updatedPost.isHidden); // Log isHidden state
            return updatedPost;
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error hiding post:", error);
    }
  };

  const handleUnhidePost = async (postId) => {
    try {
      await axios.post("http://localhost:5005/api/unhide-post", { postId });
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const updatedPost = { ...post, isHidden: false };
            console.log(`Post ${postId} isHidden state:`, updatedPost.isHidden); // Log isHidden state
            return updatedPost;
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error unhiding post:", error);
    }
  };

  const handleRemoveFlag = async (postId) => {
    try {
      await axios.post("http://localhost:5005/api/unflag-post", { postId });
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const updatedPost = { ...post, isFlagged: false };
            console.log(
              `Post ${postId} isFlagged state:`,
              updatedPost.isFlagged
            ); // Log isFlagged state
            return updatedPost;
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error removing flag:", error);
    }
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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedPost, setSelectedPost] = useState(null);

  const toggleModal = (post = null) => {
    setIsModalOpen(!isModalOpen);
    setSelectedPost(post);

    if (post) {
      fetchComments(post.id); // Fetch comments when opening the modal
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

  const handleComment = async () => {
    if (!comment.trim()) {
      alert("Comment cannot be empty.");
      return;
    }

    const userId = localStorage.getItem("userId");

    try {
      const response = await axios.post(
        "http://localhost:5005/api/add-comment",
        {
          post_id: selectedPost.id,
          user_id: userId,
          content: comment,
        }
      );

      if (response.status === 201) {
        alert("Comment added successfully.");
        setComment("");
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === selectedPost.id
              ? { ...post, comment_count: post.comment_count + 1 }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  useEffect(() => {
    if (selectedPost) {
      axios
        .get(`http://localhost:5005/api/get-comments?postId=${selectedPost.id}`)
        .then((response) => {
          const sortedComments = response.data.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at) // Sort comments by created_at (newest first)
          );
          setComments(sortedComments); // Update state with sorted comments
        })
        .catch((error) => console.error("Error fetching comments:", error));
    }
  }, [selectedPost]);

  const fetchComments = async (postId) => {
    try {
      const response = await axios.get(
        `http://localhost:5005/api/get-comments?postId=${postId}`
      );
      if (response.status === 200) {
        const sortedComments = response.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at) // Sort comments by created_at (newest first)
        );
        setComments(sortedComments); // Update state with sorted comments
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
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
              <button
                className="menu-button"
                onClick={() => navigate("/profile")}
              >
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

          <div className="posts">
            {posts.map((post) => (
              <div className="postxx" key={post.id}>
                <div className="post-header">
                  <div className="profile-image">
                    <img src={GI} alt="Profile" />
                    <div className="authorname">
                      <label className="post-user">{post.firstname}</label>
                      <label className="post-user">{post.lastname}</label>
                    </div>
                    <div className="posttime">
                      <label className="post-time">
                        {new Date(post.postdate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </label>
                      <div className="poststats">
                        {isModerator && post.isHidden ? (
                          <div className="flagged-label">
                            <FontAwesomeIcon icon={faEyeSlash} />
                            <label className="labelxxzz">
                              Hidden from users
                            </label>
                          </div>
                        ) : (
                          <div className="flagged-label hidden" />
                        )}
                        {isModerator && post.isFlagged ? (
                          <div className="flagged-label">
                            <FontAwesomeIcon icon={faFlag} />
                            <label className="labelxxzz">Flagged</label>
                          </div>
                        ) : (
                          <div className="flagged-label hidden" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="post-settings-container">
                    {/* Three dots button */}
                    <button
                      className="post-settings-button"
                      onClick={() => toggleMenu(post.id)}
                      onBlur={() => setTimeout(() => toggleMenu(post.id), 300)} // 1 second delay
                    >
                      &#x22EF; {/* Vertical three dots */}
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu[post.id] && (
                      <div className="post-settings-menu">
                        <button
                          className="post-settings-option"
                          onClick={() => handleOptionClick("report", post.id)}
                        >
                          Report
                        </button>

                        {isModerator && (
                          <div className="moderator-actions">
                            {!post.isHidden ? (
                              <button
                                onClick={() => handleHidePost(post.id)}
                                className="post-settings-option hide"
                              >
                                Hide
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnhidePost(post.id)}
                                className="post-settings-option unhide"
                              >
                                Unhide
                              </button>
                            )}

                            {post.isFlagged ? (
                              <button
                                onClick={() => handleRemoveFlag(post.id)}
                                className="post-settings-option"
                              >
                                Unflag
                              </button>
                            ) : (
                              <div></div> // empty div
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
                <div className="post-actions">
                  <label
                    className="likebtn"
                    onClick={() => handleToggle(post.id)} // Pass only the post ID
                    style={{
                      color: likedPosts[post.id] ? "red" : "white", // Show red if the post is liked
                      cursor: "pointer",
                    }}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                    {post.like_count} {/* Render updated like count */}
                  </label>

                  <label
                    className="commentbtn"
                    onClick={() => toggleModal(post)} // Pass the current post to the modal
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    <FontAwesomeIcon icon={faComment} />
                    {post.comment_count}
                  </label>
                </div>
              </div>
            ))}
          </div>

          {isModalOpen && selectedPost && (
            <div className="modal-overlay" onClick={toggleModal}>
              <div
                className="modal-contentt"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header2">
                  <button className="modal-close-btn" onClick={toggleModal}>
                    &times;
                  </button>
                  <p className="modal-title">Comments</p>
                </div>

                {/* Comments Section */}
                <div className="modal-comment-container">
                  {comments.map((comment, index) => (
                    <div key={index} className="modal-comment-author">
                      <img
                        src={GI}
                        alt="Profile"
                        className="modal-profile-image"
                      />
                      <div className="modal-author-details">
                        <label className="modal-post-user">
                          {comment.firstname} {comment.lastname}
                        </label>
                        <p className="modal-comment-content">
                          {comment.content}
                        </p>{" "}
                        {/* Display comment content */}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="modal-input-container">
                  <div className="textarea-container">
                    <textarea
                      className="modal-reply-input"
                      placeholder="Write your comment..."
                      rows="2"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)} // Update the state on input change
                    ></textarea>
                  </div>
                  <div className="button-container">
                    <button className="modal-reply-btn" onClick={handleComment}>
                      <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
      {showReportModal && (
        <div className="modal">
          <div className="modal-contentxd">
            <p>Post reported successfully!</p>
            <button onClick={() => setShowReportModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;

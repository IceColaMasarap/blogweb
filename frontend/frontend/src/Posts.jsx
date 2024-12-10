import Sidebar from "./Sidebar";
import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios"; // Add axios to make API calls
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

function Posts() {
  const [posts, setPosts] = useState([]); // State to store all posts
  const [email, setEmail] = useState(""); // State to store email filter value
  const [startDate, setStartDate] = useState(""); // State to store start date
  const [endDate, setEndDate] = useState(""); // State to store end date
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [isModalOpen2, setIsModalOpen2] = useState(false); // State to control modal visibility

  const [selectedPost, setSelectedPost] = useState(null); // State to track the selected post

  useEffect(() => {
    axios
      .get("http://localhost:5005/api/posts2") // Fetch all posts
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

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    if (selectedImage) {
      setImage(selectedImage);
    }
  };

  // Handle Date End validation
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    if (newEndDate && newEndDate < startDate) {
      alert("End Date cannot be before Start Date");
    } else {
      setEndDate(newEndDate);
    }
  };

  // Toggle modal visibility
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Filter posts based on the selected filters
  const filteredPosts = posts.filter((post) => {
    const matchesEmail = email
      ? post.author_email.toLowerCase().includes(email.toLowerCase())
      : true;
    const postDate = new Date(post.postdate);
    const matchesDateRange =
      (!startDate || postDate >= new Date(startDate)) &&
      (!endDate || postDate <= new Date(endDate));
    return matchesEmail && matchesDateRange;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("image", image); // Attach image to formData
    console.log("Form Data:", formData);
    console.log("Title:", title);
    console.log("Content:", content);
    console.log("Image:", image);
    try {
      const response = await axios.post(
        "http://localhost:5005/api/addpost2",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Ensure the header supports file upload
          },
        }
      );
      alert("Post added successfully");
      window.location.reload(); // Refresh the entire page

      setTitle("");
      setContent("");
      setImage(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding post:", error);
      alert("Error adding post.");
    }
  };
  const handleRowClick = (post) => {
    console.log("Row clicked:", post); // Debug log
    setSelectedPost(post);
    setIsModalOpen2(true);
    console.log("isModalOpen2 state after click:", isModalOpen2);
  };
  // Handle Update Post
  const handleUpdatePost = async () => {
    try {
      console.log("Update data:", {
        post_id: selectedPost?.post_id,
        title: selectedPost?.title,
        content: selectedPost?.content,
      });
      const response = await axios.put(
        "http://localhost:5005/api/updatepost2",
        {
          post_id: selectedPost.post_id,
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
        `http://localhost:5005/api/deletepost2/${selectedPost.post_id}`
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

  return (
    <div className="dashboardbg">
      <div className="navBar">
        <label className="navbartext">Posts</label>
      </div>
      <div className="dashboardcontent">
        <div className="poststablecontainer">
          <div className="filters">
            <div className="filter1">
              <label className="filterlabel">Email</label>
              <input
                className="userSearch"
                placeholder="e.g. johndoe@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="filter1">
              <label className="filterlabel">Date Start</label>
              <input
                className="dateSearch"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="filter1">
              <label className="filterlabel">Date End</label>
              <input
                className="dateSearch"
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
              />
            </div>
            <button className="addButton" onClick={toggleModal}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Author Email</th>
                <th>Author Name</th>
                <th>Title</th>
                <th>Content</th>
                <th>Date Posted</th>
                <th>Flagged</th>
                <th>Like Count</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((item) => (
                <tr
                  key={item.post_id}
                  onClick={() => handleRowClick(item)} // Properly call the function with the clicked row data
                >
                  <td>{item.author_email}</td>
                  <td>
                    {item.author_firstname} {item.author_lastname}
                  </td>
                  <td>{item.title}</td>
                  <td>{item.content}</td>
                  <td>{new Date(item.postdate).toLocaleString()}</td>
                  <td>{item.isFlagged ? "Yes" : "No"}</td>
                  <td>{item.like_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="addpostoverlay show">
            {" "}
            <div className="overlaycontainer">
              <form className="overlayform" onSubmit={handleSubmit}>
                <div className="headeroverlay">
                  {" "}
                  <h2 className="overlaylabel2">Add a new Post</h2>
                </div>

                <label className="overlaylabel">Title</label>

                <input
                  className="addpostforminput"
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <label className="overlaylabel">Content</label>

                <textarea
                  className="addpostforminput"
                  placeholder="Content"
                  rows="4"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <label className="overlaylabel">Upload Image</label>

                <div className="image-upload">
                  <input
                    className="addpostforminputs"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                <div className="overlaybutton">
                  <button className="close-button" onClick={toggleModal}>
                    Close
                  </button>
                  <button className="submit-button" type="submit">
                    Add Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
                    className="close-button"
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
    </div>
  );
}

export default Posts;

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
  const [firstName, setFirstName] = useState("Admin");
  const [lastName, setLastName] = useState("Page");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Create form data to send to the server
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("title", title);
    formData.append("content", content);
    formData.append("email", email);
    if (image) formData.append("image", image);

    // Here you can make an API call to submit the data, for example:
    // axios.post("/api/posts", formData)
    //   .then(response => {
    //     console.log("Post submitted", response);
    //   })
    //   .catch(error => {
    //     console.error("Error submitting post", error);
    //   });

    // For now, just log the form data
    console.log("Form data submitted:", formData);
  };

  // Fetch all posts when the component mounts
  useEffect(() => {
    axios
      .get("http://localhost:5005/api/posts2") // Fetch all posts
      .then((response) => {
        setPosts(response.data);
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
                <tr key={item.post_id}>
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

        {/* Modal Overlay */}
        {isModalOpen && (
          <div className="addpostoverlay">
            <button className="close-button" onClick={toggleModal}>
              Close
            </button>
            <form onSubmit={handleSubmit}>
              <input
                className="addpostforminput"
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                readOnly
              />
              <input
                className="addpostforminput"
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                readOnly
              />
              <input
                className="addpostforminput"
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="addpostforminput"
                placeholder="Content"
                rows="4"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <input
                className="addpostforminput"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly
              />
              <div className="image-upload">
                <input
                  className="addpostforminput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <button className="submit-button" type="submit">
                Submit Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Posts;

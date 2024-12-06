import { useNavigate } from "react-router-dom";
import "./Signup.css";
import TS from "./assets/tsaaritsa.png";
import axios from "axios";
import React, { useState } from "react";

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
    <div className="containerr">
      {/* Left Section */}
      <div className="left-sectionr">
        <div className="logo-containerr">
          <div className="logor">
            <img
              src={TS} // Placeholder for the tea cup logo
              alt="Tsaaritsa"
              className="logo-imager"
            />
          </div>
          <h1 className="brand-titler">Tsaaritsa.</h1>
        </div>
      </div>

      {/* Right Section */}
      <div className="right-sectionr">
        <h1 className="main-headingr">Everyone’s cup of tea</h1>
        <p className="sub-headingr">Join Today.</p>
        <form className="formr" onSubmit={handleSubmit}>
          <div className="form-rowr">
            <input
              type="text"
              placeholder="First Name"
              className="input"
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last Name"
              className="input"
              onChange={(e) => setLastName(e.target.value)}
            />
            <input
              type="date"
              className="input"
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            className="input"
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="form-rowr">
            <input
              type="password"
              placeholder="Password"
              className="input"
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm"
              className="input"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="buttonr">
            Register
          </button>

          {error && <p style={{ color: "red" }}>{error}</p>}
          {successMessage && (
            <p style={{ color: "#15bc11" }}>{successMessage}</p>
          )}
          <p className="login-linkr">
            Already have an account?
            <span
              className="registerlabelnav"
              id="tologin"
              onClick={() => navigate("/login")}
              style={{ cursor: "pointer", color: "blue" }}
            >
              Log in here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Posts;

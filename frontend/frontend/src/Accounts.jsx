import Sidebar from "./Sidebar";
import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

function Accounts() {
  const [users, setUsers] = useState([]); // State to store all users
  const [email, setEmail] = useState(""); // State for email search
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModerator, setIsModerator] = useState(null); // Filter for moderators
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateofbirth, setDateOfBirth] = useState("");
  const [email1, setEmail1] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5005/api/usershow")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  // Handle the modal toggle
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (
      !firstName ||
      !lastName ||
      !dateofbirth ||
      !email1 ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields");
      alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5005/api/register", {
        firstName,
        lastName,
        email: email1,
        dateofbirth,
        password,
      });

      // Set success message and alert
      setSuccessMessage(response.data.message);
      alert(response.data.message);

      // Clear input fields and modal state after registration
      setFirstName("");
      setLastName("");
      setEmail1("");
      setDateOfBirth("");
      setPassword("");
      setConfirmPassword("");

      toggleModal();
    } catch (err) {
      const errorMsg = err.response
        ? err.response.data.message
        : "Error occurred during registration";
      setError(errorMsg);
      alert(errorMsg);
      console.error(err);
    }
  };

  const handleModeratorFilter = (e) => {
    const value = e.target.value;
    // Set to null for 'All', and specific strings for filtering
    if (value === "All") {
      setIsModerator(null);
    } else {
      setIsModerator(value);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesEmail = email
      ? user.email.toLowerCase().includes(email.toLowerCase())
      : true;

    // Handle the moderator filter logic
    const userTypeMatch =
      isModerator === null || user.isModerator === isModerator;

    const postDate = new Date(user.created_at);
    const matchesDateRange =
      (!startDate || postDate >= new Date(startDate)) &&
      (!endDate || postDate <= new Date(endDate));

    return matchesEmail && userTypeMatch && matchesDateRange;
  });

  return (
    <div className="dashboardbg">
      <div className="navBar">
        <label className="navbartext">Accounts</label>
      </div>
      <div className="dashboardcontent">
        <div className="poststablecontainer">
          <div className="filters">
            {/* Email search */}
            <div className="filter1">
              <label className="filterlabel">Account Email</label>
              <input
                type="text"
                placeholder="e.g. johndoe@gmail.com"
                className="userSearch"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Moderator filter */}
            <div className="filter1">
              <label className="filterlabel">Account Type</label>
              <select className="userSearch" onChange={handleModeratorFilter}>
                <option value="All">All</option>
                <option value="User">User</option>
                <option value="Moderator">Moderator</option>
              </select>
            </div>

            {/* Date range picker */}
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
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <button className="addButton" onClick={toggleModal}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>

          {/* User table */}
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Birthdate</th>
                <th>User Type</th>
                <th>Creation Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((item) => (
                <tr key={item.id}>
                  <td>{item.email}</td>
                  <td>{item.firstname}</td>
                  <td>{item.lastname}</td>
                  <td>{new Date(item.dateofbirth).toLocaleString()}</td>
                  <td>{item.isModerator}</td>
                  <td>{new Date(item.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

              <label className="overlaylabel">Email</label>
              <input
                className="addpostforminput"
                type="email"
                value={email1}
                onChange={(e) => setEmail1(e.target.value)}
              />
              <label className="overlaylabel">First Name</label>
              <input
                className="addpostforminput"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />

              <label className="overlaylabel">Last Name</label>
              <input
                className="addpostforminput"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <label className="overlaylabel">Birthdate</label>
              <input
                className="addpostforminput"
                type="date"
                value={dateofbirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
              <label className="overlaylabel">Password</label>
              <input
                className="addpostforminput"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label className="overlaylabel">Confirm Password</label>
              <input
                className="addpostforminput"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div className="overlaybutton">
                <button className="close-button" onClick={toggleModal}>
                  Close
                </button>
                <button className="submit-button" type="submit">
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Accounts;

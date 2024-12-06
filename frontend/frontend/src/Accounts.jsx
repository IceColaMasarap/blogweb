import Sidebar from "./Sidebar";
import "./App.css";
import { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

function Accounts() {
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

  // Toggle modal visibility
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
  };
  const data = [
    {
      FirstName: "Jones",
      LastName: "Jones",
      BirthDate: "06/06/2004",
      Email: "johndoe@gmail.com",
      UserType: "Moderator",
      CreationDate: "06/06/2004",
    },
  ];
  return (
    <div className="dashboardbg">
      <div className="navBar">
        <label className="navbartext">Posts</label>
      </div>
      <div className="dashboardcontent">
        <div className="poststablecontainer">
          <div className="filters">
            <div className="filter1">
              <label className="filterlabel">Account Type</label>
              <select className="userSearch">
                <option value="All">All</option>
                <option value="User">User</option>
                <option value="Moderator">Moderator</option>
              </select>
            </div>
            <div className="filter1">
              <label className="filterlabel">Date Start</label>
              <input className="dateSearch" type="date" />
            </div>
            <div className="filter1">
              <label className="filterlabel">Date End</label>
              <input className="dateSearch" type="date" />
            </div>
            <button className="addButton" onClick={toggleModal}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
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
              {data.map((item) => (
                <tr key={item.name}>
                  <td>{item.Email}</td>
                  <td>{item.FirstName}</td>
                  <td>{item.LastName}</td>
                  <td>{item.BirthDate}</td>
                  <td>{item.UserType}</td>
                  <td>{item.CreationDate}</td>
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
                <h2 className="overlaylabel2">Add a new Account</h2>
              </div>

              <label className="overlaylabel">Title</label>

              <label className="overlaylabel">Content</label>

              <label className="overlaylabel">Upload Image</label>

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
    </div>
  );
}

export default Accounts;

import Sidebar from "./Sidebar";
import "./App.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function Dashboard() {
  const [posts, setPosts] = useState([]); // State to store posts
  const [usersCount, setUsersCount] = useState(0); // State to store user count
  const [moderatorsCount, setModeratorsCount] = useState(0); // State to store moderator count
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    // Fetch posts data
    axios
      .get("http://localhost:5005/api/posts")
      .then((response) => {
        setPosts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
      });

    // Fetch user count
    axios
      .get("http://localhost:5005/api/users")
      .then((response) => {
        setUsersCount(response.data.totalUsers);
        setModeratorsCount(response.data.totalModerators);
      })
      .catch((error) => {
        console.error("Error fetching user stats:", error);
      });
  }, []);

  return (
    <div className="dashboardbg">
      <div className="navBar">
        <label className="navbartext">Dashboard</label>
      </div>
      <div className="dashboardcontent">
        <div className="dashboardpanelcontainer">
          {/* Posts Panel */}
          <div
            className="dashboardpanel"
            onClick={() => navigate("/adminpage/posts")} // Navigate to the posts page
          >
            <label className="dpanellabel">{posts.length}</label>
            <label className="dpaneltext">Posts</label>
          </div>
          {/* Users Panel */}
          <div
            className="dashboardpanel"
            onClick={() => navigate("/adminpage/accounts")} // Navigate to the users page
          >
            <label className="dpanellabel">{usersCount}</label>
            <label className="dpaneltext">Users</label>
          </div>
          {/* Moderators Panel */}
          <div
            className="dashboardpanel"
            onClick={() => navigate("/adminpage/accounts")} // Navigate to the moderators page
          >
            <label className="dpanellabel">{moderatorsCount}</label>
            <label className="dpaneltext">Moderators</label>
          </div>
        </div>
        <div className="dashboardtablecontainer">
          <label className="dtableheader">Displaying Recent Posts</label>
          <table>
            <thead>
              <tr>
                <th>Author Name</th>
                <th>Date Posted</th>
                <th>Content</th>
                <th>Flagged</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((item) => (
                <tr key={item.post_id}>
                  <td>{item.author_name}</td>
                  <td>{new Date(item.date_posted).toLocaleString()}</td>
                  <td>{item.content}</td>
                  <td>{item.flagged ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

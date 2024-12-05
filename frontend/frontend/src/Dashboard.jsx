import Sidebar from "./Sidebar";
import "./App.css";

function Dashboard() {
  return (
    <div className="dashboardbg">
      <div className="navBar">
        <label className="navbartext">Dashboard</label>
      </div>
      <div className="dashboardcontent">
        <div className="dashboardpanelcontainer">
          <div className="dashboardpanel">
            <label className="dpanellabel">100</label>
            <label className="dpaneltext">Posts</label>
          </div>
          <div className="dashboardpanel">
            <label className="dpanellabel">100</label>
            <label className="dpaneltext">Users</label>
          </div>
          <div className="dashboardpanel">
            <label className="dpanellabel">100</label>
            <label className="dpaneltext">Moderators</label>
          </div>
        </div>
        <div className="dashboardtablecontainer">
          <label className="dtableheader">Displaying Recent Posts</label>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

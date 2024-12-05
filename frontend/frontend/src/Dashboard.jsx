import Sidebar from "./Sidebar";
import "./App.css";

function Dashboard() {
  const data = [
    {
      Name: "Jones Hilario",
      Date: "06/06/2004",
      Content: "Merry Christmas!",
      Flagged: false,
    },
    {
      Name: "Meriam Cuddler",
      Date: "05/02/2004",
      Content: "This year is fun!",
      Flagged: true,
    },
    {
      Name: "Vice Kanda",
      Date: "07/02/2004",
      Content: "I hope this dog live. I am so saddened",
      Flagged: false,
    },
    {
      Name: "Vice Kanda",
      Date: "07/02/2004",
      Content: "I hope this dog live. I am so saddened",
      Flagged: false,
    },
    {
      Name: "Vice Kanda",
      Date: "07/02/2004",
      Content: "I hope this dog live. I am so saddened",
      Flagged: false,
    },
    {
      Name: "Vice Kanda",
      Date: "07/02/2004",
      Content: "I hope this dog live. I am so saddened",
      Flagged: false,
    },
  ];
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
              {data.map((item) => (
                <tr key={item.name}>
                  <td>{item.Name}</td>
                  <td>{item.Date}</td>
                  <td>{item.Content}</td>
                  <td>{item.Flagged ? "Yes" : "No"}</td>
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

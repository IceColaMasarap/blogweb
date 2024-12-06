import Sidebar from "./Sidebar";
import "./App.css";

function Accounts() {
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
    </div>
  );
}

export default Accounts;

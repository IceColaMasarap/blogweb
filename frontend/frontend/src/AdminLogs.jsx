import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const AdminLogs = () => {
    const [logs, setLogs] = useState([]); // Store logs from the database
    const [email, setEmail] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchAdminLogs();
    }, []);

    const fetchAdminLogs = async () => {
        try {
            const response = await axios.get("http://localhost:5005/api/adminlogs"); // Adjust the URL based on your backend
            setLogs(response.data);
        } catch (error) {
            console.error("Error fetching admin logs:", error);
        }
    };

    const handlePrintLogs = async () => {
      try {
          // Fetch admin logs from API
          const response = await axios.get("http://localhost:5005/api/adminlogs");
  
          if (!response.data || response.data.length === 0) {
              alert("No logs found.");
              return;
          }
  
          // Sort logs by timestamp (latest first)
          const sortedLogs = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
          // Format logs as a printable table
          const logData = sortedLogs.map(
              (log, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${log.admin_email}</td>
                <td>${log.action_type}</td>
                <td>${log.details}</td>
                <td>${new Date(log.timestamp).toLocaleString()}</td>
              </tr>
          `
          );
  
          // Create printable content
          const printableContent = `
              <html>
              <head>
                <title>Admin Logs Report</title>
                <style>
                  body { font-family: Arial, sans-serif; text-align: center; }
                  h2 { margin-bottom: 20px; }
                  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                  th, td { border: 1px solid black; padding: 8px; text-align: left; }
                  th { background-color: #f2f2f2; }
                </style>
              </head>
              <body>
                <h2>Admin Logs Report</h2>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Admin Email</th>
                      <th>Action Type</th>
                      <th>Details</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${logData.join("")}
                  </tbody>
                </table>
                <script>
                  window.onload = function() {
                    window.print();
                  };
                </script>
              </body>
              </html>
          `;
  
          // Open print window
          const printWindow = window.open("", "", "width=800,height=600");
          printWindow.document.write(printableContent);
          printWindow.document.close();
      } catch (error) {
          console.error("Error fetching logs:", error);
          alert("Failed to fetch admin logs.");
      }
  };
  
      
      

    // Filter logs based on email and date range
// Filter logs based on email and date range, then sort by timestamp (latest first)
const filteredLogs = logs
    .filter((log) => {
        const matchesEmail = email ? log.admin_email.toLowerCase().includes(email.toLowerCase()) : true;
        const logDate = new Date(log.timestamp);
        const matchesDateRange =
            (!startDate || logDate >= new Date(startDate)) &&
            (!endDate || logDate <= new Date(endDate));

        return matchesEmail && matchesDateRange;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort in descending order (latest first)


    return (
        <div className="dashboardbg">
            <div className="navBar">
                <label className="navbartext">Admin Logs</label>
            </div>
            <div className="dashboardcontent">
                <div className="poststablecontainer">
                    <div className="filters">
                        <div className="filter1">
                            <label className="filterlabel">Admin Email</label>
                            <input
                                type="text"
                                placeholder="e.g. admin@example.com"
                                className="userSearch"
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
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>

                        <button className="downloadButton" onClick={handlePrintLogs}>
                            <FontAwesomeIcon icon={faDownload} />
                        </button>

                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Admin Email</th>
                                <th>Action Type</th>
                                <th>Details</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log) => (
                                <tr key={log.id}>
                                    <td>{log.admin_email}</td>                                    
                                    <td>{log.action_type}</td>
                                    <td>{log.details}</td>
                                    <td>{log.timestamp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {isModalOpen && (
                        <div className="modal">
                            <p>Modal Content Here</p>
                            <button onClick={toggleModal}>Close</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLogs;

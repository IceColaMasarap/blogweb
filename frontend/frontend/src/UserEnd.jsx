import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./Login";
import Signup from "./Signup";
import AdminEnd from "./AdminEnd";
import "./App.css";

function UserEnd() {
  return (
    <Router>
      <div className="rootcontent">
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          {/* Use AdminEnd as a parent for all admin routes */}
          <Route path="/adminpage/*" element={<AdminEnd />} />
        </Routes>
      </div>
    </Router>
  );
}

export default UserEnd;

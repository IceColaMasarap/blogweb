import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./Login";
import Signup from "./Signup";
import AdminEnd from "./AdminEnd";
import Homepage from "./HomePage.jsx";
import ProfilePage from "./ProfilePage";
import UserProfile from "./UserProfile";
import AdminLogin from "./AdminLogin";
import ProtectedRoute from "./ProtectedRoute.jsx"; // Import ProtectedRoute
import "./App.css";

function UserEnd() {
  return (
    <Router>
      <div className="rootcontent">
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/adminlogin" element={<AdminLogin />} />

          {/* Protected Routes - Users must be logged in to access */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Homepage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/adminpage/*"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminEnd />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default UserEnd;

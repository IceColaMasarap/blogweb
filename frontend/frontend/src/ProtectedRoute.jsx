import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const userId = localStorage.getItem("userId");
  const isModerator = localStorage.getItem("isModerator"); // Check if user is an admin

  if (!userId) {
    return <Navigate to="/login" replace />; // Redirect if not logged in
  }

  if (adminOnly && isModerator !== "Admin") {
    return <Navigate to="/home" replace />; // Redirect non-admin users to home
  }

  return children; // Allow access
};

export default ProtectedRoute;

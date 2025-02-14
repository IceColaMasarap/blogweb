import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const userId = localStorage.getItem("userId"); // Check if user is logged in

  if (!userId) {
    return <Navigate to="/login" replace />; // Redirect to login if no user is found
  }

  return children; // Allow access if user is logged in
};

export default ProtectedRoute;

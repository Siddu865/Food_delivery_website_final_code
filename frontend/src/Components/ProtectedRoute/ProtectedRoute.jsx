import React from "react";
import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const admin_token = Cookies.get("admin_jwt");

  if (!admin_token) {
    // Not logged in → redirect to login
    return <Navigate to="/admin-login" replace />;
  }

  // Logged in → render children
  return children;
};

export default ProtectedRoute;

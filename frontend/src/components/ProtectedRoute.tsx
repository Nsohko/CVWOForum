import { RootState } from "../redux/Store";
import React from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

// Component to protect routes
const RequireAuth: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated) && user != null; // Checks if user is authenticated

    const location = useLocation();

    if (!isAuthenticated) {
        alert("You need to log in to access this page.");
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default RequireAuth;

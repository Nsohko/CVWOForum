import User, { getDefaultUser } from "../types/User";
import AccountInput from "../components/AccountInput";
import apiClient, { handleAxiosError } from "../utils/apiClient";
import { logout } from "../redux/AuthSlice";
import "../index.css";
import { AppDispatch } from "../redux/Store";
import { processLogin } from "../utils/authUtils";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // To handle redirects
import { useDispatch } from "react-redux";

function Login() {
    const [userData, setUserData] = useState<User>(getDefaultUser());
    const [error, setError] = useState("");
    const navigate = useNavigate(); // React Router hook for navigation
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();

    // logout
    useEffect(() => {
        apiClient.get(`/api/logout`);
        dispatch(logout()); // Dispatch the logout action
    }, []);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        try {
            await processLogin(userData, dispatch);
            setUserData(getDefaultUser());
            alert("Logged in successfully!");
            const redirectTo = (location.state as { from: string })?.from || "/";
            navigate(redirectTo);
        } catch (err) {
            handleAxiosError(err, setError);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <AccountInput userData={userData} setUserData={setUserData} handleSubmit={handleLogin} action="Login" />
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default Login;

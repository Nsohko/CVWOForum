import User, { getDefaultUser } from "../types/User";
import AccountInput from "../components/AccountInput";
import "../index.css";
import apiClient, { handleAxiosError } from "../utils/apiClient";
import { processLogin } from "../utils/authUtils";
import { AppDispatch } from "../redux/Store";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

function CreateAccount() {
    const [userData, setUserData] = useState<User>(getDefaultUser);
    const [error, setError] = useState("");
    const navigate = useNavigate(); // React Router hook for navigation
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        try {
            // Make the API request using axios
            const response = await apiClient.post("/api/create_account", userData);

            if (response.status === 200) {
                await processLogin(userData, dispatch);
                setUserData(getDefaultUser());
                alert("Created account successfully!");
                const redirectTo = (location.state as { from: string })?.from || "/";
                navigate(redirectTo);
            }
        } catch (err) {
            handleAxiosError(err, setError);
        }
    };

    return (
        <div className="login-container">
            <h2>Create Account</h2>
            <AccountInput
                userData={userData}
                setUserData={setUserData}
                handleSubmit={handleSubmit}
                action="Create Account"
            />
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default CreateAccount;

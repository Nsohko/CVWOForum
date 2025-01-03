// utils/authUtils.ts

import { AppDispatch } from "../redux/Store";
import apiClient from "../utils/apiClient";
import { loginSuccess } from "../redux/AuthSlice";
import User from "../types/User";

// Function to handle login
export const processLogin = async (userData: User, dispatch: AppDispatch) => {
    // Make the login request
    const response = await apiClient.post("/api/login", userData);

    if (response.status === 200) {
        const userResponse = await apiClient.get("/api/protected");
        const user = userResponse.data;

        // Dispatch the login success action
        dispatch(loginSuccess({ user }));
    }
};

export default processLogin;

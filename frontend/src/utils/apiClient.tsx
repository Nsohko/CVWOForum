import axios, { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";

const baseURL = process.env.REACT_APP_API_URL;

if (!baseURL) {
    console.warn("REACT_APP_API_URL is not defined. Defaulting to localhost.");
}

const apiClient = axios.create({
    baseURL: baseURL || "http://localhost:8080", // Fallback for local development
    withCredentials: true,
});

// helper function to handle Axios errors when communicating with the server
export const handleAxiosError = (
    err: unknown,
    setError: (message: string) => void,
    navigate?: ReturnType<typeof useNavigate>,
) => {
    console.log(err);

    if (isAxiosError(err)) {
        const statusCode = err.response?.status;
        const errorMessage = err.response?.data?.error || "An error occurred";

        console.log("Error Message:" + errorMessage);
        setError("Error: " + errorMessage);
        if (statusCode == 401) {
            apiClient.get(`/api/logout`);
            if (navigate) {
                alert("You are not logged in. Redirecting to login page.");
                navigate("/login");
            }
        } else if (statusCode === 503) {
            setError("Error: The server is currently unavailable");
        }
    } else {
        setError("Error: An unexpected error occurred"); // Non-Axios error
    }
};

export default apiClient;

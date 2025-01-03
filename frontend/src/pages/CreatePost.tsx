import Post, { getDefaultPost } from "../types/Post";
import TextInput from "../components/PostTextInput";
import "../index.css";
import apiClient, { handleAxiosError } from "../utils/apiClient";
import { RootState } from "../redux/Store"; // Import Redux RootState

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const CreatePost: React.FC = () => {
    const [newPost, setNewPost] = useState<Post>(getDefaultPost()); // State to hold form data
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate(); // Use React Router's navigate function for redirection.
    // Access user ID from Redux store
    const user = useSelector((state: RootState) => state.auth.user);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            // Make the POST request with Axios

            if (user == null) {
                setError("Not logged in");
                return;
            }

            const updatedPost = { ...newPost }; // Create a copy to avoid directly mutating state
            updatedPost.author = user.id;
            updatedPost.created_at = new Date().toISOString(); // Set current datetime in ISO 8601 format
            const response = await apiClient.post("/api/posts", updatedPost);

            if (response.status === 201) {
                // Successfully created the post
                navigate("/"); // Redirect to homepage or another page
            } else {
                setError("Failed to create post");
            }
        } catch (err) {
            handleAxiosError(err, setError, navigate);
        }
    };

    return (
        <>
            <h2>Create a New Post</h2>
            {error && <p className="error">{error}</p>}
            <TextInput newPost={newPost} setNewPost={setNewPost} handleSubmit={handleSubmit} />
        </>
    );
};

export default CreatePost;

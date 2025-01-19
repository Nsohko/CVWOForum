import Post, { getDefaultPost } from "../types/Post";
import TextInput from "../components/PostTextInput";
import apiClient, { handleAxiosError } from "../utils/apiClient";
import "../index.css";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Page to edit a post
const EditPost: React.FC = () => {
    const { post_id } = useParams<{ post_id: string }>();

    const [newPost, setNewPost] = useState<Post>(getDefaultPost()); // State to hold form data
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Loading state
    const navigate = useNavigate(); // Use React Router's navigate function for redirection.

    useEffect(() => {
        // Fetch the existing post data to edit
        const fetchPost = async () => {
            try {
                const response = await apiClient.get(`/api/posts/${post_id}`);
                setNewPost(response.data); // Populate state with fetched data
            } catch (err) {
                handleAxiosError(err, setError, navigate);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, []);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            // Make the PATCH request with Axios
            const response = await apiClient.patch(`/api/posts/${post_id}`, newPost);

            if (response.status === 200) {
                // Successfully created the post
                navigate("/posts/" + post_id); // Redirect to homepage or another page
            } else {
                setError("Failed to update post");
            }
        } catch (err) {
            handleAxiosError(err, setError, navigate);
        }
    };

    return (
        <>
            <h2>Edit Post</h2>
            {error && <p className="error">{error}</p>}
            {loading ? (
                <p>Loading...</p> // Display a loading message or spinner
            ) : (
                <TextInput newPost={newPost} setNewPost={setNewPost} handleSubmit={handleSubmit} />
            )}
        </>
    );
};

export default EditPost;

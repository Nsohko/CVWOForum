import Post from "../types/Post";
import apiClient, { handleAxiosError } from "../utils/apiClient";
import { RootState } from "../redux/Store"; // Import Redux RootState
import "../index.css";
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Button } from "@mui/material";
import { useSelector } from "react-redux";

interface PostDetailsProps {
    post: Post;
}

const PostDetails: React.FC<PostDetailsProps> = ({ post }: PostDetailsProps) => {
    const { post_id } = useParams<{ post_id: string }>();
    const navigate = useNavigate();

    const [error, setError] = useState<string | null>(null); // State to manage errors

    // Access user ID from Redux store
    const user = useSelector((state: RootState) => state.auth.user);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const isAuthor = isAuthenticated && (user?.isAdmin === 1 || user?.id === post.author); // Compare logged-in user ID with post author ID

    // Handle post deletion
    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await apiClient.delete(`/api/posts/${post_id}`);
                alert("Post deleted successfully!");
                navigate(`/${post.topic}`); // Redirect to home page after delete
            } catch (err) {
                handleAxiosError(err, setError, navigate);
                alert("Error deleting post");
            }
        }
    };

    return (
        <>
            <div style={{ width: "80vw", margin: "50px auto", marginBottom: "25px" }}>
                <Card
                    style={{
                        padding: "1rem",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        border: "2px solid #ccc",
                    }}
                >
                    <CardContent>
                        <Typography
                            variant="subtitle2"
                            style={{
                                color: "#ff5722",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                marginBottom: "4px",
                                fontSize: "0.875rem",
                            }}
                        >
                            {post.topic}
                        </Typography>
                        <Typography variant="h5" component="h5">
                            {post.title}
                        </Typography>
                        <Typography color="textSecondary" gutterBottom>
                            {`by ${post.username}`}
                        </Typography>
                        <Typography color="textSecondary" style={{ marginBottom: "1rem" }}>
                            Posted on:{" "}
                            {new Date(post.created_at).toLocaleString(undefined, {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })}
                        </Typography>
                        <Typography variant="body1" component="p">
                            {post.content}
                        </Typography>
                    </CardContent>
                </Card>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
                    {/* Conditionally render Edit and Delete buttons */}
                    {isAuthor && (
                        <>
                            <Link to={`/posts/edit/${post.id}`}>
                                <Button variant="contained" color="primary">
                                    Edit Post
                                </Button>
                            </Link>
                            <Button variant="contained" color="error" onClick={handleDelete}>
                                Delete
                            </Button>
                        </>
                    )}
                    <Link to={`/topics/${post.topic}`}>
                        <Button variant="contained" color="secondary">
                            Back to posts
                        </Button>
                    </Link>
                    <Button variant="contained" color="secondary" onClick={() => navigate(-1)}>
                        Go Back
                    </Button>
                </div>
            </div>
            {error && <p className="error">{error}</p>}
        </>
    );
};

export default PostDetails;

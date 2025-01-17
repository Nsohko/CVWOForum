import PostComment, { getDefaultPostComment } from "../types/Comment";
import apiClient, { handleAxiosError } from "../utils/apiClient";
import { RootState } from "../redux/Store"; // Import Redux RootState
import "../index.css";
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { IconButton, Typography, Card, CardContent, Button, Box } from "@mui/material";
import { useSelector } from "react-redux";
import { Reply, Edit, Delete } from "@mui/icons-material";

// Individual Comment Component
interface CommentProps {
    comment: PostComment;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
    const [error, setError] = useState<string | null>(null); // State to manage errors
    const location = useLocation();
    const navigate = useNavigate(); // Use React Router"s navigate function for redirection.

    const [editing, setEditing] = useState<boolean>(false);
    const [replying, setReplying] = useState<boolean>(false); // State for reply input toggle
    const [newComment, setNewComment] = useState<PostComment>(getDefaultPostComment());

    // Access user ID from Redux store
    const user = useSelector((state: RootState) => state.auth.user);

    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const isAuthor = isAuthenticated && (user?.isAdmin === 1 || user?.id === comment.author); // Compare logged-in user ID with post author ID

    // Handle comment deletion
    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            try {
                await apiClient.delete(`/api/posts/${comment.post_id}/comments/${comment.id}`);
                alert("Comment deleted successfully!");

                // Check if the current page is the parent comment"s page
                if (location.pathname === `/posts/${comment.post_id}/comments/${comment.id}`) {
                    // If we are on the comment page of the parent comment, navigate to the post itself
                    navigate(`/posts/${comment.post_id}`);
                } else {
                    // Otherwise, reload the page or navigate back to the comments section
                    navigate(0);
                }
            } catch (err) {
                handleAxiosError(err, setError, navigate);
            }
        }
    };

    // Handle comment edit
    const handleEdit = async () => {
        try {
            if (editing) {
                // Submit the edited comment
                const updatedComment = { ...comment }; // Create a copy to avoid directly mutating state
                updatedComment.content = newComment.content;

                const response = await apiClient.patch(
                    `/api/posts/${comment.post_id}/comments/${comment.id}`,
                    updatedComment,
                );
                if (response.status === 200) {
                    // Successfully created the comment
                    setEditing(false); // Exit edit mode
                    navigate(0);
                } else {
                    setError("Failed to create comment");
                }
            } else {
                // Enter edit mode
                setNewComment({ ...comment });
                setEditing(true);
            }
        } catch (err) {
            handleAxiosError(err, setError, navigate);
        }
    };

    // Handle comment reply
    const handleReply = async () => {
        if (!isAuthenticated || user == null) {
            navigate("/login");
            return;
        }
        if (replying) {
            try {
                const updatedComment = { ...newComment }; // Create a copy to avoid directly mutating state
                updatedComment.post_id = comment.post_id;
                updatedComment.parent_id = comment.id;
                updatedComment.author = user.id;
                updatedComment.created_at = new Date().toISOString();

                const response = await apiClient.post(
                    `/api/posts/${comment.post_id}/comments/${comment.id}`,
                    updatedComment,
                );

                if (response.status === 201) {
                    alert("Reply posted successfully!");
                    setReplying(false); // Exit reply mode
                    navigate(0);
                } else {
                    setError("Failed to post reply");
                }
            } catch (err) {
                handleAxiosError(err, setError, navigate);
            }
        } else {
            // Enter reply mode (show input field)
            setReplying(true);
        }
    };

    // Cancel the edit and reset the content
    const handleCancel = () => {
        setNewComment(getDefaultPostComment()); // Reset the content to the original value
        setEditing(false); // Exit edit mode
        setReplying(false);
    };

    return (
        <>
            <div>
                <Card
                    style={{
                        marginBottom: "16px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        border: "2px solid #ccc",
                        transition: "all 0.2s ease-in-out",
                        padding: "0px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                    <CardContent>
                        {error && <p className="error">{error}</p>}
                        {editing ? (
                            <>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "100%",
                                    }}
                                >
                                    <textarea
                                        value={newComment.content}
                                        onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                                        placeholder="Edit comment..."
                                        style={{
                                            width: "calc(100% - 16px)",
                                            height: "80px",
                                            padding: "8px",
                                            marginBottom: "8px",
                                            borderRadius: "8px",
                                            border: "2px solid #ccc",
                                            outline: "none",
                                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                            transition: "all 0.2s ease-in-out",
                                            fontSize: "14px",
                                            resize: "none",
                                            margin: "8px",
                                        }}
                                    />
                                </div>
                                <Button onClick={handleEdit} variant="outlined" size="small" style={{ marginRight: 1 }}>
                                    Save
                                </Button>
                                <Button onClick={handleCancel} variant="outlined" size="small" color="error">
                                    Cancel
                                </Button>
                            </>
                        ) : replying ? (
                            <>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "100%",
                                    }}
                                >
                                    <textarea
                                        value={newComment.content}
                                        onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                                        placeholder="Write a reply..."
                                        style={{
                                            width: "calc(100% - 16px)",
                                            height: "80px",
                                            padding: "8px",
                                            marginBottom: "8px",
                                            borderRadius: "8px",
                                            border: "2px solid #ccc",
                                            outline: "none",
                                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                            transition: "all 0.2s ease-in-out",
                                            fontSize: "14px",
                                            resize: "none",
                                            margin: "8px",
                                        }}
                                    />
                                </div>
                                <Button onClick={handleReply} variant="outlined" size="small">
                                    Post Reply
                                </Button>
                                <Button onClick={handleCancel} variant="outlined" size="small" color="error">
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <>
                                <Box style={{ display: "flex", alignItems: "center" }}>
                                    <Box style={{ flex: 1 }}>
                                        <Link
                                            to={`/posts/${comment.post_id}/comments/${comment.id}`}
                                            style={{ textDecoration: "none" }}
                                        >
                                            <Typography
                                                variant="body2"
                                                style={{ marginBottom: "1px", fontSize: "1.25rem", color: "black" }}
                                            >
                                                {comment.content}
                                            </Typography>
                                            <br />
                                            <Typography variant="body2" style={{ fontSize: "0.85rem", color: "black" }}>
                                                Posted by {comment.username} on{" "}
                                                {new Date(comment.created_at).toLocaleString(undefined, {
                                                    year: "numeric",
                                                    month: "2-digit",
                                                    day: "2-digit",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })}
                                            </Typography>
                                            <Button>View Replies</Button>
                                        </Link>
                                    </Box>
                                    <Box
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-end",
                                            marginLeft: "8px",
                                        }}
                                    >
                                        <IconButton
                                            onClick={handleReply}
                                            size="small"
                                            style={{ marginBottom: "4px" }}
                                            color="primary"
                                        >
                                            <Reply />
                                        </IconButton>
                                        {isAuthor && (
                                            <>
                                                <IconButton
                                                    onClick={handleEdit}
                                                    size="small"
                                                    style={{ marginBottom: "4px" }}
                                                    color="primary"
                                                >
                                                    <Edit />
                                                </IconButton>
                                                <IconButton onClick={handleDelete} size="small" color="error">
                                                    <Delete />
                                                </IconButton>
                                            </>
                                        )}
                                    </Box>
                                </Box>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default Comment;

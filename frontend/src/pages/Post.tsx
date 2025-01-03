import Post, { getDefaultPost } from "../types/Post";
import PostComment, { getDefaultPostComment } from "../types/Comment";
import PostDetails from "../components/PostDetails";
import CommentList from "../components/CommentList";
import apiClient, { handleAxiosError } from "../utils/apiClient";
import { RootState } from "../redux/Store"; // Import RootState for Redux
import "../index.css";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // For navigation
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useSelector } from "react-redux";

const Posts: React.FC = () => {
    const { post_id } = useParams<{ post_id: string }>();
    const navigate = useNavigate();

    // Check if user is authenticated using Redux state
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    const [post, setPost] = useState<Post>(getDefaultPost()); // State to hold posts
    const [comments, setComments] = useState<PostComment[]>([]); // State to hold posts

    const [loading, setLoading] = useState<boolean>(true); // State to manage loading state
    const [error, setError] = useState<string | null>(null); // State to manage errors

    const [open, setOpen] = useState<boolean>(false); // State to toggle the comment form visibility

    // Initialize `newComment` with post_id from params or default to 0 if undefined
    const [newComment, setNewComment] = useState<PostComment>(getDefaultPostComment()); // Set the post_id from URL params or default to 0

    const user = useSelector((state: RootState) => state.auth.user);

    // Fetch post from the backend
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const postResponse = await apiClient.get(`/api/posts/${post_id}`);
                setPost(postResponse.data); // Update post state with fetched data

                const commentsResponse = await apiClient.get(`/api/posts/${post_id}/comments`);
                setComments(commentsResponse.data); // Update post state with fetched data
            } catch (err) {
                handleAxiosError(err, setError, navigate);
            } finally {
                setLoading(false); // Stop loading state
            }
        };

        fetchPost();
    }, []); // Empty dependency array to run this effect only once on component mount

    // Handle adding a comment
    const handleAddComment = async () => {
        try {
            if (user == null) {
                setError("Not logged in");
                return;
            }

            const updatedComment = { ...newComment }; // Create a copy to avoid directly mutating state
            updatedComment.parent_id = post.id;
            updatedComment.author = user.id;
            updatedComment.created_at = new Date().toISOString();

            const response = await apiClient.post(`/api/posts/${post_id}/comments`, updatedComment);

            if (response.status === 201) {
                // Successfully created the comment
                alert("Comment added successfully!");

                // Add the new comment to the current comments state
                setComments((prevComments) => [...prevComments, response.data]);
                setNewComment(getDefaultPostComment); // Clear the comment input
                setOpen(false); // Close the comment form
            } else {
                setError("Failed to create post");
            }
        } catch (err) {
            handleAxiosError(err, setError, navigate);
            navigate(0);
        }
    };

    return (
        <>
            {error && <p className="error">{error}</p>}
            {loading ? (
                <p>Loading post...</p>
            ) : post ? (
                <>
                    <PostDetails post={post} />
                    {comments.length === 0 ? (
                        <Typography variant="h6">No comments</Typography>
                    ) : (
                        <Typography variant="h6">Comments</Typography>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => (isAuthenticated ? setOpen(true) : navigate("/login"))}
                        style={{ marginTop: "5px" }}
                    >
                        Add Comment
                    </Button>
                    <CommentList comments={comments} />
                </>
            ) : (
                <p>No post available.</p>
            )}
            {/* Add Comment Dialog */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                sx={{
                    "& .MuiDialog-paper": {
                        width: "600px",
                        maxWidth: "90%",
                    },
                }}
            >
                <DialogTitle>Add Comment</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Comment"
                        fullWidth
                        variant="outlined"
                        value={newComment.content}
                        onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                        multiline
                        rows={4}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddComment} color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Posts;

import Post, { getDefaultPost } from "../types/Post";
import PostComment, { getDefaultPostComment } from "../types/Comment";
import CommentDetails from "../components/CommentDetails";
import PostDetails from "../components/PostDetails";
import apiClient, { handleAxiosError } from "../utils/apiClient";
import "../index.css";
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@mui/material";

// Page to render Post, one parent comment and its subcomments
const ParentComment: React.FC = () => {
    const { post_id } = useParams<{ post_id: string }>();
    const { comment_id } = useParams<{ comment_id: string }>();

    const [post, setPost] = useState<Post>(getDefaultPost()); // State to hold posts
    const [parentComment, setParentComment] = useState<PostComment>(getDefaultPostComment());
    const [subComments, setSubComments] = useState<PostComment[]>([]); // State to hold posts

    const [loading, setLoading] = useState<boolean>(true); // State to manage loading state
    const [error, setError] = useState<string | null>(null); // State to manage errors

    // Fetch post from the backend
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const postResponse = await apiClient.get(`/api/posts/${post_id}`);
                setPost(postResponse.data); // Update post state with fetched data

                const parentCommentResponse = await apiClient.get(`/api/posts/${post_id}/comments/${comment_id}`);
                setParentComment(parentCommentResponse.data); // Update parent comment state with fetched data

                const subCommentsResponse = await apiClient.get(
                    `/api/posts/${post_id}/comments/${comment_id}/subcomments`,
                );
                setSubComments(subCommentsResponse.data); // Update subcomment state with fetched data
            } catch (err) {
                handleAxiosError(err, setError);
            } finally {
                setLoading(false); // Stop loading state
            }
        };

        fetchPost();
    }, [comment_id]);

    return (
        <>
            <h2>
                {error && <p className="error">{error}</p>}
                {loading ? (
                    <p>Loading post...</p>
                ) : post ? (
                    <>
                        <PostDetails post={post} />
                        <CommentDetails parentComment={parentComment} subComments={subComments} />
                    </>
                ) : (
                    <p>No post available.</p>
                )}
                <Link to={`/posts/${post_id}`}>
                    <Button variant="contained" color="secondary">
                        Back to post
                    </Button>
                </Link>
            </h2>
        </>
    );
};

export default ParentComment;

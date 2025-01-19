import Post from "../types/Post";
import { Card, CardContent, Typography, CardActions, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import { ChatBubbleOutline } from "@mui/icons-material";
import React from "react";

interface PostListProps {
    posts: Post[];
}

// Display a list of posts
const PostList: React.FC<PostListProps> = ({ posts }: PostListProps) => {
    return (
        <div style={{ width: "80vw", maxWidth: "1200px", margin: "auto" }}>
            {posts.map((post) => (
                <Link key={post.id} to={`/posts/${post.id}`} style={{ textDecoration: "none" }}>
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
                        <CardContent style={{ paddingBottom: "0px" }}>
                            {/* Topic Display */}
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
                            <Typography
                                variant="h5"
                                component="h2"
                                style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "1.25rem" }}
                            >
                                {post.title}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="textSecondary"
                                style={{ marginBottom: "4px", fontSize: "0.9rem" }}
                            >
                                - {post.username}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="textSecondary"
                                style={{ marginBottom: "0px", fontSize: "0.9rem" }}
                            >
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
                        </CardContent>

                        <CardActions style={{ padding: "0px 16px" }}>
                            <IconButton style={{ marginLeft: "auto" }}>
                                <ChatBubbleOutline />
                            </IconButton>
                            <Typography variant="body2" color="textSecondary">
                                Comments
                            </Typography>
                        </CardActions>
                    </Card>
                </Link>
            ))}
        </div>
    );
};

export default PostList;

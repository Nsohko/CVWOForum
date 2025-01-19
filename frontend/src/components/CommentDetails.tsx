import CommentList from "./CommentList";
import Comment from "./Comment";
import PostComment from "../types/Comment";
import React from "react";
import { Typography } from "@mui/material";

interface CommentDetailsProps {
    parentComment: PostComment; // The parent comment
    subComments: PostComment[]; // The array of subcomments
}

// Display a parent comment and all its subcomments
const CommentDetails: React.FC<CommentDetailsProps> = ({ parentComment, subComments }) => {
    return (
        <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
            <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                <Comment comment={parentComment} />
            </div>
            {subComments.length === 0 ? (
                <Typography variant="h6">No replies</Typography>
            ) : (
                <Typography variant="h6">Replies</Typography>
            )}
            <div style={{ fontSize: "0.9rem" }}>
                <CommentList comments={subComments} />
            </div>
        </div>
    );
};

export default CommentDetails;

import Comment from "./Comment";
import PostComment from "../types/Comment";

import React from "react";
import { List } from "@mui/material";

interface CommentListProps {
    comments: PostComment[];
}

// display a list of comments
const CommentList: React.FC<CommentListProps> = ({ comments }: CommentListProps) => {
    return (
        <div style={{ width: "30vw", margin: "auto" }}>
            {/* Comments Section */}
            {comments && comments.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                    {comments.map((comment) => (
                        <List key={comment.id}>
                            <Comment comment={comment} />
                        </List>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentList;

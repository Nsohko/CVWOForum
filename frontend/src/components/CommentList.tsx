import Comment from "./Comment";
import PostComment from "../types/Comment";

import React from "react";

interface CommentListProps {
    comments: PostComment[];
}

// display a list of comments
const CommentList: React.FC<CommentListProps> = ({ comments }: CommentListProps) => {
    return (
        <div style={{ width: "30%", margin: "auto" }}>
            {/* Comments Section */}
            {comments && comments.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                    {comments.map((comment) => (
                        <Comment key={comment.id} comment={comment} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentList;

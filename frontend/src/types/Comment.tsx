// Define the post type
type PostComment = {
    id: number;
    post_id: number;
    parent_id: number;
    author: number;
    username: string;
    content: string;
    created_at: string;
};

// Utility function to initialize default values
export const getDefaultPostComment = (): PostComment => {
    return {
        id: -1,
        post_id: -1,
        parent_id: -1,
        author: -1,
        username: "",
        content: "",
        created_at: new Date().toISOString(),
    };
};

export default PostComment;

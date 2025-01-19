// Represents a post
type Post = {
    id: number;
    title: string;
    topic: string;
    content: string;
    author: number;
    username: string;
    created_at: string;
};

// Utility function to initialize default placeholder post
export const getDefaultPost = (): Post => {
    return {
        id: -1,
        title: "",
        topic: "",
        content: "",
        author: -1,
        username: "",
        created_at: new Date().toISOString(),
    };
};

export default Post;

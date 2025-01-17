// Define the post type
type PostTopic = {
    topic_name: string;
};

// Utility function to initialize default values
export const getDefaultPostTopic = (): PostTopic => {
    return {
        topic_name: "",
    };
};

export default PostTopic;

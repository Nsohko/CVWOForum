// Represents a topic
type PostTopic = {
    topic_name: string;
};

// Utility function to initialize default placeholder topic
export const getDefaultPostTopic = (): PostTopic => {
    return {
        topic_name: "",
    };
};

export default PostTopic;

// Define the post type
type User = {
    id: number;
    username: string;
    password: string;
    isAdmin: number;
};

// Utility function to initialize default values
export const getDefaultUser = (): User => {
    return {
        id: -1,
        username: "",
        password: "",
        isAdmin: 0,
    };
};

export default User;

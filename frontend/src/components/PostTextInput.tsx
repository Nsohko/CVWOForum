import Post from "../types/Post";
import PostTopic from "../types/PostTopic";
import apiClient, { handleAxiosError } from "../utils/apiClient";
import { Button, TextField, Box, Container, Paper, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface TextInputProps {
    newPost: Post;
    setNewPost: React.Dispatch<React.SetStateAction<Post>>;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const TextInput: React.FC<TextInputProps> = ({ newPost, setNewPost, handleSubmit }: TextInputProps) => {
    const [topics, setTopics] = useState<PostTopic[]>([]);
    const [loading, setLoading] = useState<boolean>(true); // State to manage loading state
    const [error, setError] = useState<string | null>(null); // State to manage errors
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = (location.state as { from: string })?.from || "/";

    // Fetch posts from the backend
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await apiClient.get(`/api/topics`);
                setTopics(response.data); // Update posts state with fetched data
            } catch (err) {
                handleAxiosError(err, setError);
            } finally {
                setLoading(false); // Stop loading state
            }
        };

        fetchTopics();
    }, []); // Empty dependency array to run this effect only once on component mount

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewPost({
            ...newPost,
            [name]: value,
        });
    };

    return (
        <>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : (
                <Container maxWidth="sm" style={{ marginTop: "2rem" }}>
                    <Paper elevation={3} style={{ padding: "2rem" }}>
                        <form onSubmit={handleSubmit}>
                            <Box marginBottom={2}>
                                <TextField
                                    fullWidth
                                    label="Title"
                                    name="title"
                                    value={newPost.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Box>
                            <Box marginBottom={2}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Content"
                                    name="content"
                                    value={newPost.content}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Box>
                            <Box marginBottom={2}>
                                <FormControl fullWidth required>
                                    <InputLabel>Topic</InputLabel>
                                    <Select
                                        name="topic"
                                        value={newPost.topic || ""}
                                        onChange={(e) =>
                                            setNewPost({
                                                ...newPost,
                                                topic: e.target.value as string, // Use direct inline handler
                                            })
                                        }
                                    >
                                        {topics.map((topic) => (
                                            <MenuItem key={topic.topic_name} value={topic.topic_name}>
                                                {topic.topic_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box display="flex" justifyContent="space-between" marginTop={2}>
                                <Button type="submit" variant="contained" color="primary">
                                    Submit
                                </Button>
                                <Button variant="outlined" color="secondary" onClick={() => navigate(redirectTo)}>
                                    Cancel
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                </Container>
            )}
        </>
    );
};

export default TextInput;

import Post from "../types/Post";

import { Button, TextField, Box, Container, Paper } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

interface TextInputProps {
    newPost: Post;
    setNewPost: React.Dispatch<React.SetStateAction<Post>>;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const TextInput: React.FC<TextInputProps> = ({ newPost, setNewPost, handleSubmit }: TextInputProps) => {
    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewPost({
            ...newPost,
            [name]: value,
        });
    };

    return (
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
                    <Box display="flex" justifyContent="space-between" marginTop={2}>
                        <Button type="submit" variant="contained" color="primary">
                            Submit
                        </Button>
                        <Link to="/" style={{ textDecoration: "none" }}>
                            <Button variant="outlined" color="secondary">
                                Cancel
                            </Button>
                        </Link>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default TextInput;

import PostList from "../components/PostList";
import Post from "../types/Post";
import apiClient, { handleAxiosError } from "../utils/apiClient";
import "../index.css";
import React, { useEffect, useState } from "react";
import { Button, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]); // State to hold posts
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true); // State to manage loading state
    const [error, setError] = useState<string | null>(null); // State to manage errors
    const [searchTerm, setSearchTerm] = useState<string>(""); // State for search term
    const [sortBy, setSortBy] = useState<string>("date"); // State for sort criteria

    // Fetch posts from the backend
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await apiClient.get("/api/posts");
                setPosts(response.data); // Update posts state with fetched data
            } catch (err) {
                handleAxiosError(err, setError);
            } finally {
                setLoading(false); // Stop loading state
            }
        };

        fetchPosts();
    }, []); // Empty dependency array to run this effect only once on component mount

    // Filter and sort posts based on search term and sort criteria
    useEffect(() => {
        let filtered = posts.filter(
            (post) =>
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.content.toLowerCase().includes(searchTerm.toLowerCase()),
        );

        // Sort the filtered posts based on the selected criterion
        if (sortBy === "date") {
            filtered = filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (sortBy === "title") {
            filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
        }

        setFilteredPosts(filtered);
    }, [searchTerm, sortBy, posts]); // Re-run whenever searchTerm, sortBy, or posts change

    return (
        <>
            <h3>Welcome to Sai forum.</h3>
            <Link to="/create-post" style={{ textDecoration: "none" }}>
                <Button variant="contained" color="secondary">
                    Create a Post
                </Button>
            </Link>
            <br />
            <br />
            {/* Search Bar */}
            <TextField
                label="Search"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: "20px", width: "30%" }}
            />
            {/* Sort By Dropdown */}
            <FormControl style={{ marginBottom: "20px", width: "15%" }}>
                <InputLabel>Sort By</InputLabel>
                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sort By">
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="title">Title</MenuItem>
                </Select>
            </FormControl>
            <br />
            {/* Render loading, error, or the posts */}
            {loading ? (
                <p>Loading posts...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : (
                <PostList posts={filteredPosts} />
            )}
        </>
    );
};

export default Home;

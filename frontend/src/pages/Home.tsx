import PostTopic, { getDefaultPostTopic } from "../types/PostTopic";
import Topic from "../components/Topic";
import { RootState } from "../redux/Store";
import apiClient, { handleAxiosError } from "../utils/apiClient";
import "../index.css";
import React, { useEffect, useState } from "react";
import { Button, TextField } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Home page with list of topics
const Home: React.FC = () => {
    const [topics, setTopics] = useState<PostTopic[]>([]); // State to hold topics
    const [newTopic, setNewTopic] = useState<PostTopic>(getDefaultPostTopic());
    const [loading, setLoading] = useState<boolean>(true); // State to manage loading state
    const [error, setError] = useState<string | null>(null); // State to manage errors
    const navigate = useNavigate();

    const user = useSelector((state: RootState) => state.auth.user);
    const isAdmin = user?.isAdmin === 1;

    // Fetch topics from the backend
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await apiClient.get(`/api/topics`);
                setTopics(response.data); // Update topics state with fetched data
            } catch (err) {
                handleAxiosError(err, setError);
            } finally {
                setLoading(false); // Stop loading state
            }
        };

        fetchTopics();
    }, []); // Empty dependency array to run this effect only once on component mount

    // Function to add a new topic
    const handleAddTopic = async () => {
        if (!isAdmin) {
            alert("No permission!");
            return;
        }
        if (newTopic.topic_name === "") {
            alert("Please provide a valid topic name");
            return;
        }
        try {
            const response = await apiClient.post(`/api/topics`, newTopic);
            setTopics((prev) => [...prev, response.data]); // Add new topic to the state
            setNewTopic(getDefaultPostTopic()); // Reset input field
        } catch (err) {
            handleAxiosError(err, setError, navigate);
        }
    };

    // Function to delete a topic
    const handleDeleteTopic = async (topic: PostTopic) => {
        if (!isAdmin) {
            alert("No permission!");
            return;
        }
        if (window.confirm("Are you sure you want to delete this topic?")) {
            try {
                await apiClient.delete(`/api/topics/${topic.topic_name}`);
                alert("Topic deleted successfully!");
                setTopics((prev) => prev.filter((t) => t.topic_name !== topic.topic_name)); // Remove topic from the state
            } catch (err) {
                handleAxiosError(err, setError, navigate);
            }
        }
    };

    return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            <h2>Welcome to Sai forum.</h2>

            <Link to="/create-post" style={{ textDecoration: "none" }}>
                <Button variant="contained" color="secondary">
                    Create a Post
                </Button>
            </Link>
            <br />
            <br />
            <div style={{ width: "80vw", maxWidth: "800px", margin: "auto" }}>
                <Topic title="View All Posts" link="/topics/" />
            </div>
            <br />
            <h3>Discussion Topics</h3>
            {/* Render loading, error, or the posts */}
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : (
                <div>
                    {isAdmin && (
                        <div>
                            <TextField
                                label="Create Topic"
                                value={newTopic.topic_name}
                                onChange={(e) => setNewTopic({ topic_name: e.target.value })}
                                variant="outlined"
                                size="small"
                                required
                            />
                            <Button
                                onClick={handleAddTopic}
                                variant="contained"
                                color="primary"
                                style={{ marginLeft: "10px" }}
                            >
                                Add Topic
                            </Button>
                            <br />
                            <br />
                        </div>
                    )}
                    {topics.map((topic) => (
                        <div
                            key={topic.topic_name}
                            style={{
                                display: "flex",
                                justifyContent: "center", // Center horizontally
                                alignItems: "center", // Center vertically (optional)
                                marginBottom: "10px",
                            }}
                        >
                            <div style={{ width: "100%", maxWidth: "400px", textAlign: "center" }}>
                                <Topic title={topic.topic_name} link={`/topics/${topic.topic_name}`} />
                            </div>
                            {isAdmin && (
                                <Button
                                    onClick={() => handleDeleteTopic(topic)}
                                    variant="contained"
                                    color="secondary"
                                    size="small"
                                    style={{ marginLeft: "10px" }}
                                >
                                    Delete
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;

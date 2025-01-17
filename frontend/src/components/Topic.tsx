import "../index.css";
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, Typography } from "@mui/material";

// Reusable Card Component
interface TopicProps {
    title: string;
    link: string;
}

const Topic: React.FC<TopicProps> = ({ title, link }) => {
    return (
        <Link to={link} style={{ textDecoration: "none" }}>
            <Card
                style={{
                    marginBottom: "16px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    border: "2px solid #ccc",
                    transition: "all 0.2s ease-in-out",
                    padding: "0px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
                <CardContent style={{ paddingBottom: "0px" }}>
                    <Typography
                        variant="h5"
                        component="h2"
                        style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "1.25rem" }}
                    >
                        {title}
                    </Typography>
                </CardContent>
            </Card>
        </Link>
    );
};

export default Topic;

import React from "react";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
    return (
        <div>
            <h1>404 - Page Not Found</h1>
            <p>Oops! The page / resource you are looking for does not exist.</p>
            <Link to="/" style={{ textDecoration: "none" }}>
                <Button variant="contained" color="secondary">
                    Back to home
                </Button>
            </Link>
        </div>
    );
};

export default NotFoundPage;

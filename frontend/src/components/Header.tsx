import { RootState } from "../redux/Store";
import { logout } from "../redux/AuthSlice";
import apiClient from "../utils/apiClient";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Button, AppBar, Toolbar, Typography, Box } from "@mui/material";

const Header: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated) && user != null;
    const dispatch = useDispatch();
    const location = useLocation();

    const handleLogout = async () => {
        await apiClient.get(`/api/logout`);
        dispatch(logout());
    };

    return (
        <AppBar position="static">
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box
                    sx={{
                        width: "33%",
                        display: "flex",
                        justifyContent: "flex-start",
                        gap: 1,
                    }}
                >
                    {isAuthenticated && <Typography>Welcome, {user.username}</Typography>}
                </Box>
                <Typography
                    variant="h6"
                    sx={{
                        width: "33%",
                        textAlign: "center",
                    }}
                >
                    <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
                        Sai Forum
                    </Link>
                </Typography>

                <Box
                    sx={{
                        width: "33%",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                    }}
                >
                    {isAuthenticated ? (
                        <Link to="/">
                            <Button color="inherit" onClick={handleLogout}>
                                Logout
                            </Button>
                        </Link>
                    ) : (
                        <>
                            {location.pathname !== "/create_account" && (
                                <Link to="/create_account">
                                    <Button color="inherit">Create Account</Button>
                                </Link>
                            )}
                            {location.pathname !== "/login" && (
                                <Link to="/login">
                                    <Button color="inherit">Login</Button>
                                </Link>
                            )}
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;

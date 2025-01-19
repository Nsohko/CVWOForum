import { RootState } from "../redux/Store";
import { logout } from "../redux/AuthSlice";
import apiClient from "../utils/apiClient";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Button, AppBar, Toolbar, Typography } from "@mui/material";

// the header for the app
const Header: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated) && user != null; // Checks if user is authenticated
    const dispatch = useDispatch();
    const location = useLocation();

    const handleLogout = async () => {
        await apiClient.get(`/api/logout`);
        dispatch(logout()); // Dispatch the logout action
    };

    return (
        <AppBar position="static">
            <Toolbar>
                {isAuthenticated ? <>{user.username}</> : <></>}
                <Typography variant="h6" align="center" style={{ flexGrow: 1 }}>
                    <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
                        Sai Forum
                    </Link>
                </Typography>
                {isAuthenticated ? (
                    <>
                        <br />
                        <Link to="/">
                            <Button color="inherit" onClick={handleLogout}>
                                Logout
                            </Button>
                        </Link>
                    </>
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
            </Toolbar>
        </AppBar>
    );
};

export default Header;

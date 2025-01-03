import User from "../types/User";
import React from "react";
import { Button, TextField, Box, Container, Paper } from "@mui/material";

interface AccountInputProps {
    userData: User;
    setUserData: React.Dispatch<React.SetStateAction<User>>;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    action: string;
}

const AccountInput: React.FC<AccountInputProps> = ({
    userData,
    setUserData,
    handleSubmit,
    action,
}: AccountInputProps) => {
    // Handle changes in the form inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
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
                            label="Username"
                            id="username"
                            name="username"
                            value={userData.username}
                            onChange={handleChange}
                            required
                        />
                    </Box>
                    <Box marginBottom={2}>
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            id="password"
                            name="password"
                            value={userData.password}
                            onChange={handleChange}
                            required
                        />
                    </Box>
                    <Box display="flex" justifyContent="center" marginTop={2}>
                        <Button type="submit" variant="contained" color="primary">
                            {action}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default AccountInput;

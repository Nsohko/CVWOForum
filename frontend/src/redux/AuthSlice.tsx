import User from "../types/User";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// AuthState consists of userData
// and isAuntheticated to track authentication
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}

// Initllay, no userData will be stored
// and the user will not be authenticated
const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
};

// Create a reduc slice
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (state, action: PayloadAction<{ user: User }>) => {
            action.payload.user.password = ""; // clear sensitive information, in case
            state.user = action.payload.user;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;

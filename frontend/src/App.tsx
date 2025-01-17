import Header from "./components/Header";
import Home from "./pages/Home";
import TopicPosts from "./pages/TopicPosts";
import CreatePost from "./pages/CreatePost";
import Post from "./pages/Post";
import EditPost from "./pages/EditPost";
import ParentComment from "./pages/ParentComment";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import NotFoundPage from "./pages/NotFoundPage";
import RequireAuth from "./components/ProtectedRoute";

import React from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { blue, orange } from "@mui/material/colors";

const theme = createTheme({
    palette: {
        primary: blue,
        secondary: orange,
    },
});

const App: React.FC = () => {
    return (
        <div className="App">
            <ThemeProvider theme={theme}>
                <BrowserRouter>
                    <Header />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/topics/" element={<TopicPosts />} />
                        <Route path="/topics/:topic" element={<TopicPosts />} />
                        <Route path="/posts/:post_id" element={<Post />} />
                        <Route path="/posts/:post_id/comments/:comment_id" element={<ParentComment />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/create_account" element={<CreateAccount />} />

                        <Route element={<RequireAuth />}>
                            <Route path="/create-post" element={<CreatePost />} />
                            <Route path="/posts/edit/:post_id" element={<EditPost />} />
                        </Route>
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </div>
    );
};

export default App;

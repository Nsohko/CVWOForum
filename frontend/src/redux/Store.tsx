import authReducer from "./AuthSlice";
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Persist config for the auth slice
const persistConfig = {
    key: "auth", // The key to store the persisted state
    storage, // This uses localStorage by default
};

// Persist the auth reducer
const persistedAuthReducer = persistReducer(persistConfig, authReducer);

// Root store configuration
const store = configureStore({
    reducer: {
        auth: persistedAuthReducer, // Persisted authentication slice
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Disable warnings for non-serializable data if needed
        }),
});

// Create a persistor instance
const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>; // Type for RootState
export type AppDispatch = typeof store.dispatch; // Type for AppDispatch

export { store, persistor };

import authReducer from "./AuthSlice";
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Persist config for the auth slice on browser close
const persistConfig = {
    // The key to store the persisted state
    key: "auth",
    // This uses localStorage by default, which is okay since sensitive info isnt being stored
    // The password is manually cleared, and the JWT token is stored as http-only cookie
    storage,
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
            serializableCheck: false,
        }),
});

// Create a persistor instance
const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>; // Type for RootState
export type AppDispatch = typeof store.dispatch; // Type for AppDispatch

export { store, persistor };

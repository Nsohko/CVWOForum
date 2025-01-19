package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"sample-go-app/internal/auth"
	db "sample-go-app/internal/database"
	"sample-go-app/internal/models"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/jwtauth/v5"

	"golang.org/x/crypto/bcrypt"
)

// Create a new account
func CreateAccount(w http.ResponseWriter, r *http.Request) {
	// Parse the username and unhashed password into a new user
	var newAccount models.User
	if err := json.NewDecoder(r.Body).Decode(&newAccount); err != nil {
		http.Error(w, `{"error": "Invalid input"}`, http.StatusBadRequest)
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newAccount.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, `{"error": "Failed to hash password"}`, http.StatusInternalServerError)
		return
	}

	// Update the password with the hashed version
	newAccount.Password = string(hashedPassword)

	// Insert the new user into the database
	_, err = db.DB.Exec("INSERT INTO users (username, password) VALUES (?, ?)", newAccount.Username, newAccount.Password)
	if err != nil {
		// Check for a UNIQUE constraint violation using error message
		// This ensures no duplication of username
		if strings.Contains(err.Error(), "UNIQUE constraint failed: users.username") {
			http.Error(w, `{"error": "This username is already taken. Please choose another one"}`, http.StatusConflict)
			return
		}

		// Generic internal server error for other issues
		http.Error(w, `{"error": "Failed to create account"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"message": "Account created successfully"}`))
}

// Login user
func Login(w http.ResponseWriter, r *http.Request) {
	// Parse the username and unhashed password
	var account models.User
	if err := json.NewDecoder(r.Body).Decode(&account); err != nil {
		http.Error(w, `{"error": "Invalid input"}`, http.StatusBadRequest)
		return
	}

	// Get the user info currently stored in the database
	row := db.DB.QueryRow("SELECT id, username, password, isAdmin FROM users WHERE username = ?", account.Username)
	storedAccount := models.User{}
	// Scan the result into the struct
	if err := row.Scan(&storedAccount.ID, &storedAccount.Username, &storedAccount.Password, &storedAccount.IsAdmin); err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, `{"error": "User not found"}`, http.StatusNotFound)
		} else {
			http.Error(w, `{"error": "Failed to get user"}`, http.StatusInternalServerError)
		}
		return
	}

	// Compare the entered password with the hashed password in the database
	err := bcrypt.CompareHashAndPassword([]byte(storedAccount.Password), []byte(account.Password))
	if err != nil {
		http.Error(w, `{"error": "Incorrect username / password"}`, http.StatusUnauthorized)
		return
	}

	// Clear any token currently in the cache
	auth.ClearTokenCookie(w)

	// Delete any sensitive info (password) before sending the user's details back
	storedAccount.Password = ""
	token, err := auth.GenerateToken(storedAccount)
	if err != nil {
		http.Error(w, `{"error": "Failed to generate token"}`, http.StatusInternalServerError)
		return
	}

	// set the JWT as a cookie
	auth.SetTokenCookie(w, token)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Login successful"}`))
}

// Logout user
func Logout(w http.ResponseWriter, r *http.Request) {
	// Clear any currently stored JWT cookies
	auth.ClearTokenCookie(w)
	w.Write([]byte(`{"message": "Logged out successfully"}`))
}

// Protected route to validate users upon log in
func Protected(w http.ResponseWriter, r *http.Request) {
	// Get the token
	_, claims, _ := jwtauth.FromContext(r.Context())
	// Retrieve userData from the claims
	userData, ok := claims["userData"].(map[string]interface{}) // Type assertion for nested data
	if !ok {
		http.Error(w, `{"error": "Invalid user data"}`, http.StatusUnauthorized)
		return
	}

	// Set response headers
	w.Header().Set("Content-Type", "application/json")

	// Send the userData object as JSON response
	if err := json.NewEncoder(w).Encode(userData); err != nil {
		http.Error(w, `{"error": "Failed to encode response"}`, http.StatusInternalServerError)
		return
	}
}

func GetUsernameByID(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "user_id")

	var username string
	err := db.DB.QueryRow("SELECT username FROM users WHERE id = ?", userID).Scan(&username)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, `{"error": "User not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error": "Failed to retrieve username"}`, http.StatusInternalServerError)
		return
	}

	// Send the username as JSON response
	response := map[string]string{"username": username}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, `{"error": "Failed to encode response"}`, http.StatusInternalServerError)
		return
	}
}

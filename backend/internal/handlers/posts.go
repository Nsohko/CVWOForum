package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	db "sample-go-app/internal/database"
	"sample-go-app/internal/models"

	"github.com/go-chi/chi/v5"
	_ "modernc.org/sqlite"
)

// Gets all posts in the database
func GetAllPosts(w http.ResponseWriter, r *http.Request) {
	// Query the database for posts
	rows, err := db.DB.Query(`
		SELECT p.id, p.title, p.topic, p.user_id, COALESCE(u.username, 'Unknown') AS username, p.created_at
		FROM posts p
		LEFT JOIN users u ON p.user_id = u.id
		ORDER BY p.created_at DESC
	`)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch posts"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Read the posts data into an array of posts
	posts := []models.Post{}
	for rows.Next() {
		var post models.Post
		if err := rows.Scan(&post.ID, &post.Title, &post.Topic, &post.Author, &post.Username, &post.CreatedAt); err != nil {
			http.Error(w, `{"error": "Failed to parse post data"}`, http.StatusInternalServerError)
			return
		}
		posts = append(posts, post)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(posts); err != nil {
		http.Error(w, `{"error": "Failed to encode posts"}`, http.StatusInternalServerError)
		return
	}
}

// Get all the posts associated with a relevant topic
func GetPostsByTopic(w http.ResponseWriter, r *http.Request) {
	// Extract the topic from the route parameter
	topic := chi.URLParam(r, "topic")

	// Query the database for posts matching the topic
	rows, err := db.DB.Query(`
		SELECT p.id, p.title, p.topic, p.user_id, COALESCE(u.username, 'Unknown') AS username, p.created_at
		FROM posts p
		LEFT JOIN users u ON p.user_id = u.id
		WHERE p.topic = ?
		ORDER BY p.created_at DESC
	`, topic)
	if err != nil {
		fmt.Println(err)
		http.Error(w, `{"error": "Failed to fetch posts"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Read the data into an array of posts
	posts := []models.Post{}
	for rows.Next() {
		var post models.Post
		if err := rows.Scan(&post.ID, &post.Title, &post.Topic, &post.Author, &post.Username, &post.CreatedAt); err != nil {
			http.Error(w, `{"error": "Failed to parse post data"}`, http.StatusInternalServerError)
			return
		}
		posts = append(posts, post)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(posts); err != nil {
		http.Error(w, `{"error": "Failed to encode posts"}`, http.StatusInternalServerError)
		return
	}
}

// Add a new post
func AddPost(w http.ResponseWriter, r *http.Request) {
	// Parse the request body into a Post
	post := &models.Post{}
	if err := json.NewDecoder(r.Body).Decode(post); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	post.CreatedAt = time.Now().UTC()
	if post.Content == "" || post.Title == "" {
		http.Error(w, `{"error": "Post title and content are required"}`, http.StatusBadRequest)
		return
	}

	// Insert post into DB
	res, err := db.DB.Exec("INSERT INTO posts (title, topic, content, user_id, created_at) VALUES (?, ?, ?, ?, ?)", post.Title, post.Topic, post.Content, post.Author, post.CreatedAt)
	if err != nil {
		http.Error(w, `{"error": "Failed to create post"}`, http.StatusInternalServerError)
		return
	}

	// Retrieve the last inserted ID
	id, _ := res.LastInsertId()
	post.ID = int(id)

	// Return the created post as JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(post); err != nil {
		http.Error(w, `{"error": "Failed to encode post data"}`, http.StatusInternalServerError)
	}
}

// Get the details of a specific post
func GetPostDetails(w http.ResponseWriter, r *http.Request) {
	// Extract the post ID from the route parameter
	id := chi.URLParam(r, "post_id")

	row := db.DB.QueryRow(`
		SELECT p.id, p.title, p.topic, p.content, p.user_id, COALESCE(u.username, 'Unknown') AS username, p.created_at
		FROM posts p
		LEFT JOIN users u ON p.user_id = u.id
		WHERE p.id = ?
	`, id)

	// Scan the result into a post
	post := models.Post{}
	if err := row.Scan(&post.ID, &post.Title, &post.Topic, &post.Content, &post.Author, &post.Username, &post.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, `{"error": "Post not found"}`, http.StatusNotFound)
		} else {
			http.Error(w, `{"error": "Failed to get post"}`, http.StatusInternalServerError)
		}
		return
	}

	// Set the response headers and return the post as JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(post); err != nil {
		http.Error(w, `{"error": "Failed to encode post"}`, http.StatusInternalServerError)
		return
	}
}

// Update an existing post
func UpdatePost(w http.ResponseWriter, r *http.Request) {
	// Extract the post ID from the route parameter
	id := chi.URLParam(r, "post_id")

	// Parse the request body into a Post model
	post := &models.Post{}
	if err := json.NewDecoder(r.Body).Decode(post); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	// Validate required fields
	if post.Content == "" || post.Title == "" {
		http.Error(w, `{"error": "Post title, topic and content are required"}`, http.StatusBadRequest)
		return
	}

	// Update the post in the database
	res, err := db.DB.Exec("UPDATE posts SET title = ?, topic = ?, content = ? WHERE id = ?", post.Title, post.Topic, post.Content, id)
	if err != nil || res == nil {
		http.Error(w, `{"error": "Failed to update post"}`, http.StatusInternalServerError)
		return
	}

	// Check if the post was found and updated
	affected, _ := res.RowsAffected()
	if affected == 0 {
		http.Error(w, `{"error": "Post not found"}`, http.StatusNotFound)
		return
	}

	// Send a success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true}`))
}

// Delete an existing post and its comments
func DeletePost(w http.ResponseWriter, r *http.Request) {
	// Extract the post ID from the route parameter
	id := chi.URLParam(r, "post_id")

	// Start a transaction
	tx, err := db.DB.Begin()
	if err != nil {
		http.Error(w, `{"error": "Failed to start transaction"}`, http.StatusInternalServerError)
		return
	}

	// Defer a rollback in case anything goes wrong
	defer tx.Rollback()

	// Step 1: Delete comments associated with the post
	_, err = tx.Exec("DELETE FROM comments WHERE post_id = ?", id)
	if err != nil {
		http.Error(w, `{"error": "Failed to delete comments"}`, http.StatusInternalServerError)
		return
	}

	// Step 2: Delete the post itself
	res, err := tx.Exec("DELETE FROM posts WHERE id = ?", id)
	if err != nil {
		http.Error(w, `{"error": "Failed to delete post"}`, http.StatusInternalServerError)
		return
	}

	// Check if any rows were affected
	affected, _ := res.RowsAffected()
	if affected == 0 {
		http.Error(w, `{"error": "Post not found"}`, http.StatusNotFound)
		return
	}

	// Commit the transaction
	err = tx.Commit()
	if err != nil {
		http.Error(w, `{"error": "Failed to commit transaction"}`, http.StatusInternalServerError)
		return
	}

	// Send a success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true}`))
}

// Get all the top-level comments associated with a post
func GetPostComments(w http.ResponseWriter, r *http.Request) {
	// Extract the post ID from the route parameter
	post_id := chi.URLParam(r, "post_id")

	// Query the database for comments associated with the post, where parent_id is NULL (top-level comments)
	rows, err := db.DB.Query(`
		SELECT c.id, c.post_id, c.user_id, COALESCE(u.username, 'Unknown') AS username, c.content, c.created_at
		FROM comments c
		LEFT JOIN users u ON c.user_id = u.id
		WHERE c.post_id = ? AND c.parent_id IS NULL
		ORDER BY c.created_at DESC
	`, post_id)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch comments"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Create a slice to hold the comments
	comments := []models.Comment{}
	for rows.Next() {
		var comment models.Comment
		if err := rows.Scan(&comment.ID, &comment.PostID, &comment.Author, &comment.Username, &comment.Content, &comment.CreatedAt); err != nil {
			http.Error(w, `{"error": "Failed to parse comment data"}`, http.StatusInternalServerError)
			return
		}
		comments = append(comments, comment)
	}

	// Set the response content type to JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Return the comments as a JSON response
	if err := json.NewEncoder(w).Encode(comments); err != nil {
		http.Error(w, `{"error": "Failed to encode comments"}`, http.StatusInternalServerError)
		return
	}
}

// Add a new top-level comment to the post
func AddPostComment(w http.ResponseWriter, r *http.Request) {
	// Extract the post ID from the route parameter
	post_id := chi.URLParam(r, "post_id")

	// Parse the request body into a Comment model
	comment := &models.Comment{}
	if err := json.NewDecoder(r.Body).Decode(comment); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if comment.Content == "" {
		http.Error(w, `{"error": "Comment content is required"}`, http.StatusBadRequest)
		return
	}

	comment.CreatedAt = time.Now().UTC()
	// Insert the comment into the database as a top-level comment (parent_id is NULL)
	res, err := db.DB.Exec("INSERT INTO comments (post_id, user_id, content, created_at, parent_id) VALUES (?, ?, ?, ?, NULL)", post_id, comment.Author, comment.Content, comment.CreatedAt)
	if err != nil {
		http.Error(w, `{"error": "Failed to create comment"}`, http.StatusInternalServerError)
		return
	}

	// Retrieve the last inserted ID for the comment
	id, _ := res.LastInsertId()
	comment.ID = int(id)
	comment.PostID, _ = strconv.Atoi(post_id)

	// Return the created comment as JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(comment); err != nil {
		http.Error(w, `{"error": "Failed to encode comment data"}`, http.StatusInternalServerError)
	}
}

// Get the owner's ID of a post
func GetPostOwnerID(r *http.Request) (int, error) {
	// Extract the post ID from the route parameter
	id := chi.URLParam(r, "post_id")

	var ownerID int
	// Query the database for the user_id associated with the given postID
	err := db.DB.QueryRow("SELECT user_id FROM posts WHERE id = ?", id).Scan(&ownerID)
	if err != nil {
		return -1, err
	}

	// Return the owner ID if no errors occurred
	return ownerID, nil
}

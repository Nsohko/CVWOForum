package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	db "sample-go-app/internal/database"
	"sample-go-app/internal/models"

	"github.com/go-chi/chi/v5"
)

func GetComment(w http.ResponseWriter, r *http.Request) {
	// Extract the post ID from the route parameter
	commentID := chi.URLParam(r, "comment_id")

	row := db.DB.QueryRow(`
		SELECT c.id, c.post_id, c.user_id, COALESCE(u.username, 'Unknown') AS username, c.content, c.created_at
		FROM comments c
		LEFT JOIN users u ON c.user_id = u.id
		WHERE c.id = ?
	`, commentID)

	comment := models.Comment{}
	// Scan the result into the struct
	if err := row.Scan(&comment.ID, &comment.PostID, &comment.Author, &comment.Username, &comment.Content, &comment.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, `{"error": "Comment not found"}`, http.StatusNotFound)
		} else {
			http.Error(w, `{"error": "Failed to get comment"}`, http.StatusInternalServerError)
		}
		return
	}

	// Set the response headers and return the post as JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(comment); err != nil {
		http.Error(w, `{"error": "Failed to encode comment"}`, http.StatusInternalServerError)
		return
	}
}

// GetSubcomments retrieves all subcomments for a given comment
func GetSubComments(w http.ResponseWriter, r *http.Request) {
	// Extract the comment ID from the URL parameter
	commentID := chi.URLParam(r, "comment_id")

	// Query the database for subcomments associated with the comment
	rows, err := db.DB.Query(`
		SELECT c.id, c.post_id, c.parent_id, c.user_id, COALESCE(u.username, 'Unknown') AS username, c.content, c.created_at
		FROM comments c
		LEFT JOIN users u ON c.user_id = u.id
		WHERE c.parent_id = ?
		ORDER BY c.created_at DESC
	`, commentID)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch subcomments"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Create a slice to hold the subcomments
	subcomments := []models.Comment{}
	for rows.Next() {
		var subcomment models.Comment
		if err := rows.Scan(&subcomment.ID, &subcomment.PostID, &subcomment.ParentID, &subcomment.Author, &subcomment.Username, &subcomment.Content, &subcomment.CreatedAt); err != nil {
			http.Error(w, `{"error": "Failed to parse subcomment data"}`, http.StatusInternalServerError)
			return
		}
		subcomments = append(subcomments, subcomment)
	}

	// Set the response content type to JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Return the subcomments as a JSON response
	if err := json.NewEncoder(w).Encode(subcomments); err != nil {
		http.Error(w, `{"error": "Failed to encode subcomments"}`, http.StatusInternalServerError)
		return
	}
}

// AddSubComment adds a new subcomment to a comment
func AddSubComment(w http.ResponseWriter, r *http.Request) {
	// Extract the post/comment ID from the URL parameter
	postID := chi.URLParam(r, "post_id")
	commentID := chi.URLParam(r, "comment_id")

	// Parse the request body into a Comment model
	subcomment := &models.Comment{}
	if err := json.NewDecoder(r.Body).Decode(subcomment); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if subcomment.Content == "" {
		http.Error(w, `{"error": "Subcomment content is required"}`, http.StatusBadRequest)
		return
	}

	subcomment.CreatedAt = time.Now().UTC()
	// Insert the subcomment into the database (set parent_id to the comment ID)
	res, err := db.DB.Exec("INSERT INTO comments (post_id, parent_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)", postID, commentID, subcomment.Author, subcomment.Content, subcomment.CreatedAt)
	if err != nil {
		http.Error(w, `{"error": "Failed to create subcomment"}`, http.StatusInternalServerError)
		return
	}

	// Retrieve the last inserted ID for the subcomment
	id, _ := res.LastInsertId()
	subcomment.ID = int(id)
	subcomment.PostID, _ = strconv.Atoi(postID)
	subcomment.ParentID, _ = strconv.Atoi(commentID)

	// Return the created subcomment as JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(subcomment); err != nil {
		http.Error(w, `{"error": "Failed to encode subcomment data"}`, http.StatusInternalServerError)
	}
}

// UpdateComment updates an existing comment or subcomment
func UpdateComment(w http.ResponseWriter, r *http.Request) {
	// Extract the comment ID from the route parameter
	commentID := chi.URLParam(r, "comment_id")

	// Parse the request body into a Comment model
	comment := &models.Comment{}
	if err := json.NewDecoder(r.Body).Decode(comment); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	// Validate required fields
	if comment.Content == "" {
		http.Error(w, `{"error": "Comment content is required"}`, http.StatusBadRequest)
		return
	}

	// Update the comment in the database
	res, err := db.DB.Exec("UPDATE comments SET content = ? WHERE id = ?", comment.Content, commentID)
	if err != nil || res == nil {
		http.Error(w, `{"error": "Failed to update comment"}`, http.StatusInternalServerError)
		return
	}

	// Check if the comment was found and updated
	affected, _ := res.RowsAffected()
	if affected == 0 {
		http.Error(w, `{"error": "Comment not found"}`, http.StatusNotFound)
		return
	}

	// Send a success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true}`))
}

// DeleteComment deletes an existing comment or subcomment
func DeleteComment(w http.ResponseWriter, r *http.Request) {
	// Extract the comment ID from the route parameter
	commentID := chi.URLParam(r, "comment_id")

	// Execute the DELETE query
	res, err := db.DB.Exec("DELETE FROM comments WHERE id = ?", commentID)
	if err != nil {
		http.Error(w, `{"error": "Failed to delete comment"}`, http.StatusInternalServerError)
		return
	}

	// Check if any rows were affected
	affected, _ := res.RowsAffected()
	if affected == 0 {
		http.Error(w, `{"error": "Comment not found"}`, http.StatusNotFound)
		return
	}

	// Execute the DELETE query
	_, err = db.DB.Exec("DELETE FROM comments WHERE parent_id = ?", commentID)
	if err != nil {
		http.Error(w, `{"error": "Failed to delete subcomments"}`, http.StatusInternalServerError)
		return
	}

	// Send a success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true}`))
}

func GetCommentOwnerID(r *http.Request) (int, error) {
	commentID := chi.URLParam(r, "comment_id")

	var ownerID int
	// Query the database for the user_id associated with the given postID
	err := db.DB.QueryRow("SELECT user_id FROM comments WHERE id = ?", commentID).Scan(&ownerID)
	if err != nil {
		return -1, err
	}

	// Return the owner ID if no errors occurred
	return ownerID, nil
}

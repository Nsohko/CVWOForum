package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	db "sample-go-app/internal/database"
	"sample-go-app/internal/models"

	"github.com/go-chi/chi/v5"
	_ "modernc.org/sqlite"
)

// Get all available topics
func GetTopics(w http.ResponseWriter, r *http.Request) {

	rows, err := db.DB.Query(`SELECT topic from topics`)

	if err != nil {
		http.Error(w, `{"error": "Failed to fetch topics"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Parse request body into array of topics
	topics := []models.Topic{}
	for rows.Next() {
		var topic models.Topic
		if err := rows.Scan(&topic.TopicName); err != nil {
			http.Error(w, `{"error": "Failed to parse post data"}`, http.StatusInternalServerError)
			return
		}
		topics = append(topics, topic)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(topics); err != nil {
		http.Error(w, `{"error": "Failed to encode posts"}`, http.StatusInternalServerError)
		return
	}

}

// Add a new available topic
func AddTopic(w http.ResponseWriter, r *http.Request) {
	// Parse the request body into a new topic
	topic := &models.Topic{}
	if err := json.NewDecoder(r.Body).Decode(topic); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	// Check for invalid topic names
	if topic.TopicName == "All Posts" || topic.TopicName == "" {
		http.Error(w, `{"error": "Invalid topic"}`, http.StatusInternalServerError)
		return
	}

	// Insert new topic into DB
	_, err := db.DB.Exec("INSERT INTO topics (topic) VALUES (?)", topic.TopicName)
	if err != nil {
		fmt.Print(err)
		http.Error(w, `{"error": "Failed to create topic"}`, http.StatusInternalServerError)
		return
	}

	// Return the created topic as JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(topic); err != nil {
		http.Error(w, `{"error": "Failed to encode post data"}`, http.StatusInternalServerError)
	}
}

// Delete a topic, and all posts / comments associated with it
func DeleteTopic(w http.ResponseWriter, r *http.Request) {
	// Extract the topic name from the route parameter
	topicName := chi.URLParam(r, "topic_name")

	// Start a transaction
	tx, err := db.DB.Begin()
	if err != nil {
		http.Error(w, `{"error": "Failed to start transaction"}`, http.StatusInternalServerError)
		return
	}

	// Defer a rollback in case anything goes wrong
	defer tx.Rollback()

	// Step 1: Get all posts with the same topic
	rows, err := tx.Query("SELECT id FROM posts WHERE topic = ?", topicName)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch posts"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var postIDs []int
	for rows.Next() {
		var postID int
		if err := rows.Scan(&postID); err != nil {
			http.Error(w, `{"error": "Failed to read post ID"}`, http.StatusInternalServerError)
			return
		}
		postIDs = append(postIDs, postID)
	}

	// Step 2: Delete all comments associated with the posts
	for _, postID := range postIDs {
		_, err = tx.Exec("DELETE FROM comments WHERE post_id = ?", postID)
		if err != nil {
			http.Error(w, `{"error": "Failed to delete comments"}`, http.StatusInternalServerError)
			return
		}
	}

	// Step 3: Delete all posts with the topic
	_, err = tx.Exec("DELETE FROM posts WHERE topic = ?", topicName)
	if err != nil {
		http.Error(w, `{"error": "Failed to delete posts"}`, http.StatusInternalServerError)
		return
	}

	// Step 4: Delete the topic itself
	res, err := tx.Exec("DELETE FROM topics WHERE topic = ?", topicName)
	if err != nil {
		http.Error(w, `{"error": "Failed to delete topic"}`, http.StatusInternalServerError)
		return
	}

	// Check if the topic was deleted
	affected, _ := res.RowsAffected()
	if affected == 0 {
		http.Error(w, `{"error": "Topic not found"}`, http.StatusNotFound)
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

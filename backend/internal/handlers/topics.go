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

func GetTopics(w http.ResponseWriter, r *http.Request) {

	rows, err := db.DB.Query(`SELECT topic from topics`)

	if err != nil {
		http.Error(w, `{"error": "Failed to fetch topics"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

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

func AddTopic(w http.ResponseWriter, r *http.Request) {
	// Parse the request body into a Post model
	topic := &models.Topic{}
	if err := json.NewDecoder(r.Body).Decode(topic); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if topic.TopicName == "All Posts" || topic.TopicName == "" {
		http.Error(w, `{"error": "Invalid topic"}`, http.StatusInternalServerError)
		return
	}

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

func DeleteTopic(w http.ResponseWriter, r *http.Request) {
	// Extract the post ID from the route parameter
	topic_name := chi.URLParam(r, "topic_name")

	// Execute the DELETE query
	res, err := db.DB.Exec("DELETE FROM topics WHERE topic = ?", topic_name)
	if err != nil {
		http.Error(w, `{"error": "Failed to delete topic"}`, http.StatusInternalServerError)
		return
	}

	// Check if any rows were affected
	affected, _ := res.RowsAffected()
	if affected == 0 {
		http.Error(w, `{"error": "Topic not found"}`, http.StatusNotFound)
		return
	}

	// Send a success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true}`))
}

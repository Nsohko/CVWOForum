package models

import "time"

type Post struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Topic     string    `json:"topic"`
	Content   string    `json:"content"`
	Author    int       `json:"author"`
	Username  string    `json:"username"`
	CreatedAt time.Time `json:"created_at"`
}

package models

import "time"

// Models a comment (both top-level and nested)
type Comment struct {
	ID        int       `json:"id"`
	PostID    int       `json:"post_id"`
	ParentID  int       `json:"parent_id"`
	Author    int       `json:"author"`
	Username  string    `json:"username"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

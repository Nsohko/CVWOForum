package db

import (
	"database/sql"
	"log"

	"sample-go-app/internal/models"

	"golang.org/x/crypto/bcrypt"
	_ "modernc.org/sqlite"
)

var DB *sql.DB
var PostsList []models.Post

func InitDatabase() {
	var err error
	DB, err = sql.Open("sqlite", "./database.db")
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	PostsList = []models.Post{}

	// Run migrations (create tables)
	InitTables()
}

func InitTables() {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT NOT NULL UNIQUE,
			password TEXT NOT NULL,
			isAdmin INTEGER DEFAULT 0
		);`,
		`CREATE TABLE IF NOT EXISTS posts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT,
			content TEXT,
			topic TEXT,
			user_id INTEGER,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(user_id) REFERENCES users(id)
		);`,
		`CREATE TABLE IF NOT EXISTS comments (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			post_id INTEGER NOT NULL,
			parent_id INTEGER,
			user_id INTEGER NOT NULL,
			content TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(post_id) REFERENCES posts(id),
			FOREIGN KEY(user_id) REFERENCES users(id)
		);`,
		`CREATE TABLE IF NOT EXISTS topics (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			topic STRING NOT NULL UNIQUE
		);`,
	}

	for _, query := range queries {
		_, err := DB.Exec(query)
		if err != nil {
			log.Fatalf("Failed to run migration: %v", err)
		}
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	// Insert default admin user
	_, err := DB.Exec(`
		INSERT OR IGNORE INTO users (username, password, isAdmin) 
		VALUES ('admin123', ?, 1);
	`, hashedPassword)
	if err != nil {
		log.Fatalf("Failed to insert admin user: %v", err)
	}

	// Insert default topics
	commonTopics := []string{"Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "Literature", "Economics"}
	for _, topic := range commonTopics {
		_, err := DB.Exec(`
			INSERT OR IGNORE INTO topics (topic) VALUES (?);
		`, topic)
		if err != nil {
			log.Fatalf("Failed to insert topic '%s': %v", topic, err)
		}
	}
}

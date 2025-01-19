package main

import (
	"fmt"
	"log"
	"net/http"

	"sample-go-app/internal/auth"
	db "sample-go-app/internal/database"
	"sample-go-app/internal/router"

	_ "modernc.org/sqlite"
)

func main() {

	fmt.Println("Hello World")
	fmt.Println("For debugging, admin username/password: admin123")
	fmt.Println("Non-admin username/password: 123")

	// Initialize Database
	db.InitDatabase()
	// Initialize JWT
	auth.InitJWT()

	// Setup router and routes
	r := router.Setup()

	// Start the server
	port := ":8080"
	log.Printf("Starting server on port %s...", port)
	if err := http.ListenAndServe(port, r); err != nil {
		log.Fatal(err)
	}
}

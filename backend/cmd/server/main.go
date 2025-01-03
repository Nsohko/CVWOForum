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

	db.InitDatabase()
	// Initialize JWT
	auth.InitJWT()

	r := router.Setup()

	// Start the server
	port := ":8080" // Change the port if needed
	log.Printf("Starting server on port %s...", port)
	if err := http.ListenAndServe(port, r); err != nil {
		log.Fatal(err)
	}
}

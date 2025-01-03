package router

import (
	"sample-go-app/internal/routes"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func Setup() chi.Router {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// CORS middleware configuration
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},          // Frontend origins
		AllowedMethods:   []string{"GET", "POST", "PATCH", "DELETE"}, // HTTP methods
		AllowedHeaders:   []string{"Content-Type", "Authorization"},  // Headers allowed in requests
		AllowCredentials: true,                                       // Allow cookies and credentials
		MaxAge:           300,                                        // Cache preflight requests for 5 minutes
	}))

	setUpRoutes(r)
	return r
}

func setUpRoutes(r chi.Router) {
	r.Group(routes.UnprotectedRoutes())
	r.Group(routes.ProtectedRoutes())
}

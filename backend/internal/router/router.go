package router

import (
	"backend/internal/routes"
	"net/http"
	"os"
	"path/filepath"

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

	serveStaticFiles(r)
	setUpRoutes(r)
	return r
}

// Serve static react frontend
func serveStaticFiles(r chi.Router) {
	workDir, _ := os.Getwd()

	// Navigate to the project root and locate the frontend build folder
	projectRoot := filepath.Dir(workDir) // Go up one level to the project root
	staticFilesPath := filepath.Join(projectRoot, "frontend", "build")

	// Strip prefix
	fs := http.StripPrefix("/", http.FileServer(http.Dir(staticFilesPath)))

	// Handle requests for static files
	r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
		// Check if the file exists
		filePath := staticFilesPath + r.URL.Path
		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			// If not, fallback to serving the React index.html
			http.ServeFile(w, r, staticFilesPath+"/index.html")
			return
		}
		// Serve the file
		fs.ServeHTTP(w, r)
	})
}

func setUpRoutes(r chi.Router) {
	r.Group(routes.UnprotectedRoutes())
	r.Group(routes.ProtectedRoutes())
}

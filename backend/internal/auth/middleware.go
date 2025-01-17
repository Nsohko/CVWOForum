package auth

import (
	"fmt"
	"net/http"

	"github.com/go-chi/jwtauth/v5"
)

// AdminMiddleware enforces admin-only access
func AdminMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract JWT claims from the context
			_, claims, _ := jwtauth.FromContext(r.Context())
			rawUserData, userExists := claims["userData"].(map[string]interface{}) // Extract the user claim as a map

			if !userExists {
				fmt.Println("User does not exist")
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			isAdmin := int(rawUserData["isAdmin"].(float64))

			if !(isAdmin == 1) {
				http.Error(w, "Forbidden", http.StatusForbidden)
				return
			}

			// Allow access if the user is an admin
			next.ServeHTTP(w, r)
		})
	}
}

// RoleMiddleware enforces role-based access
func RoleMiddleware(resourceOwnerIDFunc func(r *http.Request) (int, error)) func(http.Handler) http.Handler {

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			_, claims, _ := jwtauth.FromContext(r.Context())
			rawUserData, userExists := claims["userData"].(map[string]interface{}) // Extract the user claim as a map

			if !userExists {
				fmt.Println("user no exist")
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			isAdmin := int(rawUserData["isAdmin"].(float64))
			userID := int(rawUserData["id"].(float64))

			ownerID, _ := resourceOwnerIDFunc(r)

			if !(isAdmin == 1 || userID == ownerID) {
				http.Error(w, "Forbidden", http.StatusForbidden)
				return
			}

			// Add user info to the context for downstream handlers
			next.ServeHTTP(w, r)
		})
	}
}

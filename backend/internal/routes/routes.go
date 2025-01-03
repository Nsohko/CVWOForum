package routes

import (
	"sample-go-app/internal/auth"
	"sample-go-app/internal/handlers"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/jwtauth/v5"
)

func UnprotectedRoutes() func(r chi.Router) {
	return func(r chi.Router) {
		r.Get("/api/posts", handlers.GetPosts)
		r.Get("/api/posts/{post_id}", handlers.GetPostDetails)
		r.Get("/api/posts/{post_id}/comments", handlers.GetPostComments) //get all comments tied to the post, without children comments
		r.Get("/api/posts/{post_id}/comments/{comment_id}", handlers.GetComment)
		r.Get("/api/posts/{post_id}/comments/{comment_id}/subcomments", handlers.GetSubComments)

		r.Post("/api/create_account", handlers.CreateAccount)
		r.Post("/api/login", handlers.Login)
		r.Get("/api/logout", handlers.Logout)

		r.Get("/api/users/{user_id}", handlers.GetUsernameByID)
	}
}

func ProtectedRoutes() func(r chi.Router) {
	return func(r chi.Router) {
		// Add JWT authentication middleware
		r.Use(jwtauth.Verifier(auth.TokenAuth))      // Verify the JWT token
		r.Use(jwtauth.Authenticator(auth.TokenAuth)) // Enforce authentication

		r.Get("/api/protected", handlers.Protected)

		r.Post("/api/posts", handlers.AddPost)

		// Role-based access for comment actions
		r.Group(func(r chi.Router) {
			// Middleware for role-based access
			r.Use(auth.RoleMiddleware(handlers.GetPostOwnerID))

			r.Patch("/api/posts/{post_id}", handlers.UpdatePost)
			r.Delete("/api/posts/{post_id}", handlers.DeletePost)
		})

		r.Post("/api/posts/{post_id}/comments", handlers.AddPostComment)             // add new comment to the post
		r.Post("/api/posts/{post_id}/comments/{comment_id}", handlers.AddSubComment) //add new subcomment

		r.Group(func(r chi.Router) {
			// Middleware for role-based access
			r.Use(auth.RoleMiddleware(handlers.GetCommentOwnerID))

			r.Patch("/api/posts/{post_id}/comments/{comment_id}", handlers.UpdateComment)
			r.Delete("/api/posts/{post_id}/comments/{comment_id}", handlers.DeleteComment)
		})
	}
}

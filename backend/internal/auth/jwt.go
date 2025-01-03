package auth

import (
	"net/http"
	"time"

	"sample-go-app/internal/models"

	"github.com/go-chi/jwtauth/v5"
)

var TokenAuth *jwtauth.JWTAuth

func InitJWT() {
	// Replace "secret-key" with a secure secret string
	TokenAuth = jwtauth.New("HS256", []byte("secret-key"), nil)
}

// GenerateToken generates a JWT token with a given user ID and expiry.
func GenerateToken(userData models.User) (string, error) {
	claims := map[string]interface{}{
		"userData": userData,
		"exp":      time.Now().Add(time.Hour * 72).Unix(), // 3 days expiry
	}
	_, tokenString, err := TokenAuth.Encode(claims)
	return tokenString, err
}

// SetTokenCookie sets the JWT as a secure cookie
func SetTokenCookie(w http.ResponseWriter, token string) {
	cookie := &http.Cookie{
		Name:     "jwt",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   true, // Set to true for production (HTTPS only)
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(time.Hour * 72),
	}
	http.SetCookie(w, cookie)
}

// ClearTokenCookie clears the JWT cookie
func ClearTokenCookie(w http.ResponseWriter) {
	cookie := &http.Cookie{
		Name:     "jwt",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Expires:  time.Unix(0, 0),
	}
	http.SetCookie(w, cookie)
}

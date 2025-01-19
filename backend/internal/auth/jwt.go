package auth

import (
	"net/http"
	"time"

	"sample-go-app/internal/models"

	"github.com/go-chi/jwtauth/v5"
)

var TokenAuth *jwtauth.JWTAuth

func InitJWT() {
	// "secret-key" is a placeholder for now
	TokenAuth = jwtauth.New("HS256", []byte("secret-key"), nil)
}

// Generate a JWT token for a particular user.
func GenerateToken(userData models.User) (string, error) {
	claims := map[string]interface{}{
		"userData": userData,
		"exp":      time.Now().Add(time.Hour * 72).Unix(), // 3 days expiry
	}
	_, tokenString, err := TokenAuth.Encode(claims)
	return tokenString, err
}

// Set JWT as a secure http-only cookie
func SetTokenCookie(w http.ResponseWriter, token string) {
	cookie := &http.Cookie{
		Name:     "jwt",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(time.Hour * 72),
	}
	http.SetCookie(w, cookie)
}

// Clear the JWT token
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

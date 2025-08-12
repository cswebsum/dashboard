package router

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type SessionData struct {
	User   string   `json:"user"`
	Groups []string `json:"groups"`
}

const sessionCookieName = "karmada_session"

func signingKey() []byte {
	return []byte(os.Getenv("SESSION_SIGNING_KEY"))
}

func signPayload(payload []byte) string {
	key := signingKey()
	if len(key) == 0 {
		return ""
	}
	h := hmac.New(sha256.New, key)
	h.Write(payload)
	return hex.EncodeToString(h.Sum(nil))
}

func verifySignature(payload []byte, sig string) bool {
	key := signingKey()
	if len(key) == 0 {
		return true
	}
	expected := signPayload(payload)
	return hmac.Equal([]byte(expected), []byte(sig))
}

// WriteSessionCookie writes a signed, secure, HttpOnly session cookie.
func WriteSessionCookie(w http.ResponseWriter, s SessionData, ttl time.Duration) {
	b, _ := json.Marshal(s)
	enc := base64.RawURLEncoding.EncodeToString(b)
	sig := signPayload([]byte(enc))
	val := enc
	if sig != "" {
		val = enc + "." + sig
	}
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    val,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(ttl),
	})
}

// SessionMiddleware reads session cookie and sets Authorization and impersonation headers.
func SessionMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Request.Cookie(sessionCookieName)
		if err == nil && cookie != nil && cookie.Value != "" {
			parts := strings.Split(cookie.Value, ".")
			enc := parts[0]
			var valid bool = true
			if len(parts) == 2 {
				valid = verifySignature([]byte(enc), parts[1])
			}
			if valid {
				raw, _ := base64.RawURLEncoding.DecodeString(enc)
				var s SessionData
				_ = json.Unmarshal(raw, &s)
				// Set Authorization header using service account token if not already present
				if c.Request.Header.Get("Authorization") == "" {
					if token := os.Getenv("DASHBOARD_SA_TOKEN"); token != "" {
						c.Request.Header.Set("Authorization", "Bearer "+token)
					}
				}
				if s.User != "" {
					c.Request.Header.Set("Impersonate-User", s.User)
				}
				if len(s.Groups) > 0 {
					for _, g := range s.Groups {
						c.Request.Header.Add("Impersonate-Group", g)
					}
				}
				// Refresh cookie TTL to persist session
				WriteSessionCookie(c.Writer, s, 24*time.Hour)
			}
		}
		c.Next()
	}
}
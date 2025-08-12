package router

import (
	"encoding/json"
	"os"

	"github.com/gin-gonic/gin"
)

type sessionData struct {
	User   string   `json:"user"`
	Groups []string `json:"groups"`
}

const sessionCookieName = "karmada_session"

// SessionMiddleware reads session cookie and sets Authorization and impersonation headers.
func SessionMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Request.Cookie(sessionCookieName)
		if err == nil && cookie != nil && cookie.Value != "" {
			var s sessionData
			_ = json.Unmarshal([]byte(cookie.Value), &s)
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
		}
		c.Next()
	}
}
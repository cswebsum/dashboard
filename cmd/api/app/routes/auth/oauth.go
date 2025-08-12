/*
Copyright 2024 The Karmada Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	"github.com/karmada-io/dashboard/cmd/api/app/router"
	"github.com/karmada-io/dashboard/cmd/api/app/types/common"
)

var (
	oauthConfig *oauth2.Config
)

func initOAuth() {
	clientID := os.Getenv("OAUTH2_CLIENT_ID")
	clientSecret := os.Getenv("OAUTH2_CLIENT_SECRET")
	redirectURL := os.Getenv("OAUTH2_REDIRECT_URL")
	if clientID == "" || clientSecret == "" || redirectURL == "" {
		return
	}
	oauthConfig = &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Endpoint:     google.Endpoint, // example provider; replace as needed
		RedirectURL:  redirectURL,
		Scopes:       []string{"openid", "email", "profile"},
	}
}

func handleOAuthLogin(c *gin.Context) {
	if oauthConfig == nil {
		initOAuth()
	}
	if oauthConfig == nil {
		c.JSON(http.StatusBadRequest, common.BaseResponse{Code: 400, Msg: "oauth not configured"})
		return
	}
	state := "karmada" // TODO: generate random state and store in CSRF/session
	url := oauthConfig.AuthCodeURL(state, oauth2.AccessTypeOnline)
	c.Redirect(http.StatusFound, url)
}

func handleOAuthCallback(c *gin.Context) {
	if oauthConfig == nil {
		initOAuth()
	}
	if oauthConfig == nil {
		c.JSON(http.StatusBadRequest, common.BaseResponse{Code: 400, Msg: "oauth not configured"})
		return
	}
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, common.BaseResponse{Code: 400, Msg: "missing code"})
		return
	}
	tok, err := oauthConfig.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusUnauthorized, common.BaseResponse{Code: 401, Msg: err.Error()})
		return
	}
	// TODO: Retrieve userinfo with the token from provider and establish session/cookie
	// For demo, set user as "oidc-user" and group as ["oidc"]
	s := struct{
		User string `json:"user"`
		Groups []string `json:"groups"`
	}{User: "oidc-user", Groups: []string{"oidc"}}
	b, _ := json.Marshal(s)
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "karmada_session",
		Value:    string(b),
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(24 * time.Hour),
	})
	c.JSON(http.StatusOK, common.BaseResponse{Code: 200, Msg: "ok", Data: map[string]any{"access_token": tok.AccessToken}})
}

func init() {
	initOAuth()
	r := router.V1()
	r.GET("/oauth2/login", handleOAuthLogin)
	r.GET("/oauth2/callback", handleOAuthCallback)
}
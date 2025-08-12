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
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"

	"github.com/karmada-io/dashboard/cmd/api/app/router"
	"github.com/karmada-io/dashboard/cmd/api/app/types/common"
)

// Keycloak/OpenID Connect using issuer discovery
func initKeycloak() (*oauth2.Config, error) {
	issuer := os.Getenv("OIDC_ISSUER_URL")
	clientID := os.Getenv("OIDC_CLIENT_ID")
	clientSecret := os.Getenv("OIDC_CLIENT_SECRET")
	redirectURL := os.Getenv("OIDC_REDIRECT_URL")
	if issuer == "" || clientID == "" || clientSecret == "" || redirectURL == "" {
		return nil, nil
	}
	// Minimal discovery using oauth2, assume endpoints provided via env for simplicity
	endpoint := oauth2.Endpoint{
		AuthURL:  issuer + "/protocol/openid-connect/auth",
		TokenURL: issuer + "/protocol/openid-connect/token",
	}
	cfg := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Endpoint:     endpoint,
		Scopes:       []string{"openid", "email", "profile"},
	}
	return cfg, nil
}

func handleOIDCLogin(c *gin.Context) {
	cfg, _ := initKeycloak()
	if cfg == nil {
		c.JSON(http.StatusBadRequest, common.BaseResponse{Code: 400, Msg: "oidc not configured"})
		return
	}
	state := "karmada"
	c.Redirect(http.StatusFound, cfg.AuthCodeURL(state, oauth2.AccessTypeOnline))
}

func handleOIDCCallback(c *gin.Context) {
	cfg, _ := initKeycloak()
	if cfg == nil {
		c.JSON(http.StatusBadRequest, common.BaseResponse{Code: 400, Msg: "oidc not configured"})
		return
	}
	code := c.Query("code")
	tok, err := cfg.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusUnauthorized, common.BaseResponse{Code: 401, Msg: err.Error()})
		return
	}
	c.JSON(http.StatusOK, common.BaseResponse{Code: 200, Msg: "ok", Data: map[string]any{"access_token": tok.AccessToken}})
}

func init() {
	r := router.V1()
	r.GET("/oidc/login", handleOIDCLogin)
	r.GET("/oidc/callback", handleOIDCCallback)
}
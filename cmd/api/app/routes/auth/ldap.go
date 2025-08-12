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
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	ldap "github.com/go-ldap/ldap/v3"

	"github.com/karmada-io/dashboard/cmd/api/app/router"
	"github.com/karmada-io/dashboard/cmd/api/app/types/common"
)

type ldapLoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func handleLDAPLogin(c *gin.Context) {
	req := new(ldapLoginRequest)
	if err := c.ShouldBindJSON(req); err != nil {
		c.JSON(http.StatusBadRequest, common.BaseResponse{Code: 400, Msg: err.Error()})
		return
	}
	host := os.Getenv("LDAP_HOST")
	if host == "" {
		c.JSON(http.StatusBadRequest, common.BaseResponse{Code: 400, Msg: "ldap not configured"})
		return
	}
	conn, err := ldap.DialURL(host)
	if err != nil {
		c.JSON(http.StatusUnauthorized, common.BaseResponse{Code: 401, Msg: err.Error()})
		return
	}
	defer conn.Close()
	// Simple bind as the user
	if err := conn.Bind(req.Username, req.Password); err != nil {
		c.JSON(http.StatusUnauthorized, common.BaseResponse{Code: 401, Msg: "invalid credentials"})
		return
	}
	// TODO: Issue session cookie and map LDAP groups to roles
	c.JSON(http.StatusOK, common.BaseResponse{Code: 200, Msg: "ok"})
}

func init() {
	r := router.V1()
	r.POST("/auth/ldap/login", handleLDAPLogin)
}
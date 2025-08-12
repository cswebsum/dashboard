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

package rbac

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	authorizationv1 "k8s.io/api/authorization/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"github.com/karmada-io/dashboard/cmd/api/app/router"
	"github.com/karmada-io/dashboard/cmd/api/app/types/common"
	"github.com/karmada-io/dashboard/pkg/client"
)

type permissionRequest struct {
	Resource string `json:"resource"`
	Verb     string `json:"verb"`
	Group    string `json:"group"`
	Version  string `json:"version"`
	Name     string `json:"name"`
	Namespace string `json:"namespace"`
}

type permissionResponse struct {
	Allowed bool `json:"allowed"`
}

func handlePermissions(c *gin.Context) {
	req := new(permissionRequest)
	if err := c.ShouldBindJSON(req); err != nil {
		c.JSON(http.StatusBadRequest, common.BaseResponse{Code: 400, Msg: err.Error()})
		return
	}
	kube := client.InClusterClient()
	sar := &authorizationv1.SubjectAccessReview{
		Spec: authorizationv1.SubjectAccessReviewSpec{
			ResourceAttributes: &authorizationv1.ResourceAttributes{
				Group:     req.Group,
				Version:   req.Version,
				Resource:  req.Resource,
				Verb:      req.Verb,
				Name:      req.Name,
				Namespace: req.Namespace,
			},
		},
	}
	res, err := kube.AuthorizationV1().SubjectAccessReviews().Create(context.TODO(), sar, metav1.CreateOptions{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, common.BaseResponse{Code: 500, Msg: err.Error()})
		return
	}
	c.JSON(http.StatusOK, permissionResponse{Allowed: res.Status.Allowed})
}

func init() {
	r := router.V1()
	r.POST("/permissions", handlePermissions)
}
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

package router

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/klog/v2"

	"github.com/karmada-io/dashboard/cmd/api/app/types/common"
	"github.com/karmada-io/dashboard/pkg/client"
)

// EnsureMemberClusterMiddleware ensures that the member cluster exists.
func EnsureMemberClusterMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		karmadaClient := client.InClusterKarmadaClient()
		_, err := karmadaClient.ClusterV1alpha1().Clusters().Get(context.TODO(), c.Param("clustername"), metav1.GetOptions{})
		if err != nil {
			c.AbortWithStatusJSON(http.StatusOK, common.BaseResponse{
				Code: 500,
				Msg:  err.Error(),
			})
			return
		}
		c.Next()
	}
}

// RBACMiddleware is a placeholder for checking access to resource actions.
func RBACMiddleware(resource string, verb string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// TODO: integrate Karmada RBAC check via SubjectAccessReview or client-go authz API
		klog.V(3).InfoS("RBAC check", "resource", resource, "verb", verb)
		c.Next()
	}
}

// RequestLogger logs basic request info.
func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		klog.InfoS("HTTP", "method", c.Request.Method, "path", c.FullPath())
		c.Next()
	}
}

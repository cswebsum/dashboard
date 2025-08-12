package auth

import (
	"context"
	"crypto/rsa"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"encoding/xml"
	"io"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/crewjam/saml"
	"github.com/crewjam/saml/samlsp"
	"github.com/gin-gonic/gin"

	"github.com/karmada-io/dashboard/cmd/api/app/router"
)

var samlMiddleware *samlsp.Middleware

func parseRSAPrivateKeyFromPEMFile(path string) (*rsa.PrivateKey, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	block, _ := pem.Decode(b)
	if block == nil {
		return nil, err
	}
	key, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err == nil {
		return key, nil
	}
	pkcs8Key, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	return pkcs8Key.(*rsa.PrivateKey), nil
}

func initSAML() error {
	idpMetaURL := os.Getenv("SAML_IDP_METADATA_URL")
	spRoot := os.Getenv("SAML_SP_ROOT_URL")
	spCertFile := os.Getenv("SAML_SP_CERT_FILE")
	spKeyFile := os.Getenv("SAML_SP_KEY_FILE")
	if idpMetaURL == "" || spRoot == "" || spCertFile == "" || spKeyFile == "" {
		return nil
	}
	u, err := url.Parse(spRoot)
	if err != nil {
		return err
	}
	certPEM, err := os.ReadFile(spCertFile)
	if err != nil {
		return err
	}
	block, _ := pem.Decode(certPEM)
	if block == nil {
		return err
	}
	cert, err := x509.ParseCertificate(block.Bytes)
	if err != nil {
		return err
	}
	key, err := parseRSAPrivateKeyFromPEMFile(spKeyFile)
	if err != nil {
		return err
	}
	opts := samlsp.Options{URL: *u}
	mw, err := samlsp.New(opts)
	if err != nil {
		return err
	}
	mw.ServiceProvider.Key = key
	mw.ServiceProvider.Certificate = cert
	// Fetch IdP metadata
	req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, idpMetaURL, nil)
	resp, err := mw.ServiceProvider.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	b, _ := io.ReadAll(resp.Body)
	var idpMeta saml.EntityDescriptor
	if err := xml.Unmarshal(b, &idpMeta); err != nil {
		return err
	}
	mw.ServiceProvider.IDPMetadata = &idpMeta
	samlMiddleware = mw
	return nil
}

func samlLoginHandler(c *gin.Context) {
	if samlMiddleware == nil {
		if err := initSAML(); err != nil {
			c.String(http.StatusInternalServerError, err.Error())
			return
		}
	}
	h := samlMiddleware.RequireAccount(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		b, _ := json.Marshal(struct {
			User   string   `json:"user"`
			Groups []string `json:"groups"`
		}{User: "saml-user"})
		http.SetCookie(w, &http.Cookie{
			Name:     "karmada_session",
			Value:    string(b),
			Path:     "/",
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteLaxMode,
			Expires:  time.Now().Add(24 * time.Hour),
		})
		w.WriteHeader(http.StatusOK)
	}))
	h.ServeHTTP(c.Writer, c.Request)
}

func samlACSHandler(c *gin.Context) {
	if samlMiddleware == nil {
		if err := initSAML(); err != nil {
			c.String(http.StatusInternalServerError, err.Error())
			return
		}
	}
	samlMiddleware.ServeHTTP(c.Writer, c.Request)
}

func samlMetadataHandler(c *gin.Context) {
	if samlMiddleware == nil {
		if err := initSAML(); err != nil {
			c.String(http.StatusInternalServerError, err.Error())
			return
		}
	}
	c.Header("Content-Type", "application/samlmetadata+xml")
	md, _ := xml.MarshalIndent(samlMiddleware.ServiceProvider.Metadata(), "", "  ")
	c.Writer.Write(md)
}

func init() {
	_ = initSAML()
	r := router.V1()
	r.GET("/sso/saml/metadata", samlMetadataHandler)
	r.GET("/sso/saml/login", samlLoginHandler)
	r.POST("/sso/saml/acs", samlACSHandler)
}
import React from 'react';
import { Button, Card, Space } from 'antd';

export const LoginOAuth: React.FC = () => {
  const handleOIDCLogin = () => {
    window.location.href = '/api/v1/oidc/login';
  };
  const handleOAuthLogin = () => {
    window.location.href = '/api/v1/oauth2/login';
  };
  const handleSAMLLogin = () => {
    window.location.href = '/api/v1/sso/saml/login';
  };
  const handleLDAPLogin = async () => {
    // redirect to a LDAP login page or prompt; for demo, navigate to LDAP endpoint
    window.location.href = '/api/v1/auth/ldap/login';
  };
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#FAFBFC]">
      <Card title="Karmada Dashboard Login" className="w-[420px]">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button type="primary" block onClick={handleOIDCLogin}>
            Login with OIDC (Keycloak)
          </Button>
          <Button block onClick={handleOAuthLogin}>Login with OAuth2</Button>
          <Button block onClick={handleSAMLLogin}>Login with SAML</Button>
          <Button block onClick={handleLDAPLogin}>Login with LDAP</Button>
        </Space>
      </Card>
    </div>
  );
};
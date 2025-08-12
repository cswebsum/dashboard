import React from 'react';
import { Button, Card } from 'antd';

export const LoginOAuth: React.FC = () => {
  const handleOAuthLogin = () => {
    window.location.href = '/api/v1/oauth2/login';
  };
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#FAFBFC]">
      <Card title="Karmada Dashboard Login" className="w-[400px]">
        <Button type="primary" block onClick={handleOAuthLogin}>
          Login with OAuth
        </Button>
      </Card>
    </div>
  );
};
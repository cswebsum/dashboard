import React from 'react';
import { Result } from 'antd';
import { useAuth } from '@/components/auth';
import { useAuthzStore, type Role } from '@/stores/authz';

export interface RequireRoleProps {
  roles?: Role[];
  children: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ roles = [], children }) => {
  const { authenticated } = useAuth();
  const hasAny = useAuthzStore((s) => s.hasAnyRole(roles));

  if (!authenticated) return null;
  if (roles.length > 0 && !hasAny) {
    return <Result status="403" title="Forbidden" subTitle="You do not have permission to access this page." />;
  }
  return <>{children}</>;
};
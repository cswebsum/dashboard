import React from 'react';
import { Spin } from 'antd';
import { usePermission, type PermissionParams } from '@/hooks/usePermission';

interface PermissionGateProps extends PermissionParams {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({ fallback = null, children, ...params }) => {
  const { data: allowed, isLoading } = usePermission(params);
  if (isLoading) return <Spin size="small" />;
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
};
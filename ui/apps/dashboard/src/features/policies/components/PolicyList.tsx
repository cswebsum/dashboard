import React from 'react';
import { Card, Empty } from 'antd';
import { usePolicies } from '../hooks';

export const PolicyList: React.FC = () => {
  const { data, isLoading } = usePolicies();
  return (
    <Card title="Policies">
      {isLoading ? 'Loading...' : <Empty description="No policies" />}
    </Card>
  );
};
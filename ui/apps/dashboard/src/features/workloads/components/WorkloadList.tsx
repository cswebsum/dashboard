import React from 'react';
import { Card, Empty } from 'antd';
import { useWorkloads } from '../hooks';

export const WorkloadList: React.FC = () => {
  const { data, isLoading } = useWorkloads();
  return (
    <Card title="Workloads">
      {isLoading ? 'Loading...' : <Empty description="No workloads" />}
    </Card>
  );
};
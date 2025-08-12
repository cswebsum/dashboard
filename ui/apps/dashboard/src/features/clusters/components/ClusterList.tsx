import React from 'react';
import { Card, Table, Button, Space, Tag, Badge, Progress } from 'antd';
import { useClusters, useDeleteCluster } from '../hooks';
import type { Cluster } from '../types';

function getPercentColor(v: number): string {
  if (v <= 60) return '#52C41A';
  if (v <= 80) return '#FAAD14';
  return '#F5222D';
}

export interface ClusterListProps {
  onCreate?: () => void;
  onEdit?: (cluster: Cluster) => void;
}

export const ClusterList: React.FC<ClusterListProps> = ({ onCreate, onEdit }) => {
  const { data: clusters = [], isLoading } = useClusters();
  const del = useDeleteCluster();

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_: any, r: Cluster) => r.objectMeta.name,
    },
    {
      title: 'Kubernetes',
      dataIndex: 'kubernetesVersion',
      key: 'ver',
      align: 'center' as const,
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'ready',
      key: 'ready',
      align: 'center' as const,
      width: 150,
      render: (v: boolean) =>
        v ? (
          <Badge color={'green'} text={<span style={{ color: '#52c41a' }}>ready</span>} />
        ) : (
          <Badge color={'red'} text={<span style={{ color: '#f5222d' }}>not ready</span>} />
        ),
    },
    {
      title: 'Mode',
      dataIndex: 'syncMode',
      key: 'syncMode',
      align: 'center' as const,
      width: 120,
      render: (v: Cluster['syncMode']) => (
        <Tag color={v === 'Push' ? 'gold' : 'blue'}>{v}</Tag>
      ),
    },
    {
      title: 'CPU',
      key: 'cpu',
      width: 200,
      render: (_: any, r: Cluster) => {
        const fraction = parseFloat(r.allocatedResources.cpuFraction.toFixed(2));
        return <Progress percent={fraction} strokeColor={getPercentColor(fraction)} />;
      },
    },
    {
      title: 'Memory',
      key: 'mem',
      width: 200,
      render: (_: any, r: Cluster) => {
        const fraction = parseFloat(r.allocatedResources.memoryFraction.toFixed(2));
        return <Progress percent={fraction} strokeColor={getPercentColor(fraction)} />;
      },
    },
    {
      title: 'Actions',
      key: 'op',
      width: 220,
      render: (_: any, r: Cluster) => (
        <Space>
          <Button onClick={() => onEdit?.(r)}>Edit</Button>
          <Button danger loading={del.isPending} onClick={() => del.mutate(r.objectMeta.name)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Cluster Management" extra={<Button type="primary" onClick={onCreate}>New</Button>}>
      <Table rowKey={(r) => r.objectMeta.uid} columns={columns as any} loading={isLoading} dataSource={clusters} />
    </Card>
  );
};
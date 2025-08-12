import React from 'react';
import { Card, Progress, Statistic, Row, Col } from 'antd';
import type { Cluster } from '@/features/clusters';

function color(percent: number) {
  if (percent <= 60) return '#52C41A';
  if (percent <= 80) return '#FAAD14';
  return '#F5222D';
}

export interface ClusterResourceSummaryProps {
  cluster: Cluster;
}

export const ClusterResourceSummary: React.FC<ClusterResourceSummaryProps> = ({ cluster }) => {
  const cpu = parseFloat(cluster.allocatedResources.cpuFraction.toFixed(2));
  const mem = parseFloat(cluster.allocatedResources.memoryFraction.toFixed(2));
  const pod = parseFloat(cluster.allocatedResources.podFraction.toFixed(2));

  return (
    <Card title={`Resource Summary: ${cluster.objectMeta.name}`} size="small">
      <Row gutter={16}>
        <Col span={8}>
          <Statistic title="CPU Usage %" value={cpu} suffix="%" />
          <Progress percent={cpu} strokeColor={color(cpu)} />
        </Col>
        <Col span={8}>
          <Statistic title="Memory Usage %" value={mem} suffix="%" />
          <Progress percent={mem} strokeColor={color(mem)} />
        </Col>
        <Col span={8}>
          <Statistic title="Pods Usage %" value={pod} suffix="%" />
          <Progress percent={pod} strokeColor={color(pod)} />
        </Col>
      </Row>
    </Card>
  );
};
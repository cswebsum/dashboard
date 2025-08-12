import React from 'react';
import { Card } from 'antd';
import { Graph } from '@ant-design/plots';
import type { Cluster } from '@/features/clusters';

export interface ClusterTopologyProps {
  clusters: Cluster[];
}

export const ClusterTopology: React.FC<ClusterTopologyProps> = ({ clusters }) => {
  const data = {
    nodes: clusters.map((c) => ({ id: c.objectMeta.name })),
    edges: clusters.slice(1).map((c, idx) => ({ source: clusters[idx].objectMeta.name, target: c.objectMeta.name })),
  };
  const config = {
    data,
    layout: { type: 'force' as const },
    nodeStyle: { fill: '#1677ff' },
    edgeStyle: { stroke: '#aaa' },
    autoFit: true,
    height: 300,
  };
  return (
    <Card title="Cluster Topology" size="small">
      {/* @ts-ignore */}
      <Graph {...(config as any)} />
    </Card>
  );
};
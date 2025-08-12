import React from 'react';
import { Card } from 'antd';
import type { Cluster } from '@/features/clusters/types';

export interface ClusterTopologyProps {
  clusters: Cluster[];
}

export const ClusterTopology: React.FC<ClusterTopologyProps> = ({ clusters }) => {
  const nodes = clusters.map((c) => ({ id: c.objectMeta.name, x: Math.random() * 100, y: Math.random() * 100 }));
  const edges = clusters.slice(1).map((c, idx) => ({ source: clusters[idx].objectMeta.name, target: c.objectMeta.name }));

  const options = {
    type: 'view',
    children: [
      { type: 'link', data: edges, encode: { x: ['source', 'target'], y: ['source', 'target'] }, style: { stroke: '#aaa' } },
      { type: 'point', data: nodes, encode: { x: 'x', y: 'y' }, style: { r: 6, fill: '#1677ff' }, tooltip: { title: 'id' } },
    ],
    height: 300,
    autoFit: true,
  } as any;

  // Lazy require to avoid type issues at build-time
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Chart } = require('@ant-design/plots');

  return (
    <Card title="Cluster Topology" size="small">
      {/* @ts-ignore */}
      <Chart {...options} />
    </Card>
  );
};
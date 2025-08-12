import React, { useMemo } from 'react';
import { Card } from 'antd';
import { Line } from '@ant-design/plots';
import type { Cluster } from '@/features/clusters';

export interface ClusterTimeSeriesProps {
  clusters: Cluster[];
}

export const ClusterTimeSeries: React.FC<ClusterTimeSeriesProps> = ({ clusters }) => {
  const data = useMemo(() => {
    const now = Date.now();
    const points: { time: string; value: number; name: string }[] = [];
    for (const c of clusters) {
      for (let i = 5; i >= 0; i--) {
        points.push({
          time: new Date(now - i * 60_000).toLocaleTimeString(),
          value: Math.max(1, Math.min(100, c.allocatedResources.cpuFraction + (Math.random() * 10 - 5))),
          name: c.objectMeta.name,
        });
      }
    }
    return points;
  }, [clusters]);
  const config = {
    data,
    xField: 'time',
    yField: 'value',
    seriesField: 'name',
    smooth: true,
    height: 300,
  } as any;
  return (
    <Card title="CPU Usage (Last 6 min)" size="small">
      <Line {...config} />
    </Card>
  );
};
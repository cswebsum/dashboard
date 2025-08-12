import React from 'react';
import { render, screen } from '@testing-library/react';
import { ClusterResourceSummary } from './ClusterResourceSummary';

const cluster = {
  objectMeta: { name: 'c1', uid: 'u1' },
  typeMeta: { kind: 'Cluster' },
  ready: true,
  kubernetesVersion: '1.30',
  syncMode: 'Push',
  nodeSummary: { totalNum: 1, readyNum: 1 },
  allocatedResources: {
    cpuCapacity: 1,
    cpuFraction: 10,
    memoryCapacity: 1,
    memoryFraction: 20,
    allocatedPods: 1,
    podCapacity: 10,
    podFraction: 10,
  },
} as any;

describe('ClusterResourceSummary', () => {
  it('renders metrics', () => {
    render(<ClusterResourceSummary cluster={cluster} />);
    expect(screen.getByText(/Resource Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/CPU Usage/i)).toBeInTheDocument();
  });
});
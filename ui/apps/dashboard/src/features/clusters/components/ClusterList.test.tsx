import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClusterList } from './ClusterList';

jest.mock('../hooks', () => {
  return {
    useClusters: () => ({
      data: [
        {
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
        },
      ],
      isLoading: false,
    }),
    useDeleteCluster: () => ({ isPending: false, mutate: jest.fn() }),
  };
});

function wrap(ui: React.ReactNode) {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
}

describe('ClusterList', () => {
  it('renders cluster card and table', () => {
    render(wrap(<ClusterList />));
    expect(screen.getByText(/Cluster Management/i)).toBeInTheDocument();
    expect(screen.getByText('c1')).toBeInTheDocument();
  });
});
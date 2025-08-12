import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useClusters } from './hooks';
import { setupServer } from 'msw/lib/core/index.js';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/v1/cluster', () => {
    return HttpResponse.json({
      code: 200,
      message: 'ok',
      data: {
        listMeta: { totalItems: 1 },
        clusters: [
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
        errors: [],
      },
    });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function wrapper({ children }: any) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useClusters', () => {
  it('fetches clusters', async () => {
    const { result } = renderHook(() => useClusters(), { wrapper });
    await waitFor(() => {
      expect(result.current.data?.length).toBe(1);
    });
  });
});
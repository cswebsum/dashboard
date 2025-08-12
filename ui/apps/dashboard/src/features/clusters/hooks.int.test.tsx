import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useClusters } from './hooks';

let server: any;
let hasMsw = true;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { setupServer } = require('msw/node');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { http, HttpResponse } = require('msw');
  server = setupServer(
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
} catch (e) {
  hasMsw = false;
}

if (hasMsw) {
  beforeAll(() => server.listen());
  // @ts-ignore
  afterEach(() => server.resetHandlers());
  // @ts-ignore
  afterAll(() => server.close());
}

function wrapper({ children }: any) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useClusters', () => {
  (hasMsw ? it : it.skip)('fetches clusters', async () => {
    const { result } = renderHook(() => useClusters(), { wrapper });
    await waitFor(() => {
      expect(result.current.data?.length).toBe(1);
    });
  });
});
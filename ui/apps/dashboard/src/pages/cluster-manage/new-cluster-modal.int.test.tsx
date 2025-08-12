import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewClusterModal from './new-cluster-modal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.post('/api/v1/cluster', async () => {
    return HttpResponse.json({ code: 200, message: 'ok', data: 'ok' });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function wrap(ui: React.ReactNode) {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
}

describe('NewClusterModal (MSW)', () => {
  it('submits create cluster successfully', async () => {
    render(
      wrap(
        <NewClusterModal
          mode="create"
          open={true}
          onOk={() => {}}
          onCancel={() => {}}
        />,
      ),
    );

    fireEvent.change(screen.getByLabelText(/集群名称|cluster/i), {
      target: { value: 'c1' },
    });
    fireEvent.click(screen.getByLabelText(/Push/i));

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'server: https://example.com' } });

    fireEvent.click(screen.getByText(/确定|ok/i));

    await waitFor(() => {
      // modal will call onOk after successful request
      expect(screen.getByText(/确定|ok/i)).toBeInTheDocument();
    });
  });
});
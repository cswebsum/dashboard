import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Cluster } from './types';

const WS_PATH = '/api/v1/ws/clusters';

export function useClusterEvents() {
  const client = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const url = `${protocol}://${window.location.host}${WS_PATH}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onmessage = (evt) => {
        try {
          const payload = JSON.parse(evt.data) as {
            type: 'ADDED' | 'MODIFIED' | 'DELETED';
            cluster: Cluster;
          };
          client.setQueryData<Cluster[]>(['clusters'], (prev = []) => {
            if (payload.type === 'DELETED') {
              return prev.filter((c) => c.objectMeta.name !== payload.cluster.objectMeta.name);
            }
            const idx = prev.findIndex((c) => c.objectMeta.name === payload.cluster.objectMeta.name);
            if (idx >= 0) {
              const next = prev.slice();
              next[idx] = payload.cluster;
              return next;
            }
            return [payload.cluster, ...prev];
          });
        } catch {}
      };
      return () => {
        ws.close();
        wsRef.current = null;
      };
    } catch {
      // ignore
    }
  }, [client]);
}
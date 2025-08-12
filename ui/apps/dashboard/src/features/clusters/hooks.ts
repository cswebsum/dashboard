import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { ClusterService } from './services';
import type { Cluster, ClusterDetail } from './types';

const queryKeys = {
  list: ['clusters'] as const,
  detail: (name: string) => ['cluster', name] as const,
};

export function useClusters() {
  return useQuery({
    queryKey: queryKeys.list,
    queryFn: async () => {
      const ret = await ClusterService.getAll();
      return ret.data.clusters as Cluster[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useClusterDetail(name: string) {
  return useQuery({
    queryKey: queryKeys.detail(name),
    queryFn: async () => {
      const ret = await ClusterService.getDetail(name);
      return ret.data as ClusterDetail;
    },
    enabled: !!name,
  });
}

export function useCreateCluster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ClusterService.create,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.list });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.list });
      message.success('Cluster created successfully');
    },
    onError: (err: any) => {
      message.error(`Failed to create cluster: ${err?.message || err}`);
    },
  });
}

export function useUpdateCluster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ClusterService.update,
    onSuccess: async (res) => {
      const detail = res.data as ClusterDetail;
      qc.setQueryData(queryKeys.detail(detail.objectMeta.name), detail);
      await qc.invalidateQueries({ queryKey: queryKeys.list });
      message.success('Cluster updated');
    },
    onError: (err: any) => {
      message.error(`Failed to update cluster: ${err?.message || err}`);
    },
  });
}

export function useDeleteCluster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ClusterService.remove,
    onMutate: async (name: string) => {
      await qc.cancelQueries({ queryKey: queryKeys.list });
      const prev = qc.getQueryData<Cluster[]>(queryKeys.list);
      if (prev) {
        qc.setQueryData(
          queryKeys.list,
          prev.filter((c) => c.objectMeta.name !== name),
        );
      }
      return { prev } as { prev?: Cluster[] };
    },
    onError: (err: any, _name, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(queryKeys.list, ctx.prev);
      }
      message.error(`Failed to delete cluster: ${err?.message || err}`);
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.list });
    },
  });
}
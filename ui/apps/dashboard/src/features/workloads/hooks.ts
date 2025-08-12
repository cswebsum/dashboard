import { useQuery } from '@tanstack/react-query';
import { WorkloadService } from './services';
import type { WorkloadKind } from '@/services/base';

export function useWorkloads(params?: { namespace?: string; kind?: WorkloadKind; keyword?: string }) {
  const key: [string, typeof params] = ['workloads', params];
  return useQuery({
    queryKey: key,
    queryFn: () => WorkloadService.list(params),
  });
}
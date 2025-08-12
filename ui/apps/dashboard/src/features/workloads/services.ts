import { GetWorkloads } from '@/services/workload';
import type { WorkloadKind } from '@/services/base';

export const WorkloadService = {
  async list(params?: { namespace?: string; kind?: WorkloadKind; keyword?: string }) {
    return GetWorkloads({ kind: params?.kind ?? 'deployment', namespace: params?.namespace, keyword: params?.keyword } as any);
  },
};
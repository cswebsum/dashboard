import { GetWorkloads, WorkloadKind } from '@/services/workload';

export const WorkloadService = {
  async list(params?: { namespace?: string; kind?: WorkloadKind; keyword?: string }) {
    return GetWorkloads({ kind: params?.kind ?? WorkloadKind.Deployment, namespace: params?.namespace, keyword: params?.keyword });
  },
};
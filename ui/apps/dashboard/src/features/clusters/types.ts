import type { Cluster, ClusterDetail } from '@/services/cluster';

export type { Cluster, ClusterDetail };

export interface CreateClusterInput {
  kubeconfig: string;
  clusterName: string;
  mode: 'Push' | 'Pull';
}

export interface UpdateClusterInput {
  clusterName: string;
  labels: { key: string; value: string }[];
  taints: { key: string; value: string; effect: string }[];
}
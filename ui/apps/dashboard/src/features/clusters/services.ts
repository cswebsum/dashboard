import {
  GetClusters,
  GetClusterDetail,
  CreateCluster,
  UpdateCluster,
  DeleteCluster,
} from '@/services/cluster';

export const ClusterService = {
  getAll: GetClusters,
  getDetail: GetClusterDetail,
  create: CreateCluster,
  update: UpdateCluster,
  remove: DeleteCluster,
};
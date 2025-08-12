import {
  GetPropagationPolicies,
  GetClusterPropagationPolicies,
} from '@/services/propagationpolicy';
import { GetOverridePolicies } from '@/services/overridepolicy';

export const PolicyService = {
  async list(params?: { namespace?: string; keyword?: string; type?: 'propagation' | 'override' | 'cluster-propagation' }) {
    switch (params?.type) {
      case 'override':
        return GetOverridePolicies({ namespace: params.namespace, keyword: params.keyword });
      case 'cluster-propagation':
        return GetClusterPropagationPolicies({ keyword: params?.keyword });
      default:
        return GetPropagationPolicies({ namespace: params?.namespace, keyword: params?.keyword });
    }
  },
};
import { useQuery } from '@tanstack/react-query';
import { PolicyService } from './services';

export function usePolicies(params?: { namespace?: string; keyword?: string; type?: 'propagation' | 'override' | 'cluster-propagation' }) {
  const key: [string, typeof params] = ['policies', params];
  return useQuery({
    queryKey: key,
    queryFn: () => PolicyService.list(params),
  });
}
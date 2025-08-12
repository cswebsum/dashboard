import { useQuery } from '@tanstack/react-query';
import { PolicyService } from './services';

export function usePolicies() {
  return useQuery({ queryKey: ['policies'], queryFn: PolicyService.list });
}
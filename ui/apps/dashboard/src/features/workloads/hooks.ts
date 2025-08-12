import { useQuery } from '@tanstack/react-query';
import { WorkloadService } from './services';

export function useWorkloads() {
  return useQuery({ queryKey: ['workloads'], queryFn: WorkloadService.list });
}
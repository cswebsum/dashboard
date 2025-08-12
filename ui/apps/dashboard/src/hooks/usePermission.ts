import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface PermissionParams {
  resource: string;
  verb: string;
  group?: string;
  version?: string;
  name?: string;
  namespace?: string;
}

export function usePermission(params: PermissionParams) {
  return useQuery({
    queryKey: ['permission', params],
    queryFn: async () => {
      const { data } = await axios.post('/api/v1/permissions', params);
      return Boolean(data?.allowed);
    },
  });
}
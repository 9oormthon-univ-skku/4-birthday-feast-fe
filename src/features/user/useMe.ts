import { useQuery } from '@tanstack/react-query';
import { getUserMe, type UserMeResponse } from '@/apis/user';
import { useAuth } from '@/features/auth/useAuth';
import { qk } from '@/features/queryKeys';

export function useMe() {
  const { isAuthenticated } = useAuth();
  const query = useQuery<UserMeResponse>({
    queryKey: qk.auth.me,
    queryFn: getUserMe,
    enabled: isAuthenticated,
  });

  return {
    me: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refresh: () => query.refetch(),
  };
}

// src/hooks/useMe.ts
import { useQuery } from '@tanstack/react-query';
import { getUserMe, type UserMeResponse } from '@/apis/user';
import { useAuth } from '@/hooks/useAuth';
import { qk } from '@/apis/queryKeys';

type UseMeOptions = {
  enabled?: boolean;        // 외부에서 호출 여부 제어
  staleTime?: number;
};

export function useMe(opts: UseMeOptions = {}) {
  const { isAuthenticated } = useAuth();

  const enabled =
    !!isAuthenticated && (opts.enabled ?? true);  // 인증 + 외부 enabled 둘 다 만족해야 호출

  const query = useQuery<UserMeResponse>({
    queryKey: qk.auth.me,
    queryFn: getUserMe,
    enabled,
    staleTime: opts.staleTime ?? 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    me: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refresh: () => query.refetch(),
  };
}

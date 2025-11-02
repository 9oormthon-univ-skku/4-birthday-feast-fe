// src/hooks/useGuestBirthday.ts
import { useQuery, useQueryClient, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { getGuestBirthday, type GuestBirthdayRes } from '@/apis/guest';
import { qk } from '@/app/queryKeys';

/** 게스트 생일상 조회 훅 */
export function useGuestBirthday(
  options?: Omit<
    UseQueryOptions<GuestBirthdayRes, unknown, GuestBirthdayRes, typeof qk.birthdays.guest>,
    'queryKey' | 'queryFn'
  >
): UseQueryResult<GuestBirthdayRes, unknown> {
  return useQuery({
    queryKey: qk.birthdays.guest,
    queryFn: getGuestBirthday,
    retry: (failureCount, err: any) => {
      // 게스트 토큰 만료(401) 등은 재시도하지 않음
      if (err?.response?.status === 401) return false;
      return failureCount < 2;
    },
    ...options,
  });
}

/** 게스트 생일상 캐시 무효화 훅 */
// export function useInvalidateGuestBirthday() {
//   const qc = useQueryClient();
//   return () => qc.invalidateQueries({ queryKey: qk.birthdays.guest });
// }

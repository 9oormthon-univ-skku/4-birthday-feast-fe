// src/routes/loaders/mainHomeLoader.ts
import { qk } from '@/apis/queryKeys';
import { getThisYearBirthday } from '@/apis/birthday';
import type { QueryClient } from '@tanstack/react-query';
import { getLastBirthdayId } from '@/stores/userStorage';

export async function mainHomeLoader(queryClient: QueryClient) {
  const raw = getLastBirthdayId();

  // 1) 로컬스토리지에 아무 값이 없으면 그냥 종료
  if (!raw) {
    console.info('[mainHomeLoader] No local birthday ID found — skipping preload');
    return null; // 또는 undefined
  }

  const birthdayId = Number(raw);

  // 2) 숫자가 아니거나 비정상 값이면 마찬가지로 종료
  if (!Number.isFinite(birthdayId) || birthdayId <= 0) {
    console.warn('[mainHomeLoader] Invalid birthdayId in localStorage:', raw);
    return null;
  }

  // 3) 정상 ID라면 서버 데이터 캐싱 (선로딩)
  try {
    await queryClient.ensureQueryData({
      queryKey: qk.birthdays.thisYearBy(birthdayId),
      queryFn: ({ signal }) => getThisYearBirthday(birthdayId, { signal }),
    });
  } catch (err) {
    console.error('[mainHomeLoader] Failed to preload birthday data:', err);
    // 로드 실패해도 앱이 계속 진행되도록 그냥 반환
    return null;
  }

  // 4) 성공 시 ID 반환
  return { birthdayId };
}

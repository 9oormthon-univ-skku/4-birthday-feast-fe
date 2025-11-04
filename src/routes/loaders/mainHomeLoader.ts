// src/routes/loaders/mainHomeLoader.ts
import { qk } from '@/apis/queryKeys';
import { getThisYearBirthday } from '@/apis/birthday';
import type { QueryClient } from '@tanstack/react-query';
import { LS_LAST_BIRTHDAY } from '@/stores/authStorage';

export async function mainHomeLoader(queryClient: QueryClient) {
  const raw = localStorage.getItem(LS_LAST_BIRTHDAY);
  if (!raw) throw new Response('No local birthday data found', { status: 400 });

  const birthdayId = Number(raw);
  if (!Number.isFinite(birthdayId) || birthdayId <= 0) {
    throw new Response('Invalid birthdayId value in local storage', { status: 400 });
  }

  await queryClient.ensureQueryData({
    queryKey: qk.birthdays.thisYearBy(birthdayId),
    queryFn: ({ signal }) => getThisYearBirthday(birthdayId, { signal }),
  });

  return { birthdayId };
}

import { useQuery } from '@tanstack/react-query';
import { getAllBirthdays, type BirthdayItem, type BirthdayCard } from '@/apis/birthday';
import type { BirthdayCardLike } from '@/types/birthday';
import { adaptServerCards } from '@/hooks/useBirthdayCards';
import { qk } from '@/apis/queryKeys'; // 질문에 주신 qk 파일 경로에 맞춰 import

export type BirthdayWithCards = BirthdayItem & { _cards: BirthdayCardLike[] };

export function useAllBirthdays() {
  return useQuery({
    queryKey: qk.birthdays.allMine,
    queryFn: getAllBirthdays,
    // 서버 응답을 화면용으로 즉시 변환
    select: (list: BirthdayItem[] | undefined | null): BirthdayWithCards[] => {
      if (!Array.isArray(list)) return [];
      return list.map((b) => ({
        ...b,
        _cards: adaptServerCards(b.birthdayCards as BirthdayCard[]),
      }));
    }
  });
}

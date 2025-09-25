// src/features/message/useBirthdayCards.ts
import { useEffect, useMemo, useState } from "react";
import mock from "./messageCakes";
import type { BirthdayCard, BirthdayUser } from "../../types/birthday";

// 나중에 실제 API로 바꿀 때 여기만 교체하면 됨.
async function getCardsMock(): Promise<BirthdayCard[]> {
  const users = mock as BirthdayUser[]; // .d.ts 로 타입 보강
  const user = users[0];
  return user?.birthdayCards ?? [];
}

export function useBirthdayCards() {
  const [data, setData] = useState<BirthdayCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 현재는 동기 import지만, 훅 인터페이스는 비동기처럼 유지
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const cards = await getCardsMock();
        if (mounted) setData(cards);
      } catch (e) {
        if (mounted) setError(e as Error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // 필요 시 파생 데이터 예: 총 개수
  const count = useMemo(() => data.length, [data]);

  // 나중에 API 전환 시에도 유지 가능하도록 refetch 제공
  const refetch = async () => {
    setIsLoading(true);
    try {
      const cards = await getCardsMock();
      setData(cards);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, count, refetch };
}

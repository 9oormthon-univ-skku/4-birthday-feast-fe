import { useEffect, useRef, useState } from "react";
import { createBirthday, getThisYearBirthday, getAllBirthdays } from "@/apis/birthday";

const LS_LAST_BID = "bh.lastBirthdayId";
const LS_LAST_CODE = "bh.lastBirthdayCode";

export type FeastData = {
  userId?: number | string;
  birthdayId?: number | string;
  code?: string;
  birthdayCards?: any[];
};

export type FindThisYearResult = {
  exists: boolean;
  pickedId?: string;
  code?: string;
};

export function useFeastThisYear() {
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  // localStorage의 값을 즉시 반영 (초기 깜빡임 방지)
  const [data, setData] = useState<FeastData | null>(() => {
    const bid = localStorage.getItem(LS_LAST_BID) || undefined;
    const code = localStorage.getItem(LS_LAST_CODE) || undefined;
    if (bid || code) return { birthdayId: bid, code };
    return null;
  });

  const createOnceRef = useRef(false);
  const prefetchOnceRef = useRef(false);
  const bootOnceRef = useRef(false);

  async function pickAnyBirthdayIdFromCacheOrList(): Promise<string | undefined> {
    let bid = localStorage.getItem(LS_LAST_BID) || undefined;
    if (bid) return bid;

    const list = await getAllBirthdays().catch(() => []);
    const picked = Array.isArray(list) && list.length > 0 ? list[0] : null;
    if (picked) {
      bid = String(picked.birthdayId);
      localStorage.setItem(LS_LAST_BID, bid);
      if (picked.code) localStorage.setItem(LS_LAST_CODE, picked.code);
      setData((prev) => ({
        ...(prev || {}),
        userId: picked.userId,
        birthdayId: picked.birthdayId,
        code: picked.code ?? (prev?.code as any),
        birthdayCards: picked.birthdayCards ?? prev?.birthdayCards ?? [],
      }));
    }
    return bid;
  }

  async function findExistingThisYear(): Promise<FindThisYearResult> {
    const bid = await pickAnyBirthdayIdFromCacheOrList();
    if (!bid) return { exists: false };

    try {
      const thisYear = await getThisYearBirthday(bid);
      localStorage.setItem(LS_LAST_BID, String(thisYear.birthdayId));
      if (thisYear.code) localStorage.setItem(LS_LAST_CODE, thisYear.code);
      setData({
        userId: thisYear.userId,
        birthdayId: thisYear.birthdayId,
        code: thisYear.code,
        birthdayCards: thisYear.birthdayCards ?? [],
      });
      return { exists: true, pickedId: String(thisYear.birthdayId), code: thisYear.code };
    } catch {
      return { exists: false, pickedId: bid };
    }
  }

  async function ensureThisYearCreated(): Promise<{ alreadyExists: boolean }> {
    setCreating(true);
    try {
      const check = await findExistingThisYear();
      if (check.exists) return { alreadyExists: true };

      if (createOnceRef.current) return { alreadyExists: false };
      createOnceRef.current = true;

      const created = await createBirthday();
      localStorage.setItem(LS_LAST_BID, String(created.birthdayId));
      if (created.code) localStorage.setItem(LS_LAST_CODE, created.code);
      setData({
        userId: created.userId,
        birthdayId: created.birthdayId,
        code: created.code,
        birthdayCards: created.birthdayCards ?? [],
      });
      return { alreadyExists: false };
    } finally {
      setCreating(false);
    }
  }

  async function preloadThisYearQuietly(): Promise<void> {
    if (prefetchOnceRef.current) return;
    prefetchOnceRef.current = true;

    setLoading(true);
    try {
      const bid = await pickAnyBirthdayIdFromCacheOrList();
      if (!bid) return;

      const thisYear = await getThisYearBirthday(bid);
      localStorage.setItem(LS_LAST_BID, String(thisYear.birthdayId));
      if (thisYear.code) localStorage.setItem(LS_LAST_CODE, thisYear.code);

      setData({
        userId: thisYear.userId,
        birthdayId: thisYear.birthdayId,
        code: thisYear.code,
        birthdayCards: thisYear.birthdayCards ?? [],
      });
    } catch {
      // 조용히 무시
    } finally {
      setLoading(false);
    }
  }

  // 마운트 시 자동 부팅: 캐시값으로 초기 렌더 → 서버로 최신화
  useEffect(() => {
    if (bootOnceRef.current) return;
    bootOnceRef.current = true;
    (async () => {
      setLoading(true);
      try {
        await findExistingThisYear();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 외부에서 강제 재조회가 필요할 때 사용
  async function reload() {
    setLoading(true);
    try {
      await findExistingThisYear();
    } finally {
      setLoading(false);
    }
  }

  return {
    // 상태
    creating,
    loading,
    data, // code 포함

    // 동작
    findExistingThisYear,
    ensureThisYearCreated,
    preloadThisYearQuietly,
    reload, // 강제 갱신
  };
}

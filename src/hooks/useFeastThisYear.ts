// src/features/feast/useFeastThisYear.ts
import { useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBirthday, getThisYearBirthday } from "@/apis/birthday";
import { qk } from "../app/queryKeys";

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
  pickedId?: number | string;
  code?: string;
};

function readLS(key: string): string | undefined {
  try {
    return localStorage.getItem(key) || undefined;
  } catch {
    return undefined;
  }
}

function writeLS(key: string, value?: string) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch { }
}

export function useFeastThisYear() {
  const queryClient = useQueryClient();
  const prefetchOnceRef = useRef(false);

  // 로컬스토리지 캐시값(초기 깜빡임 방지용)
  const cachedBidStr = readLS(LS_LAST_BID);
  const cachedBid = cachedBidStr != null ? Number(cachedBidStr) : undefined; // number | undefined
  const cachedCode = readLS(LS_LAST_CODE);

  const thisYearQuery = useQuery({
    queryKey: cachedBid != null ? qk.birthdays.thisYearBy(cachedBid) : ["birthday", "noop"],
    enabled: cachedBid != null,
    queryFn: async () => {
      const res = await getThisYearBirthday(cachedBid as number);
      writeLS(LS_LAST_BID, String(res.birthdayId));
      if (res.code) writeLS(LS_LAST_CODE, res.code);
      return res;
    },
    initialData: () => {
      if (cachedBid == null) return undefined;
      const fromCache = queryClient.getQueryData(qk.birthdays.thisYearBy(cachedBid));
      if (fromCache) return fromCache as any;

      if (cachedCode) {
        return { birthdayId: cachedBid, code: cachedCode, birthdayCards: [] } as any;
      }
      return undefined;
    },
    initialDataUpdatedAt: () => {
      if (cachedBid == null) return undefined;
      return queryClient.getQueryState(qk.birthdays.thisYearBy(cachedBid))?.dataUpdatedAt;
    },
    staleTime: 60 * 1000,
  });

  // createBirthday 뮤테이션
  const createMutation = useMutation({
    mutationFn: async () => {
      const created = await createBirthday(); // created.birthdayId: number 가정
      writeLS(LS_LAST_BID, String(created.birthdayId));
      if (created.code) writeLS(LS_LAST_CODE, created.code);

      queryClient.setQueryData(qk.birthdays.thisYearBy(created.birthdayId), created);

      if (cachedBid != null && cachedBid !== created.birthdayId) {
        queryClient.setQueryData(qk.birthdays.thisYearBy(cachedBid), created);
      }
      return created;
    },
  });

  /** 올해 데이터 존재 유무 체크 */
  async function findExistingThisYear() {
    const bidStr = readLS(LS_LAST_BID);
    const bid = bidStr != null ? Number(bidStr) : undefined;
    if (bid == null || !Number.isFinite(bid)) return { exists: false };

    try {
      const thisYear = await queryClient.fetchQuery({
        queryKey: qk.birthdays.thisYearBy(bid),
        queryFn: async () => {
          const res = await getThisYearBirthday(bid);
          writeLS(LS_LAST_BID, String(res.birthdayId));
          if (res.code) writeLS(LS_LAST_CODE, res.code);
          return res;
        },
      });
      return { exists: true, pickedId: thisYear.birthdayId, code: thisYear.code };
    } catch {
      return { exists: false, pickedId: bid };
    }
  }

  /** 없으면 생성 */
  async function ensureThisYearCreated(): Promise<{ alreadyExists: boolean }> {
    const check = await findExistingThisYear();
    if (check.exists) return { alreadyExists: true };
    await createMutation.mutateAsync();
    return { alreadyExists: false };
  }

  /** 조용한 프리페치(최초 1회) */
  async function preloadThisYearQuietly() {
    if (prefetchOnceRef.current) return;
    prefetchOnceRef.current = true;

    const bidStr = readLS(LS_LAST_BID);
    const bid = bidStr != null ? Number(bidStr) : undefined;
    if (bid == null || !Number.isFinite(bid)) return;

    try {
      await queryClient.prefetchQuery({
        queryKey: qk.birthdays.thisYearBy(bid),
        queryFn: async () => {
          const res = await getThisYearBirthday(bid);
          writeLS(LS_LAST_BID, String(res.birthdayId));
          if (res.code) writeLS(LS_LAST_CODE, res.code);
          return res;
        },
        staleTime: 60 * 1000,
      });
    } catch { }
  }

  /** 강제 갱신 */
  async function reload() {
    const bidStr = readLS(LS_LAST_BID);
    const bid = bidStr != null ? Number(bidStr) : undefined;
    if (bid == null || !Number.isFinite(bid)) return;
    await queryClient.invalidateQueries({ queryKey: qk.birthdays.thisYearBy(bid) });
    await queryClient.refetchQueries({ queryKey: qk.birthdays.thisYearBy(bid) });
  }

  // 렌더용 데이터 매핑(이미 캐시에 있으면 즉시 카드 사용 가능)
  const data: FeastData | null = useMemo(() => {
    const r = thisYearQuery.data as any;
    if (!r) {
      if (cachedBid != null || cachedCode) {
        return { birthdayId: cachedBid, code: cachedCode, birthdayCards: [] };
      }
      return null;
    }
    return {
      userId: r.userId,
      birthdayId: r.birthdayId,
      code: r.code,
      birthdayCards: r.birthdayCards ?? [],
    };
  }, [thisYearQuery.data, cachedBid, cachedCode]);

  const creating = createMutation.isPending;
  const loading = thisYearQuery.isFetching || thisYearQuery.isPending;

  return {
    creating,
    loading,
    data, // ← 여기에 birthdayCards가 즉시 들어옴(캐시가 있으면)
    findExistingThisYear,
    ensureThisYearCreated,
    preloadThisYearQuietly,
    reload,
  };
}

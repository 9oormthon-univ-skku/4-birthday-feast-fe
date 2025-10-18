// src/features/feast/useFeastThisYear.ts
import { useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBirthday, getThisYearBirthday } from "@/apis/birthday";
import { qk } from "../lib/queryKeys";

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
  const cachedBid = readLS(LS_LAST_BID);
  const cachedCode = readLS(LS_LAST_CODE);

  // 올해 생일상 조회 쿼리 (bid가 있어야 동작)
  const thisYearQuery = useQuery({
    queryKey: cachedBid ? qk.birthdays.thisYearBy(cachedBid) : ["birthday", "noop"],
    enabled: !!cachedBid,
    queryFn: async () => {
      const res = await getThisYearBirthday(cachedBid as string);
      // 성공 시 로컬스토리지 동기화
      writeLS(LS_LAST_BID, String(res.birthdayId));
      if (res.code) writeLS(LS_LAST_CODE, res.code);
      return res;
    },
    /**
     * ✅ 초기 데이터 전략
     * 1) 이미 어딘가에서 동일 키로 prefetch/useQuery 했다면, 그 캐시를 '즉시' 사용
     * 2) 그렇지 않다면, LS의 bid/code로 얇은 스켈레톤을 제공(카드 빈 배열)
     */
    initialData: () => {
      if (!cachedBid) return undefined;
      const fromCache = queryClient.getQueryData(qk.birthdays.thisYearBy(cachedBid));
      if (fromCache) return fromCache as any;

      if (cachedCode) {
        return {
          birthdayId: cachedBid,
          code: cachedCode,
          birthdayCards: [],
        } as any;
      }
      return undefined;
    },
    // 초기 캐시 타임스탬프도 승계(있다면) → 불필요한 재요청 감소
    initialDataUpdatedAt: () => {
      if (!cachedBid) return undefined;
      const ts = queryClient.getQueryState(qk.birthdays.thisYearBy(cachedBid))?.dataUpdatedAt;
      return ts;
    },
    staleTime: 60 * 1000,
  });

  // createBirthday 뮤테이션
  const createMutation = useMutation({
    mutationFn: async () => {
      const created = await createBirthday();
      // 로컬스토리지 반영
      writeLS(LS_LAST_BID, String(created.birthdayId));
      if (created.code) writeLS(LS_LAST_CODE, created.code);
      // 쿼리 캐시 갱신(표준 키 사용)
      queryClient.setQueryData(qk.birthdays.thisYearBy(String(created.birthdayId)), created);
      // 만약 초기에는 cachedBid로 키가 잡혀 있었다면 그 키에도 일시 반영
      if (cachedBid && cachedBid !== String(created.birthdayId)) {
        queryClient.setQueryData(qk.birthdays.thisYearBy(cachedBid), created);
      }
      return created;
    },
  });

  /** 올해 데이터 존재 유무 체크 */
  async function findExistingThisYear(): Promise<FindThisYearResult> {
    const bid = readLS(LS_LAST_BID);
    if (!bid) return { exists: false };

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
      return {
        exists: true,
        pickedId: String(thisYear.birthdayId),
        code: thisYear.code,
      };
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
  async function preloadThisYearQuietly(): Promise<void> {
    if (prefetchOnceRef.current) return;
    prefetchOnceRef.current = true;

    const bid = readLS(LS_LAST_BID);
    if (!bid) return;

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
    } catch {
      // 조용히 무시
    }
  }

  /** 강제 갱신 */
  async function reload() {
    const bid = readLS(LS_LAST_BID);
    if (!bid) return;
    await queryClient.invalidateQueries({ queryKey: qk.birthdays.thisYearBy(bid) });
    await queryClient.refetchQueries({ queryKey: qk.birthdays.thisYearBy(bid) });
  }

  // 렌더용 데이터 매핑(이미 캐시에 있으면 즉시 카드 사용 가능)
  const data: FeastData | null = useMemo(() => {
    const r = thisYearQuery.data as any;
    if (!r) {
      if (cachedBid || cachedCode) return { birthdayId: cachedBid, code: cachedCode, birthdayCards: [] };
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

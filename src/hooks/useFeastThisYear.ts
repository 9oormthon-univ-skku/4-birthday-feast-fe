// src/features/feast/useFeastThisYear.ts
import { useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBirthday, getThisYearBirthday } from "@/apis/birthday";
import { qk } from "@/apis/queryKeys";
import { LS_LAST_BIRTHDAY } from "@/stores/authStorage";

// export const LS_LAST_BID = "bh.lastBirthdayId"; [레거시]
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

/** 에러 알림(콘솔 + alert). 환경/SSR 안전 처리 */
function notifyError(message: string, err?: unknown) {
  try {
    // 상세는 콘솔에 남기고, 사용자에겐 간단히 알림
    // eslint-disable-next-line no-console
    console.error(`[useFeastThisYear] ${message}`, err);
    if (typeof window !== "undefined" && typeof window.alert === "function") {
      window.alert(message);
    }
  } catch {
    /* no-op */
  }
}

export function useFeastThisYear() {
  const queryClient = useQueryClient();
  const prefetchOnceRef = useRef(false);

  // 로컬스토리지 캐시값(초기 깜빡임 방지용)
  const cachedBidStr = readLS(LS_LAST_BIRTHDAY);
  const cachedBid = cachedBidStr != null ? Number(cachedBidStr) : undefined; // number | undefined
  const cachedCode = readLS(LS_LAST_CODE);

  const thisYearQuery = useQuery({
    queryKey: cachedBid != null ? qk.birthdays.thisYearBy(cachedBid) : ["birthday", "noop"],
    enabled: cachedBid != null,
    queryFn: async () => {
      const res = await getThisYearBirthday(cachedBid as number);
      writeLS(LS_LAST_BIRTHDAY, String(res.birthdayId));
      if (res.code) writeLS(LS_LAST_CODE, res.code);
      return res;
    },
    staleTime: 10 * 60 * 1000,  // 🎂 10분
    gcTime: 60 * 60 * 1000,     // 🎂 1시간
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
    // staleTime: 60 * 1000,
    // onError: (err) => { // v4 레거시 방식 
    //   notifyError("올해 생일상 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.", err);
    // },
  });
  // ✅ v5 방식: 결과를 보고 사이드이펙트로 에러 처리
  useEffect(() => {
    if (thisYearQuery.isError) {
      notifyError(
        "올해 생일상 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
        thisYearQuery.error
      );
    }
  }, [thisYearQuery.isError, thisYearQuery.error]);


  // createBirthday 뮤테이션
  const createMutation = useMutation({
    mutationFn: async () => {
      const created = await createBirthday(); // created.birthdayId: number 가정
      writeLS(LS_LAST_BIRTHDAY, String(created.birthdayId));
      if (created.code) writeLS(LS_LAST_CODE, created.code);

      queryClient.setQueryData(qk.birthdays.thisYearBy(created.birthdayId), created);

      if (cachedBid != null && cachedBid !== created.birthdayId) {
        queryClient.setQueryData(qk.birthdays.thisYearBy(cachedBid), created);
      }
      return created;
    },
    onError: (err) => {
      notifyError("생일상 생성에 실패했어요. 잠시 후 다시 시도해 주세요.", err);
    },
  });

  /** 올해 데이터 존재 유무 체크 */
  async function findExistingThisYear(): Promise<FindThisYearResult> {
    const bidStr = readLS(LS_LAST_BIRTHDAY);
    const bid = bidStr != null ? Number(bidStr) : undefined;
    if (bid == null || !Number.isFinite(bid)) return { exists: false };

    try {
      const thisYear = await queryClient.fetchQuery({
        queryKey: qk.birthdays.thisYearBy(bid),
        queryFn: async () => {
          const res = await getThisYearBirthday(bid);
          writeLS(LS_LAST_BIRTHDAY, String(res.birthdayId));
          if (res.code) writeLS(LS_LAST_CODE, res.code);
          return res;
        },
      });
      return { exists: true, pickedId: thisYear.birthdayId, code: thisYear.code };
    } catch (err) {
      // 조용히 존재하지 않음으로 처리(UX상 과도한 경고 방지)
      return { exists: false, pickedId: bid };
    }
  }

  /** 없으면 생성 */
  async function ensureThisYearCreated(): Promise<{ alreadyExists: boolean }> {
    const check = await findExistingThisYear();
    if (check.exists) return { alreadyExists: true };
    try {
      await createMutation.mutateAsync();
      return { alreadyExists: false };
    } catch (err) {
      // onError에서 alert했지만 호출자 입장에서도 한 번 더 보장
      notifyError("생일상 생성 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.", err);
      throw err;
    }
  }

  /** 조용한 프리페치(최초 1회) */
  async function preloadThisYearQuietly() {
    if (prefetchOnceRef.current) return;
    prefetchOnceRef.current = true;

    const bidStr = readLS(LS_LAST_BIRTHDAY);
    const bid = bidStr != null ? Number(bidStr) : undefined;
    if (bid == null || !Number.isFinite(bid)) return;

    try {
      await queryClient.prefetchQuery({
        queryKey: qk.birthdays.thisYearBy(bid),
        queryFn: async () => {
          const res = await getThisYearBirthday(bid);
          writeLS(LS_LAST_BIRTHDAY, String(res.birthdayId));
          if (res.code) writeLS(LS_LAST_CODE, res.code);
          return res;
        },
        staleTime: 60 * 1000,
      });
    } catch {
      // "조용한" 프리패치: 실패시 알림 없음
    }
  }

  /** 강제 갱신 */
  async function reload() {
    const bidStr = readLS(LS_LAST_BIRTHDAY);
    const bid = bidStr != null ? Number(bidStr) : undefined;
    if (bid == null || !Number.isFinite(bid)) return;
    try {
      await queryClient.invalidateQueries({ queryKey: qk.birthdays.thisYearBy(bid) });
      await queryClient.refetchQueries({ queryKey: qk.birthdays.thisYearBy(bid) });
    } catch (err) {
      notifyError("생일상 정보를 새로고침하지 못했어요. 잠시 후 다시 시도해 주세요.", err);
    }
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

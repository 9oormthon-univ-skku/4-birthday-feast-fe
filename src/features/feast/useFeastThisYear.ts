// src/features/feast/useFeastThisYear.ts
import { useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBirthday, getThisYearBirthday } from "@/apis/birthday";

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

const qk = {
  thisYear: (bid: string | undefined) => ["feast", "thisYear", bid] as const,
} as const;

export function useFeastThisYear() {
  const queryClient = useQueryClient();
  const prefetchOnceRef = useRef(false);

  // 로컬스토리지 캐시값(초기 깜빡임 방지용)
  const cachedBid = readLS(LS_LAST_BID);
  const cachedCode = readLS(LS_LAST_CODE);

  // 올해 생일상 조회 쿼리 (bid가 있어야 동작)
  const thisYearQuery = useQuery({
    queryKey: qk.thisYear(cachedBid),
    enabled: !!cachedBid, // 캐시 없으면 조회 스킵(기존 동작과 동일)
    queryFn: async () => {
      // bid는 enabled 조건상 존재
      const res = await getThisYearBirthday(cachedBid as string);
      // 성공 시 로컬스토리지 동기화
      writeLS(LS_LAST_BID, String(res.birthdayId));
      if (res.code) writeLS(LS_LAST_CODE, res.code);
      return res;
    },
    // 초기 화면 깜빡임 방지: 캐시된 bid/code만큼 초기데이터 설정
    initialData: () =>
      cachedBid || cachedCode
        ? ({
          birthdayId: cachedBid,
          code: cachedCode,
          birthdayCards: [],
        } as any)
        : undefined,
  });

  // createBirthday 뮤테이션
  const createMutation = useMutation({
    mutationFn: async () => {
      const created = await createBirthday();
      // 로컬스토리지 반영
      writeLS(LS_LAST_BID, String(created.birthdayId));
      if (created.code) writeLS(LS_LAST_CODE, created.code);
      // 쿼리 캐시 갱신
      queryClient.setQueryData(qk.thisYear(String(created.birthdayId)), created);
      // 기존 bid 키에도 넣어서 바로 소비 가능하도록(초기엔 cachedBid 기준 키가 잡혀 있을 수 있음)
      if (cachedBid && cachedBid !== String(created.birthdayId)) {
        queryClient.setQueryData(qk.thisYear(cachedBid), created);
      }
      return created;
    },
  });

  /** 기존 시그니처 유지: 올해 데이터 존재 유무 체크 */
  async function findExistingThisYear(): Promise<FindThisYearResult> {
    const bid = readLS(LS_LAST_BID);
    if (!bid) return { exists: false };

    try {
      // 네트워크 최신화 (캐시에 있어도 fetchQuery로 재검증)
      const thisYear = await queryClient.fetchQuery({
        queryKey: qk.thisYear(bid),
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
      // 404 등: 올해 데이터 없음
      return { exists: false, pickedId: bid };
    }
  }

  /** 기존 시그니처 유지: 없으면 생성, 있으면 alreadyExists:true */
  async function ensureThisYearCreated(): Promise<{ alreadyExists: boolean }> {
    // 1) 존재 확인
    const check = await findExistingThisYear();
    if (check.exists) return { alreadyExists: true };

    // 2) 생성
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
        queryKey: qk.thisYear(bid),
        queryFn: async () => {
          const res = await getThisYearBirthday(bid);
          writeLS(LS_LAST_BID, String(res.birthdayId));
          if (res.code) writeLS(LS_LAST_CODE, res.code);
          return res;
        },
      });
    } catch {
      // 조용히 무시
    }
  }

  /** 강제 갱신 */
  async function reload() {
    const bid = readLS(LS_LAST_BID);
    if (!bid) return;
    await queryClient.invalidateQueries({ queryKey: qk.thisYear(bid) });
    await queryClient.refetchQueries({ queryKey: qk.thisYear(bid) });
  }

  // 기존 인터페이스에 맞춰 매핑
  const data: FeastData | null = useMemo(() => {
    const r = thisYearQuery.data as any;
    if (!r) {
      // 초기 로컬캐시만 있는 경우
      if (cachedBid || cachedCode) return { birthdayId: cachedBid, code: cachedCode };
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
    // 상태
    creating,
    loading,
    data, // code 포함

    // 동작
    findExistingThisYear,
    ensureThisYearCreated,
    preloadThisYearQuietly,
    reload,
  };
}

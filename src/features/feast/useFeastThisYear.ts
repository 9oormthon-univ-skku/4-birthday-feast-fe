// src/features/feast/useFeastThisYear.ts
import { useRef, useState } from "react";
import { createBirthday, getThisYearBirthday, getAllBirthdays } from "@/apis/birthday";

const LS_LAST_BID = "bh.lastBirthdayId";
const LS_LAST_CODE = "bh.lastBirthdayCode";

export type FindThisYearResult = {
  exists: boolean;
  pickedId?: string;
  code?: string;
};

export function useFeastThisYear() {
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  // 중복 호출 방지용
  const createOnceRef = useRef(false);
  const prefetchOnceRef = useRef(false);

  /** 내부 유틸: 가장 최근의 birthdayId 를 가져오거나 목록에서 하나 고르기 */
  async function pickAnyBirthdayIdFromCacheOrList(): Promise<string | undefined> {
    let bid = localStorage.getItem(LS_LAST_BID) || undefined;
    if (bid) return bid;

    const list = await getAllBirthdays().catch(() => []);
    const picked = Array.isArray(list) && list.length > 0 ? list[0] : null;
    if (picked) {
      bid = String(picked.birthdayId);
      localStorage.setItem(LS_LAST_BID, bid);
      if (picked.code) localStorage.setItem(LS_LAST_CODE, picked.code);
    }
    return bid;
  }

  /** 올해 생일상 존재 여부 + 캐시 업데이트 */
  async function findExistingThisYear(): Promise<FindThisYearResult> {
    const bid = await pickAnyBirthdayIdFromCacheOrList();
    if (!bid) return { exists: false };

    try {
      const thisYear = await getThisYearBirthday(bid);
      localStorage.setItem(LS_LAST_BID, String(thisYear.birthdayId));
      if (thisYear.code) localStorage.setItem(LS_LAST_CODE, thisYear.code);
      return { exists: true, pickedId: String(thisYear.birthdayId), code: thisYear.code };
    } catch {
      // 404/빈 응답 → 올해 없음
      return { exists: false, pickedId: bid };
    }
  }

  /**
   * 생일 입력 직후 호출:
   * - 이미 올해 생일상이 있으면 생성 생략하고 true 반환
   * - 없으면 1회만 생성 시도 후 false→true 흐름으로 이어질 수 있게
   */
  async function ensureThisYearCreated(): Promise<{ alreadyExists: boolean }> {
    setCreating(true);
    try {
      const check = await findExistingThisYear();
      if (check.exists) return { alreadyExists: true };

      if (createOnceRef.current) {
        // 이미 다른 곳에서 생성 시도 중이었다면 중복 생성 방지
        return { alreadyExists: false };
      }
      createOnceRef.current = true;

      const data = await createBirthday();
      localStorage.setItem(LS_LAST_BID, String(data.birthdayId));
      if (data.code) localStorage.setItem(LS_LAST_CODE, data.code);

      return { alreadyExists: false };
    } finally {
      setCreating(false);
    }
  }

  /**
   * 환영 모달 닫힐 때 등, 가볍게 올해 데이터 프리페치
   * 실패해도 throw 하지 않고 조용히 끝냄
   */
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
    } catch {
      // 무시하고 끝
    } finally {
      setLoading(false);
    }
  }

  return {
    // 상태
    creating,        // 생성 중 로딩
    loading,         // 프리페치 로딩

    // 동작
    findExistingThisYear,
    ensureThisYearCreated,
    preloadThisYearQuietly,
  };
}

// src/features/message/useBirthdayCards.ts
import { useEffect, useMemo, useState } from "react";
import type { BirthdayCard } from "@/types/birthday";
import { getAllBirthdays, getThisYearBirthday } from "@/apis/birthday";

// ---- 에셋 매핑 유틸 (food-*) -------------------------------------------------
const assetModules = import.meta.glob("../../assets/images/food-*.{svg,png,jpg,jpeg}", {
  eager: true,
});
const FOOD_KEYS = Object.keys(assetModules)
  .map((p) => p.split("/").pop()!)                // "food-1.svg"
  .map((f) => f.replace(/\.(svg|png|jpe?g)$/, "")); // "food-1"

function resolveAssetUrl(key: string): string | undefined {
  const candidates = [
    `../../assets/images/${key}.svg`,
    `../../assets/images/${key}.png`,
    `../../assets/images/${key}.jpg`,
    `../../assets/images/${key}.jpeg`,
  ];
  for (const p of candidates) {
    const mod: any = (assetModules as any)[p];
    if (mod) return mod.default ?? mod; // Vite: 에셋 URL
  }
  return undefined;
}

// ---- 로컬스토리지 폴백 (이 부분 추후 삭제 고려)--------------------------------------------------------
const STORAGE_KEY = "birthday_cards"; // 기존 키 유지

type LocalCard = {
  birthdayCardId: string | number;
  message: string;
  nickname?: string;
  imageUrl?: string; // 절대 URL 또는 "food-3" 같은 키
};

function readLocalCards(): LocalCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// "food-3" 같은 키 또는 절대 URL을 최종 URL로 변환
function toImageUrl(candidate: string | null | undefined, indexSeed = 0): string {
  // 키 패턴이면 에셋으로
  if (candidate && /^food-\d+[a-zA-Z]*$/.test(candidate)) {
    const u = resolveAssetUrl(candidate);
    if (u) return u;
  }
  // 절대 URL이면 그대로
  if (candidate && /^https?:\/\//.test(candidate)) return candidate;

  // 인덱스 기반 폴백
  const key = FOOD_KEYS[indexSeed % Math.max(FOOD_KEYS.length, 1)] ?? "food-1";
  return resolveAssetUrl(key) ?? "";
}

// ---- 서버 → BirthdayCard 어댑터 ----------------------------------------------
type ServerBirthdayCard = {
  birthdayCardId: number | string;
  message: string;
  nickname?: string | null;
  imageUrl?: string | null; // 절대 URL 또는 "food-3" 등 키일 수 있음
};

function adaptServerCards(list: ServerBirthdayCard[]): BirthdayCard[] {
  return list.map((c, i) => ({
    birthdayCardId: c.birthdayCardId,
    message: c.message,
    nickname: (c.nickname ?? "").trim() || "익명",
    imageUrl: toImageUrl(c.imageUrl ?? undefined, i),
  }));
}

function adaptLocalCards(list: LocalCard[]): BirthdayCard[] {
  return list.map((c, i) => ({
    birthdayCardId: c.birthdayCardId,
    message: c.message,
    nickname: (c.nickname ?? "").trim() || "익명",
    imageUrl: toImageUrl(c.imageUrl ?? undefined, i),
  }));
}

// ---- 올해 생일상 ID 선택 (캐시 → 목록) ---------------------------------------
const LS_LAST_BID = "bh.lastBirthdayId";
const LS_LAST_CODE = "bh.lastBirthdayCode";

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

// ---- 메인 훅 ------------------------------------------------------------------
export function useBirthdayCards() {
  const [data, setData] = useState<BirthdayCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1) 올해 생일상 ID 확보
      const bid = await pickAnyBirthdayIdFromCacheOrList();
      if (!bid) {
        // 서버 데이터가 전혀 없으면 로컬 폴백
        /*
        const local = readLocalCards();
        setData(adaptLocalCards(local));
        */
        return;
      }

      // 2) 올해 생일상 상세 조회 (여기서 birthdayCards 포함됨)
      const thisYear = await getThisYearBirthday(bid);
      // 응답 구조 예시: { birthdayId, code, birthdayCards: ServerBirthdayCard[] }
      const serverCards: ServerBirthdayCard[] = Array.isArray(thisYear?.birthdayCards)
        ? thisYear.birthdayCards
        : [];

      // 3) 서버 카드 사용, 없는 경우 로컬 폴백
      if (serverCards.length > 0) {
        setData(adaptServerCards(serverCards));
      } else {
        /*
        const local = readLocalCards();
        setData(adaptLocalCards(local));
        */
      }

      // 캐시 최신화
      if (thisYear?.birthdayId) localStorage.setItem(LS_LAST_BID, String(thisYear.birthdayId));
      if (thisYear?.code) localStorage.setItem(LS_LAST_CODE, String(thisYear.code));
    } catch (e) {
      // 서버 실패 → 로컬 폴백
      setError(e as Error);
      /*
      const local = readLocalCards();
      setData(adaptLocalCards(local));
      */
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();

    // 다른 탭/창에서 localStorage 변경 시 실시간 반영
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const count = useMemo(() => data.length, [data]);
  const refetch = () => void load();

  return { data, isLoading, error, count, refetch };
}

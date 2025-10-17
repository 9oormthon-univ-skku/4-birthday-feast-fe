// src/features/message/useBirthdayCards.ts
import { useEffect, useMemo } from "react";
import type { BirthdayCard } from "@/types/birthday";
import { useFeastThisYear } from "../feast/useFeastThisYear";
// import { useFeastThisYear } from "@/features/feast/useFeastThisYear"; // ⬅️ 핵심: 올해 데이터 훅 사용

// ---- 에셋 매핑 유틸 (food-*) -------------------------------------------------
const assetModules = import.meta.glob("../../assets/images/food-*.{svg,png,jpg,jpeg}", {
  eager: true,
});
const FOOD_KEYS = Object.keys(assetModules)
  .map((p) => p.split("/").pop()!)
  .map((f) => f.replace(/\.(svg|png|jpe?g)$/, ""));

function resolveAssetUrl(key: string): string | undefined {
  const candidates = [
    `../../assets/images/${key}.svg`,
    `../../assets/images/${key}.png`,
    `../../assets/images/${key}.jpg`,
    `../../assets/images/${key}.jpeg`,
  ];
  for (const p of candidates) {
    const mod: any = (assetModules as any)[p];
    if (mod) return mod.default ?? mod;
  }
  return undefined;
}

function toImageUrl(candidate: string | null | undefined, indexSeed = 0): string {
  if (candidate && /^food-\d+[a-zA-Z]*$/.test(candidate)) {
    const u = resolveAssetUrl(candidate);
    if (u) return u;
  }
  if (candidate && /^https?:\/\//.test(candidate)) return candidate;

  const key = FOOD_KEYS[indexSeed % Math.max(FOOD_KEYS.length, 1)] ?? "food-1";
  return resolveAssetUrl(key) ?? "";
}

// ---- 로컬스토리지 폴백 --------------------------------------------------------
const STORAGE_KEY = "birthday_cards";

type LocalCard = {
  birthdayCardId: string | number;
  message: string;
  nickname?: string;
  imageUrl?: string;
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

// ---- 서버 → BirthdayCard 어댑터 ----------------------------------------------
type ServerBirthdayCard = {
  birthdayCardId: number | string;
  message: string;
  nickname?: string | null;
  imageUrl?: string | null;
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

// ---- 메인 훅 ------------------------------------------------------------------
export function useBirthdayCards() {
  // 올해 생일상 데이터(캐시 포함)를 즉시 사용
  const { data: feast, loading, reload, preloadThisYearQuietly } = useFeastThisYear();

  // 앱 진입 시 조용히 프리페치(최초 1회)
  useEffect(() => {
    preloadThisYearQuietly();
  }, [preloadThisYearQuietly]);

  // 서버 카드 우선 사용, 없으면 로컬 폴백
  const serverCards: ServerBirthdayCard[] = useMemo(() => {
    return Array.isArray(feast?.birthdayCards) ? (feast!.birthdayCards as ServerBirthdayCard[]) : [];
  }, [feast?.birthdayCards]);

  const data: BirthdayCard[] = useMemo(() => {
    if (serverCards.length > 0) return adaptServerCards(serverCards);
    return adaptLocalCards(readLocalCards());
  }, [serverCards]);

  // 다른 탭/창에서 로컬 카드가 바뀌면 서버/캐시도 재확인
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        reload(); // 올해 데이터 쿼리 invalidate+refetch
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [reload]);

  // 캐시가 있어 즉시 카드가 만들어지면 로딩 표시를 줄여 UX 개선
  const isLoading = loading && serverCards.length === 0;
  const error: Error | null = null; // 오류 처리는 useFeastThisYear 내부에서 관리 중

  const count = useMemo(() => data.length, [data]);
  const refetch = () => void reload();

  return { data, isLoading, error, count, refetch };
}

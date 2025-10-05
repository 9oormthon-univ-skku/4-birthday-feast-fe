// src/features/message/useBirthdayCards.ts
import { useEffect, useMemo, useState } from "react";
import raw from "./messageCakes.json"; // 폴백용 더미
import type { BirthdayCard, BirthdayUser } from "@/types/birthday";

// 1) assets 폴더의 food-* 이미지 전부 수집
const assetModules = import.meta.glob("../../assets/images/food-*.{svg,png,jpg,jpeg}", {
  eager: true,
});

// 2) 파일명 목록 → ["food-1", "food-2", ...]
const FOOD_KEYS = Object.keys(assetModules)
  .map((p) => p.split("/").pop()!)                // "food-1.svg"
  .map((f) => f.replace(/\.(svg|png|jpe?g)$/, "")); // "food-1"

// 3) "food-1" 같은 키를 실제 URL로 변환
function resolveAssetUrl(key: string): string | undefined {
  const candidates = [
    `../../assets/images/${key}.svg`,
    `../../assets/images/${key}.png`,
    `../../assets/images/${key}.jpg`,
    `../../assets/images/${key}.jpeg`,
  ];
  for (const p of candidates) {
    const mod: any = (assetModules as any)[p];
    if (mod) {
      return mod.default ?? mod; // Vite: 에셋 임포트 default = URL
    }
  }
  return undefined;
}

const STORAGE_KEY = "birthday_cards";

// 로컬스토리지 → 안전 파싱
type LocalCard = {
  birthdayCardId: string | number;
  message: string;
  nickname?: string;
  imageUrl?: string;         // 절대경로 URL 또는 "food-3" 같은 키일 수도 있음
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

// LocalCard → BirthdayCard로 어댑트 + 이미지 URL 해석
function adaptToBirthdayCard(list: LocalCard[]): BirthdayCard[] {
  return list.map((c, idx) => {
    const candidateKey =
      // imageUrl이 "food-3" 같이 키로 들어왔다면 그대로 사용
      (c.imageUrl && /^food-\d+[a-zA-Z]*$/.test(c.imageUrl) ? c.imageUrl : undefined)
      // 없으면 인덱스로 순환 매핑
      ?? FOOD_KEYS[idx % Math.max(FOOD_KEYS.length, 1)]
      ?? "food-1";

    const assetUrl =
      (candidateKey ? resolveAssetUrl(candidateKey) : undefined)
      // imageUrl이 http(s)로 온 경우 그대로 사용
      ?? (c.imageUrl && /^https?:\/\//.test(c.imageUrl) ? c.imageUrl : undefined);

    const fallbackUrl = resolveAssetUrl("food-1");

    // BirthdayCard 타입에 맞춰 매핑
    const adapted: BirthdayCard = {
      // 프로젝트의 BirthdayCard 타입에 맞춰 필드명 사용
      // (아래 필드명이 다르면 타입 정의에 맞게 바꿔주세요)
      birthdayCardId: c.birthdayCardId,
      message: c.message,
      nickname: c.nickname ?? "익명",
      imageUrl: assetUrl ?? fallbackUrl ?? "",
    } as BirthdayCard;

    return adapted;
  });
}

export function useBirthdayCards() {
  const [data, setData] = useState<BirthdayCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = () => {
    try {
      setIsLoading(true);

      const local = readLocalCards();
      if (local.length > 0) {
        setData(adaptToBirthdayCard(local));
        setError(null);
      } else {
        // 로컬 데이터 없으면 빈 배열
        setData([]);
        setError(null);
      }
    } catch (e) {
      setError(e as Error);
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
  const refetch = () => load();

  return { data, isLoading, error, count, refetch };
}

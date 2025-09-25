// src/features/message/useBirthdayCards.ts
import { useEffect, useMemo, useState } from "react";
import raw from "./messageCakes.json"; // ← JSON 직접 임포트
import type { BirthdayCard, BirthdayUser } from "@/types/birthday";

// 1) assets 폴더의 food-* 이미지 전부 수집 (정적 URL 문자열로 로드)
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
      // Vite에서 에셋 임포트의 default가 URL 문자열
      return mod.default ?? mod;
    }
  }
  return undefined;
}

export function useBirthdayCards() {
  const [data, setData] = useState<BirthdayCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      setIsLoading(true);

      const users = raw as BirthdayUser[];
      const user = users[0];

      const cards = user.birthdayCards.map((c, idx) => {
        // (선택) JSON에 imageKey가 있다면 우선 사용, 없으면 인덱스로 순환 매핑
        // 예: { ..., "imageKey": "food-3" }
        const explicitKey = (c as any).imageKey as string | undefined;
        const fallbackKey = FOOD_KEYS[idx % Math.max(FOOD_KEYS.length, 1)] || "food-1";
        const keyToUse = explicitKey ?? fallbackKey;

        // 로컬 에셋 URL(없으면 기존 imageUrl 유지)
        const localUrl = resolveAssetUrl(keyToUse) ?? c.imageUrl;

        return { ...c, imageUrl: localUrl };
      });

      setData(cards);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const count = useMemo(() => data.length, [data]);
  const refetch = () => {}; // 정적 JSON이라 noop

  return { data, isLoading, error, count, refetch };
}

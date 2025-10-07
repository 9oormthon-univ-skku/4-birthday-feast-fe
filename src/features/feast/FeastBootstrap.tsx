// src/features/feast/FeastBootstrap.tsx
import { useEffect } from "react";
import { useFeastThisYear } from "@/features/feast/useFeastThisYear";

/**
 * 화면 진입 시 올해 생일상 데이터를 조용히 프리페치.
 * - 실패는 무시하고, 로컬 캐시만 최신화
 * - 렌더는 아무 것도 하지 않음
 */
export default function FeastBootstrap({ enabled }: { enabled: boolean }) {
  const { preloadThisYearQuietly } = useFeastThisYear();

  useEffect(() => {
    if (!enabled) return;
    preloadThisYearQuietly(); // 내부에 중복방지 ref 있음
  }, [enabled, preloadThisYearQuietly]);

  return null;
}

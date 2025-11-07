// src/utils/getEffectiveQuizId.ts
import { LS_LAST_QUIZ } from "@/stores/userStorage";
import { toNumOrUndef } from "@/utils/toNumOrUndef";

/**
 * ☁️ 모드에 따라 quizId를 추출하는 유틸
 *
 * @param mode - 'guest' | 'host' | undefined
 * @param locationSearch - window.location.search (쿼리스트링)
 * @returns number | undefined (유효한 숫자 ID만 반환)
 */
export function getEffectiveQuizId(
  mode: "guest" | "host" | undefined,
  locationSearch: string
): number | undefined {
  if (mode === "guest") {
    // 게스트: ?quizId=... 쿼리스트링에서 추출
    const sp = new URLSearchParams(locationSearch);
    const fromQuery = sp.get("quizId")?.trim();
    return toNumOrUndef(fromQuery);
  }

  if (mode === "host") {
    // 호스트: 로컬 스토리지에서 마지막 퀴즈 ID 가져오기
    const stored = localStorage.getItem(LS_LAST_QUIZ)?.trim();
    return toNumOrUndef(stored);
  }

  return undefined;
}

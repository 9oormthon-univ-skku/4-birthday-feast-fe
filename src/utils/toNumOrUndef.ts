/** ☁️ 안전한 숫자 파서 (quizId에 주로 사용) */
export function toNumOrUndef(v: unknown): number | undefined {
  const n = Number(v);
  // return Number.isFinite(n) ? n : undefined;
  return Number.isFinite(n) && n > 0 ? n : undefined; // 서버 정책에 따라 결정 ☁️
}
/** ☁️ 안전한 숫자 파서 (quizId에 주로 사용) */
export function toNumOrUndef(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
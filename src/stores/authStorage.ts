// src/features/auth/authStorage.ts
export const LS_USER_ID = "bh.user.id";
export const LS_LAST_BIRTHDAY = "bh.user.lastBirthdayId";
export const LS_LAST_QUIZ = "bh.user.lastQuizId";

/* ────────────────────────────────────────────────
 * 메모리 캐시
 * ──────────────────────────────────────────────── */
let memoryUserId: string | number | null = null;
let memoryBirthdayId: string | number | null = null;
let memoryQuizId: string | number | null = null;

/* ────────────────────────────────────────────────
 * USER ID
 * ──────────────────────────────────────────────── */
export function setAuthSessionUserId(userId: number | null) {
  memoryUserId = userId;
  if (userId != null) {
    localStorage.setItem(LS_USER_ID, String(userId));
  } else {
    localStorage.removeItem(LS_USER_ID);
  }
}

export function getStoredUserId(): string | null {
  if (memoryUserId != null) return String(memoryUserId);
  const id = localStorage.getItem(LS_USER_ID);
  memoryUserId = id;
  return id;
}

export function clearAuthUserId() {
  setAuthSessionUserId(null);
}

/* ────────────────────────────────────────────────
 * BIRTHDAY ID
 * ──────────────────────────────────────────────── */
export function setLastBirthdayId(birthdayId: number | null) {
  memoryBirthdayId = birthdayId;
  if (birthdayId != null) {
    localStorage.setItem(LS_LAST_BIRTHDAY, String(birthdayId));
  } else {
    localStorage.removeItem(LS_LAST_BIRTHDAY);
  }
}

export function getLastBirthdayId(): string | null {
  if (memoryBirthdayId != null) return String(memoryBirthdayId);
  const id = localStorage.getItem(LS_LAST_BIRTHDAY);
  memoryBirthdayId = id;
  return id;
}

export function clearLastBirthdayId() {
  setLastBirthdayId(null);
}

/* ────────────────────────────────────────────────
 * QUIZ ID
 * ──────────────────────────────────────────────── */
export function setLastQuizId(quizId: number | null) {
  memoryQuizId = quizId;
  if (quizId != null) {
    localStorage.setItem(LS_LAST_QUIZ, String(quizId));
  } else {
    localStorage.removeItem(LS_LAST_QUIZ);
  }
}

export function getLastQuizId(): string | null {
  if (memoryQuizId != null) return String(memoryQuizId);
  const id = localStorage.getItem(LS_LAST_QUIZ);
  memoryQuizId = id;
  return id;
}

export function clearLastQuizId() {
  setLastQuizId(null);
}

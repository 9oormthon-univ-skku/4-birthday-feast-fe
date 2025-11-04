// src/features/auth/authStorage.ts
export const LS_USER_ID = 'bh.user.id';
export const LS_LAST_BIRTHDAY = 'bh.user.lastBirthdayId';
export const LS_LAST_QUIZ = 'bh.user.lastQuizId';

export function setAuthSessionUserId(userId: string | number) {
  localStorage.setItem(LS_USER_ID, String(userId));
}
export function getStoredUserId(): string | null {
  return localStorage.getItem(LS_USER_ID);
}
export function clearAuthUserId() {
  localStorage.removeItem(LS_USER_ID);
}

// src/features/auth/authStorage.ts
const LS_USER_ID = 'bh.user.id';

export function setAuthSessionUserId(userId: string | number) {
  localStorage.setItem(LS_USER_ID, String(userId));
}
export function getStoredUserId(): string | null {
  return localStorage.getItem(LS_USER_ID);
}
export function clearAuthUserId() {
  localStorage.removeItem(LS_USER_ID);
}

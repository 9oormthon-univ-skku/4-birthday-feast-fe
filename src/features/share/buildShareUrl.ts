// src/features/share/buildShareUrl.ts
export type ShareTarget = 'main' | 'write';

export function buildGuestShareUrl(params: {
  userId: string | number;
  code: string;
  target?: ShareTarget; // 기본값 'main'
}) {
  const { userId, code, target = 'main' } = params;
  const base = `${window.location.origin}/u/${userId}/${target}`;
  const qs = new URLSearchParams({ code }).toString();
  return `${base}?${qs}`;
}

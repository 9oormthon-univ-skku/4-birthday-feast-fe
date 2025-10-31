// src/features/visitorOnboarding/guestReady.ts
import { SS_GUEST_AT, SS_GUEST_NN } from '@/apis/guest';

export function isGuestReady() {
  const at = sessionStorage.getItem(SS_GUEST_AT);
  const nn = (sessionStorage.getItem(SS_GUEST_NN) ?? '').trim();
  return Boolean(at) && nn.length > 0;
}

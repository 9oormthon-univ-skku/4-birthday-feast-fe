import { useQuery } from "@tanstack/react-query";
import type { BirthdayCard, BirthdayUser } from "./types";
import mock from "./messageCakes.js";
// import { api } from "@/shared/lib/api"; // 실제 API 전환 시 사용

const USE_MOCK = true; // env 분기로 바꿔도 OK

async function getCardsMock(): Promise<BirthdayCard[]> {
  const users: BirthdayUser[] = mock;
  const user = users[0];              // 단일 유저 더미
  return user.birthdayCards;
}

// 실제 API 예시
// async function getCardsReal(): Promise<BirthdayCard[]> {
//   const res = await api.get<BirthdayUser[]>("/api-user/birthday/get/all");
//   return res.data[0].birthdayCards;
// }

export function useBirthdayCards() {
  return useQuery({
    queryKey: ["birthdayCards", USE_MOCK ? "mock" : "real"],
    queryFn: () => (USE_MOCK ? getCardsMock() : getCardsMock()),
    staleTime: Infinity,
  });
}

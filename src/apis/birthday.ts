// src/apis/birthday.ts
import { apiClient } from "@/apis";

// ---------- 타입 ----------
export type BirthdayCard = {
  birthdayCardId: number | string;
  message: string;
  nickname: string;
  imageUrl: string;
};

export type BirthdayItem = {
  userId: number | string;
  birthdayId: number | string;
  code: string;
  birthdayCards: BirthdayCard[];
};

export type CreateBirthdayResponse = BirthdayItem;

/** POST 생일상 생성 */
export async function createBirthday(opts?: { signal?: AbortSignal }) {
  const res = await apiClient.post<CreateBirthdayResponse>(
    "/api-user/birthday/create",
    null, // body 없음
    {
      signal: opts?.signal,
      headers: { Accept: "application/json" },
    }
  );
  return res.data;
}

/** GET 전체 생일상 조회 */
export async function getAllBirthdays(opts?: { signal?: AbortSignal }) {
  const res = await apiClient.get<BirthdayItem[]>(
    "/api-user/birthday/get/all",
    {
      signal: opts?.signal,
      headers: { Accept: "application/json" },
    }
  );
  return res.data;
}

/** GET 이번년도 생일상 조회 */
export async function getThisYearBirthday(
  birthdayId: number | string,
  opts?: { signal?: AbortSignal }
) {
  const res = await apiClient.get<BirthdayItem>(
    `/api-user/birthday/get/this-year/${encodeURIComponent(String(birthdayId))}`,
    {
      signal: opts?.signal,
      headers: { Accept: "application/json" },
    }
  );
  return res.data;
}

/** DELETE 생일상 삭제 */
export async function deleteBirthday(
  birthdayId: number | string,
  opts?: { signal?: AbortSignal }
) {
  const res = await apiClient.delete(
    `/api-user/birthday/delete/${encodeURIComponent(String(birthdayId))}`,
    { signal: opts?.signal }
  );
  return res.data;
}

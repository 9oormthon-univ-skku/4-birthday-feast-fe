// src/apis/birthday.ts
import { apiClient } from "@/apis";
import { RequestOpts, toPathId } from "./apiUtils";

/** 생일 카드 */
export type BirthdayCard = { // 게스트, UI렌더에서 재사용
  birthdayCardId: number;
  message: string;
  nickname: string;
  imageUrl: string;
};
/** 생일상 생성 응답 / 이번년도 생일상 조회 응답 */
export type BirthdayItem = {
  userId: number;
  birthdayId: number;
  year: number;
  code: string;
  birthdayCards: BirthdayCard[];
  visible?: boolean; // 이번년도 생일상 조회일 경우에만 내려줌
};

/** 생일상 공개 기간 조회 응답 */
export type BirthdayPeriod = {
  birthdayId: number;
  startTime: string; // e.g. "2025-10-12"
  endTime: string;   // e.g. "2025-10-12"
};

/** 생일상 공개여부 설정 요청 */
export type UpdateBirthdayVisibleRequest = {
  isVisible: boolean;
};

/** 생일상 공개여부 설정 응답 */
export type UpdateBirthdayVisibleResponse = {
  birthdayId: number;
  isVisible: boolean;
};

// export type DeleteBirthdayResponse = { success: boolean };

// -----------

/** [POST] 생일상 생성 */
export async function createBirthday(opts?: RequestOpts): Promise<BirthdayItem> {
  const res = await apiClient.post<BirthdayItem>(
    "/api-user/birthday/create",
    null, // body 없음
    { signal: opts?.signal }
  );
  return res.data;
}

/** [GET]  생일상 전체 조회 */
export async function getAllBirthdays(opts?: RequestOpts): Promise<BirthdayItem[]> {
  const res = await apiClient.get<BirthdayItem[]>(
    "/api-user/birthday/get/all",
    { signal: opts?.signal, }
  );
  return res.data;
}

/** [GET] 이번년도 생일상 조회 */
export async function getThisYearBirthday(
  birthdayId: number,
  opts?: RequestOpts
): Promise<BirthdayItem> {
  const res = await apiClient.get<BirthdayItem>(
    `/api-user/birthday/get/this-year/${toPathId(birthdayId)}`,
    { signal: opts?.signal, }
  );
  return res.data;
}

/** [DELETE] 생일상 삭제 */
export async function deleteBirthday(
  birthdayId: number,
  opts?: RequestOpts
)
// : Promise<DeleteBirthdayResponse>
{
  const res = await apiClient.delete(
    `/api-user/birthday/delete/${toPathId(birthdayId)}`,
    { signal: opts?.signal }
  );
  return res.data;
}

/** [GET] 생일상 공개기간 조회 */
export async function getBirthdayPeriod(
  birthdayId: number,
  opts?: RequestOpts
): Promise<BirthdayPeriod> {
  const res = await apiClient.get<BirthdayPeriod>(
    `/api-user/birthday/get/period/${toPathId(birthdayId)}`,
    { signal: opts?.signal, }
  );
  return res.data;
}

/** [PATCH] 생일상 공개여부 설정 */
export async function updateBirthdayVisible(
  birthdayId: number,
  isVisible: boolean,
  opts?: RequestOpts
): Promise<UpdateBirthdayVisibleResponse> {
  const body: UpdateBirthdayVisibleRequest = { isVisible };
  const res = await apiClient.patch<UpdateBirthdayVisibleResponse>(
    `/api-user/birthday/visible/${toPathId(birthdayId)}`,
    body,
    { signal: opts?.signal }
  );
  return res.data;
}
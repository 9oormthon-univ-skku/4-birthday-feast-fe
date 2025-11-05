import type { BirthdayCardLike, CakeItem } from "@/types/birthday";

/**
 * 서버/캐시에서 온 BirthdayCardLike 배열을 UI용 CakeItem 배열로 변환.
 * - messageId 보정 (없으면 인덱스 기반 키 생성)
 * - nickname 기본값 보정
 * - 이미지가 없는 항목은 optional로 제외하거나 fallbackSrc로 대체 가능
 */
export function cardsToCakes(
  cards: BirthdayCardLike[] | undefined | null,
): CakeItem[] {

  if (!Array.isArray(cards) || cards.length === 0) return [];

  return cards
    .map((c, idx): CakeItem | null => {
      return {
        messageId: c.birthdayCardId ?? `card-${idx}`,
        src: c.imageUrl ?? "",
        nickname: (c.nickname ?? "").trim() || "익명",
      };
    })
    .filter((v): v is CakeItem => v !== null);
}

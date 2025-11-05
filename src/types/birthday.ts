import { BirthdayCard } from "@/apis/birthday";
import { GuestBirthdayCard } from "@/apis/guest";

export type BirthdayCardLike = BirthdayCard | GuestBirthdayCard;

// UI에서 재사용할 수 있는 프리젠테이션 타입(케이크 슬롯용)
export type CakeItem = {
  messageId: string | number;
  src: string;
  // alt?: string;
  nickname?: string;
};

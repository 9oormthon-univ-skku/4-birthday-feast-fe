export type BirthdayCard = {
  birthdayCardId: string | number;
  message: string;
  nickname: string;
  imageUrl: string;
};

export type BirthdayUser = {
  userId: number;
  birthdayId: number;
  code: "OK" | "PENDING" | "CLOSED";
  birthdayCards: BirthdayCard[];
};

// UI에서 재사용할 수 있는 프리젠테이션 타입(케이크 슬롯용)
export type CakeItem = {
  id: string | number;
  src: string;
  alt?: string;
};

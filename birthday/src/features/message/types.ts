export type BirthdayCard = {
  birthdayCardId: number;
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

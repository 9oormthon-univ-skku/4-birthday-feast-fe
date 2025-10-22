// 쿼리 키 표준화를 위한 정의 파일 

export const qk = {
  auth: {
    me: ['auth', 'me'] as const, // [GET] /api-user/me 
    token: ['auth', 'token'] as const // 로컬 토큰 동기화/관찰
  },

  // 생일/생일상(Host & Guest)
  birthdays: {
    allMine: ['birthdays', 'mine', 'all'] as const,   // GET /api/birthdays (내 리스트)
    byId: (birthdayId: string | number) =>
      ['birthday', String(birthdayId)] as const,
    thisYearBy: (birthdayId: string | number) =>
      ['birthday', String(birthdayId), 'thisYear'] as const, // GET /api/birthday/{id}/this-year
    // thisYearAny: ['birthday', 'thisYear', 'any'] as const,   // 캐시/리스트에서 하나 골라 조회(앱 최초 부팅)
    guestByCode: (code: string) =>
      ['guest', 'birthday', code] as const,           // GET /api/guest/birthday?code=...
  },

  // 메시지/카드(게스트가 남기는 축하글 등)
  cards: {
    listByBirthday: (birthdayId: string | number) =>
      ['cards', 'birthday', String(birthdayId)] as const,    // GET /api/cards?birthdayId=...
    guestListByCode: (code: string) =>
      ['guest', 'cards', code] as const,                     // GET /api/guest/cards?code=...
    byId: (cardId: string | number) =>
      ['card', String(cardId)] as const,
  },

  // 퀴즈(호스트/게스트)
  quiz: {
    mine: (birthdayId: string | number) =>
      ['quiz', 'mine', String(birthdayId)] as const,         // GET /api/quiz?birthdayId=...
    guestForCode: (code: string) =>
      ['quiz', 'guest', code] as const,                      // GET /api/guest-quiz?code=...
    resultByPlayId: (playId: string | number) =>
      ['quiz', 'result', String(playId)] as const,           // GET /api/guest-quiz/result/{playId}
  },
}
// 쿼리 키 표준화를 위한 정의 파일 

export const qk = {
  auth: {
    me: ['auth', 'me'] as const, // [GET] /api-user/me 
    token: ['auth', 'token'] as const // 로컬 토큰 동기화/관찰
  },

  // 생일/생일상(Host & Guest)
  birthdays: {
    allMine: ['birthdays', 'mine', 'all'] as const,  // GET /api-user/birthday/get/all
    thisYearBy: (birthdayId: number | string) =>
      ['birthday', birthdayId, 'thisYear'] as const, // GET /api-user/birthday/get/this-year/{birthdayId}
    guest: ['guest', 'birthday'] as const,           // GET /api-guest/birthday
  },
}
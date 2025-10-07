import { useCallback, useEffect, useMemo, useState } from "react"; // React 훅들을 가져옴: 상태, 이펙트, 메모, 콜백

export const TOKEN_KEY = "bh.auth.accessToken" as const; // 로컬스토리지에 쓸 키를 상수로 정의(리터럴 타입 고정)

export type AuthState = {                             // 훅이 반환할 상태/함수들의 타입 정의
  token: string | null;                               // 현재 저장된 액세스 토큰(없으면 null)
  isAuthenticated: boolean;                           // 토큰 존재 여부로 계산한 로그인 상태
  /** 로그인: 전달받은 토큰을 저장(필수 인자) */
  login: (token: string) => string;                   // 로그인 함수: 토큰을 저장하고 최종 저장된 토큰을 반환
  /** 로그아웃: 토큰 제거 */
  logout: () => void;                                 // 로그아웃 함수: 토큰 삭제
};

/** 로컬스토리지에서 즉시 읽기 */
function readToken(): string | null {                 // 초기 렌더에서 로컬스토리지에 저장된 토큰을 읽는 헬퍼
  try {                                               // 브라우저 환경/권한 문제 대비
    return localStorage.getItem(TOKEN_KEY);           // 저장된 토큰 문자열을 가져옴(없으면 null)
  } catch {                                           // 예: 프라이빗 모드, 접근 제한 등
    return null;                                      // 실패 시 null로 처리
  }
}

export function useAuth(): AuthState {                // 커스텀 훅 선언: 인증 상태와 조작 함수를 제공
  const [token, setToken] = useState<string | null>(() => readToken()); // 초기값을 readToken()으로 lazy 초기화

  // 스토리지 변경(다른 탭) 동기화
  useEffect(() => {                                   // 다른 탭/창에서 토큰이 바뀔 때 현재 탭도 동기화
    const onStorage = (e: StorageEvent) => {          // storage 이벤트 핸들러
      if (e.key === TOKEN_KEY) {                      // 우리가 관리하는 키에 변화가 있을 때만
        setToken(e.newValue);                         // 변경된 값을 상태로 반영(e.newValue는 string|null)
      }
    };
    window.addEventListener("storage", onStorage);    // 이벤트 리스너 등록
    return () => window.removeEventListener("storage", onStorage); // 언마운트 시 정리
  }, []);                                             // 마운트/언마운트 시에만 실행

  const login = useCallback((t: string) => {          // 로그인 함수: 의존성 없음(참조 안정화)
    const next = String(t ?? "").trim();              // 안전하게 문자열화하고 앞뒤 공백 제거
    if (!next) {                                      // 빈 문자열/공백만 전달된 경우
      // 더미 토큰 생성 금지: 잘못된 사용을 빠르게 드러내기 위해 에러 처리
      throw new Error("login(token) requires a non-empty token string"); // 명시적으로 오류 발생
    }
    localStorage.setItem(TOKEN_KEY, next);            // 로컬스토리지에 토큰 저장
    setToken(next);                                   // 리액트 상태도 갱신(렌더링 반영)
    return next;                                      // 최종 저장된 토큰 반환(호출부에서 활용 가능)
  }, []);                                             // 함수 아이덴티티 고정

  const logout = useCallback(() => {                  // 로그아웃 함수
    localStorage.removeItem(TOKEN_KEY);               // 로컬스토리지에서 토큰 제거
    setToken(null);                                   // 상태도 null로 설정
  }, []);                                             // 함수 아이덴티티 고정

  const isAuthenticated = useMemo(() => Boolean(token), [token]); // 토큰 존재 여부로 로그인 상태 계산(메모)

  return { token, isAuthenticated, login, logout };   // 훅의 공개 API 반환
}

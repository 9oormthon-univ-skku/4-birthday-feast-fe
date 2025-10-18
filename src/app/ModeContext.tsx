import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

type Mode = "host" | "guest";

/** Context에서 제공할 데이터 형태 */
type Ctx = {
  mode: Mode;
  isHost: boolean;
  isGuest: boolean;
  sharedHostId?: string | null;
  setMode: (m: Mode) => void;
};

const BirthdayModeContext = createContext<Ctx | null>(null); // Context 생성 

/**
 * BirthdayModeProvider
 * 
 * 호스트/게스트 모드를 전역적으로 관리하는 컨텍스트 Provider
 * 
 * - URL의 `?code=` 쿼리 존재 여부를 감지하여 자동으로 `guest` 모드로 전환합니다.
 * - `/u/:userId/...` 경로의 `userId`를 추적하여 `sharedHostId`로 제공합니다.
 * - 하위 트리에서는 `useBirthdayMode()` 훅을 통해 `mode`, `isHost`, `isGuest` 등을 접근
 *
 * @param {object} props - Provider 구성 요소
 * @param {React.ReactNode} props.children - Provider 하위에 렌더링할 React 노드들
 * @param {"host" | "guest"} [props.defaultMode="host"] - 초기 모드 설정값 (기본값: "host")
 *
 * @returns {JSX.Element} - BirthdayModeContext.Provider로 감싼 JSX 트리
 *
 * @example
 * ```tsx
 * <BirthdayModeProvider defaultMode="host">
 *   <AppRoutes />
 * </BirthdayModeProvider>
 * ```
 *
 * @description
 * URL 쿼리에 `?code`가 포함되면 자동으로 게스트 모드(`guest`)로 전환되며,
 * 그렇지 않으면 호스트 모드(`host`)로 유지됩니다.
 * 
 * 이 Provider는 React Router의 `useParams`와 `useLocation`을 사용하므로
 * 반드시 `<Router>` 내부에서 사용되어야 합니다.
 */

export function BirthdayModeProvider({
  children,
  defaultMode,
}: {
  children: React.ReactNode;
  defaultMode?: Mode; // optional
}) {
  const params = useParams();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>(defaultMode ?? "host");

  // 자동 게스트 감지 (code 존재 시)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    if (code && mode !== "guest") setMode("guest");
  }, [location.search, mode]);

  const value = useMemo<Ctx>(
    () => ({
      mode,
      isHost: mode === "host",
      isGuest: mode === "guest",
      sharedHostId: params.userId ?? null, // 현재 경로의 userId 추적
      setMode,
    }),
    [mode, params.userId]
  );

  return (
    <BirthdayModeContext.Provider value={value}>
      {children}
    </BirthdayModeContext.Provider>
  );
}

export function useBirthdayMode() {
  const ctx = useContext(BirthdayModeContext);
  if (!ctx) throw new Error("useBirthdayMode must be used within BirthdayModeProvider");
  return ctx;
}

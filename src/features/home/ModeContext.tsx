import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

type Mode = "host" | "guest";

type Ctx = {
  mode: Mode;
  isHost: boolean;
  isGuest: boolean;
  sharedHostId?: string | null;
  setMode: (m: Mode) => void;
};

const BirthdayModeContext = createContext<Ctx | null>(null);

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

  // ✅ 자동 게스트 감지 (code 존재 시)
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
      sharedHostId: params.userId ?? null, // ✅ 현재 경로의 userId 추적
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

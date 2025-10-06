// src/features/home/ModeContext.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';

type Mode = 'host' | 'guest';

type Ctx = {
  mode: Mode;
  isHost: boolean;
  isGuest: boolean;
  /** 공유 링크로 들어온 경우: 대상 호스트의 공개용 ID */
  sharedHostId?: string | null;
  setMode: (m: Mode) => void;
};

const BirthdayModeContext = createContext<Ctx | null>(null);

export function BirthdayModeProvider({
  children,
  defaultMode = 'guest',
  sharedHostId = null,   // ⬅️ 추가
}: {
  children: React.ReactNode;
  defaultMode?: Mode;
  sharedHostId?: string | null; // ⬅️ 추가
}) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const value = useMemo<Ctx>(() => ({
    mode,
    isHost: mode === 'host',
    isGuest: mode === 'guest',
    sharedHostId,        // ⬅️ 추가
    setMode,
  }), [mode, sharedHostId]);

  return (
    <BirthdayModeContext.Provider value={value}>
      {children}
    </BirthdayModeContext.Provider>
  );
}

export function useBirthdayMode() {
  const ctx = useContext(BirthdayModeContext);
  if (!ctx) throw new Error('useBirthdayMode must be used within BirthdayModeProvider');
  return ctx;
}

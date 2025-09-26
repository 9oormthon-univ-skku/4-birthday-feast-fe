// src/features/home/ModeContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type BirthdayMode = 'host' | 'guest';

type Ctx = {
  mode: BirthdayMode;
  setMode: (m: BirthdayMode) => void;
  toggleMode: () => void;
  isHost: boolean;
  isGuest: boolean;
};

const BirthdayModeContext = createContext<Ctx | null>(null);

const STORAGE_KEY = 'birthday:mode';

function readModeFromSearch(): BirthdayMode | null {
  if (typeof window === 'undefined') return null;
  const sp = new URLSearchParams(window.location.search);
  const raw = sp.get('mode');
  if (raw === 'host' || raw === 'guest') return raw;
  return null;
}

function readModeFromStorage(): BirthdayMode | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === 'host' || raw === 'guest') return raw;
  return null;
}

function writeModeToStorage(mode: BirthdayMode) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, mode);
}

export const BirthdayModeProvider: React.FC<{ defaultMode?: BirthdayMode; children: React.ReactNode }> = ({
  defaultMode = 'guest',
  children,
}) => {
  // 초기 우선순위: URL 쿼리 > localStorage > default
  const initial = useMemo(() => {
    return readModeFromSearch() ?? readModeFromStorage() ?? defaultMode;
  }, [defaultMode]);

  const [mode, _setMode] = useState<BirthdayMode>(initial);

  // 상태 변경 시 storage 동기화
  const setMode = useCallback((m: BirthdayMode) => {
    _setMode(m);
    writeModeToStorage(m);
    // URL 쿼리도 맞춰주면 공유 링크 일관성 ↑ (선택 사항)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', m);
      // history pushState 대신 replaceState 사용해 히스토리 오염 방지
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const toggleMode = useCallback(() => setMode(mode === 'host' ? 'guest' : 'host'), [mode, setMode]);

  // URL 쿼리가 바뀌었을 때도 반영 (탭 내에서 쿼리 갱신될 수 있는 경우 대비)
  useEffect(() => {
    const q = readModeFromSearch();
    if (q && q !== mode) _setMode(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeof window !== 'undefined' ? window.location.search : '']);

  const value = useMemo<Ctx>(
    () => ({
      mode,
      setMode,
      toggleMode,
      isHost: mode === 'host',
      isGuest: mode === 'guest',
    }),
    [mode, setMode, toggleMode]
  );

  return <BirthdayModeContext.Provider value={value}>{children}</BirthdayModeContext.Provider>;
};

export function useBirthdayMode() {
  const ctx = useContext(BirthdayModeContext);
  if (!ctx) throw new Error('useBirthdayMode must be used within BirthdayModeProvider');
  return ctx;
}

/** 모드별로 다른 UI를 보여주고 싶을 때 사용 */
export const ModeGate: React.FC<{ host?: React.ReactNode; guest?: React.ReactNode }> = ({ host, guest }) => {
  const { isHost } = useBirthdayMode();
  return <>{isHost ? host : guest}</>;
};

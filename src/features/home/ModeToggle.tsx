// src/home/ModeToggle.tsx
import { useBirthdayMode } from '@/features/home/ModeContext';
import React from 'react';
// import { useBirthdayMode } from '@/features/mode/BirthdayModeContext';

const ModeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { mode, setMode, toggleMode } = useBirthdayMode();
  return (
    <div className={className}>
      <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-2 py-1 text-xs shadow">
        <span className="font-bold">Mode:</span>
        <button
          className={`rounded px-2 py-1 ${mode === 'host' ? 'bg-black text-white' : 'bg-transparent'}`}
          onClick={() => setMode('host')}
        >
          host
        </button>
        <button
          className={`rounded px-2 py-1 ${mode === 'guest' ? 'bg-black text-white' : 'bg-transparent'}`}
          onClick={() => setMode('guest')}
        >
          guest
        </button>
        <button className="rounded px-2 py-1 ring-1 ring-black/10" onClick={toggleMode}>
          toggle
        </button>
      </div>
    </div>
  );
};

export default ModeToggle;

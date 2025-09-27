// src/dev/DevPlayQuizButton.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

type DevPlayQuizButtonProps = {
  /** 이동 경로 (기본 /quiz) */
  to?: string;
  /** 'fab' = 화면 우하단 플로팅, 'inline' = 인라인 버튼 */
  variant?: 'fab' | 'inline';
  /** 버튼 라벨 */
  label?: React.ReactNode;
  /** 추가 클래스 */
  className?: string;
  /** 플로팅일 때 z-index */
  zIndex?: number;
  /** 비활성화 */
  disabled?: boolean;
};

export default function DevPlayQuizButton({
  to = '/play',
  variant = 'fab',
  label = '퀴즈 플레이',
  className,
  zIndex = 150,
  disabled,
}: DevPlayQuizButtonProps) {
  // 프로덕션에서는 노출 안 함
  if (import.meta.env.PROD) return null;

  const navigate = useNavigate();
  const handleClick = () => {
    if (!disabled) navigate(to);
  };

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={clsx(
          'rounded-md bg-[#E49393] px-4 py-2 text-white shadow-sm transition disabled:opacity-50',
          className
        )}
      >
        {label}
      </button>
    );
  }

  // 플로팅(FAB)
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      style={{
        position: 'fixed',
        right: 16,
        // 안전영역 고려: bottom = safe-area + 16px
        bottom: `calc(env(safe-area-inset-bottom, 0px) + 40px)`,
        zIndex,
      }}
      className={clsx(
        'flex items-center gap-2 rounded-full bg-[#E49393] px-4 py-3 text-white shadow-lg',
        'active:scale-95 transition disabled:opacity-50',
        className
      )}
      aria-label="퀴즈 플레이로 이동(개발용)"
      title="퀴즈 플레이"
    >
      <span className="text-lg leading-none">▶</span>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

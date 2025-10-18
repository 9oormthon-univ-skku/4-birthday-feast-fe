// src/components/PlayQuizButton.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import quizFrame from '@/assets/theme/quiz-1.svg';

type PlayQuizButtonProps = {
  /** 이동 경로 (기본 ../play 로 변경) */
  to?: string;
  variant?: 'fab' | 'inline';
  ariaLabel?: string;
  className?: string;
  zIndex?: number;
  disabled?: boolean;
  imgSrc?: string;
  imgSizeClassName?: string; // 예: "h-12 w-12"
};

export default function PlayQuizButton({
  to = '../play',                 // ✅ 기본값을 상대 경로로 변경
  variant = 'fab',
  ariaLabel = '퀴즈 플레이로 이동',
  className,
  zIndex = 200,
  disabled,
  imgSrc = quizFrame,
  imgSizeClassName = 'h-12 w-12',
}: PlayQuizButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (disabled) return;

    // ✅ 현재 쿼리(특히 ?code=...) 유지.
    // to에 이미 ?가 있으면 그대로 사용, 없으면 현재 search를 붙임.
    if (location.search && !to.includes('?')) {
      navigate({ pathname: to, search: location.search });
    } else {
      navigate(to);
    }
  };

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={clsx(
          'inline-flex items-center justify-center rounded-md bg-transparent p-0',
          'active:scale-95 transition disabled:opacity-50',
          className
        )}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        <img
          src={imgSrc}
          alt={ariaLabel}
          className={clsx('object-contain', imgSizeClassName)}
          draggable={false}
        />
      </button>
    );
  }

  // FAB (우하단 고정)
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      style={{
        position: 'fixed',
        right: 16,
        bottom: `calc(env(safe-area-inset-bottom, 0px) + 40px)`,
        zIndex,
      }}
      className={clsx(
        'flex items-center justify-center rounded-full bg-white/0 p-0',
        'active:scale-95 transition disabled:opacity-50',
        className
      )}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <img
        src={imgSrc}
        alt={ariaLabel}
        className={clsx('drop-shadow-lg object-contain', imgSizeClassName)}
        draggable={false}
      />
    </button>
  );
}

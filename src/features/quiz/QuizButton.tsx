// src/components/PlayQuizButton.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

// 이미지 변수 (원하는 경로로 조정)
import quizFrame from '@/assets/theme/quiz-1.svg';

type PlayQuizButtonProps = {
  /** 이동 경로 (기본 /play) */
  to?: string;
  /** 'fab' = 화면 우하단 플로팅, 'inline' = 인라인 버튼 */
  variant?: 'fab' | 'inline';
  /** 접근성/툴팁용 라벨 (이미지 alt 포함) */
  ariaLabel?: string;
  /** 커스텀 클래스 */
  className?: string;
  /** 플로팅일 때 z-index */
  zIndex?: number;
  /** 비활성화 */
  disabled?: boolean;
  /** 이미지 교체가 필요하면 주입 (기본값: quizFrame) */
  imgSrc?: string;
  /** 이미지 크기 (tailwind class) */
  imgSizeClassName?: string; // 예: "h-12 w-12"
};

export default function PlayQuizButton({
  to = '/play',
  variant = 'fab',
  ariaLabel = '퀴즈 플레이로 이동',
  className,
  zIndex = 200,
  disabled,
  imgSrc = quizFrame,          // ← 이미지 변수명: quizFrame
  imgSizeClassName = 'h-12 w-12',
}: PlayQuizButtonProps) {
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

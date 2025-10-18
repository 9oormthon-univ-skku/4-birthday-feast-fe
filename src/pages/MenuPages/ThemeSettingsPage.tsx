// src/pages/ThemeSettingsPage.tsx
import React, { useMemo, useState } from 'react';
import AppLayout from '@/layouts/AppLayout';

// ✅ 이미지들을 모아 import (원하는 파일명/경로로 교체하세요)
import Character1 from '@/assets/theme/character-1.svg';
import Balloon1 from '@/assets/theme/balloon-1.svg';
import QuizFrame1 from '@/assets/theme/quiz-1.svg';
import Cake1 from '@/assets/theme/cake-1.svg';
import { useNavigate } from 'react-router-dom';

// 한 곳에서 자산을 관리하면 교체/확장이 쉬워집니다.
const THEME_ASSETS = {
  character: {
    default: Character1,
    // 추후 출시 예정 항목은 배지로 비활성 처리 (이미지 없음)
  },
  balloon: {
    default: Balloon1,
  },
  quizFrame: {
    default: QuizFrame1,
  },
  cake: {
    default: Cake1,
  },
} as const;

export type ThemeCategoryKey = 'character' | 'balloon' | 'quizFrame' | 'cake';

type Option = {
  id: string;
  label?: string;
  imgSrc?: string; // 없으면 "출시 예정"
};

type Category = {
  key: ThemeCategoryKey;
  title: string;
  options: Option[];
};

export type ThemeSettingsState = Record<ThemeCategoryKey, string | null>;

export default function ThemeSettingsPage({
  onBack,
  onConfirm,
  categories: categoriesProp,
}: {
  onBack?: () => void;
  onConfirm?: (state: ThemeSettingsState) => void;
  categories?: Category[];
}) {
  const navigate = useNavigate();

  // 기본 카테고리/옵션을 이미지 변수로 구성
  const categories = useMemo<Category[]>(
    () =>
      categoriesProp ?? [
        {
          key: 'character',
          title: '주인공 인형',
          options: [
            { id: 'default', imgSrc: THEME_ASSETS.character.default, label: '기본 인형' },
            { id: 'upcoming-1' }, // 이미지 없음 → 출시 예정 배지
            { id: 'upcoming-2' },
          ],
        },
        {
          key: 'balloon',
          title: '풍선',
          options: [
            { id: 'default', imgSrc: THEME_ASSETS.balloon.default, label: '기본 풍선' },
            { id: 'upcoming-1' },
            { id: 'upcoming-2' },
          ],
        },
        {
          key: 'quizFrame',
          title: '퀴즈 액자',
          options: [
            { id: 'default', imgSrc: THEME_ASSETS.quizFrame.default, label: '기본 액자' },
            { id: 'upcoming-1' },
            { id: 'upcoming-2' },
          ],
        },
        {
          key: 'cake',
          title: '케이크',
          options: [
            { id: 'default', imgSrc: THEME_ASSETS.cake.default, label: '기본 케이크' },
            { id: 'upcoming-1' },
            { id: 'upcoming-2' },
          ],
        },
      ],
    [categoriesProp]
  );

  const [state, setState] = useState<ThemeSettingsState>({
    character: categories.find(c => c.key === 'character')?.options[0]?.id ?? null,
    balloon: categories.find(c => c.key === 'balloon')?.options[0]?.id ?? null,
    quizFrame: categories.find(c => c.key === 'quizFrame')?.options[0]?.id ?? null,
    cake: categories.find(c => c.key === 'cake')?.options[0]?.id ?? null,
  });

  const handleSelect = (key: ThemeCategoryKey, id: string) => {
    setState(prev => ({ ...prev, [key]: id }));
  };

  return (
    <AppLayout
      title={
        <span>
          <span className="text-[#FF8B8B]">테마</span>
          <span className="text-[#A0A0A0]"> 변경하기</span>
        </span>
      }
      showBack
      onBack={onBack}
      showMenu={false}
      showBrush={false}
      footerButtonLabel="확인"
      // onFooterButtonClick={() => onConfirm?.(state)}
      onFooterButtonClick={() => navigate(-1)}
    >
      <ul className="space-y-7 pt-2">
        {categories.map(cat => (
          <li key={cat.key}>
            <p className="mb-2 text-base font-normal font-['KoreanSWGIG3'] text-[#FF8B8B]">
              {cat.title}
            </p>
            <div className="grid grid-cols-3 gap-6">
              {cat.options.map((opt, idx) => {
                const isUpcoming = !opt.imgSrc || opt.id.startsWith('upcoming');
                const selected = state[cat.key] === opt.id && !isUpcoming;
                return (
                  <OptionCard
                    key={opt.id + idx}
                    option={opt}
                    disabled={isUpcoming}
                    selected={selected}
                    onClick={() => !isUpcoming && handleSelect(cat.key, opt.id)}
                  />
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </AppLayout>
  );
}

function OptionCard({
  option,
  disabled,
  selected,
  onClick,
}: {
  option: Option;
  disabled?: boolean;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex aspect-square w-full items-center justify-center rounded-[10px] transition-all
        ${selected ? 'border-[#FF8B8B] border-2' : ''}
        ${disabled ? 'cursor-not-allowed opacity-60' : 'active:scale-95'}`}
      aria-pressed={!!selected}
      aria-label={option.label ?? '옵션'}
    >
      {option.imgSrc ? (
        <div className='rounded-full bg-[#FFF4DF]'>
          <img
            src={option.imgSrc}
            alt={option.label ?? '옵션 이미지'}
            className="h-14 w-14 object-contain"
            onError={e => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="h-24 w-24" />
      )}

      {disabled && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="inline-flex h-14 w-14 flex-col items-center justify-center rounded-full bg-[#FFF4DF] text-base font-normal leading-tight font-['KoreanSWGIG3'] text-[#FF8B8B80]">
            출시
            <br />
            예정
          </span>
        </div>
      )}
    </button>
  );
}

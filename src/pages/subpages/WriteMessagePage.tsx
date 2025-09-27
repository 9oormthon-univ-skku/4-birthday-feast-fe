// src/pages/MessageComposePage.tsx
import React, { useMemo, useState } from 'react';
import AppLayout from '@/layouts/AppLayout';

// 아이콘 에셋
import food1 from '@/assets/images/food-1.svg';
import food2 from '@/assets/images/food-2.svg';
import food3 from '@/assets/images/food-3.svg';
import food4 from '@/assets/images/food-4.svg';
import food5 from '@/assets/images/food-5.svg';
import food6 from '@/assets/images/food-6.svg';

type IconItem = { id: string; src: string; alt: string };

export default function WriteMessagePage() {
  const [message, setMessage] = useState('');
  const [selectedId, setSelectedId] = useState<string>('food-1');

  const maxLen = 300;

  // 2~3줄 그리드가 되도록 8개 정도 구성
  const icons = useMemo<IconItem[]>(
    () => [
      { id: 'food-1', src: food1, alt: '디저트 1' },
      { id: 'food-2', src: food2, alt: '디저트 2' },
      { id: 'food-3', src: food3, alt: '디저트 3' },
      { id: 'food-4', src: food4, alt: '디저트 4' },
      { id: 'food-5', src: food5, alt: '디저트 5' },
      { id: 'food-6', src: food6, alt: '디저트 6' },
      { id: 'food-1b', src: food1, alt: '디저트 1' },
      { id: 'food-2b', src: food2, alt: '디저트 2' },
    ],
    []
  );

  const disabled = message.trim().length === 0;

  const handleSubmit = () => {
    if (disabled) return;
    // TODO: API 연동/페이지 이동
    console.log('submit', { message, icon: selectedId });
    alert('메시지를 남겼어요!');
  };

  return (
    <AppLayout
      showBack
      showMenu={false}
      showBrush={false}
      title={
        <span className="text-2xl font-normal leading-none">
          <span className="text-[#FF8B8B]">생일 메시지</span>{' '}
          <span className="text-[#A0A0A0]">작성하기</span>
        </span>
      }
      footerButtonLabel="메시지 남기기"
      onFooterButtonClick={handleSubmit}
      footerButtonDisabled={disabled}
    >
      {/* 안내문 */}
      <p className="mb-4 text-[13px] leading-5 text-neutral-400">
        생일 메시지는 14일 전부터 등록할 수 있으며
        <br className="sm:hidden" />
        생일 당일에 공개됩니다.
      </p>

      {/* 입력 박스 */}
      <label htmlFor="message" className="sr-only">
        생일 메시지를 작성해주세요.
      </label>
      <div className="rounded-[10px] border border-neutral-200 bg-[#F7F7F7] p-3">
        <textarea
          id="message"
          value={message}
          onChange={(e) =>
            setMessage(e.target.value.slice(0, maxLen))
          }
          placeholder="생일 메시지를 작성해주세요."
          className="h-40 w-full resize-none bg-transparent text-[14px] leading-relaxed placeholder:text-neutral-400 focus:outline-none"
          maxLength={maxLen}
        />
      </div>
      <div className="mt-1 text-right text-[11px] text-neutral-400">
        {message.length}/{maxLen}
      </div>

      {/* 아이콘 그리드 */}
      <div className="mt-5 grid grid-cols-3 gap-x-6 gap-y-4">
        {icons.map((it) => {
          const active = selectedId === it.id;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => setSelectedId(it.id)}
              className={[
                'flex h-20 w-20 items-center justify-center rounded-[12px] transition',
                active
                  ? 'ring-1 ring-[#FF8B8B] bg-white'
                  : 'ring-1 ring-neutral-200 bg-white/60 hover:bg-white',
              ].join(' ')}
              aria-pressed={active}
            >
              <img
                src={it.src}
                alt={it.alt}
                className="h-12 w-auto object-contain"
                loading="lazy"
              />
            </button>
          );
        })}
      </div>
    </AppLayout>
  );
}

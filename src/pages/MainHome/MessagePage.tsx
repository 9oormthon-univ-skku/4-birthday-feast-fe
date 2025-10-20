// src/pages/BirthdayMessagePage.tsx
import React, { useMemo, useState } from 'react';
import food6 from '@/assets/images/food-6.svg';
import AppLayout from '@/ui/AppLayout';
import { useNavigate } from 'react-router-dom';

export type Message = {
  id: string | number;
  title: string;
  body: string;
  imgSrc?: string;
  imgAlt?: string;
};

export default function MessagePage({
  messages,
  initialIndex = 0,
  onBack,
  // onHome,
  loop = true,
}: {
  messages: Message[];
  initialIndex?: number;
  onBack?: () => void;
  // onHome?: () => void;
  loop?: boolean;
}) {
  const navigate = useNavigate();

  const safeInitial = useMemo(
    () => Math.min(Math.max(initialIndex, 0), Math.max(messages.length - 1, 0)),
    [initialIndex, messages.length]
  );
  const [index, setIndex] = useState(safeInitial);

  const hasItems = messages.length > 0;
  const msg = hasItems ? messages[index] : undefined;

  const canPrev = hasItems && (loop || index > 0);
  const canNext = hasItems && (loop || index < messages.length - 1);

  const goPrev = () => {
    if (!hasItems) return;
    if (index === 0) { if (loop) setIndex(messages.length - 1); }
    else setIndex(i => i - 1);
  };
  const goNext = () => {
    if (!hasItems) return;
    if (index === messages.length - 1) { if (loop) setIndex(0); }
    else setIndex(i => i + 1);
  };

  return (
    <AppLayout
      title={<span className="text-[#FF8B8B]">생일 메세지</span>}
      showBack
      onBack={onBack}
      showMenu={false}
      showBrush={false}
      footerButtonLabel="처음으로"
      onFooterButtonClick={() => navigate(-1)}
    >
      {!hasItems ? (
        <div className="text-center text-[#9CA3AF] py-16">표시할 메세지가 없어요.</div>
      ) : (
        <section className="relative w-full px-8 py-4">
          <div
            className="
              relative mx-auto mt-20
              rounded-[5px] bg-white
              shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]
              w-full aspect-[329/406]"
          >
            {/* 이미지: 카드 상단 중앙 고정 */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-[96px] h-[96px] rounded-[90%] bg-[#FFF4DF] grid place-items-center shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
              <img
                src={msg?.imgSrc || food6}
                alt={msg?.imgAlt ?? msg?.title ?? '기본 디저트'}
                className=" -mt-2 object-contain select-none pointer-events-none"
                draggable={false}
              />
            </div>

            <div className="absolute left-0 bottom-6 top-7 w-full flex flex-col items-center">
              <div className="w-[80%] flex items-center justify-between gap-6">
                <button type="button" aria-label="이전 메세지" onClick={goPrev} disabled={!canPrev}>
                  {goPrevIcon}
                </button>
                <button type="button" aria-label="다음 메세지" onClick={goNext} disabled={!canNext}>
                  {goNextIcon}
                </button>
              </div>

              <h2 className="mt-4 text-center text-xl font-extrabold text-[#FF8B8B]">
                {msg?.title ?? ''}
              </h2>
              <div className="mt-3 w-[80%] overflow-y-auto overscroll-contain">
                <p className="text-[#60343F] text-base font-medium leading-normal text-left break-keep">
                  {msg?.body ?? ''}
                </p>
              </div>
            </div>
          </div>
        </section>

      )}
    </AppLayout>
  );
}

// ---------- 아이콘 svg ----------
const goPrevIcon = <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
  <path d="M18.75 22.5L11.25 15L18.75 7.5" stroke="#FF8B8B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
</svg>
const goNextIcon = <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
  <path d="M11.25 22.5L18.75 15L11.25 7.5" stroke="#FF8B8B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
</svg>
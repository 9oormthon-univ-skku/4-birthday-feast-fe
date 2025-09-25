// src/pages/BirthdayMessagePage.tsx
import React, { useMemo, useState } from 'react';
import Header from '../../components/ui/Header';
import food6 from '../../assets/images/food-6.svg';

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
  onHome,
  loop = true,
}: {
  messages: Message[];
  initialIndex?: number;
  onBack?: () => void;
  onHome?: () => void;
  loop?: boolean;
}) {
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
    <div className="min-h-screen bg-white flex flex-col">
      <Header
        showBack
        onBack={onBack}
        showMenu={false}
        showBrush={false}
        title={<span className="text-[#FF8B8B]">생일 메세지</span>}
      />

      <main className="w-full flex justify-center p-4">
        {!hasItems ? (
          <div className="text-center text-[#9CA3AF] py-16">표시할 메세지가 없어요.</div>
        ) : (
          <section className="relative w-screen">
            {/* 카드 */}
            <div className="
              relative mx-auto mt-[200px]
              rounded-[5px] bg-white 
              shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] 
              w-[80%] aspect-[329/406] 
              p-10">
              {/* 이미지 + 버튼 + 제목/본문 (카드 위쪽에 살짝 겹치도록) */}
              <div className="absolute top-[-1.5rem] left-0 w-full flex flex-col items-center">
                {/* ⬅️ 버튼 · 이미지 · 버튼 : 가로 정렬 + 여백 */}
                <div className="w-[70%] flex items-center justify-between gap-6">
                  {/* 이전 버튼 */}
                  <button
                    type="button"
                    aria-label="이전 메세지"
                    onClick={goPrev}
                    disabled={!canPrev}
                    className="grid place-items-center w-8 h-8 rounded-full border border-[#E5E7EB] bg-white
                  hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-white transition"
                  >
                    <ChevronLeft className="text-[#777]" />
                  </button>

                  {/* 이미지: 크기 고정된 원형 컨테이너 */}
                  <div className="rounded-full bg-[#FFEDEB] grid place-items-center shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
                    <img
                      src={msg?.imgSrc || food6}
                      alt={msg?.imgAlt ?? msg?.title ?? '기본 디저트'}
                      className="w-[120%] h-[120%] object-contain select-none pointer-events-none"
                      draggable={false}
                    />
                  </div>

                  {/* 다음 버튼 */}
                  <button
                    type="button"
                    aria-label="다음 메세지"
                    onClick={goNext}
                    disabled={!canNext}
                    className="grid place-items-center w-8 h-8 rounded-full border border-[#E5E7EB] bg-white
                 hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-white transition"
                  >
                    <ChevronRight className="text-[#777]" />
                  </button>
                </div>

                {/* 닉네임/본문: 이미지 아래로 정렬 */}
                <h2 className="mt-2 text-center text-[40px] font-extrabold text-[#FF8B8B]">
                  {msg?.title ?? ''}
                </h2>
                <p className="mt-1 text-[#60343F] text-[30px] font-medium leading-normal text-center">
                  {msg?.body ?? ''}
                </p>
              </div>

            </div>

            {/* 인디케이터 */}
            {messages.length > 1 && (
              <div className="mt-3 flex justify-center gap-1.5">
                {messages.map((m, i) => (
                  <span
                    key={m.id}
                    className={
                      'inline-block h-1.5 rounded-full transition-all ' +
                      (i === index ? 'w-5 bg-[#FF8B8B]' : 'w-2.5 bg-[#F3C8C8]')
                    }
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* 하단 버튼 고정 */}
      <footer className="fixed bottom-0 left-0 right-0 flex justify-center pb-[env(safe-area-inset-bottom)]">
        <div className="w-full max-w-[420px] px-4 py-4 bg-gradient-to-t from-white to-white/70 backdrop-blur">
          <button
            type="button"
            onClick={onHome}
            className="w-full h-12 rounded-xl bg-[#FF8B8B] hover:bg-[#ff9c9c] active:bg-[#ff7a7a] text-white font-semibold transition shadow-sm"
          >
            처음으로
          </button>
        </div>
      </footer>
    </div>
  );
}

/* ----------------- Icons ----------------- */
function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

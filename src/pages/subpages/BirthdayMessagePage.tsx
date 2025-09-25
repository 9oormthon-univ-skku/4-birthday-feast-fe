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

export default function BirthdayMessagePage({
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

      <main className="w-full mx-[60px] max-w-md px-4 pt-2 pb-10">
        {!hasItems ? (
          <div className="text-center text-[#9CA3AF] py-16">표시할 메세지가 없어요.</div>
        ) : (
          <section className="relative">
            {/* 카드: 이미지가 흐름 안에서 자리 차지 */}
            <div className="relative rounded-2xl border border-[#EFD9C6] bg-white shadow-[0_4px_10px_rgba(0,0,0,0.06)] px-5 py-6">
              {/* 제목 */}
              <h2 className="text-center text-[#FF8B8B] text-[40px] font-extrabold font-['Pretendard'] mb-3">
                {msg?.title ?? ''}
              </h2>

              {/* 이미지 + 좌우 네비 (카드 내부 중앙) */}
              <div
                className="
    relative mx-auto mb-4
    w-[clamp(140px,80%,240px)]  /* ✅ 반응형 너비 */
    aspect-[4/3]               /* ✅ 높이 자동(4:3 비율) */
    flex items-center justify-center
  "
              >
                {/* <button
                    type="button"
                    aria-label="이전 메세지"
                    onClick={goPrev}
                    disabled={!canPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    type="button"
                    aria-label="다음 메세지"
                    onClick={goNext}
                    disabled={!canNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition"
                  >
                    <ChevronRight />
                  </button> */}

                {/* 이미지 (없으면 기본 이미지) */}
                {msg?.imgSrc ? (
                  <img
                    src={msg.imgSrc}
                    alt={msg.imgAlt ?? msg.title}
                    className="block w-full h-full object-contain select-none pointer-events-none"
                    draggable={false}
                  />
                ) : (
                  <DefaultDessertIcon />
                )}


              </div>

              {/* 본문 */}
              <p className="text-[28px] leading-6 text-[#555] whitespace-pre-line">
                {msg?.body ?? ''}
              </p>
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

      <footer className="fixed bottom-0 left-0 right-0 flex justify-center pb-[env(safe-area-inset-bottom)]">
        <div className="w-full max-w-md px-4 py-4 bg-gradient-to-t from-white to-white/70 backdrop-blur">
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

/* ----------------- Icons & Fallback ----------------- */
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
function DefaultDessertIcon() {
  return (
    <img
      src={food6}
      alt="기본 디저트"
      className="block w-full h-full object-contain select-none pointer-events-none"
      draggable={false}
    />
  );
}

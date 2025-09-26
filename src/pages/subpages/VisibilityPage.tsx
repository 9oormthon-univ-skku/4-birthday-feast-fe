// src/pages/subpages/VisibilityPage.tsx
import React, { useMemo, useState } from 'react';
import AppLayout from '@/layouts/AppLayout';

// 요일(월요일 시작)
const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

type YMD = { y: number; m: number }; // m: 0~11

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function sameDay(a: Date | null, b: Date) {
  return !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isBetween(target: Date, start: Date, end: Date) {
  const t = target.setHours(0, 0, 0, 0);
  const s = start.setHours(0, 0, 0, 0);
  const e = end.setHours(0, 0, 0, 0);
  return t > Math.min(s, e) && t < Math.max(s, e);
}

/** 해당 월(월요일 시작) 달력 그리드(6행x7열) 생성 */
function buildCalendarGrid({ y, m }: YMD) {
  const firstDay = new Date(y, m, 1).getDay(); // 0=일
  const offsetMon = (firstDay + 6) % 7; // 0=월
  const thisCount = daysInMonth(y, m);
  const prevCount = daysInMonth(y, m - 1);

  const cells: { date: Date; inMonth: boolean }[] = [];

  // 앞쪽: 이전 달 날짜
  for (let i = offsetMon; i > 0; i--) {
    const d = new Date(y, m - 1, prevCount - i + 1);
    cells.push({ date: d, inMonth: false });
  }
  // 이번 달
  for (let d = 1; d <= thisCount; d++) {
    cells.push({ date: new Date(y, m, d), inMonth: true });
  }
  // 다음 달
  while (cells.length % 7 !== 0) {
    const idx = cells.length - (offsetMon + thisCount);
    cells.push({ date: new Date(y, m + 1, idx + 1), inMonth: false });
  }
  // 6행 맞추기
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
  }
  return cells;
}

export default function VisibilityPage() {
  // 초기 월을 "현재 월"로
  const today = new Date();
  const [view, setView] = useState<YMD>({ y: today.getFullYear(), m: today.getMonth() });

  // 범위 선택(시작/끝)
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);

  const grid = useMemo(() => buildCalendarGrid(view), [view]);

  const goMonth = (delta: number) => {
    const next = new Date(view.y, view.m + delta, 1);
    setView({ y: next.getFullYear(), m: next.getMonth() });
  };

  const onPick = (d: Date) => {
    if (!start || (start && end)) {
      setStart(d);
      setEnd(null);
      return;
    }
    if (start && !end) {
      if (sameDay(start, d)) {
        setEnd(d);
        return;
      }
      setEnd(d);
    }
  };

  const confirm = () => {
    if (!start || !end) return alert('시작과 종료 날짜를 선택해 주세요.');
    const a = start < end ? start : end;
    const b = start < end ? end : start;
    alert(`공개 범위: ${a.getFullYear()}.${a.getMonth() + 1}.${a.getDate()} ~ ${b.getFullYear()}.${b.getMonth() + 1}.${b.getDate()}`);
  };

  return (
    <AppLayout
      showBack
      showMenu={false}
      showBrush={false}
      title={
        <>
          <span className="text-[#A0A0A0]">생일상 공개 </span>
          <span className="text-[#FF8B8B]">날짜</span>
        </>
      }
      footerButtonLabel="확인"
      onFooterButtonClick={confirm}
    >
      {/* 상단 구분선 */}
      <div className="h-[1px] bg-[#EFD9C6] mb-4" />

      {/* 캘린더 카드 */}
      <section className="rounded-xl border border-[#EFD9C6] bg-white shadow-sm overflow-hidden">
        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between px-4 py-3">
          <button
            aria-label="이전 달"
            onClick={() => goMonth(-1)}
            className="p-2 rounded-md hover:bg-black/5 active:scale-95 transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 6L9 12L15 18" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="text-center">
            <div className="text-[18px] font-bold">{view.m + 1}월</div>
            <div className="text-[12px] text-[#A0A0A0]">{view.y}</div>
          </div>
          <button
            aria-label="다음 달"
            onClick={() => goMonth(1)}
            className="p-2 rounded-md hover:bg黑/5 active:scale-95 transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 6L15 12L9 18" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 text-center text-[12px] text-[#8A8A8A] border-t border-[#F0E4D9]">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 border-t border-[#F0E4D9]">
          {grid.map(({ date, inMonth }, idx) => {
            const inRange = start && end && isBetween(date, start, end);
            const isStart = sameDay(start, date);
            const isEnd = sameDay(end, date);

            const base = 'h-[44px] flex items-center justify-center text-[14px] transition';
            const dim = inMonth ? 'text-[#333]' : 'text-[#C9C9C9]';
            const hover = 'hover:bg-black/5 active:scale-[0.98]';
            const selectedBg = inRange ? 'bg-[#FF8B8B]/35' : '';
            const boundary = isStart || isEnd ? 'ring-2 ring-[#FF8B8B] ring-offset-0 rounded-lg' : '';

            const roundLeft = isStart && !isEnd ? 'rounded-l-full' : '';
            const roundRight = isEnd && !isStart ? 'rounded-r-full' : '';

            const className = [base, dim, hover, selectedBg, boundary, roundLeft, roundRight].join(' ');

            return (
              <button key={idx} onClick={() => onPick(date)} className={className}>
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </section>

      {/* 안내문 */}
      <p className="mt-4 text-[12px] leading-6 text-[#8A8A8A]">
        생일 메시지는 14일 전부터 등록할 수 있으며 생일 당일에 공개됩니다.
      </p>
    </AppLayout>
  );
}

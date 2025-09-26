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
  // 5행 맞추기
  while (cells.length < 35) {
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

      {/* 캘린더 카드 */}
      <section className=" bg-white overflow-hidden py-3">
        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between px-3 py-3">
          <button
            aria-label="이전 달"
            onClick={() => goMonth(-1)}
          >
            {prevMonth}
          </button>
          <div className="text-center">
            <div className="text-xl text-black font-normal font-['Inter']">{view.m + 1}월</div>
            <div className="text-xs text-black font-normal font-['Inter']">{view.y}</div>
          </div>
          <button
            aria-label="다음 달"
            onClick={() => goMonth(1)}
          >
            {nextMonth}
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 text-center text-sm text-[#707070] font-['Inter'] font-semibold">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7">
          {grid.map(({ date, inMonth }, idx) => {
            const inRange = start && end && isBetween(date, start, end);
            const isStart = sameDay(start, date);
            const isEnd = sameDay(end, date);

            const base = "h-9 my-1 flex items-center justify-center text-sm text-medium transition";
            const dim = inMonth ? 'text-black' : 'text-[#707070]';
            const hover = 'hover:bg-black/5 active:scale-[0.98]';
            const selectedBg = inRange ? 'bg-[#FF8B8B]/50' : '';
            const boundary = isStart || isEnd ? 'bg-[#FF8B8B]/50' : '';

            const roundLeft = isStart && !isEnd ? 'rounded-l-lg' : '';
            const roundRight = isEnd && !isStart ? 'rounded-r-lg' : '';

            const endRing = isEnd ? 'border-2 border-[#FF8B8B]' : '';

            const className = [base, dim, hover, selectedBg, boundary, roundLeft, roundRight, endRing].join(' ');

            return (
              <button key={idx} onClick={() => onPick(date)} className={className}>
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </section>

      <div className='h-[1px] bg-[#D9D9D9] my-8'/>

      {/* 안내문 */}
      <p className="text-base leading-6 text-[#BFBFBF] break-keep">
        생일 메시지는 14일 전부터 등록할 수 있으며 생일 당일에 공개됩니다.
      </p>
    </AppLayout>
  );
}

// ---------- 아이콘 svg ----------
const prevMonth = <svg xmlns="http://www.w3.org/2000/svg" width="9" height="15" viewBox="0 0 9 15" fill="none">
  <path d="M7.7301 1.07153L1.45227 7.34937L7.7301 13.6272" stroke="black" strokeWidth="1.79365" strokeLinecap="round" strokeLinejoin="round" />
</svg>
const nextMonth = <svg xmlns="http://www.w3.org/2000/svg" width="9" height="15" viewBox="0 0 9 15" fill="none">
  <path d="M1.09521 1.07153L7.37305 7.34937L1.09521 13.6272" stroke="black" strokeWidth="1.79365" strokeLinecap="round" strokeLinejoin="round" />
</svg>
// src/pages/subpages/VisibilityPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/ui/AppLayout';
import { getBirthdayPeriod, type BirthdayPeriod } from "@/apis/birthday";
import { useNavigate } from 'react-router-dom';
import { getLastBirthdayId } from '@/stores/authStorage';
import { toNumOrUndef } from '@/utils/toNumOrUndef';
// import { LS_LAST_BID } from '@/hooks/useFeastThisYear'; [레거시]

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

// ---- 폴백 기간 설정: 로컬스토리지 키가 없거나 API가 실패하면 오늘-14일 ~ 오늘로 자동 표시
const FALLBACK_DAYS_BEFORE = 14;
function buildFallbackPeriod() {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const start = new Date(end);
  start.setDate(start.getDate() - FALLBACK_DAYS_BEFORE);
  return { start, end };
}

type YMD = { y: number; m: number }; // m: 0~11

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function sameDay(a: Date | null, b: Date) {
  return !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isBetween(target: Date, start: Date, end: Date) {
  const t = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return t > Math.min(s, e) && t < Math.max(s, e);
}
/** "YYYY-MM-DD"를 타임존 밀림 없이 파싱 */
function parseLocalYMD(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
/** 해당 월(월요일 시작) 달력 그리드(6행x7열) 생성 */
function buildCalendarGrid({ y, m }: YMD) {
  const firstDay = new Date(y, m, 1).getDay(); // 0=일
  const offsetMon = (firstDay + 6) % 7; // 0=월
  const thisCount = daysInMonth(y, m);
  const prevCount = daysInMonth(y, m - 1);

  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = offsetMon; i > 0; i--) {
    const d = new Date(y, m - 1, prevCount - i + 1);
    cells.push({ date: d, inMonth: false });
  }
  for (let d = 1; d <= thisCount; d++) cells.push({ date: new Date(y, m, d), inMonth: true });
  while (cells.length % 7 !== 0) {
    const idx = cells.length - (offsetMon + thisCount);
    cells.push({ date: new Date(y, m + 1, idx + 1), inMonth: false });
  }
  while (cells.length < 35) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
  }
  return cells;
}

export default function VisibilityPage() {
  const navigate = useNavigate();
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // 초기 월(나중에 시작일의 월로 이동)
  const [view, setView] = useState<YMD>(() => {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth() };
  });

  useEffect(() => {
    const idRaw = getLastBirthdayId();

    // 로컬스토리지 미존재 → 폴백 세팅
    if (!idRaw) {
      applyFallback("저장된 birthdayId가 없어 폴백 기간을 표시합니다.");
      return;
    }

    const birthdayId = toNumOrUndef(idRaw);

    // birthdayId가 유효 숫자가 아니면 API 호출하지 않음
    if (birthdayId === undefined) {
      applyFallback("유효하지 않은 birthdayId입니다. 폴백 기간을 표시합니다.");
      return;
    }

    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data: BirthdayPeriod = await getBirthdayPeriod(birthdayId, { signal: ac.signal });
        const s = parseLocalYMD(data.startTime);
        const e = parseLocalYMD(data.endTime);
        setStart(s);
        setEnd(e);
        setView({ y: s.getFullYear(), m: s.getMonth() }); // 시작일의 월로 이동
      } catch (e: any) {
        applyFallback(e?.message ?? "공개기간 조회 실패: 폴백 기간을 표시합니다.");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  // 👇 깔끔하게 재사용할 폴백 헬퍼
  function applyFallback(message: string) {
    const fb = buildFallbackPeriod();
    setStart(fb.start);
    setEnd(fb.end);
    setView({ y: fb.start.getFullYear(), m: fb.start.getMonth() });
    setErr(message);
    setLoading(false);
  }


  const grid = useMemo(() => buildCalendarGrid(view), [view]);

  const goMonth = (delta: number) => {
    const next = new Date(view.y, view.m + delta, 1);
    setView({ y: next.getFullYear(), m: next.getMonth() });
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
      onFooterButtonClick={() => navigate(-1)}
    >
      <div className='px-8 py-4'>
        {/* 캘린더 카드 */}
        <section className=" bg-white overflow-hidden py-3">
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between px-3 py-3">
            <button aria-label="이전 달" onClick={() => goMonth(-1)}>{prevMonth}</button>
            <div className="text-center">
              <div className="text-xl text-black font-normal font-['Inter']">{view.m + 1}월</div>
              <div className="text-xs text-black font-normal font-['Inter']">{view.y}</div>
            </div>
            <button aria-label="다음 달" onClick={() => goMonth(1)}>{nextMonth}</button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 text-center text-sm text-[#707070] font-['Inter'] font-semibold">
            {WEEKDAYS.map((d) => <div key={d} className="py-2">{d}</div>)}
          </div>

          {/* 날짜 그리드 (읽기 전용) */}
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

              const className = [base, dim, hover, selectedBg, boundary, roundLeft, roundRight, endRing, "cursor-default"].join(' ');

              return <div key={idx} className={className}>{date.getDate()}</div>;
            })}
          </div>
        </section>

        {loading && <div className="px-4 py-3 text-sm text-[#707070]">공개기간을 불러오는 중…</div>}
        {err && <div className="px-4 py-3 text-sm text-red-500">{err}</div>}

        <div className='h-[1px] bg-[#D9D9D9] my-8' />

        <p className="text-base leading-6 text-[#BFBFBF] break-keep">
          생일 메시지는 14일 전부터 등록할 수 있으며 생일 당일에 공개됩니다.
        </p>
      </div>
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

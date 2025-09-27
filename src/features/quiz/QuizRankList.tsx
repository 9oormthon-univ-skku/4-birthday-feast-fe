// src/features/quiz/QuizRankList.tsx
import React from 'react';
import clsx from 'clsx';

type Props = {
  className?: string;
  /** 스크롤 높이 지정(기본 max-h-[70vh]) */
  heightClassName?: string;
};

type RankItem = { name: string; score: string };

const ITEMS: RankItem[] = [
  { name: '김땡땡님', score: '15/20' },
  { name: '어쩌구저쩌구님', score: '13/20' },
  { name: '김수한무거북이와두루미님', score: '10/20' },
  { name: '4동님', score: '9/20' },
  { name: '선풍기고장남님', score: '20/8' },
  { name: '생일축하해님', score: '20/7' },
  { name: '허리아프다님', score: '20/6' },
  { name: '거북목님', score: '20/5' },
  { name: '철수님', score: '20/4' },
  { name: '영희님', score: '20/3' },
  { name: '치즈님', score: '20/2' },
  { name: '모닥불님', score: '20/2' },
  { name: '둘리님', score: '20/1' },
  { name: '도우너님', score: '20/0' },
  { name: '또치님', score: '20/12' },
  { name: '마이쮸님', score: '20/11' },
  { name: '마카롱님', score: '20/10' },
  { name: '딸기케이크님', score: '20/9' },
  { name: '초코쿠키님', score: '20/8' },
  { name: '솜사탕님', score: '20/7' },
];

export default function QuizRankList({
  className,
  heightClassName = 'max-h-[68vh]',
}: Props) {
  return (
    <div className={clsx('w-full', className)}>
      <div className={clsx('overflow-auto pr-1', heightClassName)}>
        <ul className="w-full">
          {ITEMS.map((it, idx) => (
            <li
              key={`${it.name}-${idx}`}
              className="flex items-center justify-between py-2"
            >
              {/* Left: 번호 + 아바타 + 텍스트 */}
              <div className="flex min-w-0 items-center gap-3">
                {/* 번호 */}
                <div className="w-5 text-right text-sm font-bold text-[#E49393] tabular-nums">
                  {idx + 1}
                </div>

                {/* 아바타 (회색 원) */}
                <div className="h-7 w-7 rounded-full bg-neutral-300/60" aria-hidden />

                {/* 이름/점수 */}
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[#FF8B8B]">
                    {it.name}
                  </div>
                  <div className="text-[11px] text-[#E49393]">{it.score}</div>
                </div>
              </div>

              {/* Right: 오답보기 버튼 */}
              <button
                type="button"
                className="shrink-0 rounded-full bg-[#FF8B8B] px-3 py-1 text-xs font-semibold text-white shadow-sm active:scale-95 transition"
                onClick={() => {
                  // 개발용: 필요 시 동작 추가
                  // console.log('오답보기:', it.name);
                }}
              >
                오답보기
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

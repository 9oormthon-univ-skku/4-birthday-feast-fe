import React, { useMemo } from 'react';
import clsx from 'clsx';
import { useQuizRanking } from '@/hooks/useQuizRanking';
import { GoPersonFill } from "react-icons/go";

type Props = {
  className?: string;
  /** 스크롤 높이 지정(기본 max-h-[68vh]) */
  heightClassName?: string;
  /** “오답보기” 버튼 클릭 시 부모에 알림 */
  onShowAnswers?: () => void;
  nickName?: string;
};

export default function QuizRankList({
  className,
  heightClassName = 'max-h-[68vh]',
  onShowAnswers,
  nickName,
}: Props) {
  const { items, isLoading, isError } = useQuizRanking({
  });

  const displayItems = useMemo(() => items, [items]);

  return (
    <div className={clsx('w-full', className)}>
      <div className={clsx('overflow-auto pr-1', heightClassName)}>
        {/* 상태 표시 */}
        <div className="mb-2 flex items-center gap-2 text-xs">
          {isLoading && <span className="animate-pulse text-[#FF8B8B]">랭킹을 불러오는 중…</span>}
          {isError && <span className="text-[#FF8B8B]">네트워크 오류로 예시 데이터를 표시합니다.</span>}
        </div>

        <ul className="w-full">
          {displayItems.map((it) => (
            <li
              key={`${it.guestQuizId ?? 'fallback'}-${it.rank}-${it.name}`}
              className="flex items-center justify-between py-2"
            >
              {/* Left: 순위 + 아바타 + 이름/점수 */}
              <div className="flex min-w-0 items-center gap-3">
                <div className="w-5 text-right text-sm font-bold text-[#FF8B8B] tabular-nums">
                  {it.rank}
                </div>
                <div className="h-7 w-7 rounded-full overflow-hidden bg-[#D9D9D9] border-1 border-[#D9D9D9]" aria-hidden >
                  <GoPersonFill className="h-full w-full mt-[0.185rem] text-[#bebebe]" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-[#FF8B8B]">
                    {it.name}
                  </div>
                  <div className="text-xs text-[#BFBFBF] font-bold">{it.score}</div>
                </div>
              </div>

              {/* Right: 오답보기 버튼 */}
              {onShowAnswers && nickName === it.name && (<button
                type="button"
                className="shrink-0 rounded-full bg-[#FF8B8B] px-3 py-1 text-xs font-semibold text-white shadow-sm active:scale-95 transition"
                onClick={() => {
                  onShowAnswers?.();
                }}
              >
                오답보기
              </button>)}
            </li>
          ))}
        </ul>
      </div>
    </div >
  );
}

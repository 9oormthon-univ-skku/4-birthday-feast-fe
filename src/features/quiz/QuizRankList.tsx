// src/features/quiz/QuizRankList.tsx
import React, { useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { useQuizRanking } from '@/hooks/useQuizRanking';
import { GoPersonFill } from "react-icons/go";

type Props = {
  className?: string;
  heightClassName?: string;
  onShowAnswers?: () => void;
  nickName?: string;
  /** ❗️외부에서 fetch 타이밍 제어 */
  enabled?: boolean;
  /** ❗️값이 바뀌면 refetch 트리거 (e.g. Date.now()) */
  refreshToken?: number | string;
};

export default function QuizRankList({
  className,
  heightClassName = 'max-h-[68vh]',
  onShowAnswers,
  nickName,
  enabled = true,
  refreshToken,
}: Props) {
  const { items, isLoading, isError, refetch } = useQuizRanking();

  // refreshToken 변경 시 강제 재조회
  useEffect(() => {
    if (!enabled) return;
    if (refreshToken !== undefined) refetch();
  }, [enabled, refreshToken, refetch]);

  const displayItems = useMemo(() => items, [items]);

  return (
    <div className={clsx('w-full', className)}>
      <div className={clsx('overflow-auto pr-1', heightClassName)}>
        {/* 상태 표시 */}
        <div className="mb-2 flex items-center gap-2 text-xs">
          {isLoading && <span className="animate-pulse text-[#FF8B8B]">랭킹을 불러오는 중…</span>}
          {isError && <span className="text-[#FF8B8B]">랭킹을 불러오지 못했어요.🥲</span>}
          {!isLoading && !isError && (items.length === 0) && <span className="text-[#FF8B8B]">아직 랭킹 데이터가 없습니다.</span>}
        </div>

        {items.length > 0 &&
          <ul className="w-full">
            {displayItems.map((it) => (
              <li
                key={`${it.guestQuizId ?? 'fallback'}-${it.rank}-${it.name}`}
                className="flex items-center justify-between py-2"
              >
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

                {onShowAnswers && nickName === it.name && (
                  <button
                    type="button"
                    className="shrink-0 rounded-full bg-[#FF8B8B] mx-2 px-3 py-1 text-xs font-semibold text-white shadow-sm active:scale-95 transition"
                    onClick={() => onShowAnswers?.()}
                  >
                    오답보기
                  </button>
                )}
              </li>
            ))}
          </ul>}
      </div>
    </div>
  );
}

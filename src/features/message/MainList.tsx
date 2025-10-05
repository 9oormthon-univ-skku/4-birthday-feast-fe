// src/features/home/MainList.tsx
import React from 'react';
import clsx from 'clsx';
import { useBirthdayCards } from '@/features/message/useBirthdayCards';
import type { BirthdayCard } from '@/types/birthday';
import { useNavigate } from 'react-router-dom'; // ✅ 추가

type MainListProps = {
  columns?: 2 | 3 | 4;
  onSelect?: (card: BirthdayCard) => void;
  className?: string;
};

const colClass = (n: 2 | 3 | 4) =>
  ({ 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }[n]);

const MainList: React.FC<MainListProps> = ({ columns = 4, onSelect, className }) => {
  const { data, isLoading, error } = useBirthdayCards();
  const navigate = useNavigate(); // ✅ 추가

  if (error) {
    return (
      <div className={clsx('w-full py-8 text-center text-sm text-red-500', className)}>
        데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </div>
    );
  }

  if (isLoading) {
    return <SkeletonGrid columns={columns} className={className} />;
  }

  const handleClick = (c: BirthdayCard, index: number) => {
    onSelect?.(c); // ✅ TableCakes와 동일: 콜백 먼저
    const id = (c as any).birthdayCardId ?? (c as any).id ?? '';
    navigate(`/message?i=${index}`, { state: { cakeId: id } }); // ✅ 동일 동작
  };

  return (
    <ul
      className={clsx(
        'grid gap-x-6 gap-y-5 w-full max-w-[520px] mx-auto',
        colClass(columns),
        className
      )}
      role="list"
    >
      {data.map((c, idx) => (
        <li key={(c as any).birthdayCardId ?? (c as any).id ?? `${c.nickname}-${c.imageUrl}`}>
          <button
            type="button"
            onClick={() => handleClick(c, idx)}
            className="group flex w-full flex-col items-center outline-none"
          >
            {/* 원형 썸네일 (중첩 button → div로 교체) */}
            <div className="flex h-15 w-15 items-center justify-center rounded-full bg-[#FFFDF9]">
              <img
                src={c.imageUrl}
                alt={c.nickname ?? '디저트'}
                loading="lazy"
                className="h-14 mt-2 w-auto object-contain"
              />
            </div>

            {/* 닉네임 */}
            <div className="mt-2 w-24 text-center text-sm font-semibold leading-tight text-[#FF8B8B] break-keep">
              {c.nickname ?? '방문자'}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default MainList;

/* -------- 로딩 스켈레톤 -------- */
function SkeletonGrid({
  columns,
  className,
}: {
  columns: 2 | 3 | 4;
  className?: string;
}) {
  const items = Array.from({ length: columns * 4 }); // 2~3행 정도 보여주기
  return (
    <ul
      className={clsx(
        'grid gap-x-6 gap-y-5 w-full max-w-[520px] mx-auto',
        colClass(columns),
        className
      )}
    >
      {items.map((_, i) => (
        <li key={i} className="flex flex-col items-center">
          <div className="h-20 w-20 animate-pulse rounded-full bg-neutral-200/70 md:h-24 md:w-24" />
          <div className="mt-2 h-3 w-20 animate-pulse rounded bg-neutral-200/70 md:w-24" />
        </li>
      ))}
    </ul>
  );
}

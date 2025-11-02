// src/features/home/MainList.tsx
import { FC } from 'react';
import clsx from 'clsx';
import type { BirthdayCardLike } from '@/types/birthday';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useBirthdayCards } from '@/hooks/useBirthdayCards';

type MainListProps = {
  columns?: 2 | 3 | 4;
  onSelect?: (card: BirthdayCardLike) => void;
  className?: string;
};

const colClass = (n: 2 | 3 | 4) =>
  ({ 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }[n]);

const MainList: FC<MainListProps> = ({ columns = 4, onSelect, className }) => {
  const { data, isLoading, error } = useBirthdayCards();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams(); // 현재 경로 파라미터 사용

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

  // 기존 쿼리스트링 유지 + i 추가
  const buildSearchWithIndex = (i: number) => {
    const sp = new URLSearchParams(location.search);
    sp.set('i', String(i));
    const q = sp.toString();
    return q ? `?${q}` : '';
  };

  const handleClick = (c: BirthdayCardLike, index: number) => {
    onSelect?.(c);

    const id = (c as any).birthdayCardId ?? (c as any).id ?? '';

    if (userId) {
      navigate(
        {
          pathname: `/u/${userId}/message`,
          search: buildSearchWithIndex(index),
        },
        { state: { cakeId: id } }
      );
    } else {
      // fallback: 전역 메시지 경로
      navigate(
        { pathname: '/message', search: buildSearchWithIndex(index) },
        { state: { cakeId: id } }
      );
    }
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
            {/* 원형 썸네일 */}
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
  const items = Array.from({ length: columns * 4 });
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

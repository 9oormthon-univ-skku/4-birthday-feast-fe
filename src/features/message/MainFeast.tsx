import React, { useMemo } from 'react';
import clsx from 'clsx';

// 내부 이미지/자원 임포트
import table from '@/assets/images/table.svg';
import lBalloon from '@/assets/images/left-balloon.svg';
import rBalloon from '@/assets/images/right-balloon.svg';
import host from '@/assets/images/host.svg';
import mainCake from '@/assets/images/main-cake.svg';

// 케이크 폴백 이미지(최소 6개 보장)
import food1 from '@/assets/images/food-1.svg';
import food2 from '@/assets/images/food-2.svg';
import food3 from '@/assets/images/food-3.svg';
import food4 from '@/assets/images/food-4.svg';
import food5 from '@/assets/images/food-5.svg';
import food6 from '@/assets/images/food-6.svg';

// 내부에서 TableCakes & 카드 데이터 훅 사용
import TableCakes from '@/features/message/TableCakes';
import { useBirthdayCards } from '@/features/message/useBirthdayCards';
import PlayQuizButton from '../quiz/QuizButton';

export type CakeItem = { id: number | string; src: string; alt?: string };

export type MainFeastProps = {
  className?: string;
};

const MainFeast: React.FC<MainFeastProps> = ({ className }) => {
  const { data: cards = [] } = useBirthdayCards();

  const cakes: CakeItem[] = useMemo(() => {
    const fallback = [food1, food2, food3, food4, food5, food6];

    const mapped = cards.map((c: any, idx: number) => ({
      id: c.birthdayCardId ?? `card-${idx}`,
      src: c.imageUrl,
      alt: c.nickname,
    }));

    if (mapped.length >= 6) return mapped;

    const need = Math.max(0, 6 - mapped.length);
    const fills = Array.from({ length: need }).map((_, i) => ({
      id: `fallback-${i + 1}`,
      src: fallback[i],
      alt: `디저트${i + 1}`,
    }));
    return [...mapped, ...fills];
  }, [cards]);

  return (
    <div className='relative w-full max-w-[520px]'>
      {/* 풍선 */}
      <img
        src={lBalloon}
        alt=""
        className="absolute left-0 z-30 -translate-y-[73%] w-[31%]"
      />
      <img
        src={rBalloon}
        alt=""
        className="absolute right-0 z-30 -translate-y-[75%] w-[34%]"
      />

      {/* 호스트/케이크 */}
      <div className="absolute left-1/2 z-40 -translate-x-1/2 -translate-y-[83%] w-[46%]">
        <img src={host} alt="host" className="w-full" />
        <div className="absolute left-0 top-1/2 -translate-x-[55%] -translate-y-1/2">
          <PlayQuizButton
            variant="inline"
            imgSizeClassName="h-17 w-21"
            ariaLabel="퀴즈 플레이 버튼"
          />
        </div>
      </div>

      <img
        src={mainCake}
        alt=""
        className="absolute left-1/2 z-50 -translate-x-1/2 -translate-y-[60%] 
        w-[50%] drop-shadow-[0_8px_8px_rgba(0,0,0,0.15)]"
      />

      {/* 테이블 + 케이크들 */}
      <div className="relative h-full w-full">
        <img src={table} alt="table" className="z-10 h-auto w-full" />
        <TableCakes items={cakes} />
      </div>
    </div>
  );
};

export default React.memo(MainFeast);

import React, { useMemo } from 'react';
import clsx from 'clsx';

// 내부 이미지/자원 임포트
import table from '@/assets/images/table.svg';
import lBalloon from '@/assets/images/left-balloon.svg';
import rBalloon from '@/assets/images/right-balloon.svg';
import host from '@/assets/images/host.svg';
import mainCake from '@/assets/images/main-cake.svg';

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

  // 🎂 로컬스토리지 카드만 사용 — 폴백 없음
  const cakes: CakeItem[] = useMemo(() => {
    return cards.map((c: any, idx: number) => ({
      id: c.birthdayCardId ?? `card-${idx}`,
      src: c.imageUrl,
      alt: c.nickname,
    }));
  }, [cards]);

  return (
    <div className="relative w-full max-w-[520px]">
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

      {/* 호스트 / 퀴즈 버튼 */}
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

import { FC, memo, useMemo } from 'react';
import table from '@/assets/images/table.webp';
import lBalloon from '@/assets/images/left-balloon.webp';
import rBalloon from '@/assets/images/right-balloon.webp';

const HOST_SRC = '/images/host.webp';
const MAIN_CAKE_SRC = '/images/main-cake.webp';

import TableCakes from '@/features/message/TableCakes';
import PlayQuizButton from '../quiz/QuizButton';
import { BirthdayCardLike, CakeItem } from '@/types/birthday';
import { cardsToCakes } from '@/utils/cardsToCakes';

export type MainFeastProps = {
  className?: string;
  cards: BirthdayCardLike[];
  hideQuizButton?: boolean;
};

const MainFeast: FC<MainFeastProps> = ({
  // className,
  cards = [],
  hideQuizButton = false,
}) => {
  // cards를 cakes로 변환 
  const cakes: CakeItem[] = useMemo(
    () => cardsToCakes(cards),
    [cards]
  );

  return (
    // <div className={`relative w-full max-w-[520px] ${className}`}>
    <div className="relative w-full max-w-[520px]">

      {/* 🎈 장식 풍선 (lazy) */}
      <img
        src={lBalloon}
        alt=""
        width={162}
        height={503}
        className="absolute left-0 z-30 -translate-y-[73%] w-[31%]"
        loading="lazy"
        fetchPriority="low"
        decoding="async"
        aria-hidden="true"
      />
      <img
        src={rBalloon}
        alt=""
        width={162}
        height={503}
        className="absolute right-0 z-30 -translate-y-[75%] w-[34%]"
        loading="lazy"
        fetchPriority="low"
        decoding="async"
        aria-hidden="true"
      />


      {/* 👤 host = LCP 우선 */}
      <picture className="absolute left-1/2 z-40 -translate-x-1/2 -translate-y-[83%] w-[46%]">
        <img
          src={HOST_SRC}
          alt="host"
          width={175}
          height={382}
          loading="eager"
          fetchPriority="high"
          sizes="(max-width: 520px) 46vw, 240px"
          className="block w-full"
        />
        {!hideQuizButton && (<div className="absolute left-0 top-1/2 -translate-x-[55%] -translate-y-1/2">
          <PlayQuizButton
            variant="inline"
            imgSizeClassName="h-17 w-21"
            ariaLabel="퀴즈 플레이 버튼"
          />
        </div>)}
      </picture>

      {/* 🎂 main-cake = 우선순위 내림 */}
      <img
        src={MAIN_CAKE_SRC}
        alt="cake"
        width={196}
        height={214}
        className="absolute left-1/2 z-50 -translate-x-1/2 -translate-y-[60%] w-[50%]"
        loading="eager"
        fetchPriority="auto"                    // 'high' 제거(또는 "low")
        aria-hidden="false"
      />

      {/* 🍽️ 테이블 + 케이크들 (lazy) */}
      <div className="relative h-full w-full">
        <img
          src={table}
          alt="table"
          width={473}
          height={333}
          className="z-10 w-full"
          loading="lazy"
          fetchPriority="low"
          decoding="async"
          aria-hidden="true"
        />
        <TableCakes items={cakes} />
      </div>
    </div>
  );
};

export default memo(MainFeast);

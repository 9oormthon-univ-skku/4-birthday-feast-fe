import { FC, memo, useMemo } from 'react';
// 내부 이미지/자원 임포트
import table from '@/assets/images/table.svg';
import lBalloon from '@/assets/images/left-balloon.svg';
import rBalloon from '@/assets/images/right-balloon.svg';

// 내부에서 TableCakes & 카드 데이터 훅 사용
import TableCakes from '@/features/message/TableCakes';
import PlayQuizButton from '../quiz/QuizButton';
import { BirthdayCardLike } from '@/types/birthday';

const HOST_SRC = '/images/host.svg';
const MAIN_CAKE_SRC = '/images/main-cake.svg';

export type CakeItem = { id: number | string; src: string; alt?: string };

export type MainFeastProps = {
  className?: string;
  cards: BirthdayCardLike[];
  hideQuizButton?: boolean;
};

const MainFeast: FC<MainFeastProps> = ({ className, cards = [], hideQuizButton = false }) => {
  // 카드 하나-> 케이크 하나로 반환
  const cakes: CakeItem[] = useMemo(() => {
    return cards.map((c: any, idx: number) => ({
      id: c.birthdayCardId ?? `card-${idx}`,
      src: c.imageUrl,
      alt: c.nickname,
    }));
  }, [cards]);

  return (
    <div className={`relative w-full max-w-[520px] ${className}`}>
      {/* 풍선 */}
      <img
        src={lBalloon}
        alt=""
        width={162} height={503}
        className="absolute left-0 z-30 -translate-y-[73%] w-[31%] h-auto"
        loading="lazy"
        decoding="async"
        aria-hidden="true"
      />
      <img
        src={rBalloon}
        alt=""
        width={162} height={503}
        className="absolute right-0 z-30 -translate-y-[75%] w-[34%] h-auto"
        loading="lazy"
        decoding="async"
        aria-hidden="true"
      />

      {/* 호스트 / 퀴즈 버튼 (⚠️ LCP 후보) */}
      <div className="absolute left-1/2 z-40 -translate-x-1/2 -translate-y-[83%] w-[46%]">
        <img
          src={HOST_SRC}
          alt="host"
          /* LCP 최적화: lazy 제거 + fetchpriority=high */
          fetchPriority="high"
          decoding="async"
          width={175} height={382}
          className="w-full h-auto"
        />
        {!hideQuizButton && (
          <div className="absolute left-0 top-1/2 -translate-x-[55%] -translate-y-1/2">
            <PlayQuizButton
              variant="inline"
              imgSizeClassName="h-17 w-21"
              ariaLabel="퀴즈 플레이 버튼"
            />
          </div>
        )}
      </div>

      {/* 메인 케이크 (LCP가 host라면 high 불필요) */}
      <img
        src={MAIN_CAKE_SRC}
        alt="cake"
        aria-hidden="true"
        decoding="async"
        width={196} height={214}
        className="absolute left-1/2 z-50 h-auto -translate-x-1/2 -translate-y-[60%] w-[50%]
                  drop-shadow-[0_8px_8px_rgba(0,0,0,0.15)]"
      />

      {/* 테이블 + 케이크들 */}
      <div className="relative h-full w-full">
        <img
          src={table}
          alt="table"
          loading="lazy"
          decoding="async"
          width={473} height={333}
          className="z-10 h-auto w-full"
        />
        <TableCakes items={cakes} />
      </div>
    </div>
  );
};

export default memo(MainFeast);

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Header from '../../ui/Header';
import FooterButton from '@/ui/FooterButton';

import { useBirthdayMode } from '@/app/ModeContext';
import ViewToggle from '@/features/home/ViewToggle';
import FeatureButtons from '@/features/home/FeatureButtons';
import EventBanner from '@/features/event/EventBanner';

import MainFeast from '@/features/message/MainFeast';
import MainList from '@/features/message/MainList';
import QuizRankList from '@/features/quiz/QuizRankList';

import CapturePreview from '@/features/home/CapturePreview';
import BottomSheet from './BottomSheet';

import { qk } from '@/apis/queryKeys';
import { getUserMe, type UserMeResponse } from '@/apis/user';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useBirthdayCards } from '@/hooks/useBirthdayCards';

const MainHome: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [qs] = useSearchParams();

  const [drawerOpen, setDrawerOpen] = useState(false); // 메뉴 오픈 상태 관리 
  const [isIconView, setIsIconView] = useState(true); // 생일 메시지 아이콘 뷰(테이블에 올리기) 상태 관리 (아이콘 뷰 | 리스트 뷰)

  const { isHost, isGuest } = useBirthdayMode(); // 생일자 | 게스트 상태 관리 

  const captureRef = useRef<HTMLDivElement | null>(null); // 캡쳐 기능을 위한 ref
  const [shotUrl, setShotUrl] = useState<string | null>(null);

  const { data: me } = useQuery<UserMeResponse>({
    queryKey: qk.auth.me,
    queryFn: getUserMe,
    enabled: isHost,              // 게스트면 호출 안 함
    staleTime: 5 * 60 * 1000,     // 5분 동안 신선 처리 (깜빡임/재요청 줄이기)
    placeholderData: (prev) => prev, // 이전 캐시 유지 (있다면)
    initialData: () => queryClient.getQueryData<UserMeResponse>(qk.auth.me), // 이미 프리패치된 값 사용
  });

  const { data: cards = [], isLoading: cardsLoading, error: cardsError } = useBirthdayCards();

  const nameFromQS = (isGuest ? (qs.get('name')?.trim() || '') : '').trim();
  const displayName = (isGuest ? nameFromQS : me?.name?.trim()) || '사용자';

  return (
    <div className="relative flex h-screen w-screen flex-col bg-[#FFF4DF]">
      {/* Header는 UserLayout에서 모드/유저 컨텍스트가 제공되므로 그대로 사용 */}
      <Header onDrawerOpenChange={setDrawerOpen} showBrush={isHost}
        title={<>
          <span className="text-[#FF8B8B]">{displayName}</span>
          <span className="text-[#A0A0A0]">님의 생일한상</span>
        </>} />

      {/* 상단 컨트롤 바 */}
      <div className="z-100 mx-auto my-4 flex w-[90%] max-w-[468px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <ViewToggle isIconView={isIconView} onToggle={setIsIconView} />
          {isHost && (
            <FeatureButtons
              targetRef={captureRef}
              fileName="birthday-feast"
              backgroundColor="#FFF4DF"
              onCaptured={(url) => setShotUrl(url)}
            />
          )}
        </div>

        {isHost && (
          <div className="shrink-0">
            <EventBanner />
          </div>
        )}
      </div>

      <div ref={captureRef} className={isIconView ? 'mt-auto pt-[95%]' : ''}>
        {isIconView ? (
          <div className="w-full flex justify-center">
            <MainFeast cards={cards} />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[520px] px-4 pb-3">
            <MainList columns={4}
              cards={cards}
              isLoading={cardsLoading}
              error={cardsError}
            />
          </div>
        )}
      </div>

      <BottomSheet>
        <h2 className="mb-2 text-[#FF8B8B] text-xl font-bold">방문자 퀴즈 랭킹</h2>
        <QuizRankList />
      </BottomSheet>

      {
        isGuest && !drawerOpen && (
          <footer className="fixed bottom-8 left-0 right-0 z-100 flex justify-center bg-transparent">
            <div className="w-full max-w-[520px] px-8 py-4 pt-15 pb-[env(safe-area-inset-bottom)]">
              <FooterButton
                label={`${displayName}님에게 생일 메시지 남기기`}
                onClick={() =>
                  navigate(
                    { pathname: '../write', search: location.search }, // ../ 로 한 단계 올라가서 /u/:userId/write 로
                    { replace: false }
                  )
                }
              />
            </div>
          </footer>
        )
      }

      {/* 방문자 온보딩 게이트만 유지 (게스트 전용) */}
      {/* {isGuest && <VisitorOnboardingGate quizPlayPath="../play" />} */}

      <CapturePreview open={!!shotUrl} src={shotUrl} onClose={() => setShotUrl(null)} />
    </div >
  );
};

export default MainHome;
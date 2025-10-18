import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../ui/Header';
import FooterButton from '@/ui/FooterButton';

import { useBirthdayMode } from '@/layouts/ModeContext';
import ViewToggle from '@/features/home/ViewToggle';
import FeatureButtons from '@/features/home/FeatureButtons';
import EventBanner from '@/features/event/EventBanner';

import MainFeast from '@/features/message/MainFeast';
import MainList from '@/features/message/MainList';
import QuizRankList from '@/features/quiz/QuizRankList';

import CapturePreview from '@/features/home/CapturePreview';
import VisitorOnboardingGate from '@/features/visitorOnboarding/VisitorOnboardingGate';
import BottomSheet from './BottomSheet';

const MainHome: React.FC = () => {
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false); // 메뉴 오픈 상태 관리 
  const [isIconView, setIsIconView] = useState(true); // 생일 메시지 아이콘 뷰(테이블에 올리기) 상태 관리 (아이콘 뷰 | 리스트 뷰)

  const { isHost, isGuest } = useBirthdayMode(); // 생일자 | 게스트 상태 관리 

  const captureRef = useRef<HTMLDivElement | null>(null); // 캡쳐 기능을 위한 ref
  const [shotUrl, setShotUrl] = useState<string | null>(null);

  return (
    <div className="relative flex h-screen w-screen flex-col bg-[#FFF4DF]">
      {/* Header는 UserLayout에서 모드/유저 컨텍스트가 제공되므로 그대로 사용 */}
      <Header onDrawerOpenChange={setDrawerOpen} showBrush={isHost} />

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
            <MainFeast />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[520px] px-4 pb-3">
            <MainList columns={4} />
          </div>
        )}
      </div>

      <BottomSheet>
        <h2 className="my-2 text-[#FF8B8B] text-xl font-bold">방문자 퀴즈 랭킹</h2>
        <QuizRankList />
      </BottomSheet>

      {isGuest && !drawerOpen && (
        <footer className="fixed bottom-8 left-0 right-0 z-100 flex justify-center bg-transparent">
          <div className="w-full max-w-[520px] px-8 py-4 pt-15 pb-[env(safe-area-inset-bottom)]">
            <FooterButton
              label="사용자님에게 생일 메시지 남기기"
              onClick={() =>
                navigate(
                  { pathname: '../write', search: location.search }, // ../ 로 한 단계 올라가서 /u/:userId/write 로
                  { replace: false }
                )
              }
            />
          </div>
        </footer>
      )}

      {/* 방문자 온보딩 게이트만 유지 (게스트 전용) */}
      {isGuest && <VisitorOnboardingGate quizPlayPath="../play" />}

      <CapturePreview open={!!shotUrl} src={shotUrl} onClose={() => setShotUrl(null)} />
    </div>
  );
};

export default MainHome;

// src/pages/MainHome/MainHome.tsx
import React, { useRef, useState } from 'react';
import {
  useNavigate,
  useSearchParams,
  useLoaderData,
  useLocation,
  type LoaderFunctionArgs,
} from 'react-router-dom';

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

import { getUserMe, type UserMeResponse } from '@/apis/user';
import { useBirthdayCards } from '@/hooks/useBirthdayCards';

// loader 추가 
type MainHomeLoaderData = {
  guestName: string;      // ?name=에서 파싱 (게스트일 때만 의미)
  meName: string | null;  // 서버에서 가져온 내 이름 (호스트일 때만 사용)
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const guestName = (url.searchParams.get('name') || '').trim();

  let meName: string | null = null;
  try {
    const me: UserMeResponse = await getUserMe();
    meName = (me?.name || '').trim() || null;
  } catch {
    // 401/403/기타 에러는 여기서 무시 (게스트일 수도 있으므로 리다이렉트 X)
  }

  return {
    guestName,
    meName,
  } satisfies MainHomeLoaderData;
}

const MainHome: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [qs] = useSearchParams();

  // 👇 모드 판별은 반드시 여기서만
  const { isHost, isGuest } = useBirthdayMode();

  // 👇 loader가 넘긴 원재료
  const { guestName, meName } = useLoaderData() as MainHomeLoaderData;

  // 최종 표시 이름: 모드에 따라 선택
  const displayName =
    (isGuest ? (guestName || qs.get('name')?.trim() || '') : meName || '') || '사용자';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isIconView, setIsIconView] = useState(true);

  const captureRef = useRef<HTMLDivElement | null>(null);
  const [shotUrl, setShotUrl] = useState<string | null>(null);

  // 카드 목록은 기존 훅 유지
  const {
    data: cards = [],
    isLoading: cardsLoading,
    error: cardsError,
  } = useBirthdayCards();

  return (
    <div className="relative flex h-screen w-screen flex-col bg-[#FFF4DF]">
      <Header
        onDrawerOpenChange={setDrawerOpen}
        showBrush={isHost}
        title={
          <>
            <span className="text-[#FF8B8B]">{displayName}</span>
            <span className="text-[#A0A0A0]">님의 생일한상</span>
          </>
        }
      />

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
            <MainList
              columns={4}
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

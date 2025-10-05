import React, { useEffect, useRef, useState } from 'react';
import Header from '../ui/Header';
import BottomSheet from '@/ui/BottomSheet';

import { BirthdayModeProvider, useBirthdayMode } from '@/features/home/ModeContext';
import ModeToggle from '@/features/home/ModeToggle';
import ViewToggle from '@/features/home/ViewToggle';
import FeatureButtons from '@/features/home/FeatureButtons';
import EventBanner from '@/features/event/EventBanner';

import MainFeast from '@/features/message/MainFeast';
import MainList from '@/features/message/MainList';

import FooterButton from '@/ui/FooterButton';
import { useNavigate } from 'react-router-dom';
import QuizRankList from '@/features/quiz/QuizRankList';
import WelcomeModal from '@/features/home/WelcomeModal';
import NicknameModal from '@/features/auth/NicknameModal';

const MainHomeBody: React.FC = () => {
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [nicknameOpen, setNicknameOpen] = useState(false);
  const [isIconView, setIsIconView] = useState(true);

  useEffect(() => { setWelcomeOpen(true); }, []);

  const { isHost, isGuest } = useBirthdayMode();

  const captureRef = useRef<HTMLDivElement | null>(null);
  const [shotUrl, setShotUrl] = useState<string | null>(null);

  // 닉네임 저장 처리 
  const handleNicknameSubmit = (nickname: string) => {
    try { localStorage.setItem('guest_nickname', nickname); } catch { }
    setNicknameOpen(false);
  };

  return (
    <div className="relative flex h-screen w-screen flex-col bg-[#FFF4DF]">
      <ModeToggle className="absolute right-3 top-30 z-[60]" />
      <Header onDrawerOpenChange={setDrawerOpen} showBrush={isHost} />

      {/* 상단 컨트롤 바 */}
      <div className="z-100 mx-auto my-4 flex w-[90%] max-w-[468px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2"
        >
          <ViewToggle isIconView={isIconView} onToggle={setIsIconView} />
          {isHost && (
            <FeatureButtons
              targetRef={captureRef}                 // 캡쳐 타깃 전달
              fileName="birthday-feast"
              backgroundColor="#FFF4DF"
              onCaptured={(url) => setShotUrl(url)}  // 미리보기 열기
            />
          )}
        </div>

        {isHost && (
          <div className="shrink-0">
            <EventBanner />
          </div>
        )}
      </div>

      <div ref={captureRef} className={isIconView ? "mt-auto pt-[95%]" : ""}>
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
        <h2 className='my-2 text-[#FF8B8B] text-xl font-bold'>방문자 퀴즈 랭킹</h2>
        <QuizRankList />
      </BottomSheet>

      {(isGuest && !drawerOpen) && (
        <footer className="fixed bottom-8 left-0 right-0 z-100 flex justify-center bg-transparent">
          <div className="w-full max-w-[520px] px-8 py-4 pt-15 pb-[env(safe-area-inset-bottom)]">
            <FooterButton
              label="사용자님에게 생일 메시지 남기기"
              onClick={() => navigate('/write')}
            />
          </div>
        </footer>
      )}

      <WelcomeModal
        open={welcomeOpen}
        isHost={isHost}
        onClose={() => {
          setWelcomeOpen(false);
          if (isGuest) setNicknameOpen(true);
        }}
      />
      <NicknameModal
        open={isGuest && nicknameOpen}
        defaultValue={localStorage.getItem('guest_nickname') || ''}
        onSubmit={handleNicknameSubmit}
        onClose={() => setNicknameOpen(false)}
      />

      {shotUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShotUrl(null)}
        >
          <div
            className="relative max-w-[520px] w-full rounded-2xl bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-lg font-semibold text-gray-800">캡쳐 미리보기</h3>

            <div className="max-h-[70vh] overflow-auto rounded-xl border">
              <img src={shotUrl} alt="캡쳐 이미지" className="w-full h-auto block" />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = shotUrl;
                  a.download = `birthday-feast-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
                  a.click();
                }}
                className="px-3 py-2 rounded-xl bg-[#FF8B8B] text-white"
              >
                다운로드
              </button>
              <button
                onClick={() => setShotUrl(null)}
                className="px-3 py-2 rounded-xl bg-gray-200 text-gray-800"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MainHome: React.FC = () => (
  <BirthdayModeProvider defaultMode="guest">
    <MainHomeBody />
  </BirthdayModeProvider>
);

export default MainHome;

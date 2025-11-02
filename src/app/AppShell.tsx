// src/routes/UserLayout.tsx
import { Outlet, useParams, useSearchParams } from 'react-router-dom';
import { getStoredUserId } from '@/stores/authStorage';
import { BirthdayModeProvider } from '@/app/ModeContext';
import FeastBootstrap from '@/features/feast/FeastBootstrap';
import OnboardingGate from '@/features/onboarding/OnboardingGate';
import { useMe } from '@/hooks/useMe';
import VisitorOnboardingGate from '@/features/visitorOnboarding/VisitorOnboardingGate';
import { useEffect, useState } from 'react';
import { isGuestReady } from '@/features/visitorOnboarding/guestReady';

export default function AppShell() {
  const { userId } = useParams();
  const [qs] = useSearchParams();
  const code = qs.get('code'); // 게스트 초대 코드 가져옴
  const isShareView = !!code; // code의 존재 여부에 따라 true/false 값 저장 (존재하면 true)

  const meId = getStoredUserId(); // 로컬 스토리지에 저장된 userId 정보 가져옴 
  const isMyPage = meId && String(meId) === String(userId); // 현재 페이지 소유자와 로컬스토리지의 userId가 같으면 내 페이지라고 판단 

  // 초기 모드 결정 (전역 컨텍스트인 BirthdayModeContext에 전달됨)
  const initialMode: 'host' | 'guest' = isShareView ? 'guest' : 'host';

  // ✅ 게스트 온보딩 완료 여부 (세션스토리지 판정)
  const [guestReady, setGuestReady] = useState(() => isGuestReady());
  useEffect(() => {
    if (!isShareView) return;
    const id = window.setInterval(() => {
      if (isGuestReady()) {
        setGuestReady(true);
        window.clearInterval(id);
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [isShareView]);

  // ✅ host가 자기 페이지 볼 때만 /api-user/me 호출 (초기 체인에서 제거)
  // const { me, loading, error } = useMe({ enabled: !isShareView && !!isMyPage });

  // (선택) idle에 프리페치: host인데 내 페이지가 아니면 화면 그린 뒤 백그라운드 호출
  useEffect(() => {
    if (!isShareView && !isMyPage && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback?.(() => {
        // 미리 캐시해두고 싶다면 여기서 queryClient.prefetchQuery 호출
        // queryClient.prefetchQuery({ queryKey: qk.auth.me, queryFn: getUserMe });
      });
    }
  }, [isShareView, isMyPage]);

  return (
    // 전역적으로 mode 값을 제공 (isHost | isGuest)
    <BirthdayModeProvider
      defaultMode={initialMode}
      key={`mode-${initialMode}-${code ?? userId ?? 'self'}`}
    >
      {/* host 전용 부트스트랩 */}
      {!isShareView && <FeastBootstrap enabled={true} />}
      {!isShareView && isMyPage && <OnboardingGate />}

      {/* guest 온보딩 게이트 */}
      {isShareView && !guestReady && (
        <VisitorOnboardingGate
          quizPlayPath={`/u/${userId}/play`}
          onCompleted={() => setGuestReady(true)} // 완료 즉시 진입 허용
        />
      )}
      {/* Outlet렌더 보호 */}
      {/* {(!isShareView || guestReady) && <Outlet />} */}
      <Outlet />
    </BirthdayModeProvider>
  );
}

// src/routes/UserLayout.tsx
// 모드 감지 후 모드에 따라 분기 (host -> onboarding gate | guest -> 게스트 플로우 따르기)
import { Outlet, useParams, useSearchParams } from 'react-router-dom';
import { getStoredUserId } from '@/stores/authStorage';
import { BirthdayModeProvider } from '@/app/ModeContext';
import FeastBootstrap from '@/features/feast/FeastBootstrap';
import OnboardingGate from '@/features/onboarding/OnboardingGate';
import { useMe } from '@/hooks/useMe';
import VisitorOnboardingGate from '@/features/visitorOnboarding/VisitorOnboardingGate';
import { useEffect, useState } from 'react';
import { isGuestReady } from '@/features/visitorOnboarding/guestReady';

/**
 * /u/:userId/.. 형태의 라우팅 구조
 * userId는 페이지 소유자(host)의 id, 
 * ?code=xxxx 쿼리가 있으면 게스트 공유 링크로 접근한 경우로 판단 
 */
export default function AppShell() {
  // 전역 캐시 관리 데이터 
  const { me, loading, error } = useMe();

  const { userId } = useParams();
  const [qs] = useSearchParams();
  const code = qs.get('code'); // 게스트 초대 코드 가져옴
  const isShareView = !!code; // code의 존재 여부에 따라 true/false 값 저장 (존재하면 true)

  const meId = getStoredUserId(); // 로컬 스토리지에 저장된 userId 정보 가져옴 
  const isMyPage = meId && String(meId) === String(userId); // 현재 페이지 소유자와 로컬스토리지의 userId가 같으면 내 페이지라고 판단 

  // 초기 모드 결정 (전역 컨텍스트인 BirthdayModeContext에 전달됨)
  const initialMode: 'host' | 'guest' = isShareView ? 'guest' : 'host';

  // ✅ 게스트 온보딩 완료 여부 (세션스토리지 판정 + 콜백으로 즉시 반영)
  const [guestReady, setGuestReady] = useState(() => isGuestReady());

  // 혹시 다른 탭/리다이렉트로 완료되었을 때 대비(가벼운 폴링 or 가시 이벤트)
  useEffect(() => {
    if (!isShareView) return;
    const id = window.setInterval(() => {
      const ok = isGuestReady();
      if (ok) {
        setGuestReady(true);
        window.clearInterval(id);
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [isShareView]);


  return (
    // 전역적으로 mode 값을 제공 (isHost | isGuest)
    <BirthdayModeProvider
      defaultMode={initialMode}
      key={`mode-${initialMode}-${code ?? userId ?? 'self'}`}
    >
      {!isShareView && <FeastBootstrap enabled={true} />}
      {!isShareView && isMyPage && <OnboardingGate />}

      {isShareView && !guestReady && (
        <VisitorOnboardingGate
          quizPlayPath={`/u/${userId}/play`}
          onCompleted={() => setGuestReady(true)} // 완료 즉시 진입 허용
        />
      )}
      {/* Outlet렌더 보호 */}
      {(!isShareView || guestReady) && <Outlet />}
    </BirthdayModeProvider>
  );
}

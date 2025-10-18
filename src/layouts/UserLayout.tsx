// src/routes/UserLayout.tsx
// 모드 감지 후 모드에 따라 분기 (host -> onboarding gate | guest -> 게스트 플로우 따르기)
import { Outlet, useParams, useSearchParams } from 'react-router-dom';
import { getStoredUserId } from '@/stores/authStorage';
import { BirthdayModeProvider } from '@/layouts/ModeContext';
import FeastBootstrap from '@/features/feast/FeastBootstrap';
import OnboardingGate from '@/features/onboarding/OnboardingGate';

/*
UserLayout
  ├─ BirthdayModeProvider       ← host/guest 모드 컨텍스트
  │   ├─ FeastBootstrap          ← 호스트용 생일상 데이터 생성
  │   ├─ OnboardingGate          ← 호스트 온보딩(생일 설정 등)
  │   └─ <Outlet />              ← 실제 페이지 (MainHome 등)
 */

/**
 * /u/:userId/.. 형태의 라우팅 구조
 * userId는 페이지 소유자(host)의 id, 
 * ?code=xxxx 쿼리가 있으면 게스트 공유 링크로 접근한 경우로 판단 
 */
export default function UserLayout() {
  const { userId } = useParams();
  const [qs] = useSearchParams();
  const code = qs.get('code'); // 게스트 초대 코드 가져옴
  const isShareView = !!code; // code의 존재 여부에 따라 true/false 값 저장 (존재하면 true)

  const meId = getStoredUserId(); // 로컬 스토리지에 저장된 userId 정보 가져옴 
  const isMyPage = meId && String(meId) === String(userId); // 현재 페이지 소유자와 로컬스토리지의 userId가 같으면 내 페이지라고 판단 

  // 초기 모드 결정 (전역 컨텍스트인 BirthdayModeContext에 전달됨)
  const initialMode: 'host' | 'guest' = isShareView ? 'guest' : 'host';

  return (
    // 전역적으로 mode 값을 제공 (isHost | isGuest)
    <BirthdayModeProvider
      defaultMode={initialMode}
      key={`mode-${initialMode}-${code ?? userId ?? 'self'}`}
    >
      {!isShareView && <FeastBootstrap enabled={true} />}
      {!isShareView && isMyPage && <OnboardingGate />}

      <Outlet />
    </BirthdayModeProvider>
  );
}

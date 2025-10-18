// src/routes/UserLayout.tsx
// 모드 감지 후 모드에 따라 분기 (host -> onboarding gate | guest -> 게스트 플로우 따르기)
import { Outlet, useParams, useSearchParams } from 'react-router-dom';
import { getStoredUserId } from '@/stores/authStorage';
import { BirthdayModeProvider } from '@/features/home/ModeContext';
import FeastBootstrap from '@/features/feast/FeastBootstrap';
import OnboardingGate from '@/features/onboarding/OnboardingGate';

export default function UserLayout() {
  const { userId } = useParams();
  const [qs] = useSearchParams();
  const code = qs.get('code');
  const isShareView = !!code;

  const meId = getStoredUserId();
  const isMyPage = meId && String(meId) === String(userId);
  const initialMode: 'host' | 'guest' = isShareView ? 'guest' : 'host';

  return (
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

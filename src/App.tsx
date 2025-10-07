// App.tsx
import { useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import MainHome from './pages/MainHome';
import TeamAboutPage from './pages/subpages/TeamAboutPage';
import ContactPage from './pages/subpages/ContactPage';
import QuizPage from './pages/QuizPage';
import MyFeastQRPage from './pages/subpages/MyFeastQRPage';
import HistoryPage from './pages/subpages/HistoryPage';
import VisibilityPage from './pages/subpages/VisibilityPage';
import AccountSettingsPage from './pages/subpages/AccountSettingsPage';
import MessagePage from './pages/MessagePage';
import Loading from './pages/LoadingPage';
import Login from './pages/LoginPage';

// 더미데이터 훅(React Query 미사용 버전)
import { useBirthdayCards } from '@/features/message/useBirthdayCards';
import WriteMessagePage from './pages/subpages/WriteMessagePage';
import PlayQuizPage from './pages/subpages/PlayQuizPage';
import ThemeSettingsPage from './pages/subpages/ThemeSettingsPage';
import OnboardingGate from './features/onboarding/OnboardingGate';
import CreateQuizPage from './pages/CreateQuizPage';
import FeastSharePage from './pages/FeastSharePage';
import AuthKakaoCallback from './pages/AuthKakaoCallback';

// 라우트용 래퍼: 쿼리 파싱 + 더미 데이터 매핑
function BirthdayMessageRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const qs = new URLSearchParams(location.search);

  const indexFromQuery = Number(qs.get('i') ?? 0);
  const initialIndexRaw = Number.isFinite(indexFromQuery) ? indexFromQuery : 0;

  // 1) 더미 데이터 로딩
  const { data: cards = [], isLoading, error } = useBirthdayCards();

  // 2) BirthdayMessagePage가 기대하는 형태로 매핑
  //    id: 카드ID, title: nickname, body: message, imgSrc: imageUrl
  const messages = useMemo(
    () =>
      cards.map((c) => ({
        id: c.birthdayCardId,
        title: c.nickname,
        body: c.message,
        imgSrc: c.imageUrl,
      })),
    [cards]
  );

  // 데이터 길이에 맞춰 안전하게 보정
  const safeInitialIndex = Math.max(0, Math.min(initialIndexRaw, Math.max(messages.length - 1, 0)));

  if (isLoading) return <Loading />;
  if (error) {
    return (
      <div className="p-6 text-red-600">
        메시지를 불러오지 못했어요.
        <button className="ml-3 underline" onClick={() => navigate(-1)}>뒤로</button>
      </div>
    );
  }

  return (
    <MessagePage
      messages={messages}
      initialIndex={safeInitialIndex}
      onBack={() => navigate(-1)}
      onHome={() => navigate('/main')}
    />
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/auth/kakao/callback" element={<AuthKakaoCallback />} />

        <Route path="/main" element={<MainHome />} />
        {/* 공유 링크용: hostId가 들어오면 MainHome이 게스트 보기로 동작 */}
        <Route path="/feast/:hostId" element={<MainHome />} />

        <Route path="/theme" element={<ThemeSettingsPage />} />
        <Route path="/about-team" element={<TeamAboutPage />} />

        <Route path="/contact" element={<ContactPage />} />

        <Route path="/create-quiz" element={<CreateQuizPage />} />

        {/* 편집/작성용 퀴즈 페이지 (온보딩에서 이동) */}
        <Route path="/quiz" element={<QuizPage />} />
        {/* 호환 라우트: 캔버스 코드가 /quiz로 이동하지만, 혹시 모를 링크 대비 */}
        <Route path="/quiz/edit" element={<QuizPage />} />

        <Route path="/my-feast-qr" element={<MyFeastQRPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/visibility" element={<VisibilityPage />} />
        <Route path="/account" element={<AccountSettingsPage />} />

        {/* 생일 메시지 라우트 */}
        <Route path="/message" element={<BirthdayMessageRoute />} />

        <Route path="/write" element={<WriteMessagePage />} />
        <Route path="/play" element={<PlayQuizPage />} />

        {/* 그 외 경로는 홈으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

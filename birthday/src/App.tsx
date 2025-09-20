// App.tsx
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import MainHome from './pages/MainHome';
import ThemePage from './pages/subpages/ThemePage';
import TeamAboutPage from './pages/subpages/ProjectTeamPage';
import ContactPage from './pages/subpages/ContactDevPage';
import QuizPage from './pages/subpages/QuizPage';
import MyFeastQRPage from './pages/subpages/MyFeastQRPage';
import HistoryPage from './pages/subpages/HistoryPage';
import VisibilityPage from './pages/subpages/VisibilityPage';
import AccountSettingsPage from './pages/subpages/AccountSettingsPage';
import BirthdayMessagePage from './pages/subpages/BirthdayMessagePage';
import Loading from './pages/LoadingPage';
import Login from './pages/LoginPage';

// 라우트용 래퍼: 쿼리 파싱 + 데모 데이터 주입
function BirthdayMessageRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const initialIndex = Math.max(0, Number(qs.get('i') ?? 0));

  // TODO: 실제 데이터로 교체하세요
  const messages = [
    {
      id: 1,
      title: '거북목님',
      body:
        '대통령이 궐위된 때 또는 대통령 당선자가 사망하거나 판결 기타의 사유로 그 자격을 상실할 때에는 60일 이내에 후임자를 선거한다...',
      // imgSrc: '/assets/dessert-1.png',
    },
    {
      id: 2,
      title: '행복한 하루',
      body:
        '제1항의 해임건의는 국회의원 3분의 1 이상의 발의에 의하여 국회의원 과반수의 찬성이 있어야 한다...',
      // imgSrc: '/assets/dessert-2.png',
    },
  ];

  return (
    <BirthdayMessagePage
      messages={messages}
      initialIndex={initialIndex}
      onBack={() => navigate(-1)}
      onHome={() => navigate('/')}
    />
  );
}

export default function App() {
  return (
    <Routes>
      {/* <Route path="/loading" element={<Loading />} /> */}
      {/* <Route path="/login" element={<Login />} /> */}

      <Route path="/" element={<MainHome />} />
      <Route path="/theme" element={<ThemePage />} />
      <Route path="/about-team" element={<TeamAboutPage />} />

      <Route path="/contact" element={<ContactPage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/my-feast-qr" element={<MyFeastQRPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/visibility" element={<VisibilityPage />} />
      <Route path="/account" element={<AccountSettingsPage />} />

      {/* 생일 메시지 라우트 */}
      <Route path="/message" element={<BirthdayMessageRoute />} />

      {/* 그 외 경로는 홈으로 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

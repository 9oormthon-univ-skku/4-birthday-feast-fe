import { Routes, Route, Navigate } from 'react-router-dom';
import MainHome from './pages/MainHome';
import ThemePage from './pages/subpages/ThemePage';
import TeamAboutPage from './pages/subpages/ProjectTeamPage';
import ContactPage from './pages/subpages/ContactDevPage';
import QuizPage from './pages/subpages/QuizPage';
import MyFeastQRPage from './pages/subpages/MyFeastQRPage';
import HistoryPage from './pages/subpages/HistoryPage';
import VisibilityPage from './pages/subpages/VisibilityPage';
import AccountSettingsPage from './pages/subpages/AccountSettingsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainHome />} />
      <Route path="/theme" element={<ThemePage />} />
      <Route path="/about-team" element={<TeamAboutPage />} />

      <Route path="/contact" element={<ContactPage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/my-feast-qr" element={<MyFeastQRPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/visibility" element={<VisibilityPage />} />
      <Route path="/account" element={<AccountSettingsPage />} />

            {/* 그 외 경로는 홈으로 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

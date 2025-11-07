// src/App.tsx
import { createBrowserRouter, RouterProvider, redirect } from 'react-router-dom';
import Login from './pages/LoginPage';
import AuthKakaoCallback from './routes/AuthKakaoCallback';
import MainHome from './pages/MainHome/MainHome';
import TeamAboutPage from './pages/MenuPages/TeamAboutPage';
import ContactPage from './pages/MenuPages/ContactPage';
import QuizPage from './pages/MenuPages/QuizPage';
import CreateQuizPage from './pages/MenuPages/CreateQuizPage';
import MyFeastQRPage from './pages/MenuPages/MyFeastQRPage';
import HistoryPage from './pages/MenuPages/HistoryPage';
import VisibilityPage from './pages/MenuPages/VisibilityPage';
import AccountSettingsPage from './pages/MenuPages/AccountSettingsPage';
import WriteMessagePage from './pages/MainHome/WriteMessagePage';
import PlayQuizPage from './pages/MainHome/PlayQuizPage';
import ThemeSettingsPage from './pages/MenuPages/ThemeSettingsPage';
import BirthdayMessageRoute from './routes/BirthdayMessageRoute';
import AppShell from './app/AppShell';
import { getStoredUserId } from '@/stores/userStorage';
import { mainHomeLoader } from './routes/loaders/mainHomeLoader';
import { queryClient } from './apis/queryClient';

// /u, /main 진입 시 내 홈으로 돌리기
async function redirectToMyHome() {
  const id = getStoredUserId();
  return redirect(id ? `/u/${id}/main` : '/login');
}

// /u/:userId 보호 (게스트 공유 뷰는 허용)
async function guardUserLayoutLoader({ request, params }: { request: Request; params: any }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (code) return null;

  const selfId = getStoredUserId();
  if (!selfId) return redirect('/login');
  if (String(params.userId) !== String(selfId)) {
    return redirect(`/u/${selfId}/main`);
  }
  return null;
}

const router = createBrowserRouter([
  { path: '/', loader: () => redirect('/u') },

  // 인증
  { path: '/login', element: <Login /> },
  { path: '/auth/kakao/callback', element: <AuthKakaoCallback /> },

  // 새 사용자 레이아웃
  { path: '/u', loader: redirectToMyHome },
  {
    path: '/u/:userId',
    loader: guardUserLayoutLoader,
    element: <AppShell />, // 모든 하위 페이지 경로를 감싸 host | guest 관리
    children: [
      { index: true, loader: () => redirect('main') },
      { path: 'main', element: <MainHome />, loader: () => mainHomeLoader(queryClient), },
      { path: 'history', element: <HistoryPage /> },
      { path: 'visibility', element: <VisibilityPage /> },
      { path: 'account', element: <AccountSettingsPage /> },
      { path: 'my-feast-qr', element: <MyFeastQRPage /> },
      { path: 'theme', element: <ThemeSettingsPage /> },
      { path: 'quiz', element: <QuizPage /> },
      { path: 'quiz/edit', element: <QuizPage /> },
      { path: 'create-quiz', element: <CreateQuizPage /> },
      { path: 'write', element: <WriteMessagePage /> },
      { path: 'play', element: <PlayQuizPage /> },
      { path: 'message', element: <BirthdayMessageRoute /> },
    ],
  },

  { path: '/about-team', element: <TeamAboutPage /> },
  { path: '/contact', element: <ContactPage /> },

  { path: '*', loader: () => redirect('/') },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
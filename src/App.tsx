// App.tsx
import {
  createBrowserRouter,
  RouterProvider,
  redirect,
} from 'react-router-dom';

import MainHome from './pages/MainHome';
import TeamAboutPage from './pages/subpages/TeamAboutPage';
import ContactPage from './pages/subpages/ContactPage';
import QuizPage from './pages/subpages/QuizPage';
import MyFeastQRPage from './pages/subpages/MyFeastQRPage';
import HistoryPage from './pages/subpages/HistoryPage';
import VisibilityPage from './pages/subpages/VisibilityPage';
import AccountSettingsPage from './pages/subpages/AccountSettingsPage';
import WriteMessagePage from './pages/subpages/WriteMessagePage';
import PlayQuizPage from './pages/PlayQuizPage';
import ThemeSettingsPage from './pages/subpages/ThemeSettingsPage';
import CreateQuizPage from './pages/CreateQuizPage';
import AuthKakaoCallback from './pages/AuthKakaoCallback';
import Login from './pages/LoginPage';
import BirthdayMessageRoute from './routes/BirthdayMessageRoute';

const router = createBrowserRouter([
  { path: '/', loader: () => redirect('/main') },

  { path: '/login', element: <Login /> },
  { path: '/auth/kakao/callback', element: <AuthKakaoCallback /> },

  { path: '/main', element: <MainHome /> },
  { path: '/theme', element: <ThemeSettingsPage /> },
  { path: '/about-team', element: <TeamAboutPage /> },
  { path: '/contact', element: <ContactPage /> },

  { path: '/create-quiz', element: <CreateQuizPage /> },
  { path: '/quiz', element: <QuizPage /> },
  { path: '/quiz/edit', element: <QuizPage /> },

  { path: '/my-feast-qr', element: <MyFeastQRPage /> },
  { path: '/history', element: <HistoryPage /> },
  { path: '/visibility', element: <VisibilityPage /> },
  { path: '/account', element: <AccountSettingsPage /> },

  { path: '/message', element: <BirthdayMessageRoute /> },

  { path: '/write', element: <WriteMessagePage /> },
  { path: '/play', element: <PlayQuizPage /> },

  { path: '*', loader: () => redirect('/') },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

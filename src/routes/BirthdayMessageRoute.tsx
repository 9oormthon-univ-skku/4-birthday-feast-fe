// src/routes/BirthdayMessageRoute.tsx
import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MessagePage from '@/pages/MessagePage';
// import Loading from '@/pages/LoadingPage';
import { useBirthdayCards } from '@/features/message/useBirthdayCards';
import { getStoredUserId } from '@/features/auth/authStorage'; // ⬅️ 추가

export default function BirthdayMessageRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const qs = new URLSearchParams(location.search);

  const indexFromQuery = Number(qs.get('i') ?? 0);
  const initialIndexRaw = Number.isFinite(indexFromQuery) ? indexFromQuery : 0;

  // 더미 데이터 로딩
  const { data: cards = [], isLoading, error } = useBirthdayCards();

  // BirthdayMessagePage에서 기대하는 형태로 매핑
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

  const safeInitialIndex = Math.max(0, Math.min(initialIndexRaw, Math.max(messages.length - 1, 0)));

  // if (isLoading) return <Loading />;

  if (error) {
    return (
      <div className="p-6 text-red-600">
        메시지를 불러오지 못했어요.
        <button className="ml-3 underline" onClick={() => navigate(-1)}>
          뒤로
        </button>
      </div>
    );
  }

  const handleHome = () => {
    const userId = getStoredUserId();
    if (userId) {
      // 게스트 컨텍스트 유지(예: ?code=...)
      navigate({ pathname: `/u/${userId}/main`, search: location.search });
    } else {
      // 라우터가 /u → 내 홈 또는 로그인으로 리다이렉트
      navigate('/u');
    }
  };

  return (
    <MessagePage
      messages={messages}
      initialIndex={safeInitialIndex}
      onBack={() => navigate(-1)}
      onHome={handleHome}
    />
  );
}

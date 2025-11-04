// src/routes/BirthdayMessageRoute.tsx
// 메시지 상세 보기 페이지 index 이동을 관리
import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStoredUserId } from '@/stores/authStorage';
import { useBirthdayCards } from '@/hooks/useBirthdayCards';
import MessagePage from '@/pages/MainHome/MessagePage';

export default function BirthdayMessageRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const qs = new URLSearchParams(location.search);

  const indexFromQuery = Number(qs.get('i') ?? 0);
  const initialIndexRaw = Number.isFinite(indexFromQuery) ? indexFromQuery : 0;

  // 서버/로컬에서 카드 로딩
  const { data: cards = [], isLoading, error } = useBirthdayCards();

  // 인덱스 보정
  const safeInitialIndex = Math.max(
    0,
    Math.min(initialIndexRaw, Math.max(cards.length - 1, 0))
  );

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
      cards={cards}
      initialIndex={safeInitialIndex}
      onBack={() => navigate(-1)}
    // onHome={handleHome}
    />
  );
}

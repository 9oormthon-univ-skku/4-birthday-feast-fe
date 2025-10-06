// src/pages/FeastSharePage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loading from './LoadingPage';

type FeastData = {
  userId: string;
  nickname: string;
  coverImg?: string;
  items: Array<{ id: string; imgSrc: string; alt?: string }>;
};

// TODO: 실제 API로 교체
async function fetchFeastByUserId(userId: string): Promise<FeastData | null> {
  // const res = await fetch(`/api/feasts/${encodeURIComponent(userId)}`);
  // if (!res.ok) return null;
  // return (await res.json()) as FeastData;

  await new Promise((r) => setTimeout(r, 200));
  if (!userId) return null;
  return {
    userId,
    nickname: '생일주인공',
    items: [
      { id: 'c1', imgSrc: '/assets/images/food-1.svg', alt: '디저트1' },
      { id: 'c2', imgSrc: '/assets/images/food-2.svg', alt: '디저트2' },
      { id: 'c3', imgSrc: '/assets/images/food-3.svg', alt: '디저트3' },
    ],
  };
}

export default function FeastSharePage() {
  const { userId = '' } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<FeastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isValidId = useMemo(() => /^[a-zA-Z0-9_\-:.]+$/.test(userId), [userId]);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!isValidId) {
        setErrorMsg('올바르지 않은 링크예요.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetchFeastByUserId(userId);
        if (!alive) return;
        if (!res) setErrorMsg('해당 사용자의 생일상을 찾을 수 없어요.');
        else setData(res);
      } catch {
        setErrorMsg('일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [isValidId, userId]);

  if (loading) return <Loading />;

  if (errorMsg) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{errorMsg}</p>
        <button className="mt-4 px-4 py-2 rounded-xl border" onClick={() => navigate('/main')}>
          홈으로
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <header className="px-4 py-3 sticky top-0 bg-white/70 backdrop-blur border-b">
        <h1 className="text-lg font-semibold">🎉 {data?.nickname}님의 생일상</h1>
      </header>

      <main className="px-4 py-6">
        <section className="grid grid-cols-3 gap-3">
          {data?.items.map((it) => (
            <div key={it.id} className="rounded-2xl border p-3 text-center">
              <img className="mx-auto h-20" src={it.imgSrc} alt={it.alt ?? ''} />
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

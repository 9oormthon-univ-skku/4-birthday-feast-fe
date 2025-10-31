import { useEffect, useState } from 'react';
import AppLayout from '@/ui/AppLayout';
import QuizRankList from '@/features/quiz/QuizRankList';
import QuizPlay from '@/features/quiz/QuizPlay';
import QuizAnswerList from '@/features/quiz/QuizAnswerList';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBirthdayMode } from '@/app/ModeContext';
import { QuizQuestion } from '@/apis/quiz';
import { useQuizById } from '@/hooks/useQuizById';
import { useGuestQuizById } from '@/hooks/useGuestQuizById';
import { SS_GUEST_NN } from '@/apis/guest';

export default function PlayQuizPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isHost, isGuest } = useBirthdayMode();

  // 호스트 전용: 서버 퀴즈 훅
  const { data: hostQuiz, isLoading: hostLoading, isError: hostError } = useQuizById();

  // 게스트 전용: URL 기반 퀴즈 훅
  const {
    questions: guestQuestions,
    isLoading: guestLoading,
    isError: guestIsError,
  } = useGuestQuizById();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(boolean | null)[]>([]);
  const [finished, setFinished] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  // 표시용 닉네임 (게스트)
  const [nickName, setNickName] = useState<string>('익명');

  // 닉네임 로컬스토리지 연동
  useEffect(() => {
    const readNick = () => {
      const nn = sessionStorage.getItem(SS_GUEST_NN)?.trim();
      setNickName(nn && nn.length > 0 ? nn : '익명');
    };
    readNick();

    const onStorage = (e: StorageEvent) => {
      if (e.key === SS_GUEST_NN) {
        const nn = (e.newValue ?? '').trim();
        setNickName(nn && nn.length > 0 ? nn : '익명');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // 역할에 따라 질문 세팅
  useEffect(() => {
    if (isHost && hostQuiz?.questions) {
      const qs = hostQuiz.questions;
      setQuestions(qs);
      setUserAnswers(Array(qs.length).fill(null));
      setIndex(0);
      setFinished(false);
      setShowAnswers(false);
      return;
    }
    if (isGuest) {
      const qs = guestQuestions || [];
      setQuestions(qs);
      setUserAnswers(Array(qs.length).fill(null));
      setIndex(0);
      setFinished(false);
      setShowAnswers(false);
      return;
    }
  }, [isHost, hostQuiz, isGuest, guestQuestions]);

  const total = questions.length;
  const current = questions[index];

  const handleChoose = (ans: boolean) => {
    setUserAnswers((prev) => {
      const next = [...prev];
      next[index] = ans;
      return next;
    });
    if (index < total - 1) setIndex((i) => i + 1);
    else setFinished(true);
  };

  const correctCount =
    total === 0
      ? 0
      : userAnswers.reduce((acc, v, i) => acc + (v === questions[i]?.answer ? 1 : 0), 0);

  const progressPct = total === 0 ? 0 : Math.min((index / Math.max(total, 1)) * 100, 100);

  const resetToMain = () => {
    setIndex(0);
    setUserAnswers(Array(total).fill(null));
    setFinished(false);
    setShowAnswers(false);
    navigate({ pathname: '../main', search: location.search });
  };

  const goAnswers = () => setShowAnswers(true);

  const footerAction = resetToMain;
  const headerTitle = showAnswers ? (
    <>
      <span className="text-[#FF8B8B]">{nickName}</span>
      <span className="text-[#A0A0A0]">님의 오답</span>
    </>
  ) : (
    <span className="text-[#FF8B8B]">생일 퀴즈</span>
  );

  // 로딩/에러 안내 ui
  const loading = (isHost && hostLoading) || (isGuest && guestLoading);
  const isError = (isHost && hostError) || (isGuest && guestIsError);

  if (loading && total === 0) {
    return (
      <AppLayout showBack showMenu={false} showBrush={false} title={headerTitle}
        footerButtonLabel={'처음으로'} onFooterButtonClick={footerAction}>
        <section className="py-20 text-center text-[#A0A0A0]">퀴즈를 불러오는 중…</section>
      </AppLayout>
    );
  }

  if (isError && total === 0) {
    return (
      <AppLayout showBack showMenu={false} showBrush={false} title={headerTitle}
        footerButtonLabel={'처음으로'} onFooterButtonClick={footerAction}>
        <section className="py-20 text-center">
          <h3 className="text-xl text-[#FF8B8B] font-['KoreanSWGIG3']">퀴즈를 불러오지 못했어요</h3>
          <p className="mt-2 text-sm text-[#A0A0A0]">잠시 후 다시 시도해주세요.</p>
        </section>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      showBack
      showMenu={false}
      showBrush={false}
      title={headerTitle}
      footerButtonLabel={'처음으로'}
      onFooterButtonClick={footerAction}
      onBack={showAnswers ? () => setShowAnswers(false) : undefined}
    >
      {total === 0 ? (
        <section className="py-20 text-center">
          <h3 className="text-xl text-[#FF8B8B] font-['KoreanSWGIG3']">등록된 퀴즈가 없어요</h3>
          {isHost ? (
            <button
              type="button"
              onClick={() => navigate('../create-quiz')}
              className="mt-3 text-sm text-[#A0A0A0] underline underline-offset-2 hover:opacity-90 active:scale-95 transition"
              aria-label="생일 퀴즈 등록하러 가기"
            >
              여기를 눌러 생일 퀴즈를 등록해주세요.
            </button>
          ) : (
            <p className="mt-2 text-sm text-[#A0A0A0]">
              생일자가 퀴즈를 등록하면 여기에서 풀 수 있어요.
            </p>
          )}
        </section>
      ) : !finished ? (
        <section className="pt-2">
          <div className="mt-28 mx-auto mb-8 w-64">
            <div className="mb-1 text-sm font-normal font-['KoreanSWGIG3']">
              <span className="text-[#FF8B8B] ">{index + 1}</span>
              <span className="text-[#D9D9D9]">/{total}</span>
            </div>
            <div className="h-[5px] w-full overflow-hidden rounded bg-[#D9D9D9]">
              <div className="h-full bg-[#FF8B8B]" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <QuizPlay
            content={current?.content}
            onChoose={handleChoose}
            disabled={finished || !current}
          />
        </section>
      ) : (
        <>
          {!showAnswers && (
            <div className="w-full px-8 pt-9 pb-4">
              <h2 className="text-4xl font-normal font-['KoreanSWGIG3'] text-[#FF8B8B]">결과는?</h2>
              <p className="mt-1 mb-4 text-2xl font-normal font-['KoreanSWGIG3'] text-[#A0A0A0]">
                {total}문제 중 <span className="text-[#FF8B8B]">{correctCount}</span>문제 맞췄어요!
              </p>
            </div>
          )}

          {showAnswers ? (
            <QuizAnswerList
              questions={questions}
              userAnswers={userAnswers}
              heightClassName="max-h-[70vh]"
            />
          ) : (
            <QuizRankList
              className=" px-8 py-4"
              heightClassName="max-h-[70vh]"
              onShowAnswers={goAnswers}
              nickName={nickName}
            />
          )}
        </>
      )}
    </AppLayout>
  );
}

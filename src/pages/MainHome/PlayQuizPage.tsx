import { useEffect, useState } from 'react';
import AppLayout from '@/ui/AppLayout';
import QuizRankList from '@/features/quiz/QuizRankList';
import QuizPlay from '@/features/quiz/QuizPlay';
import QuizAnswerList from '@/features/quiz/QuizAnswerList';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBirthdayMode } from '@/app/ModeContext';
import { QuizQuestion } from '@/apis/quiz';
import { useQuizById } from '@/hooks/useQuizById';

export default function PlayQuizPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isHost } = useBirthdayMode();

  // 서버 퀴즈 조회 훅 (데이터 반영은 isHost일 때만)
  const { data: quizData } = useQuizById();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(boolean | null)[]>([]);
  const [finished, setFinished] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  // isHost인 경우에만 서버 데이터로 세팅
  useEffect(() => {
    if (!isHost) return;
    if (!quizData?.questions) return;

    const qs = quizData.questions || [];
    setQuestions(qs);
    setUserAnswers(Array(qs.length).fill(null));
    setIndex(0);
    setFinished(false);
    setShowAnswers(false);
  }, [isHost, quizData]);

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
      <span className="text-[#FF8B8B]">김땡땡</span>
      <span className="text-[#A0A0A0]">님의 오답</span>
    </>
  ) : (
    <span className="text-[#FF8B8B]">생일 퀴즈</span>
  );

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
          {!showAnswers && <div className='w-full px-8 pt-9 pb-4'>
            <h2 className="text-4xl font-normal font-['KoreanSWGIG3'] text-[#FF8B8B]">결과는?</h2>
            <p className="mt-1 mb-4 text-2xl font-normal font-['KoreanSWGIG3'] text-[#A0A0A0]">
              {total}문제 중 <span className="text-[#FF8B8B]">{correctCount}</span>문제 맞췄어요!
            </p>
          </div>}

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
              onShowAnswers={goAnswers} // 랭킹에서 “오답보기” 누르면 전환
            />
          )}
        </>
      )}
    </AppLayout>
  );
}

// src/pages/PlayQuizPage.tsx (예시 경로)
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '@/ui/AppLayout';
import QuizRankList from '@/features/quiz/QuizRankList';
import QuizPlay from '@/features/quiz/QuizPlay';
import QuizAnswerList from '@/features/quiz/QuizAnswerList';
import { useBirthdayMode } from '@/app/ModeContext';
import { QuizQuestion } from '@/apis/quiz';
import { submitGuestQuiz, type GuestQuizSubmitReq, type GuestQuizSubmitRes } from '@/apis/guest';
import { SS_GUEST_NN } from '@/apis/apiUtils'; // 기존 경로 유지
import { useQuizByIdUnified } from '@/hooks/useQuizByIdUnified';

export default function PlayQuizPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isHost, isGuest } = useBirthdayMode();

  // 통합 훅: 게스트/호스트 자동 분기 + quizId/질문/상태 제공
  const { data, isLoading, isError, quizId } = useQuizByIdUnified();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(boolean | null)[]>([]);
  const [finished, setFinished] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  const [serverScore, setServerScore] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [rankEnabled, setRankEnabled] = useState(false);
  const [rankRefreshToken, setRankRefreshToken] = useState<number>(0);
  // 질문 세팅/리셋 시 랭킹 ON/OFF (호스트면 ON, 아니면 OFF)
  useEffect(() => {
    // questions 참조가 바뀔 때만 트리거
    const qs = data?.questions;
    if (!qs) return;
    setRankEnabled(isHost);
  }, [isHost, data?.questions]);
  // finished 이후 중복 전송 방지
  const hasSubmittedRef = useRef(false);

  // 표시용 닉네임 (게스트)
  const [nickName, setNickName] = useState<string>('익명');

  // 닉네임 세션스토리지 연동
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

  // 통합 데이터 기반으로 질문 세팅/리셋
  useEffect(() => {
    const qs = data?.questions ?? [];
    setQuestions(qs);
    setUserAnswers(Array(qs.length).fill(null));
    setIndex(0);
    setFinished(false);
    setShowAnswers(false);
    setServerScore(null);
    setSubmitError(null);
    hasSubmittedRef.current = false;
  }, [data]);

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

  // 게스트일 때만 제출 로직 동작
  useEffect(() => {
    if (!isGuest) return;
    if (!finished) return;
    if (!quizId) return;
    if (hasSubmittedRef.current) return;
    if (questions.length === 0) return;

    // null 답안이 있으면(미응답) 전송하지 않음
    const hasNull = userAnswers.some((v) => v === null);
    if (hasNull) return;

    hasSubmittedRef.current = true; // 가드
    setSubmitting(true);
    setSubmitError(null);
    setRankEnabled(false);            // 제출 중엔 랭킹 OFF

    (async () => {
      try {
        const payload: GuestQuizSubmitReq[] = questions.map((q, i) => ({
          questionId: q.questionId,
          answer: Boolean(userAnswers[i]),
        }));

        const res: GuestQuizSubmitRes = await submitGuestQuiz(quizId, payload);

        if (typeof (res as any)?.score === 'number') {
          setServerScore((res as any).score);
          // ✅ 제출 성공: 랭킹 ON + 강제 refetch 트리거
          setRankEnabled(true);
          setRankRefreshToken(Date.now());
        }
      } catch (e: any) {
        setSubmitError(`퀴즈 제출 중 오류가 발생했어요.🥲\n잠시 후 다시 시도해주세요.\n${e}`);
        // 재시도 허용
        hasSubmittedRef.current = false;
      } finally {
        setSubmitting(false);
      }
    })();
  }, [finished, isGuest, quizId, questions, userAnswers]);

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

  // 로딩/에러 안내 ui (통합)
  if (isLoading && total === 0) {
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
              <p className="my-1 text-2xl font-normal font-['KoreanSWGIG3'] text-[#A0A0A0]">
                {total}문제 중 <span className="text-[#FF8B8B]">{correctCount}</span>문제 맞췄어요!
              </p>
              {submitting && (
                <p className="text-sm text-[#A0A0A0]">점수/랭킹 반영 중…</p>
              )}
              {submitError && (
                <p className="text-sm text-[#FF8B8B]">{submitError}</p>
              )}
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
              enabled={rankEnabled}
              refreshToken={rankRefreshToken}
            />
          )}
        </>
      )}
    </AppLayout>
  );
}

// src/pages/QuizPage.tsx
import { useEffect, useState } from 'react';
import Header from '@/ui/Header';
import Modal from '@/ui/Modal';
import { deleteQuizQuestion, QuizQuestion } from '@/apis/quiz';
import OIcon from '@/assets/images/OIcon.svg';
import XIcon from '@/assets/images/XIcon.svg';
import { useQuizById } from '@/hooks/useQuizById';

// 시퀀스 정렬/보정 (편집/삭제 후 순번 정돈용)
function normalize(questions: QuizQuestion[]): QuizQuestion[] {
  return questions
    .map((q, i) => ({ ...q, sequence: i + 1 }))
    .sort((a, b) => a.sequence - b.sequence);
}

export default function QuizPage() {
  // 서버만 사용 (훅 내부에서 lastQuizId를 읽고 서버 조회, 폴백 없음)
  const { data: packed, isLoading, isError } = useQuizById();

  // 삭제 확인 모달 상태
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);

  // 페이지 로컬 상태 (렌더용)
  const [meta, setMeta] = useState<{ quizId: number | string | null; birthdayId?: number | string }>({
    quizId: null,
    birthdayId: undefined,
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<boolean[]>([]);

  // 훅 데이터가 준비되면 내부 상태에 반영
  useEffect(() => {
    if (!packed) return;
    setMeta({ quizId: packed.quizId, birthdayId: (packed as any).birthdayId });
    setQuestions(packed.questions);
    setAnswers(packed.questions.map((it) => it.answer));
  }, [packed]);

  // 삭제 버튼 클릭 시 모달 오픈
  const askRemoveQuestion = (index: number) => {
    setPendingIndex(index);
    setConfirmOpen(true);
  };
  const confirmRemove = () => {
    if (pendingIndex !== null) removeQuestion(pendingIndex);
    setConfirmOpen(false);
    setPendingIndex(null);
  };
  const closeConfirm = () => {
    setConfirmOpen(false);
    setPendingIndex(null);
  };

  const toggleAnswer = (index: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], answer: !next[index].answer };
      return next;
    });
  };

  // 서버 삭제 + 로컬 상태 반영 (로컬 스토리지 사용 X)
  const removeQuestion = async (index: number) => {
    const target = questions[index];
    if (!target) return;

    try {
      if (typeof target.questionId === 'number' || /^[0-9]+$/.test(String(target.questionId))) {
        await deleteQuizQuestion(target.questionId);
        console.log(`[QuizPage] Deleted questionId=${target.questionId} from server`);
      } else {
        console.log(`[QuizPage] Skipped server delete for non-numeric questionId=${target.questionId}`);
      }
    } catch (err) {
      console.error('❌ 서버 문항 삭제 실패', err);
      alert(`문항 삭제 중 오류가 발생했어요.\n${err}`);
      return;
    }

    setQuestions((prev) => normalize(prev.filter((_, i) => i !== index)));
    setAnswers((prev) => prev.filter((_, i) => i !== index));
  };

  const changeContent = (index: number, value: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], content: value };
      return next;
    });
  };

  // 편집 완료 (로컬 저장 제거, 서버 저장 플로우는 별도)
  const handleToggleEditMode = () => {
    if (editMode) {
      // 여기서 서버 저장을 붙일 예정이면 API 호출 위치
      setQuestions((prev) => normalize(prev));
      setEditMode(false);
      return;
    }
  };

  const askStartEdit = () => setEditConfirmOpen(true);
  const confirmStartEdit = () => {
    setEditConfirmOpen(false);
    setEditMode(true);
  };
  const cancelStartEdit = () => setEditConfirmOpen(false);

  // ----- 렌더 -----
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header showBack showMenu={false} showBrush={false} title={<span className="text-[#FF8B8B]">생일 퀴즈</span>} />
        <main className="px-4 pb-6">
          <div className="mb-4 h-[1px] bg-[#EFD9C6]" />
          <div className="py-12 text-center text-[#6b6b6b]">불러오는 중…</div>
        </main>
      </div>
    );
  }

  if (isError || !packed) {
    return (
      <div className="min-h-screen bg-white">
        <Header showBack showMenu={false} showBrush={false} title={<span className="text-[#FF8B8B]">생일 퀴즈</span>} />
        <main className="px-4 pb-6">
          <div className="mb-4 h-[1px] bg-[#EFD9C6]" />
          <div className="py-12 text-center text-red-500">퀴즈를 불러오지 못했어요.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        showBack
        showMenu={false}
        showBrush={false}
        title={<span className="text-[#FF8B8B]">생일 퀴즈</span>}
        rightExtra={
          <button
            aria-label={editMode ? '편집 완료' : '퀴즈 편집'}
            onClick={editMode ? handleToggleEditMode : askStartEdit}
            className="rounded-full p-2 transition hover:bg-black/5 active:scale-95"
          >
            {editMode ? editCompl : editStart}
          </button>
        }
      />

      <main className="px-8 py-4 pt-8 font-['Pretendard']">
        {(packed.questions?.length ?? 0) === 0 ? (
          <div className="py-12 text-center text-[#6b6b6b]">퀴즈가 없습니다.</div>
        ) : (
          <ul className="space-y-5">
            {questions.map((q, i) => (
              <li key={q.questionId} className="flex items-stretch gap-3 h-12">
                <span className="w-1.5 rounded-full bg-[#FF8B8B]" />
                <div className="flex flex-1 items-center justify-between rounded-sm bg-[#F5F5F5] px-4 py-3 text-base text-[#3E3E3E]">
                  {/* {!editMode ? ( */}
                  <span>
                    <b className="mr-2 text-[#FF8B8B]">{q.sequence}.</b>
                    {q.content}
                  </span>
                  {/* ) : (
                    <label className="flex-1">
                      <span className="sr-only">{q.sequence}번 문항</span>
                      <div className="flex items-center gap-2">
                        <b className="text-[#FF8B8B]">{q.sequence}.</b>
                        <input
                          value={q.content}
                          onChange={(e) => changeContent(i, e.target.value)}
                          placeholder="생일 퀴즈를 작성해주세요."
                          className="w-full text-[#A0A0A0] font-medium text-base outline-none focus:ring-1 focus:ring-[#FF8B8B]/40"
                        />
                      </div>
                    </label>
                  )} */}
                </div>

                {editMode && (
                  <div className="ml-3 flex items-center gap-2">
                    <button
                      aria-label={answers[i] ? '정답(O)로 설정' : '정답(X)로 설정'}
                      // onClick={() => toggleAnswer(i)}
                      className="flex items-center justify-center"
                      title={answers[i] ? '정답 O' : '정답 X'}
                    >
                      <img
                        src={q.answer ? OIcon : XIcon}
                        alt={q.answer ? '정답 O' : '정답 X'}
                        className="h-11 w-11"
                      />
                    </button>
                    <button
                      aria-label="삭제"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b6b6b] hover:bg-black/5"
                      onClick={() => askRemoveQuestion(i)}
                      title="문항 삭제"
                    >
                      {trashBin}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      <Modal
        open={confirmOpen}
        type="confirm"
        title="정말 이 퀴즈를 삭제할까요?"
        confirmText="예"
        cancelText="아니오"
        onConfirm={confirmRemove}
        onCancel={closeConfirm}
        onClose={closeConfirm}
      />
      <Modal
        open={editConfirmOpen}
        type="confirm"
        title="퀴즈를 편집하시겠어요?"
        helperText="퀴즈 편집 시 기존 랭킹 데이터는 초기화됩니다."
        confirmText="편집하기"
        cancelText="취소"
        onConfirm={confirmStartEdit}
        onCancel={cancelStartEdit}
        onClose={cancelStartEdit}
        className="break-keep"
      />
    </div>
  );
}

// ---------- 아이콘 svg ----------
const trashBin = (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 22 24" fill="none">
    <path d="M8.55556 19.2C8.87971 19.2 9.19059 19.0736 9.4198 18.8485C9.64901 18.6235 9.77778 18.3183 9.77778 18V10.8C9.77778 10.4817 9.64901 10.1765 9.4198 9.95147C9.19059 9.72643 8.87971 9.6 8.55556 9.6C8.2314 9.6 7.92053 9.72643 7.69131 9.95147C7.4621 10.1765 7.33333 10.4817 7.33333 10.8V18C7.33333 18.3183 7.4621 18.6235 7.69131 18.8485C7.92053 19.0736 8.2314 19.2 8.55556 19.2ZM20.7778 4.8H15.8889V3.6C15.8889 2.64522 15.5026 1.72955 14.8149 1.05442C14.1273 0.379285 13.1947 0 12.2222 0H9.77778C8.80532 0 7.87269 0.379285 7.18505 1.05442C6.49742 1.72955 6.11111 2.64522 6.11111 3.6V4.8H1.22222C0.898069 4.8 0.587192 4.92643 0.357981 5.15147C0.128769 5.37652 0 5.68174 0 6C0 6.31826 0.128769 6.62348 0.357981 6.84853C0.587192 7.07357 0.898069 7.2 1.22222 7.2H2.44444V20.4C2.44444 21.3548 2.83075 22.2705 3.51839 22.9456C4.20602 23.6207 5.13865 24 6.11111 24H15.8889C16.8613 24 17.794 23.6207 18.4816 22.9456C19.1692 22.2705 19.5556 21.3548 19.5556 20.4V7.2H20.7778C21.1019 7.2 21.4128 7.07357 21.642 6.84853C21.8712 6.62348 22 6.31826 22 6C22 5.68174 21.8712 5.37652 21.642 5.15147C21.4128 4.92643 21.1019 4.8 20.7778 4.8ZM8.55556 3.6C8.55556 3.28174 8.68433 2.97652 8.91354 2.75147C9.14275 2.52643 9.45362 2.4 9.77778 2.4H12.2222C12.5464 2.4 12.8573 2.52643 13.0865 2.75147C13.3157 2.97652 13.4444 3.28174 13.4444 3.6V4.8H8.55556V3.6ZM17.1111 20.4C17.1111 20.7183 16.9823 21.0235 16.7531 21.2485C16.5239 21.4736 16.213 21.6 15.8889 21.6H6.11111C5.78696 21.6 5.47608 21.4736 5.24687 21.2485C5.01766 21.0235 4.88889 20.7183 4.88889 20.4V7.2H17.1111V20.4ZM13.4444 19.2C13.7686 19.2 14.0795 19.0736 14.3087 18.8485C14.5379 18.6235 14.6667 18.3183 14.6667 18V10.8C14.6667 10.4817 14.5379 10.1765 14.3087 9.95147C14.0795 9.72643 13.7686 9.6 13.4444 9.6C13.1203 9.6 12.8094 9.72643 12.5802 9.95147C12.351 10.1765 12.2222 10.4817 12.2222 10.8V18C12.2222 18.3183 12.351 18.6235 12.5802 18.8485C12.8094 19.0736 13.1203 19.2 13.4444 19.2Z" fill="#A0A0A0" />
  </svg>
);

const editStart = (
  <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none">
    <path d="M21.8437 11.5033C21.5388 11.5033 21.2463 11.6245 21.0307 11.8401C20.8151 12.0557 20.694 12.3481 20.694 12.653V19.551C20.694 19.8559 20.5729 20.1483 20.3573 20.3639C20.1417 20.5795 19.8492 20.7007 19.5443 20.7007H3.449C3.14409 20.7007 2.85167 20.5795 2.63606 20.3639C2.42046 20.1483 2.29933 19.8559 2.29933 19.551V3.45567C2.29933 3.15076 2.42046 2.85833 2.63606 2.64273C2.85167 2.42712 3.14409 2.306 3.449 2.306H10.347C10.6519 2.306 10.9443 2.18487 11.1599 1.96927C11.3755 1.75367 11.4967 1.46124 11.4967 1.15633C11.4967 0.851422 11.3755 0.559 11.1599 0.343396C10.9443 0.127791 10.6519 0.00666616 10.347 0.00666616H3.449C2.53427 0.00666616 1.657 0.370042 1.01019 1.01686C0.363376 1.66367 0 2.54093 0 3.45567V19.551C0 20.4657 0.363376 21.343 1.01019 21.9898C1.657 22.6366 2.53427 23 3.449 23H19.5443C20.4591 23 21.3363 22.6366 21.9831 21.9898C22.63 21.343 22.9933 20.4657 22.9933 19.551V12.653C22.9933 12.3481 22.8722 12.0557 22.6566 11.8401C22.441 11.6245 22.1486 11.5033 21.8437 11.5033ZM4.59867 12.3771V17.2517C4.59867 17.5566 4.71979 17.849 4.9354 18.0646C5.151 18.2802 5.44342 18.4013 5.74833 18.4013H10.6229C10.7742 18.4022 10.9242 18.3732 11.0643 18.316C11.2044 18.2588 11.3318 18.1745 11.4392 18.0679L19.3949 10.1007L22.6599 6.90467C22.7677 6.79779 22.8532 6.67064 22.9116 6.53054C22.9699 6.39044 23 6.24017 23 6.0884C23 5.93663 22.9699 5.78637 22.9116 5.64627C22.8532 5.50617 22.7677 5.37902 22.6599 5.27214L17.7853 0.340069C17.6785 0.232313 17.5513 0.146784 17.4112 0.0884173C17.2711 0.0300503 17.1208 0 16.9691 0C16.8173 0 16.667 0.0300503 16.5269 0.0884173C16.3868 0.146784 16.2597 0.232313 16.1528 0.340069L12.9108 3.59363L4.93207 11.5608C4.82552 11.6682 4.74122 11.7956 4.684 11.9357C4.62679 12.0758 4.59779 12.2258 4.59867 12.3771ZM16.9691 2.77736L20.2226 6.03092L18.5901 7.66345L15.3366 4.40989L16.9691 2.77736ZM6.898 12.8484L13.7155 6.03092L16.9691 9.28448L10.1516 16.102H6.898V12.8484Z" fill="black" />
  </svg>
);

const editCompl = (
  <svg xmlns="http://www.w3.org/2000/svg" width="31" height="22" viewBox="0 0 31 22" fill="none">
    <path d="M29 2L11 20L2 11.0004" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

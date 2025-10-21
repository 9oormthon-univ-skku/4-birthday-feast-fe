import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "@/ui/AppLayout";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createQuiz } from "@/apis/quiz"; // API 연결

type QuizQuestion = {
  questionId: string;
  content: string;
  answer: boolean; // true=O, false=X
  sequence: number;
};

type QuizDraft = {
  quizId: string;
  birthdayId?: string | number;
  questions: QuizQuestion[];
  updatedAt: string;
};

const DRAFT_KEY = "bh.quiz.ox.draft";
const LS_BIRTHDAY_ID = "bh.lastBirthdayId";
const MAX_LEN = 100;
const MIN_QUESTIONS = 1;

function makeId() {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadDraft(): QuizDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.questions)) return null;
    return parsed as QuizDraft;
  } catch {
    return null;
  }
}

function saveDraft(d: QuizDraft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch { }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch { }
}

function normalizeSequence(list: QuizQuestion[]): QuizQuestion[] {
  return list
    .map((q, i) => ({ ...q, sequence: i + 1 }))
    .sort((a, b) => a.sequence - b.sequence);
}

function readLastBirthdayId(): string | number | undefined {
  try {
    const raw = localStorage.getItem(LS_BIRTHDAY_ID);
    if (!raw) return undefined;
    // 숫자로 저장된 경우와 문자열 모두 지원
    const n = Number(raw);
    return Number.isFinite(n) ? n : (raw as string);
  } catch {
    return undefined;
  }
}

export default function CreateQuizPage() {
  const nav = useNavigate();
  const [sp] = useSearchParams();

  const [title, setTitle] = useState<string>("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { questionId: makeId(), content: "", answer: true, sequence: 1 },
  ]);
  const [birthdayId, setBirthdayId] = useState<string | number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  // 초안 로드 & birthdayId 결정 (query -> draft -> undefined)
  useEffect(() => {
    const d = loadDraft();
    const qBirthday = sp.get("birthdayId") || undefined;
    const lsBirthday = readLastBirthdayId();

    setBirthdayId(qBirthday ?? d?.birthdayId ?? lsBirthday ?? undefined);

    if (d) {
      setQuestions(normalizeSequence(d.questions));
      // setTitle(d.title ?? ""); // 제목 쓰면 사용
    }
  }, [sp]);

  // 자동 임시저장
  useEffect(() => {
    const draft: QuizDraft = {
      quizId: "local-quiz",
      birthdayId,
      questions: normalizeSequence(questions),
      updatedAt: new Date().toISOString(),
    };
    saveDraft(draft);
  }, [questions, birthdayId]);

  const allValid = useMemo(() => {
    if (questions.length < MIN_QUESTIONS) return false;
    return questions.every(
      (q) => q.content.trim().length > 0 && q.content.length <= MAX_LEN
    );
  }, [questions]);

  const addQuestion = () => {
    setQuestions((prev) =>
      normalizeSequence([
        ...prev,
        { questionId: makeId(), content: "", answer: true, sequence: prev.length + 1 },
      ])
    );
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => normalizeSequence(prev.filter((q) => q.questionId !== id)));
  };

  const moveUp = (idx: number) => {
    setQuestions((prev) => {
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return normalizeSequence(next);
    });
  };

  const moveDown = (idx: number) => {
    setQuestions((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return normalizeSequence(next);
    });
  };

  const updateContent = (id: string, content: string) => {
    if (content.length > MAX_LEN) return;
    setQuestions((prev) => prev.map((q) => (q.questionId === id ? { ...q, content } : q)));
  };

  const toggleAnswer = (id: string, value: boolean) => {
    setQuestions((prev) => prev.map((q) => (q.questionId === id ? { ...q, answer: value } : q)));
  };

  // ✅ 실제 API 호출
  const handleSave = async () => {
    if (!birthdayId) {
      alert("생일상 ID를 찾을 수 없어요. URL에 ?birthdayId= 를 포함하거나 온보딩을 완료해주세요.");
      return;
    }
    if (!allValid) return;

    setSubmitting(true);
    try {
      const payload = {
        birthdayId,
        questions: normalizeSequence(questions).map((q) => ({
          // 서버 스키마: sequence/content/answer 만 전송
          sequence: q.sequence,
          content: q.content.trim(),
          answer: q.answer,
        })),
      };

      const created = await createQuiz(payload); // <-- POST /api-user/quiz/create
      clearDraft();
      alert("퀴즈가 저장되었습니다.");
      // 필요에 맞게 이동 경로 조정
      nav(`/main?quizId=${created.quizId}`);
    } catch (e: any) {
      console.error(e);
      alert("퀴즈 저장에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const rightExtra = (
    <div className="text-sm text-[#A0A0A0]">퀴즈 개수 : {questions.length}</div>
  );

  return (
    <AppLayout
      title={
        <>
          <span className="text-[#FF8B8B]">생일 퀴즈 </span>
          <span className="text-[#A0A0A0]">만들기</span>
        </>
      }
      showBack
      onBack={() => nav(-1)}
      showMenu={false}
      showBrush={false}
      rightExtra={rightExtra}
      footerButtonLabel={submitting ? "저장 중..." : "저장하기"}
      onFooterButtonClick={handleSave}
      footerButtonDisabled={!allValid || submitting}
    >
      <div className="w-full px-8 py-4">
        {/* 설명 */}
        <p className="text-sm text-[#A0A0A0] mb-4">
          각 문항은 <span className="text-[#FF8B8B] font-bold">O / X</span> 중 하나의 정답을 선택해 주세요.<br />
          (최대 {MAX_LEN}자)
        </p>

        {/* 문항 리스트 */}
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.questionId} className="rounded-[5px] border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-[#383838]">Q. {idx + 1}</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveUp(idx)}
                    className="rounded-md border-2 p-1 text-xs font-bold text-[#A0A0A0] hover:bg-gray-50"
                    disabled={idx === 0 || submitting}
                    aria-label="위로 이동"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(idx)}
                    className="rounded-md border-2 p-1 text-xs font-bold text-[#A0A0A0] hover:bg-gray-50"
                    disabled={idx === questions.length - 1 || submitting}
                    aria-label="아래로 이동"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeQuestion(q.questionId)}
                    className="rounded-md border-2 px-2 py-1 font-semibold text-xs text-[#FF8B8B]"
                    disabled={submitting}
                    aria-label="삭제"
                  >
                    삭제
                  </button>
                </div>
              </div>

              <input
                value={q.content}
                onChange={(e) => updateContent(q.questionId, e.target.value)}
                placeholder="퀴즈 내용을 입력하세요"
                className=" w-full rounded-[5px] border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF8B8B] mb-3"
                disabled={submitting}
              />

              <div className="flex justify-between">
                <div className="flex items-center gap-2s">
                  <OXToggle
                    value={q.answer}
                    onChange={(val) => toggleAnswer(q.questionId, val)}
                  />
                </div>
                <span className="text-sm text-[#A0A0A0] px-2">
                  정답: <span className="font-medium text-[#383838]">{q.answer ? "O" : "X"}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 추가 버튼 */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={addQuestion}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            disabled={submitting}
          >
            + 퀴즈 추가
          </button>
        </div>
      </div>

    </AppLayout>
  );
}

function OXToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden border rounded-full border-gray-200">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`px-3 py-1.5 text-sm rounded-full ${value ? "bg-[#FF8B8B] text-white" : "bg-white text-[#A0A0A0]"}`}
        aria-pressed={value}
        aria-label="정답 O"
      >
        O
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`px-3 py-1.5 text-sm rounded-full ${!value ? "bg-[#FF8B8B] text-white" : "bg-white text-[#A0A0A0]"}`}
        aria-pressed={!value}
        aria-label="정답 X"
      >
        X
      </button>
    </div>
  );
}

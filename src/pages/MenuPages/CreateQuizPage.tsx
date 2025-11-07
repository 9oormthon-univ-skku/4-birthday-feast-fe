import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "@/ui/AppLayout";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  createQuiz,
  type QuizCreateQuestionInput,
  type QuizCreateReq,
} from "@/apis/quiz";
import { getLastBirthdayId, setLastQuizId } from "@/stores/userStorage";
import { toNumOrUndef } from "@/utils/toNumOrUndef";

// -------------------- 타입 --------------------
type QuizDraft = QuizCreateReq & {
  updatedAt: string; // 클라이언트 메타
};
type EditableQuestion = QuizCreateQuestionInput & { questionId: string };

// -------------------- 상수/유틸 --------------------
const BASE_DRAFT_KEY = "bh.quiz.ox.draft"; // 생일상별 네임스페이스 접두어
const MAX_LEN = 100;
const MIN_QUESTIONS = 1;

function makeId() {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** ✅ 생일상별 네임스페이스 키 (birthdayId 없으면 저장/로드 스킵) */
function draftKeyFor(birthdayId?: number) {
  return birthdayId ? `${BASE_DRAFT_KEY}:${birthdayId}` : "";
}

/** ✅ 세션스토리지 유틸 */
function loadDraftByKey(key: string): QuizDraft | null {
  if (!key) return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed.birthdayId !== "number" ||
      !Array.isArray(parsed.questions)
    )
      return null;
    return parsed as QuizDraft;
  } catch {
    return null;
  }
}
function saveDraftByKey(key: string, d: QuizDraft) {
  if (!key) return;
  try {
    sessionStorage.setItem(key, JSON.stringify(d));
  } catch { }
}
function clearDraftByKey(key: string) {
  if (!key) return;
  try {
    sessionStorage.removeItem(key);
  } catch { }
}

/** 시퀀스 정렬/보정: 편집용(기존 필드 유지) */
function normalizeSequenceEditable<T extends { sequence: number }>(list: T[]): T[] {
  return list
    .map((q, i) => ({ ...q, sequence: i + 1 }))
    .sort((a, b) => a.sequence - b.sequence);
}

/** 시퀀스 정렬/보정: 페이로드/드래프트용(필드 축소) */
function normalizeSequencePayload(
  list: EditableQuestion[]
): QuizCreateQuestionInput[] {
  return list
    .map((q, i) => ({
      sequence: i + 1,
      content: q.content,
      answer: q.answer,
    }))
    .sort((a, b) => a.sequence - b.sequence);
}

/** LS에서 birthdayId 안전 파싱 */
function readLastBirthdayId(): number | undefined {
  try {
    const raw = getLastBirthdayId();
    return toNumOrUndef(raw);
  } catch {
    return undefined;
  }
}

/** 문항 유효성 */
function isQuestionValid(q: QuizCreateQuestionInput) {
  const content = (q.content ?? "").trim();
  return content.length > 0 && content.length <= MAX_LEN && typeof q.answer === "boolean";
}

// -------------------- 컴포넌트 --------------------
export default function CreateQuizPage() {
  const nav = useNavigate();
  const [sp] = useSearchParams();

  const [birthdayId, setBirthdayId] = useState<number | undefined>(undefined);
  const [questions, setQuestions] = useState<EditableQuestion[]>([
    { questionId: makeId(), content: "", answer: true, sequence: 1 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  /** 1) birthdayId 결정 */
  useEffect(() => {
    setBirthdayId(readLastBirthdayId());
  }, [sp]);

  /** 2) 생일상별 초안 로드 */
  useEffect(() => {
    if (birthdayId === undefined) return;
    const nsKey = draftKeyFor(birthdayId);
    const d = loadDraftByKey(nsKey);
    if (d) {
      // 서버 스펙 → 편집 모델로 매핑 (questionId 부여) + 편집용 정렬
      setQuestions(
        normalizeSequenceEditable(
          d.questions.map((q, i) => ({
            questionId: `q_${i}_${Date.now()}`,
            content: q.content,
            answer: q.answer,
            sequence: q.sequence,
          }))
        )
      );
    }
  }, [birthdayId]);

  /** 3) 자동 임시저장 (생일상별 키로만 저장) */
  useEffect(() => {
    if (birthdayId === undefined) return; // id 없으면 저장 안 함
    const nsKey = draftKeyFor(birthdayId);
    const draft: QuizDraft = {
      birthdayId,
      questions: normalizeSequencePayload(questions), // ✅ 축소/정렬
      updatedAt: new Date().toISOString(),
    };
    saveDraftByKey(nsKey, draft);
  }, [questions, birthdayId]);

  /** 폼 전체 유효성 */
  const allValid = useMemo(() => {
    if (questions.length < MIN_QUESTIONS) return false;
    return questions.every((q) =>
      isQuestionValid({ sequence: q.sequence, content: q.content, answer: q.answer })
    );
  }, [questions]);

  // -------------------- 액션들 --------------------
  const addQuestion = () => {
    setQuestions((prev) =>
      normalizeSequenceEditable([
        ...prev,
        { questionId: makeId(), content: "", answer: true, sequence: prev.length + 1 },
      ])
    );
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) =>
      normalizeSequenceEditable(prev.filter((q) => q.questionId !== id))
    );
  };

  const moveUp = (idx: number) => {
    setQuestions((prev) => {
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return normalizeSequenceEditable(next);
    });
  };

  const moveDown = (idx: number) => {
    setQuestions((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return normalizeSequenceEditable(next);
    });
  };

  const updateContent = (id: string, content: string) => {
    if (content.length > MAX_LEN) return;
    setQuestions((prev) => prev.map((q) => (q.questionId === id ? { ...q, content } : q)));
  };

  const toggleAnswer = (id: string, value: boolean) => {
    setQuestions((prev) => prev.map((q) => (q.questionId === id ? { ...q, answer: value } : q)));
  };

  // -------------------- 실제 API 호출 --------------------
  const handleSave = async () => {
    if (submitting) return; // ✅ 중복 제출 가드
    if (!birthdayId) {
      alert("생일상 ID를 찾을 수 없어요.");
      return;
    }
    if (!allValid) return;

    setSubmitting(true);
    try {
      const payload: QuizCreateReq = {
        birthdayId,
        questions: normalizeSequencePayload(questions), // ✅ 서버 스펙 그대로
      };

      const created = await createQuiz(payload);

      // 퀴즈 생성 시 quizId 로컬에 저장
      try {
        setLastQuizId(created.quizId ?? null);
      } catch { }

      clearDraftByKey(draftKeyFor(birthdayId)); // 해당 생일상 초안만 제거
      alert("퀴즈가 저장되었습니다.");
      nav(`/main?quizId=${created.quizId}`);
    } catch (e: any) {
      console.error(e);
      alert(`퀴즈 저장에 실패했어요. 잠시 후 다시 시도해주세요.\n${e}`);
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------- UI --------------------
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
        <p className="text-sm text-[#A0A0A0] mb-4">
          각 문항은 <span className="text-[#FF8B8B] font-bold">O / X</span> 중 하나의 정답을 선택해 주세요.
          <br />
          (최대 {MAX_LEN}자)
        </p>

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
                className="w-full rounded-[5px] border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF8B8B] mb-3"
                disabled={submitting}
              />

              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <OXToggle value={q.answer} onChange={(val) => toggleAnswer(q.questionId, val)} />
                </div>
                <span className="text-sm text-[#A0A0A0] px-2">
                  정답: <span className="font-medium text-[#383838]">{q.answer ? "O" : "X"}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

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

// -------------------- 서브 컴포넌트 --------------------
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
        className={`px-3 py-1.5 text-sm rounded-full ${value ? "bg-[#FF8B8B] text-white" : "bg-white text-[#A0A0A0]"
          }`}
        aria-pressed={value}
        aria-label="정답 O"
      >
        O
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`px-3 py-1.5 text-sm rounded-full ${!value ? "bg-[#FF8B8B] text-white" : "bg-white text-[#A0A0A0]"
          }`}
        aria-pressed={!value}
        aria-label="정답 X"
      >
        X
      </button>
    </div>
  );
}

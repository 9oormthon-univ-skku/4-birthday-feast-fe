// src/pages/QuizPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../ui/Header';
import quizEditIcon from '@/assets/images/quiz-edit.svg';

const mockQuiz = Array.from({ length: 10 }).map((_, i) => `생일 퀴즈 작성해주세요.`);

export default function QuizPage() {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header
        showBack
        showMenu={false}
        showBrush={false}
        title={<span className="text-[#FF8B8B]">생일 퀴즈</span>}
        // 우측 연필 아이콘 → 편집 모드 토글
        rightExtra={
          <button
            aria-label="퀴즈 편집"
            onClick={() => setEditMode((v) => !v)}
            className="rounded-full p-2 transition hover:bg-black/5 active:scale-95"
          >
            <img src={quizEditIcon} alt="" className="h-[22px] w-[22px]" />
          </button>
        }
      />

      <main className="px-4 pb-6">
        {/* 상단 구분선 */}
        <div className="mb-4 h-[1px] bg-[#EFD9C6]" />

        <ul className="space-y-4">
          {mockQuiz.map((q, i) => (
            <li key={i} className="flex items-stretch gap-3">
              {/* 왼쪽 포인트 바 */}
              <span className="w-1.5 rounded-full bg-[#FF8B8B]" />

              {/* 내용 카드 */}
              <div className="flex flex-1 items-center justify-between rounded-sm bg-[#F5F5F5] px-4 py-3 text-base text-[#3E3E3E]">
                <span>{q}</span>

                {editMode && (
                  <div className="ml-3 flex items-center gap-2">
                    {/* O 버튼 */}
                    <button
                      aria-label="정답"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF8B8B] text-white"
                    >
                      ○
                    </button>
                    {/* X 버튼 */}
                    <button
                      aria-label="오답"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#FF8B8B] text-[#FF8B8B]"
                    >
                      ✕
                    </button>
                    {/* 삭제 버튼 */}
                    <button
                      aria-label="삭제"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-[#6b6b6b] hover:bg-black/5"
                      onClick={() => alert(`${i + 1}번 퀴즈 삭제`)}
                    >
                      🗑
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

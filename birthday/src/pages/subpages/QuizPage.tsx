// 퀴즈 
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import quizEditIcon from '../../assets/images/quiz-edit.svg';

const mockQuiz = Array.from({ length: 10 }).map((_, i) => `생일 퀴즈 내용 ${i + 1}`);

export default function QuizPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Header
        showBack
        showMenu={false}
        showBrush={false}
        title={<span className="text-[#FF8B8B]">생일 퀴즈</span>}
        // 우측에 연필 아이콘
        rightExtra={
          <button
            aria-label="퀴즈 편집"
            onClick={() => navigate('/quiz/edit')} // TODO: 편집 라우트 연결 (없으면 콜백만 유지)
            className="p-2 rounded-full hover:bg-black/5 active:scale-95 transition"
          >
           <img src={quizEditIcon} alt="" className="w-[22px] h-[22px]" />
          </button>
        }
      />

      <main className="mx-[60px] max-w-md px-4 pb-6">
        {/* 상단 여백/구분선 느낌 */}
        <div className="h-[1px] bg-[#EFD9C6] mb-4" />

        <ul className="space-y-4">
          {mockQuiz.map((q) => (
            <li key={q} className="flex items-stretch gap-3">
              {/* 왼쪽 포인트 바 */}
              <span className="w-1.5 rounded-full bg-[#FF8B8B]" />
              {/* 내용 카드 */}
              <div className="flex-1 bg-[#F5F5F5] rounded-xl px-4 py-3 text-[14px] text-[#555]">
                {q.replace(/\s\d+$/, '') /* '생일 퀴즈 내용'만 보이게 할 거면 이 줄 유지 */}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

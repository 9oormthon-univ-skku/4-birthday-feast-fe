// src/pages/subpages/ContactPage.tsx
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';

export default function ContactPage() {
  const navigate = useNavigate();
  const email = 'asy030303@daum.net';

  return (
    <div className="min-h-screen bg-white">
      {/* 메인과 동일 사이즈 헤더 + 뒤로가기 */}
      <Header
        showBack
        showMenu={false}
        showBrush={false}
        title={<span className="text-[#FF8B8B]">문의하기</span>}
      />

      {/* 본문 */}
      <main className="mx-[60px] max-w-md px-4 pb-28">
        <p className="mt-[60px] ml-[30px] text-[28px] leading-6 text-[#8A8A8A]">
          문제를 겪고 계신가요?
          <br />
          <a
            href={`mailto:${email}`}
            className="underline hover:text-[#FF8B8B]"
          >
            {email}
          </a>
          으로 연락해주세요.
        </p>
      </main>

      {/* 하단 확인 버튼 고정 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EFD9C6]">
        <div className="mx-[60px] max-w-md px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3.5 rounded-xl bg-[#FF8B8B] text-white font-bold shadow-md active:scale-[0.98] transition"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 14px)' }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

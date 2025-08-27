// src/pages/TeamAboutPage.tsx
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';

type Member = { name: string; school: string; email: string };

const sections: { title: string; members: Member[] }[] = [
  {
    title: '기획',
    members: [
      { name: '안서연', school: '한국예술종합학교', email: 'asy030303@daum.net' },
    ],
  },
  {
    title: '디자인',
    members: [
      { name: '최윤정', school: '한국예술종합학교', email: '0311yunjung@gmail.com' },
    ],
  },
  {
    title: '프론트엔드',
    members: [
      { name: '김예진', school: '성균관대학교', email: 'twjindev@gmail.com' },
    ],
  },
  {
    title: '백엔드',
    members: [
      { name: '강지혜', school: '성균관대학교', email: 'rosa10984595@gmail.com' },
      { name: '김은서', school: '성균관대학교', email: 'edgexpand@g.skku.edu' },
    ],
  },
];

export default function TeamAboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* 헤더: 메인과 동일 크기/스타일 유지 + 뒤로가기 */}
      <Header
        showBack
        showMenu={false}
        showBrush={false}
        title={
          <>
            <span className="text-[#A0A0A0]">생일한상 </span>
            <span className="text-[#FF8B8B]">팀 소개</span>
          </>
        }
      />

      {/* 본문 */}
      <main className="mx-[60px] max-w-md px-4 pb-28">
        <p className="text-[28px] leading-6 text-[#8A8A8A]">
          생일한상은 성균관대학교와 한국예술종합학교 연합이 제작한
          생일 축하 앱 개발 프로젝트입니다.
        </p>

        <hr className="my-4 border-[#EFD9C6]" />

        {sections.map((sec) => (
          <section key={sec.title} className="mb-6">
            <h2 className="text-[#FF8B8B] font-bold text-[36px] mb-2">{sec.title}</h2>
            <ul className="space-y-3">
              {sec.members.map((m) => (
                <li key={m.email} className="text-[28px] leading-5">
                  <div className="text-[#555] font-medium">
                    {m.name} <span className="text-[#A0A0A0]">| {m.school}</span>
                  </div>
                  <div className="text-[#A0A0A0]">{m.email}</div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      {/* 하단 고정 CTA */}
      {/* <div className="fixed bottom-0 left-0 right-0 bg-[#FFF4DF] border-t border-[#EFD9C6] backdrop-blur">
        <div className="mx-[60px] max-w-md px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3.5 rounded-xl bg-[#FF8B8B] text-white font-bold shadow-md active:scale-[0.98] transition"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 14px)' }}
          >
            확인
          </button>
        </div>
      </div> */}
    </div>
  );
}

// src/pages/ThemePage.tsx
import Header from '../../layouts/Header';

export default function ThemePage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <Header
        // ✅ compact 안 씀 = 메인 홈과 같은 48px 타이틀/헤더 높이 유지
        showBack
        showMenu={false}
        showBrush={false}
        title={
          <>

            <span className="text-[#A0A0A0]">테마 변경하기</span>
          </>
        }
      />
      {/* 나머지 화면 */}
      <div className="px-4">…</div>
    </div>
  );
}

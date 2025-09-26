// src/pages/ThemePage.tsx
import Header from '../../ui/Header';

export default function ThemePage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <Header
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

// src/pages/subpages/AccountSettingsPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import { useLogout } from '@/features/auth/useLogout'; // ⬅️ 추가

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const [publicAll, setPublicAll] = useState(true);
  const { logout } = useLogout();               // ⬅️ 추가
  const [loggingOut, setLoggingOut] = useState(false); // ⬅️ 로딩 상태

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout(); // 서버 로그아웃 + 토큰 삭제 + /login 이동
      // 참고: useLogout 안에서 네비게이션까지 처리하므로 여기서 alert 불필요
    } catch (e) {
      // useLogout 내부에서 실패해도 최종적으로 이동은 처리됨. 필요시 사용자 피드백만 추가
      console.error(e);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleWithdraw = () => {
    if (confirm('정말 탈퇴하시겠어요?')) {
      alert('탈퇴 처리되었습니다.');
    }
  };

  return (
    <AppLayout
      showBack
      showMenu={false}
      showBrush={false}
      title={
        <>
          <span className="text-[#FF8B8B]">계정</span>
          <span className="text-[#A0A0A0]"> 설정</span>
        </>
      }
      footerButtonLabel="확인"
      onFooterButtonClick={() => navigate(-1)}
    >
      {/* 프로필 섹션 */}
      <section className="pt-9 pb-5 px-1 border-b border-[#D9D9D9]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-extrabold text-[#FF8B8B]">사용자님</div>
            <div className="text-base text-[#A0A0A0] mt-0.5 font-medium">카카오로 로그인 중</div>
          </div>
          <div className="w-16 h-16 rounded-full bg-[#D9D9D9]" />
        </div>
      </section>

      {/* 공개 설정 + 기타 항목 */}
      <section className="pt-9 px-3 space-y-6">
        {/* 공개 스위치 */}
        <div className="flex items-center justify-between">
          <span className="text-base text-[#A0A0A0] font-semibold">내게 온 메시지 모두에게 공개</span>
          <button
            type="button"
            aria-pressed={publicAll}
            onClick={() => setPublicAll((v) => !v)}
            className={[
              'relative inline-flex items-center h-6 w-12 rounded-full transition-colors',
              publicAll ? 'bg-[#FF8B8B]' : 'bg-[#E5E5E5]',
            ].join(' ')}
          >
            <span
              className={[
                'absolute text-[10px] font-bold text-white',
                publicAll ? 'left-2' : 'left-6',
              ].join(' ')}
            >
              {publicAll ? 'ON' : 'OFF'}
            </span>
            <span
              className={[
                'inline-block h-4 w-4 rounded-full bg-white shadow transform transition',
                publicAll ? 'translate-x-[28px]' : 'translate-x-[4px]',
              ].join(' ')}
            />
          </button>
        </div>

        {/* 로그아웃 */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full text-left text-base text-[#A0A0A0] font-semibold hover:text-[#FF8B8B] transition disabled:opacity-60"
        >
          {loggingOut ? '로그아웃 중…' : '로그아웃'}
        </button>

        {/* 회원탈퇴 */}
        <button
          type="button"
          onClick={handleWithdraw}
          className="w-full text-left text-base text-[#A0A0A0] font-semibold hover:text-[#FF8B8B] transition"
        >
          회원탈퇴
        </button>
      </section>
    </AppLayout>
  );
}

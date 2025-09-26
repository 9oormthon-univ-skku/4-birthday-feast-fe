// src/pages/subpages/AccountSettingsPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const [publicAll, setPublicAll] = useState(true); // 내게 온 메시지 모두에게 공개

  const handleLogout = () => {
    // TODO: 실제 로그아웃 로직 연결
    alert('로그아웃 되었습니다.');
  };

  const handleWithdraw = () => {
    // TODO: 실제 회원탈퇴 로직 연결
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

          {/* 토글 */}
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
          className="w-full text-left text-base text-[#A0A0A0] font-semibold hover:text-[#FF8B8B] transition"
        >
          로그아웃
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

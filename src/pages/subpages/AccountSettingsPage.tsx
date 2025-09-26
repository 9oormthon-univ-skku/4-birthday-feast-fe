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
      <section className="pb-4 border-b border-[#EFD9C6]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[16px] font-bold text-[#FF8B8B]">사용자님</div>
            <div className="text-[12px] text-[#8A8A8A] mt-0.5">카카오로 로그인 중</div>
          </div>
          <div className="w-[48px] h-[48px] rounded-full bg-[#EAEAEA]" />
        </div>
      </section>

      {/* 공개 설정 + 기타 항목 */}
      <section className="pt-4 space-y-4">
        {/* 공개 스위치 */}
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-[#555]">내게 온 메시지 모두에게 공개</span>

          {/* iOS 느낌 토글 */}
          <button
            type="button"
            aria-pressed={publicAll}
            onClick={() => setPublicAll((v) => !v)}
            className={[
              'relative inline-flex items-center h-7 w-[52px] rounded-full transition-colors',
              publicAll ? 'bg-[#FF8B8B]' : 'bg-[#E5E5E5]',
            ].join(' ')}
          >
            <span
              className={[
                'absolute text-[10px] font-bold text-white',
                publicAll ? 'left-2' : 'left-[26px]',
              ].join(' ')}
            >
              {publicAll ? 'ON' : 'OFF'}
            </span>
            <span
              className={[
                'inline-block h-6 w-6 rounded-full bg-white shadow transform transition',
                publicAll ? 'translate-x-[26px]' : 'translate-x-[2px]',
              ].join(' ')}
            />
          </button>
        </div>

        {/* 로그아웃 */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full text-left py-2 text-[14px] text-[#555] hover:text-[#FF8B8B] transition"
        >
          로그아웃
        </button>

        {/* 회원탈퇴 */}
        <button
          type="button"
          onClick={handleWithdraw}
          className="w-full text-left py-2 text-[14px] text-[#555] hover:text-[#FF8B8B] transition"
        >
          회원탈퇴
        </button>
      </section>
    </AppLayout>
  );
}

// src/pages/subpages/AccountSettingsPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/ui/AppLayout';
import { updateNickname } from '@/apis/user';
import NicknameModal from '@/features/auth/NicknameModal';
import { updateBirthdayVisible } from "@/apis/birthday"; // getBirthdayPeriod 제거
import { useLogout } from '@/hooks/useLogout';
import { qk } from '@/apis/queryKeys';
import type { UserMeResponse } from '@/apis/user';
import { useQueryClient } from '@tanstack/react-query';
import { GoPersonFill } from 'react-icons/go';
import { LS_LAST_BID } from '@/hooks/useFeastThisYear';

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const { logout } = useLogout();
  const queryClient = useQueryClient();

  const [loggingOut, setLoggingOut] = useState(false);
  const [nicknameModalOpen, setNicknameModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // 공개 여부 (생일상 공개 여부)
  const [publicAll, setPublicAll] = useState<boolean>(true);
  const [loadingVisible, setLoadingVisible] = useState<boolean>(false);

  const me = queryClient.getQueryData<UserMeResponse>(qk.auth.me) ?? null;

  // --- 공개여부 토글 ---
  const handleToggleVisible = async () => {
    const next = !publicAll;
    setPublicAll(next);

    const idRaw = localStorage.getItem(LS_LAST_BID);
    if (!idRaw) {
      alert("생일상 ID를 찾을 수 없습니다.");
      return;
    }

    const birthdayId = /^\d+$/.test(idRaw) ? Number(idRaw) : idRaw;

    try {
      setLoadingVisible(true);
      await updateBirthdayVisible(birthdayId, next);
    } catch (e) {
      console.error(e);
      alert("공개여부 변경 중 오류가 발생했습니다.");
      // 실패 시 UI 롤백
      setPublicAll(!next);
    } finally {
      setLoadingVisible(false);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout(); // 서버 로그아웃 + 토큰 삭제 + /login 이동
    } catch (e) {
      console.error(e);
    } finally {
      setLoggingOut(false);
    }
  };

  // 닉네임 변경 버튼 클릭 -> 모달 열기 
  const handleChangeNickname = () => {
    setNicknameModalOpen(true);
  };

  const handleSubmitNickname = async (nickname: string) => {
    if (updating) return;
    setUpdating(true);
    try {
      await updateNickname(nickname);
      alert("닉네임이 변경되었습니다!");
      // 쿼리 케시 업데이트 
      queryClient.setQueryData<UserMeResponse>(qk.auth.me, (old) =>
        old ? { ...old, name: nickname } : { name: nickname } as UserMeResponse
      );
      setNicknameModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("닉네임 변경 중 오류가 발생했습니다.");
    } finally {
      setUpdating(false);
    }
  };

  const handleWithdraw = () => {
    // 추후 회원탈퇴 API 연동 예정
  };

  const displayName = me?.name ?? '사용자님';
  const profileUrl = me?.profileImageUrl;

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
      <div className='px-8 py-4'>
        {/* 프로필 섹션 */}
        <section className="pt-9 pb-5 px-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-extrabold text-[#FF8B8B]">{displayName}</div>
              <div className="text-base text-[#A0A0A0] mt-0.5 font-medium">카카오로 로그인 중</div>
            </div>
            {profileUrl ? (
              <img
                src={profileUrl}
                alt="프로필 이미지"
                className="w-16 h-16 rounded-full object-cover border border-[#E5E5E5]"
              />
            ) : (
              // <div className="w-16 h-16 rounded-full bg-[#D9D9D9]" />
              <div className="h-16 w-16 rounded-full overflow-hidden bg-[#D9D9D9] border-2 border-[#D9D9D9]" aria-hidden >
                <GoPersonFill className="h-full w-full mt-2 text-[#bebebe]" />
              </div>
            )}
          </div>
        </section>

        <section className="border-b border-[#D9D9D9]" />

        {/* 공개 설정 + 기타 항목 */}
        <section className="pt-9 space-y-6">
          {/* 공개 스위치 */}
          <div className="flex items-center justify-between px-3">
            <span className="text-base text-[#A0A0A0] font-semibold">내게 온 메시지 모두에게 공개</span>
            <button
              type="button"
              aria-pressed={publicAll}
              onClick={handleToggleVisible}
              disabled={loadingVisible}
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

          {/* 닉네임 변경 */}
          <button
            type="button"
            onClick={handleChangeNickname}
            className="w-full px-3 text-left text-base text-[#A0A0A0] font-semibold hover:text-[#FF8B8B] transition"
          >
            닉네임 변경
          </button>

          <section className="border-b border-[#D9D9D9]" />

          {/* 로그아웃 */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full px-3 text-left text-base text-[#A0A0A0] font-semibold hover:text-[#FF8B8B] transition disabled:opacity-60"
          >
            {loggingOut ? '로그아웃 중…' : '로그아웃'}
          </button>

          {/* 회원탈퇴 */}
          <button
            type="button"
            onClick={handleWithdraw}
            className="w-full px-3 text-left text-base text-[#A0A0A0] font-semibold hover:text-[#FF8B8B] transition"
          >
            회원탈퇴
          </button>
        </section>
      </div>

      {/* 닉네임 변경 모달 */}
      <NicknameModal
        open={nicknameModalOpen}
        defaultValue={me?.name ?? displayName}
        onSubmit={handleSubmitNickname}
        onClose={() => setNicknameModalOpen(false)}
      />
    </AppLayout>
  );
}

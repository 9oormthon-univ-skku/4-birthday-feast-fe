// src/pages/subpages/AccountSettingsPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import { useLogout } from '@/features/auth/useLogout';
import { updateNickname } from '@/apis/user';
import NicknameModal from '@/features/auth/NicknameModal';
import { useMe } from '@/features/user/useMe';
import { updateBirthdayVisible, getBirthdayPeriod } from "@/apis/birthday";

const LOCAL_KEY = "bh.lastBirthdayId";

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const { logout } = useLogout();
  const [loggingOut, setLoggingOut] = useState(false);

  const { me, loading: loadingMe, refresh } = useMe();

  const [nicknameModalOpen, setNicknameModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // 공개 여부 (생일상 공개 여부)
  const [publicAll, setPublicAll] = useState<boolean>(true);
  const [loadingVisible, setLoadingVisible] = useState<boolean>(false);

  // --- 초기 공개여부 불러오기 ---
  useEffect(() => {
    const idRaw = localStorage.getItem(LOCAL_KEY);
    if (!idRaw) return;

    const birthdayId = /^\d+$/.test(idRaw) ? Number(idRaw) : idRaw;

    // 서버에서 현재 공개여부 조회용
    (async () => {
      try {
        setLoadingVisible(true);
        const data = await getBirthdayPeriod(birthdayId);
        // API가 별도의 공개여부 필드를 주지 않는 경우 기본값 유지
        // (추가되면 data.isVisible 사용)
        if ((data as any)?.isVisible !== undefined) {
          setPublicAll(Boolean((data as any).isVisible));
        }
      } catch (err) {
        console.warn("공개여부 조회 실패:", err);
      } finally {
        setLoadingVisible(false);
      }
    })();
  }, []);

  // --- 공개여부 토글 ---
  const handleToggleVisible = async () => {
    const next = !publicAll;
    setPublicAll(next);

    const idRaw = localStorage.getItem(LOCAL_KEY);
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
      // 참고: useLogout 안에서 네비게이션까지 처리하므로 여기서 alert 불필요
    } catch (e) {
      // useLogout 내부에서 실패해도 최종적으로 이동은 처리됨. 필요시 사용자 피드백만 추가
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
      setNicknameModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("닉네임 변경 중 오류가 발생했습니다.");
    } finally {
      setUpdating(false);
    }
  };

  const handleWithdraw = () => {
    //   if (confirm('정말 탈퇴하시겠어요?')) {
    //     alert('탈퇴 처리되었습니다.');
    //   }
  };

  const displayName = loadingMe ? '…' : me?.name ?? '사용자님';
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
      {/* 프로필 섹션 */}
      <section className="pt-9 pb-5 px-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-extrabold text-[#FF8B8B]">{displayName}</div>
            <div className="text-base text-[#A0A0A0] mt-0.5 font-medium">카카오로 로그인 중</div>
          </div>
          {/* 프로필 이미지 (없으면 placeholder) */}
          {profileUrl ? (
            <img
              src={profileUrl}
              alt="프로필 이미지"
              className="w-16 h-16 rounded-full object-cover border border-[#E5E5E5]"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#D9D9D9]" />
          )}
        </div>
      </section>

      <section className="border-b border-[#D9D9D9]"></section>

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

        {/* 생일한상 닉네임 변경 */}
        <button
          type="button"
          onClick={handleChangeNickname}
          className="w-full px-3 text-left text-base text-[#A0A0A0] font-semibold hover:text-[#FF8B8B] transition"
        >
          닉네임 변경
        </button>

        <section className="border-b border-[#D9D9D9]"></section>

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

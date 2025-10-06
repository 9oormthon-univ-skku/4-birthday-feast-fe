// src/pages/subpages/MyFeastQRPage.tsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import { useShareLink } from '@/features/share/useShareLink';
import { useAuth } from '@/features/auth/useAuth';

// (예시) 현재 로그인 유저의 공개용 hostId(slug)를 만들어/가져오는 함수
// 실제 프로젝트의 사용자 정보/프로필에서 가져오도록 교체하세요.
function getShareHostId(auth: ReturnType<typeof useAuth>): string | number {
  // 예: auth.user?.publicId || auth.user?.id || 'u_12345';
  // 여기선 임시로 userId 또는 디폴트 사용
  return (auth as any)?.user?.publicId ?? (auth as any)?.user?.id ?? 'u_12345';
}

export default function MyFeastQRPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  // 공유할 대상 hostId (본인)
  const hostId = getShareHostId(auth);

  // ✅ useShareLink로 /feast/:hostId URL 생성 + 공유/복사 액션 사용
  const { url: shareUrl, share, copy } = useShareLink(hostId);

  // QR 이미지 (의존성 없이 외부 API 사용)
  const qrPng = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=480x480&data=${encodeURIComponent(
        shareUrl
      )}`,
    [shareUrl]
  );

  const onShare = async () => {
    try {
      await share(); // navigator.share 있으면 공유, 없으면 클립보드 복사
    } catch {
      // 사용자가 취소했거나 오류 — 무시
    }
  };

  const onDownload = () => {
    const a = document.createElement('a');
    a.href = qrPng;
    a.download = 'my-birthday-qr.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <AppLayout
      title={
        <>
          <span className="text-[#A0A0A0]">내 생일상 </span>
          <span className="text-[#FF8B8B]">큐알코드</span>
        </>
      }
      showBack
      showMenu={false}
      showBrush={false}
      footerButtonLabel="확인"
      onFooterButtonClick={() => navigate(-1)}
    >
      <section className="mt-15 mx-auto rounded-[5px] bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] p-4">
        {/* QR 박스 */}
        <div className="w-fit p-7 mx-auto rounded-md bg-white border border-[#A0A0A0]">
          {/* 고해상도 QR을 240~300px로 노출하면 선명 */}
          <img src={qrPng} alt="내 생일상 QR" className="block w-[240px] h-[240px]" />
        </div>

        {/* 공유 URL 미리보기 */}
        <p className="mt-4 text-center text-xs text-gray-500 break-all">{shareUrl}</p>

        {/* 액션 버튼들 */}
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            onClick={onShare}
            className="w-14 h-14 rounded-full bg-[#FF8B8B] text-white shadow-md active:scale-95 transition flex items-center justify-center"
            aria-label="공유"
            title="공유"
          >
            {shareIcon}
          </button>

          <button
            onClick={onDownload}
            className="w-14 h-14 rounded-full bg-[#FF8B8B] text-white shadow-md active:scale-95 transition flex items-center justify-center"
            aria-label="다운로드"
            title="다운로드"
          >
            {downloadIcon}
          </button>
        </div>
      </section>
    </AppLayout>
  );
}

// ------------ 아이콘 svg -----------
const shareIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 22 24" fill="none">
    <path d="M17.5 23.0002C19.3226 23.0002 20.8 21.5228 20.8 19.7003C20.8 17.8778 19.3226 16.4004 17.5 16.4004C15.6774 16.4004 14.2 17.8778 14.2 19.7003C14.2 21.5228 15.6774 23.0002 17.5 23.0002Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17.5 7.59983C19.3226 7.59983 20.8 6.1224 20.8 4.29991C20.8 2.47743 19.3226 1 17.5 1C15.6774 1 14.2 2.47743 14.2 4.29991C14.2 6.1224 15.6774 7.59983 17.5 7.59983Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.30002 15.299C6.12257 15.299 7.60004 13.8217 7.60004 11.9991C7.60004 10.1766 6.12257 8.69922 4.30002 8.69922C2.47747 8.69922 1 10.1766 1 11.9991C1 13.8217 2.47747 15.299 4.30002 15.299Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.7501 5.9502L7.05005 10.3501" stroke="white" strokeWidth="2" />
    <path d="M7.05005 13.6504L14.7501 18.0503" stroke="white" strokeWidth="2" />
  </svg>
);

const downloadIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="25" viewBox="0 0 19 25" fill="none">
    <path d="M1 23.6667H18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.50008 1V18M9.50008 18L14.4584 13.0417M9.50008 18L4.54175 13.0417" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);


import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';

/** 공유할 실제 URL을 정하세요. 필요에 맞게 수정 */
const makeShareUrl = () => {
  const base = window.location.origin;
  return `${base}/birthday`;
};

export default function MyFeastQRPage() {
  const navigate = useNavigate();

  // QR 이미지 URL (외부 QR 이미지 엔진 사용: 의존성 없이 바로 동작)
  const shareUrl = useMemo(makeShareUrl, []);
  const qrPng = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=480x480&data=${encodeURIComponent(
        shareUrl
      )}`,
    [shareUrl]
  );

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: '내 생일상',
          text: '제 생일상을 공유합니다 🎉',
          url: shareUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        alert('링크를 클립보드에 복사했어요!');
      } else {
        prompt('아래 링크를 복사하세요', shareUrl);
      }
    } catch {
      // 사용자가 취소했거나 공유 실패
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
          {/* 고해상도 이미지를 240px로 보여주기 (선명도 ↑) */}
          <img
            src={qrPng}
            alt="내 생일상 QR"
            className="block"
          />
        </div>

        {/* 액션 버튼들 */}
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            onClick={onShare}
            className="w-14 h-14 rounded-full bg-[#FF8B8B] text-white shadow-md active:scale-95 transition flex items-center justify-center"
            aria-label="공유"
            title="공유"
          >
            {share}
          </button>

          <button
            onClick={onDownload}
            className="w-14 h-14 rounded-full bg-[#FF8B8B] text-white shadow-md active:scale-95 transition flex items-center justify-center"
            aria-label="다운로드"
            title="다운로드"
          >
            {download}
          </button>
        </div>
      </section>
    </AppLayout>
  );
}

// ------------ 아이콘 svg -----------
const share = <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 22 24" fill="none">
  <path d="M17.5 23.0002C19.3226 23.0002 20.8 21.5228 20.8 19.7003C20.8 17.8778 19.3226 16.4004 17.5 16.4004C15.6774 16.4004 14.2 17.8778 14.2 19.7003C14.2 21.5228 15.6774 23.0002 17.5 23.0002Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M17.5 7.59983C19.3226 7.59983 20.8 6.1224 20.8 4.29991C20.8 2.47743 19.3226 1 17.5 1C15.6774 1 14.2 2.47743 14.2 4.29991C14.2 6.1224 15.6774 7.59983 17.5 7.59983Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M4.30002 15.299C6.12257 15.299 7.60004 13.8217 7.60004 11.9991C7.60004 10.1766 6.12257 8.69922 4.30002 8.69922C2.47747 8.69922 1 10.1766 1 11.9991C1 13.8217 2.47747 15.299 4.30002 15.299Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M14.7501 5.9502L7.05005 10.3501" stroke="white" strokeWidth="2" />
  <path d="M7.05005 13.6504L14.7501 18.0503" stroke="white" strokeWidth="2" />
</svg>

const download = <svg xmlns="http://www.w3.org/2000/svg" width="19" height="25" viewBox="0 0 19 25" fill="none">
  <path d="M1 23.6667H18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M9.50008 1V18M9.50008 18L14.4584 13.0417M9.50008 18L4.54175 13.0417" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
</svg>

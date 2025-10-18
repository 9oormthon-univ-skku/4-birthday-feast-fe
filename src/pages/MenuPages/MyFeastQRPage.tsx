// src/pages/subpages/MyFeastQRPage.tsx
// src/pages/subpages/MyFeastQRPage.tsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import { useShareLink } from "@/hooks/useShareLink";
import { useFeastThisYear } from "@/hooks/useFeastThisYear";

export default function MyFeastQRPage() {
  const navigate = useNavigate();

  // 올해 생일상 정보 로드 (code 사용)
  const { data: feast, loading } = useFeastThisYear(); // { userId, birthdayId, code, ... }

  const { url: shareUrl, share } = useShareLink(feast?.code);

  // QR 이미지 (code 준비 전이면 빈 문자열 → img는 안 그려짐)
  const qrPng = useMemo(() => {
    if (!shareUrl) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=480x480&data=${encodeURIComponent(
      shareUrl
    )}`;
  }, [shareUrl]);

  const onShare = async () => {
    try {
      await share(); // navigator.share 지원 시 시스템 공유, 미지원 시 클립보드 복사
    } catch {
      // 사용자가 취소했거나 오류 → 무시
    }
  };

  const onDownload = () => {
    if (!qrPng) return;
    const a = document.createElement("a");
    a.href = qrPng;
    a.download = "my-birthday-qr.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const disabled = loading;

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
          {/* code 준비 전이면 이미지 렌더 안 함 */}
          {qrPng ? (
            <img
              src={qrPng}
              alt="내 생일상 QR"
              className="block w-[240px] h-[240px]"
            />
          ) : (
            <div className="w-[240px] h-[240px] flex items-center justify-center text-xs text-gray-400">
              링크 준비 중…
            </div>
          )}
        </div>

        {/* 공유 URL 미리보기 */}
        <p className="mt-4 text-center text-xs text-gray-500 break-all">
          {shareUrl || "링크 준비 중…"}
        </p>

        {/* 액션 버튼들 */}
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            onClick={onShare}
            disabled={disabled}
            className={`w-14 h-14 rounded-full bg-[#FF8B8B] text-white shadow-md active:scale-95 transition flex items-center justify-center ${disabled ? "opacity-50 cursor-not-allowed active:scale-100" : ""
              }`}
            aria-label="공유"
            title={disabled ? "링크 준비 중" : "공유"}
          >
            {shareIcon}
          </button>

          <button
            onClick={onDownload}
            disabled={disabled}
            className={`w-14 h-14 rounded-full bg-[#FF8B8B] text-white shadow-md active:scale-95 transition flex items-center justify-center ${disabled ? "opacity-50 cursor-not-allowed active:scale-100" : ""
              }`}
            aria-label="다운로드"
            title={disabled ? "링크 준비 중" : "다운로드"}
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

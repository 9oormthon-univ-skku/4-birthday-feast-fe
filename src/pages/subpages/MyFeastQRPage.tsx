// src/pages/subpages/MyQRCodePage.tsx
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';

/**
 * 공유할 실제 URL을 정하세요.
 * 예: `/share/:userId` 등으로 변경 가능
 */
const makeShareUrl = () => {
  const base = window.location.origin;
  return `${base}/birthday`; // 필요에 맞게 수정
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
    <div className="min-h-screen bg-white">
      <Header
        showBack
        showMenu={false}
        showBrush={false}
        title={
          <>
            <span className="text-[#A0A0A0]">내 생일상 </span>
            <span className="text-[#FF8B8B]">큐알코드</span>
          </>
        }
      />

      <main className="mx-[60px] max-w-md px-4 pb-28">
        <section className="mt-2 rounded-xl border border-[#EFD9C6] bg-white shadow-sm p-5">
          {/* QR 박스 */}
          <div className="mx-auto rounded-md border border-[#EFD9C6] bg-white p-4 w-fit">
            {/* 고해상도 이미지를 240px로 보여주기 (선명도 ↑) */}
            <img
              src={qrPng}
              alt="내 생일상 QR"
              width={240}
              height={240}
              className="block"
            />
          </div>

          {/* 액션 버튼들 */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={onShare}
              className="w-11 h-11 rounded-full bg-[#FF8B8B] text-white shadow-md active:scale-95 transition flex items-center justify-center"
              aria-label="공유"
              title="공유"
            >
              {/* share 아이콘 (인라인 SVG) */}
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M18 16a3 3 0 0 0-2.816 1.973L8.91 14.94a3.005 3.005 0 0 0 0-1.879l6.274-3.033A3 3 0 1 0 14 7a2.98 2.98 0 0 0 .09.732L7.816 10.76a3 3 0 1 0 0 4.48l6.274 3.028A3 3 0 1 0 18 16Z"/>
              </svg>
            </button>

            <button
              onClick={onDownload}
              className="w-11 h-11 rounded-full bg-[#FF8B8B] text-white shadow-md active:scale-95 transition flex items-center justify-center"
              aria-label="다운로드"
              title="다운로드"
            >
              {/* download 아이콘 (인라인 SVG) */}
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 3a1 1 0 0 1 1 1v8.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4A1 1 0 1 1 8.707 10.293L11 12.586V4a1 1 0 0 1 1-1Zm-7 14a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z"/>
              </svg>
            </button>
          </div>
        </section>
      </main>

      {/* 하단 고정 CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EFD9C6]">
        <div className="mx-[60px] max-w-md px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3.5 rounded-xl bg-[#FF8B8B] text-white font-bold shadow-md active:scale-[0.98] transition"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 14px)' }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

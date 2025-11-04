import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/ui/AppLayout';
import MainFeast from '@/features/message/MainFeast';
import { useAllBirthdays } from '@/hooks/useAllBirthdays';
import { BirthdayCardLike } from '@/types/birthday';
import MessagePage from '../MainHome/MessagePage';

export default function HistoryPage() {
  const navigate = useNavigate();

  const {
    data: mapped = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAllBirthdays();
  // ✅ 메시지 뷰 로컬 상태
  const [viewer, setViewer] = useState<{
    open: boolean;
    cards: BirthdayCardLike[];
    initialIndex: number;
  }>({ open: false, cards: [], initialIndex: 0 });

  const openMessages = (cards: BirthdayCardLike[], initialIndex = 0) =>
    setViewer({ open: true, cards, initialIndex });

  const closeMessages = () => setViewer(v => ({ ...v, open: false }));

  if (isLoading) {
    return (
      <AppLayout
        showBack
        showMenu={false}
        showBrush={false}
        title={
          <>
            <span className="text-[#A0A0A0]">지난 생일상 </span>
            <span className="text-[#FF8B8B]">모아보기</span>
          </>
        }
        footerButtonLabel="확인"
        onFooterButtonClick={() => navigate(-1)}
      >
        <div className="px-8 py-6 text-sm text-gray-500 text-center">불러오는 중...</div>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout
        showBack
        showMenu={false}
        showBrush={false}
        title={
          <>
            <span className="text-[#A0A0A0]">지난 생일상 </span>
            <span className="text-[#FF8B8B]">모아보기</span>
          </>
        }
        footerButtonLabel="다시 시도"
        onFooterButtonClick={() => refetch()}
      >
        <div className="px-8 py-6 text-sm text-red-500">
          생일상 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </div>
      </AppLayout>
    );
  }
  const isEmpty = mapped.length === 0;

  // ✅ 메시지 페이지를 라우팅 없이 바로 렌더
  if (viewer.open) {
    return (
      <MessagePage // 🎂 추가 
        cards={viewer.cards}
        initialIndex={viewer.initialIndex}
        onClose={closeMessages}   // 뒤로/푸터 모두 닫기 동작
      />
    );
  }


  return (
    <AppLayout
      showBack
      showMenu={false}
      showBrush={false}
      title={
        <>
          <span className="text-[#A0A0A0]">지난 생일상 </span>
          <span className="text-[#FF8B8B]">모아보기</span>
        </>
      }
      footerButtonLabel="확인"
      onFooterButtonClick={() => navigate(-1)}
    >
      <div className="px-7 py-6">
        {isEmpty ? (
          <div className="my-10 text-center text-sm text-gray-400">
            아직 지난 생일상이 없어요.
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4">
            {mapped.map((b) => {
              const cardCount = b._cards.length;
              // const firstMsg = b._cards[0]?.message ?? '';
              // const dateText = `코드 ${b.code}`; // 추후 수정 필요(api 반환값 필요)
              const dateText = "2025.08.28"; // 하드코딩 

              return (
                <li
                  key={String(b.birthdayId)}
                  role="button"
                  tabIndex={0}
                  onClick={() => openMessages(b._cards, 0)} //  바로 오픈
                  className="rounded-xs bg-white shadow-[0px_0px_1.9083333015441895px_0px_rgba(0,0,0,0.50)] overflow-hidden"
                >
                  {/* MainFeast 영역 */}
                  <div
                    className="relative w-[90%] mx-auto mt-[5%] bg-[#fff4df] flex items-center justify-center overflow-hidden"
                    style={{ aspectRatio: '156/229' }}
                  >
                    <div className="!w-full !h-full pt-[80%]">
                      <MainFeast
                        hideQuizButton={true}
                        cards={b._cards}
                      />
                    </div>

                  </div>

                  {/* 메타/캡션 */}
                  <div className="px-3 py-2">
                    <div className="text-base font-normal font-['KoreanSWGIG3'] text-[#FF8B8B]">
                      {dateText}
                    </div>
                    <div className="text-[11px] text-[#BFBFBF] font-semibold">
                      {cardCount}개의 메시지
                      {/* {firstMsg
                        ? ` · ${firstMsg.slice(0, 28)}${firstMsg.length > 28 ? '…' : ''}`
                        : ''} */}
                    </div>
                  </div>
                </li>

              );
            })}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}

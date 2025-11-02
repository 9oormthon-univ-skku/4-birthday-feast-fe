import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/ui/AppLayout';
import MainFeast from '@/features/message/MainFeast';
import { useAllBirthdays } from '@/hooks/useAllBirthdays';

export default function HistoryPage() {
  const navigate = useNavigate();

  const {
    data: mapped = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAllBirthdays();

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
        <div className="px-8 py-6 text-sm text-gray-500">불러오는 중...</div>
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
      <div className="px-8 py-4">
        {isEmpty ? (
          <div className="my-10 text-center text-sm text-gray-400">
            아직 지난 생일상이 없어요.
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 my-5">
            {mapped.map((b) => {
              const cardCount = b._cards.length;
              const firstMsg = b._cards[0]?.message ?? '';
              const dateText = `코드 ${b.code}`;

              return (
                <li
                  key={String(b.birthdayId)}
                  className="rounded-xs bg-white shadow-[0px_0px_1.9083333015441895px_0px_rgba(0,0,0,0.50)] overflow-hidden"
                >
                  {/* MainFeast 영역 */}
                  <div
                    className="relative w-[90%] mx-auto mt-[5%] bg-[#fff4df] flex items-center justify-center overflow-hidden"
                    style={{ aspectRatio: '150/220' }}
                  >
                    <MainFeast
                      hideQuizButton={true}
                      cards={b._cards}
                      className="!w-full !h-full pt-[80%]"
                    />
                  </div>

                  {/* 메타/캡션 */}
                  <div className="px-3 py-2">
                    <div className="text-xs font-normal font-['KoreanSWGIG3'] text-[#FF8B8B]">
                      {dateText}
                    </div>
                    <div className="text-[8px] text-[#BFBFBF]">
                      {cardCount}개의 메시지
                      {firstMsg
                        ? ` · ${firstMsg.slice(0, 28)}${firstMsg.length > 28 ? '…' : ''}`
                        : ''}
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

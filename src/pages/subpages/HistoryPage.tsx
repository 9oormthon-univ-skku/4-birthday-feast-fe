import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';

type PastItem = {
  id: number;
  date: string;     // YYYY.MM.DD
  caption: string;  // 짧은 설명
  img?: string;     // 이미지 경로
};

// 더미 데이터 (img 는 직접 삽입해서 교체하세요)
const items: PastItem[] = [
  { id: 1, date: '2019.03.11', caption: '사진에 적힐 메시지를 적어주세요.' },
  { id: 2, date: '2020.03.11', caption: '사진에 적힐 메시지를 적어주세요.' },
  { id: 3, date: '2021.03.11', caption: '사진에 적힐 메시지를 적어주세요.' },
  { id: 4, date: '2022.03.11', caption: '사진에 적힐 메시지를 적어주세요.' },
  { id: 5, date: '2023.03.11', caption: '사진에 적힐 메시지를 적어주세요.' },
  { id: 6, date: '2024.03.11', caption: '사진에 적힐 메시지를 적어주세요.' },
];

export default function HistoryPage() {
  const navigate = useNavigate();

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

      {/* 2열 그리드 */}
      <ul className="grid grid-cols-2 gap-4 my-7">
        {items.map((it) => (
          <li
            key={it.id}
            className="rounded-xs bg-white shadow-[0px_0px_1.9083333015441895px_0px_rgba(0,0,0,0.50)] overflow-hidden"
          >
            {/* 이미지 영역 이미지는 직접 넣기(it.img) */}
            <div className="w-[90%] h-[80%] mt-[5%] mx-auto bg-gray-200" style={{ aspectRatio: '150/220' }}>
              {it.img && (
                <img
                  src={it.img}
                  alt={`${it.date} 생일상`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* 캡션 */}
            <div className="px-3 py-2">
              <div className="text-xs font-normal font-['KoreanSWGIG3'] text-[#FF8B8B]">
                {it.date}
              </div>
              <div className="text-[8px] text-[#BFBFBF]">
                {it.caption}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </AppLayout>
  );
}

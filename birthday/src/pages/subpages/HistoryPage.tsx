// src/pages/subpages/PastBirthdayListPage.tsx
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';

type PastItem = {
  id: number;
  date: string;     // YYYY.MM.DD
  caption: string;  // 짧은 설명
  img?: string;     // 이미지 경로 (직접 채워 넣으세요)
};

// 🔧 더미 데이터 (img 는 직접 삽입해서 교체하세요)
const items: PastItem[] = [
  { id: 1, date: '2019.03.11', caption: '사진 한 장에 담아두었죠.' },
  { id: 2, date: '2020.03.11', caption: '사진 한 장에 담아두었죠.' },
  { id: 3, date: '2021.03.11', caption: '사진 한 장에 담아두었죠.' },
  { id: 4, date: '2022.03.11', caption: '사진 한 장에 담아두었죠.' },
  { id: 5, date: '2023.03.11', caption: '사진 한 장에 담아두었죠.' },
  { id: 6, date: '2024.03.11', caption: '사진 한 장에 담아두었죠.' },
];

export default function HistoryPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더: 메인과 동일 크기/폰트, 뒤로가기 */}
      <Header
        showBack
        showMenu={false}
        showBrush={false}
        title={
          <>
            <span className="text-[#A0A0A0]">지난 생일상 </span>
            <span className="text-[#FF8B8B]">모아보기</span>
          </>
        }
      />

      <main className="mx-[60px] max-w-md px-4 pb-28">
        {/* 상단 구분선 */}
        <div className="h-[1px] bg-[#EFD9C6] mb-4" />

        {/* 2열 그리드 */}
        <ul className="grid grid-cols-2 gap-4">
          {items.map((it) => (
            <li
              key={it.id}
              className="rounded-xl border border-[#EFD9C6] bg-white shadow-sm overflow-hidden"
            >
              {/* 이미지 영역: 3:4 비율 - 이미지는 직접 넣으세요(it.img) */}
              <div
                className="w-full bg-[#F8F8F8]"
                style={{ aspectRatio: '3 / 4' }}
              >
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
                <div className="text-[12px] font-semibold text-[#FF8B8B]">
                  {it.date}
                </div>
                <div className="text-[12px] text-[#8A8A8A]">
                  {it.caption}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </main>

      {/* 하단 고정 버튼 */}
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

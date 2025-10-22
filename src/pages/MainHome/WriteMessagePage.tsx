// src/pages/MessageComposePage.tsx
import React, { useMemo, useState } from 'react';
import AppLayout from '@/ui/AppLayout';
import Modal from '@/ui/Modal';
import { useNavigate } from 'react-router-dom';

// 아이콘 에셋 ...
import food1 from '@/assets/images/food-1.svg';
import food2 from '@/assets/images/food-2.svg';
import food3 from '@/assets/images/food-3.svg';
import food4 from '@/assets/images/food-4.svg';
import food5 from '@/assets/images/food-5.svg';
import food6 from '@/assets/images/food-6.svg';

// 🔸 로컬스토리지 관련 타입/유틸 추가
type StoredMessage = {
  id: string;
  text: string;
  iconId: string;
  nickname?: string;
  createdAt: number; // epoch ms
};

const STORAGE_KEY = 'birthday_messages';

function readMessages(): StoredMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMessages(list: StoredMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // 용량 초과 등 쓰기 실패는 조용히 무시
  }
}

export default function WriteMessagePage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [selectedId, setSelectedId] = useState<string>('food-1');
  const [doneOpen, setDoneOpen] = useState(false);

  const maxLen = 300;
  const disabled = message.trim().length === 0;

  // 2~3줄 그리드가 되도록
  const icons = useMemo(
    () => [
      { id: 'food-1', src: food1, alt: '디저트 1' },
      { id: 'food-2', src: food2, alt: '디저트 2' },
      { id: 'food-3', src: food3, alt: '디저트 3' },
      { id: 'food-4', src: food4, alt: '디저트 4' },
      { id: 'food-5', src: food5, alt: '디저트 5' },
      { id: 'food-6', src: food6, alt: '디저트 6' },
    ],
    []
  );

  const handleSubmit = () => {
    if (disabled) return;

    // 닉네임, 이미지 경로 가져오기
    const nickname = localStorage.getItem('bh.visitor.nickname') || '익명';
    const icon = icons.find((it) => it.id === selectedId);

    // 🎯 저장할 구조: birthdayCardId / message / nickname / imageUrl
    const newCard = {
      birthdayCardId: crypto?.randomUUID?.() ?? Date.now(),
      message: message.trim(),
      nickname,
      imageUrl: icon?.src || '',
    };

    // 기존 목록 불러오기
    const STORAGE_KEY = 'birthday_cards';
    const prevList = (() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })();

    // 새 항목 추가 (최신순)
    const nextList = [newCard, ...prevList].slice(0, 200);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
    } catch (e) {
      console.error('⚠️ 저장 실패', e);
    }

    console.log(newCard);
    setDoneOpen(true);
  };


  return (
    <AppLayout
      showBack
      showMenu={false}
      showBrush={false}
      title={
        <span className="text-2xl font-normal leading-none">
          <span className="text-[#FF8B8B]">생일 메시지</span>{' '}
          <span className="text-[#A0A0A0]">작성하기</span>
        </span>
      }
      footerButtonLabel="메시지 남기기"
      onFooterButtonClick={handleSubmit}
      footerButtonDisabled={disabled}
    >
      <div className='w-full px-8 py-4'>
        {/* 안내문 */}
        <p className="mb-4 text-[13px] leading-5 text-neutral-400">
          생일 메시지는 14일 전부터 등록할 수 있으며
          <br className="sm:hidden" />
          생일 당일에 공개됩니다.
        </p>

        {/* 입력 박스 */}
        <label htmlFor="message" className="sr-only">
          생일 메시지를 작성해주세요.
        </label>
        <div className="rounded-[10px] border border-neutral-200 bg-[#F7F7F7] p-3">
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, maxLen))}
            placeholder="생일 메시지를 작성해주세요."
            className="h-40 w-full resize-none bg-transparent text-[14px] leading-relaxed placeholder:text-neutral-400 focus:outline-none"
            maxLength={maxLen}
          />
        </div>
        <div className="mt-1 text-right text-[11px] text-neutral-400">
          {message.length}/{maxLen}
        </div>

        {/* 아이콘 그리드 */}
        <div className="mt-5 grid grid-cols-3 gap-x-6 gap-y-4">
          {icons.map((it) => {
            const active = selectedId === it.id;
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => setSelectedId(it.id)}
                className={[
                  'flex h-20 w-20 items-center justify-center rounded-[12px] transition',
                  active ? 'ring-1 ring-[#FF8B8B] bg-white' : 'ring-1 ring-neutral-200 bg-white/60 hover:bg-white',
                ].join(' ')}
                aria-pressed={active}
              >
                <img src={it.src} alt={it.alt} className="h-12 w-auto object-contain" loading="lazy" />
              </button>
            );
          })}
        </div>

        {/* 완료 모달 */}
        <Modal
          open={doneOpen}
          type="alert"
          message="생일 메시지를 남겼습니다."
          confirmText="확인"
          onConfirm={() => {
            setDoneOpen(false);
            setMessage('');
            navigate(-1);
          }}
          onClose={() => setDoneOpen(false)}
        />
      </div>

    </AppLayout>
  );
}

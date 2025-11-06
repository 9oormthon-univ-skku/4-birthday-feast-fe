// 게스트 전용 메시지 입력 페이지 (API 이미지 + 로컬 폴백) 
// 추후 로컬 폴백 이미지 삭제 (api 있어야 create payload 작성 가능함..)

// TODO: createGuestCard 추가하기
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  type GuestCardCreateReq, createGuestCard,
  getGuestImages, type GuestImage
} from '@/apis/guest';
import AppLayout from '@/ui/AppLayout';
import Modal from '@/ui/Modal';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';

// 더미 에셋 (폴백)
import food1 from '@/assets/images/food-1.svg';
import food2 from '@/assets/images/food-2.svg';
import food3 from '@/assets/images/food-3.svg';
import food4 from '@/assets/images/food-4.svg';
import food5 from '@/assets/images/food-5.svg';
import food6 from '@/assets/images/food-6.svg';

// 세션스토리지 드래프트 키
const SS_GUEST_CARD_DRAFT = 'bh.guest.cardDraft';

// 아이콘 공통 타입
type IconItem = { id: string; src: string; alt: string };

export default function WriteMessagePage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [selectedId, setSelectedId] = useState<string>('food-1');
  const [doneOpen, setDoneOpen] = useState(false); // 메시지 전송 완료 모달
  const [errorOpen, setErrorOpen] = useState<string | null>(null);

  const maxLen = 300;

  // 1) 로컬 폴백 아이콘 (추후 수정!, UI 표시용)
  const fallbackIcons: IconItem[] = useMemo(
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

  // 2) API에서 이미지 목록 받아오기 (TanStack Query)
  const { data } = useQuery<GuestImage[]>({
    queryKey: ['guestImages'],
    queryFn: getGuestImages,
    // staleTime: 1000 * 60 * 10, // 10분
    retry: 1,
  });

  // 3) 서버에서 가져온 이미지를 아이콘 포맷으로 변환
  const apiIcons: IconItem[] = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((g, idx) => ({
      id: String(g.imageId),
      src: g.imageUrl,
      alt: `카드 이미지 ${idx + 1}`,
    }));
  }, [data]);

  // 4) 최종 아이콘 소스 (서버 우선, 실패/빈배열 시 폴백)
  const icons: IconItem[] = apiIcons.length > 0 ? apiIcons : fallbackIcons;

  // 최초 로드나 데이터 변경으로 현재 선택된 id가 목록에 없으면 첫 번째로 맞춤
  useEffect(() => {
    if (icons.length === 0) return;
    if (!icons.some((i) => i.id === selectedId)) {
      setSelectedId(icons[0].id);
    }
  }, [icons, selectedId]);

  // 드래프트 복원 (한 번만)
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    if (icons.length === 0) return;

    try {
      const raw = sessionStorage.getItem(SS_GUEST_CARD_DRAFT);
      if (raw) {
        const draft = JSON.parse(raw) as GuestCardCreateReq;
        if (typeof draft?.messageText === 'string') {
          setMessage(draft.messageText.slice(0, maxLen));
        }
        // draft.imageUrl이 현재 아이콘에 있으면 해당 아이콘 선택
        if (draft?.imageUrl) {
          const match = icons.find((it) => it.src === draft.imageUrl);
          if (match) setSelectedId(match.id);
        }
      }
    } catch {
      // 무시
    } finally {
      restoredRef.current = true;
    }
  }, [icons, maxLen]);

  // 드래프트 자동 저장 (message/selectedId 변경 시)
  useEffect(() => {
    const icon = icons.find((it) => it.id === selectedId);
    const draft: GuestCardCreateReq = {
      messageText: message.trim(),
      imageUrl: icon?.src ?? "",
    };
    try {
      sessionStorage.setItem(SS_GUEST_CARD_DRAFT, JSON.stringify(draft));
    } catch {
      // 세션 용량 초과 등은 무시
    }
  }, [message, selectedId, icons]);

  // 서버 등록 뮤테이션
  const { mutate, isPending } = useMutation({
    mutationFn: (body: GuestCardCreateReq) => createGuestCard(body),
    onSuccess: () => {
      try {
        sessionStorage.removeItem(SS_GUEST_CARD_DRAFT);
      } catch { }
      setDoneOpen(true);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        '일시적인 오류로 생일 메시지를 등록하지 못했어요.';
      setErrorOpen(msg);
    },
  });

  // ✋ 제출 가드: 메시지 + API 이미지가 있어야 함
  const isApiSelected = apiIcons.some((i) => i.id === selectedId);
  const disabled = message.trim().length === 0; // 임시, 실제 운영 시 이미지 로컬폴백 삭제, 아래 조건으로 강화하기 
  // const disabled = message.trim().length === 0 || !isApiSelected || isPending;

  const handleSubmit = () => {
    if (disabled) return;

    // 현재 상태를 GuestCardCreateReq 형태로 세션 드래프트에 보관
    const icon = icons.find((it) => it.id === selectedId);
    const draft: GuestCardCreateReq = {
      messageText: message.trim(),
      imageUrl: icon?.src ?? "",
    };

    // API 이미지가 없으면 방어
    if (!isApiSelected) {
      alert('생일 메시지를 정상적으로 등록하지 못했습니다.\n네트워크 연결을 확인한 후 다시 시도해주세요.');
      return;
    }

    try {
      sessionStorage.setItem(SS_GUEST_CARD_DRAFT, JSON.stringify(draft));
    } catch { }
    mutate(draft);

    // TODO: createGuestCard(draft) 호출로 서버 저장 연동
    // setDoneOpen(true);
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
        <div className="mt-5">
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
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
        {/* 에러 모달 */}
        {/* <Modal
          open={!!errorOpen}
          type="alert"
          message={errorOpen ?? ''}
          confirmText="확인"
          onConfirm={() => setErrorOpen(null)}
          onClose={() => setErrorOpen(null)}
        /> */}
      </div>
    </AppLayout>
  );
}

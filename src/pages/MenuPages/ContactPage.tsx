// src/pages/subpages/ContactPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../ui/AppLayout';

export default function ContactPage() {
  const navigate = useNavigate();
  const email = 'asy030303@daum.net';

  return (
    <AppLayout
      title={<span className="text-[#FF8B8B]">문의하기</span>}
      showBack
      showMenu={false}
      showBrush={false}
      footerButtonLabel="확인"
      onFooterButtonClick={() => navigate(-1)}
    >
      <div className="mx-auto px-12 py-10">
        <p className="text-base leading-5 text-[#A0A0A0]">
          문제를 겪고 계신가요?
          <br />
          <a
            href={`mailto:${email}`}
            className="underline hover:text-[#FF8B8B]"
          >
            {email}
          </a>
          으로 연락해주세요.
        </p>
      </div>
    </AppLayout>
  );
}

// src/pages/subpages/TeamAboutPage.tsx
import React from 'react';
import AppLayout from '../../ui/AppLayout';
import { useNavigate } from 'react-router-dom';

type Member = { name: string; school: string; email: string };

const sections: { title: string; members: Member[] }[] = [
  {
    title: '기획',
    members: [
      { name: '안서연', school: '한국예술종합학교', email: 'asy030303@daum.net' },
    ],
  },
  {
    title: '디자인',
    members: [
      { name: '최윤정', school: '한국예술종합학교', email: '0311yunjung@gmail.com' },
    ],
  },
  {
    title: '프론트엔드',
    members: [
      { name: '김예진', school: '성균관대학교', email: 'twjindev@gmail.com' },
    ],
  },
  {
    title: '백엔드',
    members: [
      { name: '강지혜', school: '성균관대학교', email: 'rosa10984595@gmail.com' },
      { name: '김은서', school: '성균관대학교', email: 'edgexpand@g.skku.edu' },
    ],
  },
];

export default function TeamAboutPage() {
  const navigate = useNavigate();

  return (
    <AppLayout
      title={
        <>
          <span className="text-[#A0A0A0]">생일한상 </span>
          <span className="text-[#FF8B8B]">팀 소개</span>
        </>
      }
      showBack
      showMenu={false}
      showBrush={false}
      footerButtonLabel="확인"
      onFooterButtonClick={() => navigate(-1)}
    >
      <div className="mx-auto p-1">
        <p className="px-3 mt-6 mb-11 text-base leading-5 font-medium text-[#A0A0A0] break-keep">
          생일한상은 성균관대학교와 한국예술종합학교 연합이 제작한
          생일 축하 앱 개발 프로젝트입니다.
        </p>

        <hr className="border-[#D9D9D9]" />

        {sections.map((sec) => (
          <section key={sec.title} className="my-11">
            <h2 className="text-[#FF8B8B] font-extrabold text-xl mb-4">{sec.title}</h2>
            <ul className="space-y-3">
              {sec.members.map((m) => (
                <li key={m.email} className="text-base leading-5">
                  <div className="text-[#555] font-medium">
                    {m.name} <span className="text-[#A0A0A0]">| {m.school}</span>
                  </div>
                  <div className="text-[#A0A0A0]">
                    <a href={`mailto:${m.email}`} className="hover:underline">
                      {m.email}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </AppLayout>
  );
}

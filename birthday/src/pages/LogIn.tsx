// src/pages/LogIn.tsx
import React from 'react';

const LogIn = () => {
  return (
    <div className="relative w-screen h-screen bg-[#FFFFFF] overflow-hidden">
      <h1
        className="absolute left-1/2 -translate-x-1/2
                  text-[127px] leading-none text-center text-[#FF8B8B]
                  whitespace-nowrap"
        style={{
          top: '25.17%',
          fontFamily: 'KoreanSWGIG1, Pretendard, sans-serif',
        }}
      >
        생일한상
      </h1>
      <p
        className="absolute left-1/2 -translate-x-1/2 
                  text-[40px] leading-none text-center text-[#FF8B8B]"
        style={{
          top: '37.75%',
          fontFamily: 'KoreanSWGIG1, Pretendard, sans-serif',
          lineHeight: '46px', // Figma 상 전체 텍스트 높이
        }}
      >
        멀리 있어도 함께하는<br />디지털 생일상
      </p>
      <button
        className="absolute left-1/2 -translate-x-1/2 
                  w-[684px] h-[100px] bg-[#FF8B8B] rounded-[10px] text-[#FFFFFF] text-[32px] 
                  border-none"
        style={{
          top: '86.49%',
          fontFamily: 'Pretendard, sans-serif',
        }}
      >
        카카오톡으로 계속하기
      </button>


    </div>
  );
};

export default LogIn;

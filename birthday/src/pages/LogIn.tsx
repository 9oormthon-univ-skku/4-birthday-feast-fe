// src/pages/LogIn.tsx
import React from 'react';

const LogIn = () => {
  return (
    <div className="w-screen h-screen relative overflow-hidden">

      <h1
        className="absolute left-1/2 -translate-x-1/2 
                  text-[64px] leading-none text-center font-normal text-[#FF8B8B]"
        style={{
          top: '25.1%',
          fontFamily: 'KoreanSWGIG1, Pretendard, sans-serif',
        }}
      >
        생일한상
      </h1>
      <p
        className="absolute left-1/2 -translate-x-1/2 
                  text-[20px] leading-none text-center font-normal text-[#FF8B8B]"
        style={{
          top: '37.7%',
          fontFamily: 'KoreanSWGIG1, Pretendard, sans-serif',
        }}
      >
        멀리 있어도 함께하는<br />디지털 생일상
      </p>
      <button
        className="absolute left-1/2 -translate-x-1/2 
                  w-[342px] h-[50px] 
                  bg-[#FF8B8B] text-white 
                  rounded-[5px]
                  text-[16px] font-medium
                  flex items-center justify-center
                "
        style={{
          top: '86.4%',
          fontFamily: 'Pretendard, sans-serif',
        }}
      >
        카카오톡으로 계속하기
      </button>


    </div>
  );
};

export default LogIn;

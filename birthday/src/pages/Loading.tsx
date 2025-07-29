import React from 'react';

const Loading = () => {
  return (
    <div className="w-screen h-screen bg-[#FF8B8B] relative overflow-hidden">
      <h1
        className="absolute left-1/2 -translate-x-1/2 
          text-[128px] text-[#FFEDC8] text-center"
        style={{
          top: '28.71%',
          fontFamily: 'KoreanSWGIG1, Pretendard, sans-serif',
          lineHeight: '148px', // Figma 상 전체 텍스트 높이
        }}
      >
        생일<br />한상
      </h1>
    </div>
  );
};

export default Loading;

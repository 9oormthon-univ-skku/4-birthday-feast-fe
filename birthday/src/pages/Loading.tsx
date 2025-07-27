import React from 'react';

const Loading = () => {
  return (
    <div className="w-screen h-screen relative overflow-hidden">

      {/* 중앙 텍스트 */}
      <h1
        className="absolute left-1/2 -translate-x-1/2 
                  text-[128px] leading-none text-center font-normal text-[#FFEDC8]"
        style={{
          top: '28.7%',
          fontFamily: 'KoreanSWGIG3R, Pretendard, sans-serif',
        }}
      >
        생일<br />한상
      </h1>
    </div>
  );
};

export default Loading;

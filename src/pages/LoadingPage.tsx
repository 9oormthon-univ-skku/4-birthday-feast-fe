import React from 'react';

// 스플래시 페이지
const Loading = () => {
  return (
    <div className="w-screen h-screen bg-[#FF8B8B] relative overflow-hidden">
      <h1
        className="absolute left-1/2 -translate-x-1/2 top-[28.71%]
          text-6xl text-[#FFEDC8] text-center leading-17 font-['KoreanSWGIG3']"
      >
        생일<br />한상
      </h1>
    </div>
    // 로딩 ver.2
    // <div className="w-screen h-screen bg-[#FFFFFF] relative overflow-hidden">
    //   <h1
    //     className="absolute left-1/2 -translate-x-1/2 top-[28.71%]
    //         text-6xl text-[#FF8B8B] text-center leading-17 font-['KoreanSWGIG3']"
    //   >
    //     생일<br />한상
    //   </h1>
    // </div>
  );
};

export default Loading;

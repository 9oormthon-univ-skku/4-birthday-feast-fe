import React from 'react';

// Header 더미 코드 
const Header = () => {
  return (
    <header className="w-full px-4 py-3 flex justify-between items-center bg-[#FFF6EC]">
      <h1 className="text-[#FF8B8B] text-lg font-bold">
        사용자님의 <span className="text-gray-800">생일한상</span>
      </h1>
      <button>
        <img
          src="/icons/hamburger.svg"
          alt="메뉴"
          className="w-6 h-6"
        />
      </button>
    </header>
  );
};

export default Header;

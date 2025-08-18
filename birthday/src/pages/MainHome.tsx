import React from 'react';
import Header from '../components/ui/Header';
import birthdayImg from '../assets/images/mainDummy.png';

const MainHome = () => {
  return (
    <div className="w-screen h-screen bg-[#FFFFFF] relative overflow-hidden">


      <Header/>
      <img src={birthdayImg} alt="생일한상" className="w-full max-w-sm" />

      

    </div>
  );
};

export default MainHome;

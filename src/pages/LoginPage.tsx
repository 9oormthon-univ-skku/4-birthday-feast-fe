import { useNavigate } from 'react-router-dom';
import kakaoBtn from '@/assets/images/kakao_login_large_wide.png';
import { useEffect, useState } from 'react';
import Loading from './LoadingPage';

// 더미 토큰 키 상수 (다른 곳에서도 통일해서 사용할 수 있게)
const TOKEN_KEY = 'bh.auth.token';

const Login = () => {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);

  // 2초 스플래시
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  /** 로그인 버튼 클릭 */
  const handleLogin = () => {
    // 더미 토큰 생성 (UUID-like)
    const dummyToken = `token_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    // 로컬스토리지에 저장
    localStorage.setItem(TOKEN_KEY, dummyToken);

    // 메인 페이지로 이동
    navigate('/main');
  };

  if (showSplash) return <Loading />;

  return (
    <div className="relative w-screen h-screen bg-[#FFFFFF] overflow-hidden text-[#FF8B8B] font-['KoreanSWGIG3']">
      <h1
        className="absolute left-1/2 -translate-x-1/2
                  text-6xl leading-none text-center 
                  whitespace-nowrap top-[25.17%]"
      >
        생일한상
      </h1>
      <p
        className="absolute left-1/2 -translate-x-1/2 top-[37.75%]
                  text-xl leading-6 text-center text-[#FF8B8B]"
      >
        멀리 있어도 함께하는<br />디지털 생일상
      </p>

      <img
        src={kakaoBtn}
        alt="카카오톡으로 계속하기"
        onClick={handleLogin}
        className="absolute left-1/2 -translate-x-1/2 top-[86.49%] w-80 h-12 cursor-pointer select-none"
      />
    </div>
  );
};

export default Login;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import LogIn from './pages/LogIn';
// import MainHome from './pages/MainHome';
// import BirthdayPage from './pages/BirthdayPage';
// import CreatePage from './pages/CreatePage';
import Loading from './pages/LoadingPage';
import LogIn from './pages/LoginPage';
import MainHome from './pages/MainHome';
// import Header from './ui/Header'; // 예시: 모든 페이지에 표시될 컴포넌트

function App() {
  return (
    <Router>
      {/* <Header /> */}
      <Routes>
        <Route path="/" element={<MainHome />} />

        {/* <Route path="/" element={<Login />} /> */}
        {/* <Route path="/home" element={<MainHome />} /> */}
        {/* <Route path="/birthday" element={<BirthdayPage />} /> */}
        {/* <Route path="/create" element={<CreatePage />} /> */}
        {/* <Route path="/loading" element={<Loading />} /> */}
      </Routes>
    </Router>
  );
}

export default App;

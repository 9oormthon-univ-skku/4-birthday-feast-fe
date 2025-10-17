// // src/routes/RequireAuth.tsx
// import React from "react";
// import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "@/features/auth/useAuth";


// /** 로그인 필요 페이지에서 사용: 토큰 없으면 /login 으로 이동 */
// export default function RequireAuth({ children }: { children: React.ReactElement }) {
// const { isAuthenticated } = useAuth();
// const loc = useLocation();
// if (!isAuthenticated) {
// return <Navigate to="/login" replace state={{ from: loc }} />;
// }
// return children;
// }
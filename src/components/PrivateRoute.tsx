// src/components/PrivateRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();

  if (!user) {
    // ログインしていなければログインページへ
    return <Navigate to="/login" replace />;
  }

  // ログイン済みならそのまま表示
  return children;
};

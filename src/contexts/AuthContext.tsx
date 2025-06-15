import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

type User = {
  id: number;
  email: string;
  // 他にも必要なら追加
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('access-token');
    const client = localStorage.getItem('client');
    const uid = localStorage.getItem('uid');

    if (!token || !client || !uid) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('http://localhost:3000/auth/validate_token', {
        headers: {
          'access-token': token,
          client,
          uid,
        },
      });

      setUser(res.data.data);
    } catch (err) {
      console.error('認証チェック失敗:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

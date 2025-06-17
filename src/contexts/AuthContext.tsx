import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
  logout: () => void; // 🔹 追加
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {}, // 🔹 追加
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);

  const logout = async () => {
    const token = localStorage.getItem('access-token');
    const client = localStorage.getItem('client');
    const uid = localStorage.getItem('uid');

    try {
      await axios.delete('http://localhost:3000/auth/sign_out', {
        headers: {
          'access-token': token || '',
          client: client || '',
          uid: uid || '',
        },
      });
    } catch (err) {
      console.warn('ログアウトリクエスト失敗（トークン切れ？）', err);
    }

    localStorage.clear();
    setUser(null);
  };

  useEffect(() => {
    const validateUser = async () => {
      const token = localStorage.getItem('access-token');
      const client = localStorage.getItem('client');
      const uid = localStorage.getItem('uid');

      if (token && client && uid) {
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
          console.error('Token validation failed', err);
          localStorage.clear();
          setUser(null);
        }
      }
    };

    validateUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

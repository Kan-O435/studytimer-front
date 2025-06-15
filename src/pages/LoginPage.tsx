import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:3000/auth/sign_in', {
        email,
        password,
      });

      const headers = res.headers;
      localStorage.setItem('access-token', headers['access-token']);
      localStorage.setItem('client', headers['client']);
      localStorage.setItem('uid', headers['uid']);

      navigate('/dashboard'); // 仮にログイン後ページへ
    } catch (err: any) {
      setError('ログイン失敗: ' + (err.response?.data?.errors?.[0] || '不明なエラー'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">ログイン</h1>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-4"
        >
          <input
            className="w-full p-2 border rounded"
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full p-2 border rounded"
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
}

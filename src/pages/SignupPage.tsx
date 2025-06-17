import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:3000/auth', {
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      navigate('/login');
    } catch (err: any) {
      setError(
        '登録失敗: ' +
          (err.response?.data?.errors?.full_messages?.join(', ') || '不明なエラー')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">新規登録</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSignup();
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
          <input
            className="w-full p-2 border rounded"
            type="password"
            placeholder="パスワード確認"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
          >
            {loading ? '登録中...' : '登録'}
          </button>
        </form>
      </div>
    </div>
  );
}

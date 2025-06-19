// src/pages/LoginPage.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // <--- ここに Link を追加！

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const res = await axios.post(
        'http://localhost:3000/auth/sign_in',
        {
          email: email, // ★以前修正した部分です。session ネストは削除されています。
          password: password,
        }
      );

      localStorage.setItem('access-token', res.headers['access-token']);
      localStorage.setItem('client', res.headers['client']);
      localStorage.setItem('uid', res.headers['uid']);

      axios.defaults.headers.common['access-token'] = res.headers['access-token'];
      axios.defaults.headers.common['client'] = res.headers['client'];
      axios.defaults.headers.common['uid'] = res.headers['uid'];

      console.log('ログイン成功！', res.data);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('ログイン失敗:', error.response ? error.response.data : error);
      if (error.response && error.response.data && error.response.data.errors) {
        setErrorMessage(error.response.data.errors[0] || 'ログインに失敗しました。');
      } else {
        setErrorMessage('ネットワークエラー、または予期せぬエラーが発生しました。');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">ログイン</h2>
      {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            パスワード
          </label>
          <input
            type="password"
            id="password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            ログイン
          </button>
        </div>
      </form>
      <div className="text-center mt-4">
        {/* Link コンポーネントが使われている部分 */}
        <Link to="/register" className="text-blue-500 hover:text-blue-800 text-sm">
          アカウントをお持ちでない方はこちら
        </Link>
      </div>
    </div>
  );
}
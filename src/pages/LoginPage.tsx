import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const res = await axios.post('http://localhost:3000/api/v1/auth/sign_in', {
        email,
        password,
      });

      localStorage.setItem('access-token', res.headers['access-token']);
      localStorage.setItem('client', res.headers['client']);
      localStorage.setItem('uid', res.headers['uid']);

      axios.defaults.headers.common['access-token'] = res.headers['access-token'];
      axios.defaults.headers.common['client'] = res.headers['client'];
      axios.defaults.headers.common['uid'] = res.headers['uid'];

      console.log('ログイン成功！', res.data);
      navigate('/dashboard');
    } catch (error: any) {
      const msg = error.response?.data?.errors?.[0] ?? 'ログインに失敗しました。';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="login-wrapper">
      {/* 流体風 背景アニメーション */}
      <div className="background-glow-1" />
      <div className="background-glow-2" />

      {/* メインフォーム */}
      <div className="login-container">
        <h2 className="login-title">ログイン</h2>

        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">メールアドレス</label>
            <input
              id="email"
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">パスワード</label>
            <input
              id="password"
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="●●●●●●●"
            />
          </div>

          <button
            type="submit"
            disabled={!email || !password}
            className={`login-button ${email && password ? 'enabled' : 'disabled'}`}
          >
            ログイン
          </button>
        </form>

        <div className="register-link">
          アカウントをお持ちでない方は{' '}
          <Link to="/register" className="link">新規登録</Link>
        </div>
      </div>
    </div>
  );
}

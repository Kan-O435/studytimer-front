import { useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TimerPage from './pages/TimerPage';
import WeeklyReportPage from './pages/WeeklyReportPage';
import ReviewPage from './pages/ReviewPage'; // ← 追加

export default function App() {
  useEffect(() => {
    const accessToken = localStorage.getItem('access-token');
    const client = localStorage.getItem('client');
    const uid = localStorage.getItem('uid');

    if (accessToken && client && uid) {
      axios.defaults.headers.common['access-token'] = accessToken;
      axios.defaults.headers.common['client'] = client;
      axios.defaults.headers.common['uid'] = uid;
      console.log('認証ヘッダーをlocalStorageから再設定しました。');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/timer/:taskId" element={<TimerPage />} />
        <Route path="/weekly-report" element={<WeeklyReportPage />} />
        <Route path="/review" element={<ReviewPage />} /> {/* ← 追加 */}
      </Routes>
    </BrowserRouter>
  );
}

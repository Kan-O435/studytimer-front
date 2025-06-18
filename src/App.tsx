import { useEffect } from 'react'; // useEffectをインポート
import axios from 'axios'; // axiosをインポート
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TimerPage from './pages/TimerPage';
import WeeklyReportPage from './pages/WeeklyReportPage';

export default function App() {
  // コンポーネントがマウントされた時（＝ページが読み込まれた時）に一度だけ実行
  useEffect(() => {
    // localStorageから保存された認証情報を取得
    const accessToken = localStorage.getItem('access-token');
    const client = localStorage.getItem('client');
    const uid = localStorage.getItem('uid');

    // もし認証情報が全てlocalStorageにあれば、axiosのデフォルトヘッダーに再設定
    if (accessToken && client && uid) {
      axios.defaults.headers.common['access-token'] = accessToken;
      axios.defaults.headers.common['client'] = client;
      axios.defaults.headers.common['uid'] = uid;
      console.log('認証ヘッダーをlocalStorageから再設定しました。');
    }
  }, []); // 依存配列を空にすることで、コンポーネントのマウント時のみ実行

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/timer" element={<TimerPage />} />
        <Route path="/weekly-report" element={<WeeklyReportPage />} />
      </Routes>
    </BrowserRouter>
  );
}
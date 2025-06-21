// src/components/WeeklyReport.jsx
import React, { useEffect, useState } from 'react';

const WeeklyReport = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWeeklyReport = async () => {
      setLoading(true);
      setError(null);

      // localStorageから認証ヘッダーを取得
      // devise_token_auth が設定されていればこれらのキーが存在するはずです
      const accessToken = localStorage.getItem('access-token');
      const client = localStorage.getItem('client');
      const uid = localStorage.getItem('uid');

      if (!accessToken || !client || !uid) {
        setError("認証情報が見つかりません。ログインしてください。");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/v1/weekly_reports', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'access-token': accessToken,
            'client': client,
            'uid': uid,
          },
        });

        if (!response.ok) {
          // エラーレスポンスの本文を読み込む
          const errorData = await response.json();
          throw new Error(errorData.errors ? errorData.errors.join(', ') : 'レポートの取得に失敗しました');
        }

        const data = await response.json();
        setReportData(data);
      } catch (err) {
        console.error("週次レポートの取得中にエラーが発生しました:", err);
        setError(`レポートの取得に失敗しました: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyReport();
  }, []); // 空の依存配列はコンポーネトのマウント時に一度だけ実行されることを意味します

  if (loading) {
    return <div style={styles.container}>週次レポートを読み込み中...</div>;
  }

  if (error) {
    return <div style={styles.container}>エラー: {error}</div>;
  }

  if (reportData.length === 0) {
    return <div style={styles.container}>今週のデータはありません。</div>;
  }

  return (
    <div style={styles.container}>
      <h2>週次レポート</h2>
      {reportData.map((dayData) => (
        <div key={dayData.date} style={styles.dayCard}>
          <h3 style={styles.dayDate}>{dayData.date}</h3>
          <p>合計学習時間: <strong style={styles.duration}>{dayData.total_duration_minutes}分</strong></p>
          <p>平均評価: {dayData.average_rating ? dayData.average_rating.toFixed(1) : '評価なし'}</p>
          {dayData.llm_feedback && <p>LLMからのフィードバック: {dayData.llm_feedback}</p>}

          <h4 style={styles.sessionsHeader}>セッション詳細:</h4>
          {dayData.sessions.length > 0 ? (
            <ul style={styles.sessionList}>
              {dayData.sessions.map((session) => (
                <li key={session.id} style={styles.sessionItem}>
                  <strong>{session.task_title}</strong>: {session.duration_minutes}分
                  {session.rating && ` (評価: ${session.rating})`}
                  {session.comment && ` - ${session.comment}`}
                </li>
              ))}
            </ul>
          ) : (
            <p style={styles.noSessions}>この日はセッションがありませんでした。</p>
          )}
        </div>
      ))}
    </div>
  );
};

// スタイリング (簡易的なインラインスタイル)
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '20px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    backgroundColor: '#f9f9f9',
  },
  dayCard: {
    border: '1px solid #eee',
    borderRadius: '5px',
    padding: '15px',
    marginBottom: '15px',
    backgroundColor: '#fff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  dayDate: {
    color: '#333',
    borderBottom: '1px solid #eee',
    paddingBottom: '5px',
    marginBottom: '10px',
  },
  duration: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  sessionsHeader: {
    color: '#555',
    marginTop: '15px',
    marginBottom: '8px',
  },
  sessionList: {
    listStyle: 'none',
    padding: '0',
  },
  sessionItem: {
    backgroundColor: '#f0f8ff',
    padding: '8px 10px',
    marginBottom: '5px',
    borderRadius: '4px',
    borderLeft: '3px solid #007bff',
  },
  noSessions: {
    color: '#888',
    fontStyle: 'italic',
  },
};

export default WeeklyReport;
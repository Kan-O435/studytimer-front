import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WeeklyReport.css';

interface Session {
  id: number;
  task_title: string;
  duration_minutes: number;
  rating?: number;
  comment?: string;
}

interface DayData {
  date: string;
  total_duration_minutes: number;
  average_rating?: number;
  llm_feedback?: string | null;
  sessions: Session[];
}

const WeeklyReport: React.FC = () => {
  const [reportData, setReportData] = useState<DayData[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWeeklyReport = async () => {
      setLoading(true);
      setError(null);

      const accessToken = localStorage.getItem('access-token');
      const client = localStorage.getItem('client');
      const uid = localStorage.getItem('uid');

      if (!accessToken || !client || !uid) {
        setError('認証情報が見つかりません。ログインしてください。');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/v1/weekly_reports', {
          headers: {
            'Content-Type': 'application/json',
            'access-token': accessToken,
            'client': client,
            'uid': uid,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.errors?.join(', ') || 'レポートの取得に失敗しました');
        }

        const json = await response.json();
        console.log('受信した summary:', json.summary); // ← ログ追加
        setReportData(json.data ?? []);

        if (typeof json.summary === 'string') {
          const cleanedSummary = json.summary.replace(/^"|"$/g, '');
          if (cleanedSummary === 'null' || cleanedSummary.trim() === '') {
            setSummary(null);
          } else {
            setSummary(cleanedSummary);
          }
        } else {
          setSummary(null);
        }
      } catch (err: any) {
        console.error('週次レポート取得エラー:', err);
        setError(err.message || '不明なエラー');
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyReport();
  }, []);

  if (loading) return <div className="container">週次レポートを読み込み中...</div>;
  if (error) return <div className="container error">エラー: {error}</div>;
  if (reportData.length === 0) return <div className="container">今週のデータはありません。</div>;

  return (
    <div className="container">
      <h2 className="title">今週の振り返り</h2>

      {summary && (
        <div className="summaryBox">
          <h3 className="summaryHeader"></h3>
          <p>{summary}</p>
        </div>
      )}

      <div className="reportScrollWrapper">
        {reportData.map((day) => (
          <div key={day.date} className="dayCard">
            <h3 className="dayDate">{day.date}</h3>
            <p>合計学習時間: <strong className="duration">{day.total_duration_minutes}分</strong></p>
            <p>平均評価: {day.average_rating ?? '評価なし'}</p>
            {day.llm_feedback && <p>LLMフィードバック: {day.llm_feedback}</p>}

            <h4 className="sessionsHeader">セッション詳細</h4>
            {day.sessions.length > 0 ? (
              <ul className="sessionList">
                {day.sessions.map((s) => (
                  <li key={s.id} className="sessionItem">
                    <strong>{s.task_title}</strong>: {s.duration_minutes}分
                    {s.rating !== undefined && ` (評価: ${s.rating})`}
                    {s.comment && ` - ${s.comment}`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="noSessions">セッションはありませんでした。</p>
            )}
          </div>
        ))}
      </div>

      <button
        className="dashboardButton"
        onClick={() => navigate('/dashboard')}
        aria-label="ダッシュボードに戻る"
      >
        Dashboardに戻る
      </button>
    </div>
  );
};

export default WeeklyReport;

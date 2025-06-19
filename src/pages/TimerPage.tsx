import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function TimerPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const taskTitle = (location.state as { taskTitle: string })?.taskTitle || '不明なタスク';

  // ユーザーが入力するタイマー設定時間（分）
  const [inputMinutes, setInputMinutes] = useState('25');

  // 残り秒数（秒単位）
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // タイマー稼働中フラグ
  const [isRunning, setIsRunning] = useState(false);

  // APIで作成したタイマーセッションID
  const [timerSessionId, setTimerSessionId] = useState<number | null>(null);

  // インターバルID管理用
  const intervalRef = useRef<number | null>(null);

  // 認証ヘッダー取得
  const getAuthHeaders = () => ({
    'access-token': localStorage.getItem('access-token') || '',
    client: localStorage.getItem('client') || '',
    uid: localStorage.getItem('uid') || '',
  });

  // 秒数をMM:SSに変換
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // タイマー開始処理
  const startTimer = async () => {
    if (isRunning) return;

    let minutes = parseInt(inputMinutes, 10);
    if (isNaN(minutes) || minutes <= 0) {
      alert('有効な時間（分）を入力してください。');
      return;
    }

    // 既に残り秒数があれば、その秒数に合わせて分を調整（再開用）
    if (remainingSeconds > 0) {
      minutes = Math.ceil(remainingSeconds / 60);
    } else {
      setRemainingSeconds(minutes * 60);
    }

    const now = new Date();

    try {
      // 新規作成はtimerSessionIdがnullの場合のみ
      if (!timerSessionId) {
        const res = await axios.post(
          'http://localhost:3000/api/v1/timer_sessions',
          {
            timer_session: {
              task_id: taskId ? parseInt(taskId) : null,
              started_at: now.toISOString(),
              duration_minutes: 0,
            },
          },
          { headers: getAuthHeaders() }
        );

        setTimerSessionId(res.data.id);
      }

      setIsRunning(true);

      // 1秒ごとに残り秒数を減らす
      intervalRef.current = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setIsRunning(false);
            stopTimer(); // APIに終了通知も呼ぶ
            alert('時間になりました！');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      console.error('タイマー開始エラー', error.response || error.message || error);
      alert('タイマー開始に失敗しました。');
    }
  };

  // 一時停止処理
  const pauseTimer = async () => {
    if (!isRunning) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);

    if (timerSessionId) {
      try {
        // 経過時間を分で計算
        const elapsedMinutes = Math.floor((parseInt(inputMinutes) * 60 - remainingSeconds) / 60);

        await axios.patch(
          `http://localhost:3000/api/v1/timer_sessions/${timerSessionId}`,
          {
            timer_session: {
              duration_minutes: elapsedMinutes,
            },
          },
          { headers: getAuthHeaders() }
        );
        console.log('タイマー一時停止＆更新完了');
      } catch (error: any) {
        console.error('タイマー更新エラー', error.response || error.message || error);
        alert('一時停止時にエラーが発生しました。');
      }
    }
  };

  // 停止・終了処理
  const stopTimer = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);

    if (timerSessionId) {
      try {
        const endedAtTime = new Date().toISOString();
        const elapsedMinutes = Math.floor((parseInt(inputMinutes) * 60 - remainingSeconds) / 60);

        await axios.patch(
          `http://localhost:3000/api/v1/timer_sessions/${timerSessionId}`,
          {
            timer_session: {
              ended_at: endedAtTime,
              duration_minutes: elapsedMinutes,
            },
          },
          { headers: getAuthHeaders() }
        );

        console.log('タイマー終了＆最終更新完了');
        navigate('/dashboard');
      } catch (error: any) {
        console.error('タイマー終了更新エラー', error.response || error.message || error);
        alert('タイマー終了時にエラーが発生しました。');
      }
    } else {
      navigate('/dashboard');
    }
  };

  // コンポーネントアンマウント時にインターバルクリア
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto p-4 text-center">
      <h1 className="text-4xl font-bold mb-6">タイマー</h1>
      <h2 className="text-2xl mb-4">タスク: {taskTitle}</h2>

      {/* タイマー設定入力(停止中のみ表示) */}
      {!isRunning && (
        <div className="mb-6">
          <label htmlFor="timeInput" className="block mb-2 text-lg">
            タイマー設定時間（分）
          </label>
          <input
            id="timeInput"
            type="number"
            min="1"
            value={inputMinutes}
            onChange={(e) => setInputMinutes(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-32 text-center text-xl"
          />
        </div>
      )}

      {/* 残り時間表示 */}
      <div className="text-6xl font-mono mb-8">{formatTime(remainingSeconds)}</div>

      {/* 操作ボタン */}
      <div className="space-x-4">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="px-6 py-3 bg-green-500 text-white text-xl rounded-lg hover:bg-green-600 transition-colors"
          >
            開始
          </button>
        ) : (
          <>
            <button
              onClick={pauseTimer}
              className="px-6 py-3 bg-yellow-500 text-white text-xl rounded-lg hover:bg-yellow-600 transition-colors"
            >
              一時停止
            </button>
            <button
              onClick={stopTimer}
              className="px-6 py-3 bg-red-500 text-white text-xl rounded-lg hover:bg-red-600 transition-colors"
            >
              終了
            </button>
          </>
        )}
      </div>

      {/* ダッシュボードへ戻るリンク */}
      <div className="mt-8">
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          ダッシュボードに戻る
        </Link>
      </div>
    </div>
  );
}

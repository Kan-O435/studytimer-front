// src/components/TimerPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './TimerPage.css'; // ★この行は正しいです

export default function TimerPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const taskTitle = (location.state as { taskTitle: string })?.taskTitle || '不明なタスク';

  const [inputMinutes, setInputMinutes] = useState('25');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timerSessionId, setTimerSessionId] = useState<number | null>(null);

  const intervalRef = useRef<number | null>(null);

  // 認証ヘッダーを取得するヘルパー関数
  const getAuthHeaders = () => ({
    'access-token': localStorage.getItem('access-token') || '',
    client: localStorage.getItem('client') || '',
    uid: localStorage.getItem('uid') || '',
  });

  // 時間のフォーマット関数
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // タイマー開始処理
  const startTimer = async () => {
    if (isRunning) return; // 既に実行中の場合は何もしない

    let minutes = parseInt(inputMinutes, 10);
    if (isNaN(minutes) || minutes <= 0) {
      alert('有効な時間（分）を入力してください。');
      return;
    }

    // 残り時間が0の場合にのみ、入力値から初期設定を行う
    if (remainingSeconds === 0) {
      setRemainingSeconds(minutes * 60);
    }

    const now = new Date();

    try {
      // timerSessionIdがまだ存在しない場合のみ新しいセッションを作成
      if (!timerSessionId) {
        const res = await axios.post(
          'http://localhost:3000/api/v1/timer_sessions',
          {
            timer_session: {
              task_id: taskId ? parseInt(taskId) : null,
              started_at: now.toISOString(),
              duration_minutes: 0, // 開始時は0分として記録
            },
          },
          { headers: getAuthHeaders() }
        );

        setTimerSessionId(res.data.id);

        // APIレスポンスから最新の認証トークンをlocalStorageに保存
        const newAccessToken = res.headers['access-token'];
        const newClient = res.headers['client'];
        const newUid = res.headers['uid'];
        if (newAccessToken && newClient && newUid) {
          localStorage.setItem('access-token', newAccessToken);
          localStorage.setItem('client', newClient);
          localStorage.setItem('uid', newUid);
          console.log('DEBUG: TimerPageのstartTimerで新しい認証ヘッダーをlocalStorageに保存しました。');
        }
      }

      setIsRunning(true);

      // タイマーのインターバル設定
      intervalRef.current = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            // タイマーが0になったらクリアし、停止状態にする
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setIsRunning(false); // タイマー停止
            alert('時間になりました！'); // タイマー終了のアラート

            return 0;
          }
          return prev - 1; // 1秒減らす
        });
      }, 1000);
    } catch (error: any) {
      console.error('タイマー開始エラー', error.response || error.message || error);
      alert('タイマー開始に失敗しました。');
    }
  };

  // タイマー一時停止処理
  const pauseTimer = async () => {
    if (!isRunning) return; // 実行中でない場合は何もしない

    // インターバルをクリア
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false); // タイマー停止

    // タイマーセッションIDが存在する場合のみ、経過時間を更新
    if (timerSessionId) {
      try {
        const elapsedMinutes = Math.floor((parseInt(inputMinutes) * 60 - remainingSeconds) / 60);

        const res = await axios.patch(
          `http://localhost:3000/api/v1/timer_sessions/${timerSessionId}`,
          {
            timer_session: {
              duration_minutes: elapsedMinutes,
            },
          },
          { headers: getAuthHeaders() }
        );
        console.log('タイマー一時停止＆更新完了');

        // APIレスポンスから最新の認証トークンをlocalStorageに保存
        const newAccessToken = res.headers['access-token'];
        const newClient = res.headers['client'];
        const newUid = res.headers['uid'];
        if (newAccessToken && newClient && newUid) {
          localStorage.setItem('access-token', newAccessToken);
          localStorage.setItem('client', newClient);
          localStorage.setItem('uid', newUid);
          console.log('DEBUG: TimerPageのpauseTimerで新しい認証ヘッダーをlocalStorageに保存しました。');
        }
      } catch (error: any) {
        console.error('タイマー更新エラー', error.response || error.message || error);
        alert('一時停止時にエラーが発生しました。');
      }
    }
  };

  // タイマー強制終了・最終更新処理
  const stopTimer = async () => {
    // インターバルがまだ動いていればクリア
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false); // タイマー停止

    if (timerSessionId) {
      try {
        const endedAtTime = new Date().toISOString();
        const elapsedMinutes = Math.floor((parseInt(inputMinutes) * 60 - remainingSeconds) / 60);

        const res = await axios.patch(
          `http://localhost:3000/api/v1/timer_sessions/${timerSessionId}`,
          {
            timer_session: {
              ended_at: endedAtTime,
              duration_minutes: elapsedMinutes,
            },
          },
          { headers: getAuthHeaders() }
        );

        // APIレスポンスから最新の認証トークンをlocalStorageに保存
        const newAccessToken = res.headers['access-token'];
        const newClient = res.headers['client'];
        const newUid = res.headers['uid'];
        if (newAccessToken && newClient && newUid) {
          localStorage.setItem('access-token', newAccessToken);
          localStorage.setItem('client', newClient);
          localStorage.setItem('uid', newUid);
          console.log('DEBUG: TimerPageのstopTimerで新しい認証ヘッダーをlocalStorageに保存しました。');
        }

        console.log('タイマー終了＆最終更新完了');

        // レビュー画面へ遷移
        navigate('/review', {
          state: {
            timerSessionId,
            taskTitle,
          },
        });
      } catch (error: any) {
        console.error('タイマー終了更新エラー', error.response || error.message || error);
        alert('タイマー終了時にエラーが発生しました。');
      }
    } else {
      // timerSessionIdがない場合はダッシュボードに戻る
      navigate('/dashboard');
    }
  };

  // コンポーネトアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // remainingSecondsが0になり、かつタイマーが停止したことを検知して
  // 最終的な stopTimer 処理を呼び出すための useEffect
  // ここで stopTimer を呼ぶことで、レンダリングフェーズ外で副作用を実行
  useEffect(() => {
    // remainingSecondsが0になり、タイマーが実行中でなく、かつインターバルがクリアされている場合
    // これはタイマーが時間切れになったことを意味する
    if (remainingSeconds === 0 && !isRunning && timerSessionId && intervalRef.current === null) {
      console.log("DEBUG: Timer finished (remainingSeconds is 0), calling stopTimer for final update and navigation.");
      stopTimer(); // stopTimer はナビゲーションも含む
    }
  }, [remainingSeconds, isRunning, timerSessionId, navigate, inputMinutes, taskTitle]); // 必要な依存関係をすべて含める

  return (
    // ★変更: divのclassNameを変更
    <div className="timer-page-container">
      {/* ★変更: h1のclassNameを変更 */}
      <h1 className="timer-page-title">タイマー</h1>
      {/* ★変更: h2のclassNameを変更 */}
      <h2 className="task-title">タスク: {taskTitle}</h2>

      {/* タイマーが実行中でない場合のみ、時間設定入力欄を表示 */}
      {!isRunning && (
        // ★変更: divのclassNameを追加
        <div className="time-input-group">
          {/* ★変更: labelのclassNameを変更 */}
          <label htmlFor="timeInput" className="time-input-label">
            タイマー設定時間（分）
          </label>
          <input
            id="timeInput"
            type="number"
            min="1"
            value={inputMinutes}
            onChange={(e) => setInputMinutes(e.target.value)}
            // ★変更: inputのclassNameを変更
            className="time-input"
          />
        </div>
      )}

      {/* 残り時間の表示 */}
      {/* ★変更: divのclassNameを変更 */}
      <div className="remaining-time">{formatTime(remainingSeconds)}</div>

      {/* 操作ボタン */}
      {/* ★変更: divのclassNameを変更 */}
      <div className="timer-controls">
        {!isRunning ? (
          // タイマーが実行中でない場合は「開始」ボタン
          // ★変更: buttonのclassNameを変更
          <button
            onClick={startTimer}
            className="timer-button start-button"
          >
            開始
          </button>
        ) : (
          // タイマー実行中の場合は「一時停止」と「終了」ボタン
          <>
            {/* ★変更: buttonのclassNameを変更 */}
            <button
              onClick={pauseTimer}
              className="timer-button pause-button"
            >
              一時停止
            </button>
            {/* ★変更: buttonのclassNameを変更 */}
            <button
              onClick={stopTimer}
              className="timer-button stop-button"
            >
              終了
            </button>
          </>
        )}
      </div>

      {/* ダッシュボードへのリンク */}
      {/* ★変更: divのclassNameを変更（もし必要なら） */}
      <div className="dashboard-link-container"> {/* 新しいクラス名を提案 */}
        {/* ★変更: LinkのclassNameを変更 */}
        <Link to="/dashboard" className="dashboard-link">
          ダッシュボードに戻る
        </Link>
      </div>
    </div>
  );
}
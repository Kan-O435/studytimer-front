// src/components/ReviewPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ReviewPage() {
  // console.log("DEBUG: ReviewPage is starting to render!"); // デバッグ用ログ、必要に応じてコメントアウトを外してください

  const location = useLocation();
  const navigate = useNavigate();

  // TimerPageから渡されたstateを取得
  const timerSessionId = (location.state as { timerSessionId: number })?.timerSessionId;
  const taskTitle = (location.state as { taskTitle: string })?.taskTitle || '不明なタスク';

  const [rating, setRating] = useState<number>(0); // 1-5の評価
  const [comment, setComment] = useState<string>(''); // コメント
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // 送信中フラグ
  const [error, setError] = useState<string | null>(null); // エラーメッセージ

  // 認証ヘッダーを取得するヘルパー関数
  const getAuthHeaders = () => ({
    'access-token': localStorage.getItem('access-token') || '',
    client: localStorage.getItem('client') || '',
    uid: localStorage.getItem('uid') || '',
  });

  // timerSessionIdがない場合はダッシュボードに戻す
  useEffect(() => {
    if (!timerSessionId) {
      alert('レビュー対象のタイマーセッションが見つかりませんでした。');
      navigate('/dashboard');
    }
  }, [timerSessionId, navigate]);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault(); // フォームのデフォルト送信を防ぐ
    setError(null); // エラーメッセージをクリア

    // 評価が選択されているかバリデーション
    if (!rating || rating < 1 || rating > 5) {
      setError('1から5の評価を選択してください。');
      return;
    }

    setIsSubmitting(true); // 送信中フラグを立てる

    try {
      // レビュー作成APIエンドポイントにPOSTリクエスト
      const res = await axios.post(
        'http://localhost:3000/api/v1/reviews', // バックエンドのルーティングと合わせてください
        {
          review: {
            timer_session_id: timerSessionId,
            rating: rating,
            comment: comment.trim() === '' ? null : comment, // 空コメントはnullとして送信
          },
        },
        { headers: getAuthHeaders() } // 認証ヘッダーを付与
      );

      console.log('レビュー投稿成功:', res.data);
      alert('レビューを投稿しました！');
      navigate('/dashboard'); // 投稿後はダッシュボードへ遷移
    } catch (err: any) {
      console.error('レビュー投稿エラー:', err.response?.data || err.message || err);
      setError('レビューの投稿に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false); // 送信中フラグを解除
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 text-center">
      <h1 className="text-4xl font-bold mb-6">レビュー</h1>
      <h2 className="text-2xl mb-4">タスク: {taskTitle}</h2>

      <form onSubmit={handleSubmitReview} className="space-y-6">
        <div>
          <label className="block text-lg font-medium mb-2">評価 (1-5)</label>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                // 評価の星のスタイルを改善
                className={`
                  text-5xl cursor-pointer transition-colors duration-200 ease-in-out
                  ${rating >= star ? 'text-yellow-400 drop-shadow-md' : 'text-gray-300 hover:text-gray-400'}
                  focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-75
                `}
                aria-label={`${star}つ星を評価`} // スクリーンリーダー用ラベル
              >
                ★
              </button>
            ))}
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div>
          <label htmlFor="comment" className="block text-lg font-medium mb-2">
            コメント (任意)
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="感想や学びを共有してください..."
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmitting} // 送信中はボタンを無効化
          className="px-8 py-4 bg-blue-600 text-white text-xl rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '送信中...' : 'レビューを投稿'}
        </button>
      </form>

      <div className="mt-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-600 hover:underline"
        >
          レビューせずにダッシュボードに戻る
        </button>
      </div>
    </div>
  );
}
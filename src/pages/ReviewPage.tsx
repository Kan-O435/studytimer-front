import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ReviewPage.css'; // ReviewPage.css のインポート

export default function ReviewPage() {
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
    // ★変更: divのclassNameを 'review-page-container' に変更
    <div className="review-page-container">
      {/* ★変更: h1のclassNameを 'review-page-title' に変更 */}
      <h1 className="review-page-title">レビュー</h1>
      {/* ★変更: h2のclassNameを 'review-task-title' に変更 */}
      <h2 className="review-task-title">タスク: {taskTitle}</h2>

      {/* ★変更: formのclassNameを 'review-form' に変更 */}
      <form onSubmit={handleSubmitReview} className="review-form">
        {/* 評価セクション */}
        <div className="rating-section"> {/* ★変更: divに 'rating-section' クラスを追加 */}
          {/* ★変更: labelのclassNameを 'rating-label' に変更 */}
          <label className="rating-label">評価 (1-5)</label>
          {/* ★変更: divのclassNameを 'star-buttons-container' に変更 */}
          <div className="star-buttons-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                // ★変更: classNameを動的に変更
                className={`
                  star-button
                  ${rating >= star ? 'selected' : ''}
                `}
                aria-label={`${star}つ星を評価`}
              >
                ★
              </button>
            ))}
          </div>
          {error && <p className="error-message">{error}</p>} {/* ★変更: pのclassNameを 'error-message' に変更 */}
        </div>

        {/* コメントセクション */}
        <div className="comment-section"> {/* ★変更: divに 'comment-section' クラスを追加 */}
          {/* ★変更: labelのclassNameを 'comment-label' に変更 */}
          <label htmlFor="comment" className="comment-label">
            コメント (任意)
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            // ★変更: textareaのclassNameを 'comment-textarea' に変更
            className="comment-textarea"
            placeholder="感想や学びを共有してください..."
          ></textarea>
        </div>

        {/* 送信ボタン */}
        {/* ★変更: buttonのclassNameを 'submit-button' に変更 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? '送信中...' : 'レビューを投稿'}
        </button>
      </form>

      {/* ダッシュボードに戻るボタン（Linkではなくbuttonなので） */}
      {/* ★変更: divのclassNameを 'back-to-dashboard-container' に変更 */}
      <div className="back-to-dashboard-container">
        {/* ★変更: buttonのclassNameを 'back-to-dashboard-button' に変更 */}
        <button
          onClick={() => navigate('/dashboard')}
          className="back-to-dashboard-button"
        >
          レビューせずにダッシュボードに戻る
        </button>
      </div>
    </div>
  );
}
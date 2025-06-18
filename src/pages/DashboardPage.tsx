import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

type Task = {
  id: number;
  title: string;
  completed: boolean;
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // タスク一覧取得
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('http://localhost:3000/tasks', {
          headers: {
            'access-token': localStorage.getItem('access-token') || '',
            client: localStorage.getItem('client') || '',
            uid: localStorage.getItem('uid') || '',
          },
        });
        setTasks(res.data);
      } catch (error) {
        console.error('タスク取得に失敗しました', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // タスク追加
  const handleAddTask = async () => {
    const title = newTaskTitle.trim();
    if (!title) return;

    try {
      const res = await axios.post(
        'http://localhost:3000/tasks',
        { task: { title } },
        {
          headers: {
            'access-token': localStorage.getItem('access-token') || '',
            client: localStorage.getItem('client') || '',
            uid: localStorage.getItem('uid') || '',
          },
        }
      );
      // 追加成功したらリストに追加し、入力欄は空に
      setTasks((prev) => [...prev, res.data]);
      setNewTaskTitle('');
    } catch (error) {
      console.error('タスク追加に失敗しました', error);
    }
  };

  // タスク削除
  const handleDeleteTask = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3000/tasks/${id}`, {
        headers: {
          'access-token': localStorage.getItem('access-token') || '',
          client: localStorage.getItem('client') || '',
          uid: localStorage.getItem('uid') || '',
        },
      });
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (error) {
      console.error('タスク削除に失敗しました', error);
    }
  };

  if (loading) return <p>読み込み中...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">ダッシュボード</h1>

      {/* やることリスト */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">やることリスト</h2>

        {/* タスク追加フォーム */}
        <div className="flex mb-4">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="新しいタスクを入力"
            className="flex-grow border border-gray-300 rounded px-3 py-2 mr-2"
          />
          <button
            onClick={handleAddTask}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            追加
          </button>
        </div>

        {/* タスク一覧 */}
        {tasks.length === 0 ? (
          <p>やることはまだありません。</p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between mb-2 border-b pb-1"
              >
                <span
                  className={`${
                    task.completed ? 'line-through text-gray-400' : ''
                  }`}
                >
                  {task.title}
                </span>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* タイマー選択 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">タイマー選択</h2>
        <Link
          to="/timer"
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          タイマーを開始
        </Link>
      </section>

      {/* 評価ページへのリンク */}
      <section>
        <h2 className="text-xl font-semibold mb-4">評価</h2>
        <Link
          to="/weekly-report"
          className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          評価ページへ
        </Link>
      </section>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DashboardPage.css';

type Task = {
  id: number;
  title: string;
  completed: boolean;
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const navigate = useNavigate();

  const getAuthHeaders = () => ({
    'access-token': localStorage.getItem('access-token') || '',
    client: localStorage.getItem('client') || '',
    uid: localStorage.getItem('uid') || '',
  });

  useEffect(() => {
    if (
      !localStorage.getItem('access-token') ||
      !localStorage.getItem('client') ||
      !localStorage.getItem('uid')
    ) {
      navigate('/login');
      return;
    }

    const fetchTasks = async () => {
      try {
        const res = await axios.get('http://localhost:3000/tasks', {
          headers: getAuthHeaders(),
        });
        setTasks(res.data);
      } catch (error: any) {
        console.error('タスク取得に失敗しました', error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [navigate]);

  const handleAddTask = async () => {
    const title = newTaskTitle.trim();
    if (!title) return;

    try {
      const res = await axios.post(
        'http://localhost:3000/tasks',
        { task: { title } },
        { headers: getAuthHeaders() }
      );
      setTasks((prev) => [...prev, res.data]);
      setNewTaskTitle('');
    } catch (error) {
      console.error('タスク追加に失敗しました', error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3000/tasks/${id}`, {
        headers: getAuthHeaders(),
      });
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (error) {
      console.error('タスク削除に失敗しました', error);
    }
  };

  const handleStartTimer = (taskId: number, taskTitle: string) => {
    navigate(`/timer/${taskId}`, { state: { taskTitle } });
  };

  if (loading) return <p className="loading-text">読み込み中...</p>;

  return (
    <div className="dashboard-wrapper">
      <h1 className="dashboard-title">#勉強してください</h1>

      <section className="tasks-section">
        <h2 className="section-title">やることリスト</h2>

        <div className="task-input-area">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="新しいタスクを入力"
            className="task-input"
          />
          <button onClick={handleAddTask} className="btn btn-add" type="button">
            追加
          </button>
        </div>

        {tasks.length === 0 ? (
          <p className="no-tasks-text">やることはまだありません。</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className="task-item">
                <span className={`task-title ${task.completed ? 'completed' : ''}`}>
                  {task.title}
                </span>
                <div className="task-actions">
                  <button
                    onClick={() => handleStartTimer(task.id, task.title)}
                    className="btn btn-start-timer"
                    type="button"
                  >
                    タイマーを開始
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="btn btn-delete"
                    type="button"
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="evaluation-section">
        <h2 className="section-title">評価</h2>
        <Link to="/weekly-report" className="btn btn-evaluation">
          評価ページへ
        </Link>
      </section>
    </div>
  );
}

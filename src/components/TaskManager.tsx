import React, { useEffect, useState } from 'react';

type Task = {
  id: number;
  title: string;
};

export const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    fetch('/tasks')
      .then(res => res.json())
      .then(data => setTasks(data));
  }, []);

  const addTask = () => {
    if (!newTitle.trim()) return;

    fetch('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: { title: newTitle } }),
    })
      .then(res => res.json())
      .then(newTask => {
        setTasks([...tasks, newTask]);
        setNewTitle('');
      });
  };

  const deleteTask = (id: number) => {
    fetch(`/tasks/${id}`, { method: 'DELETE' })
      .then(() => {
        setTasks(tasks.filter(task => task.id !== id));
      });
  };

  return (
    <div>
      <h2>タスク一覧</h2>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            {task.title}{' '}
            <button onClick={() => deleteTask(task.id)}>削除</button>
          </li>
        ))}
      </ul>
      <input
        value={newTitle}
        onChange={e => setNewTitle(e.target.value)}
        placeholder="新しいタスク"
      />
      <button onClick={addTask}>追加</button>
    </div>
  );
};

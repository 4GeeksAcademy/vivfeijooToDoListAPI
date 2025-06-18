import React, { useState, useEffect } from 'react';
import '../../styles/index.css';

const USERNAME = "vivfeijoo";
const API_BASE = "https://playground.4geeks.com/todo";
const TODOS_URL = `${API_BASE}/todos/${USERNAME}`;
const USER_URL = `${API_BASE}/users/${USERNAME}`;

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(null);

  
  useEffect(() => {
    fetch(USER_URL)
      .then((res) => {
        if (res.status === 404) {
          return fetch(USER_URL, { method: "POST" }).then(() => []);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data.todos)) {
          setTasks(data.todos);
        } else {
          setTasks([]);
        }
      })
      .catch((err) => {
        console.error("Error loading tasks:", err);
        setError("Error loading tasks. Please try again.");
      });
  }, []);

  // Añadir nueva tarea
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      const newTask = {
        label: inputValue.trim(),
        done: false
      };

      fetch(TODOS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newTask)
      })
        .then((res) => {
          if (!res.ok) throw new Error("Error adding task");
          return res.json();
        })
        .then((data) => {
          if (data && data.id) {
            setTasks(prev => [...prev, data]);
          }
        })
        .catch((err) => {
          console.error("Error adding task:", err);
          setError("Failed to add task. Please try again.");
        });

      setInputValue('');
    }
  };

  // Eliminar tarea individual
  const deleteTask = (taskId) => {
    fetch(`${API_BASE}/todos/${taskId}`, {
      method: "DELETE"
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error deleting task");
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      })
      .catch((err) => {
        console.error("Error deleting task:", err);
        setError("Failed to delete task.");
      });
  };

  // Eliminar todas las tareas
  const deleteAllTasks = () => {
    const deleteRequests = tasks.map(task =>
      fetch(`${API_BASE}/todos/${task.id}`, {
        method: "DELETE"
      })
    );

    Promise.all(deleteRequests)
      .then((responses) => {
        if (responses.some(res => !res.ok)) {
          throw new Error("Some deletions failed");
        }
        setTasks([]);
      })
      .catch((err) => {
        console.error("Error deleting all tasks:", err);
        setError("Failed to delete all tasks.");
      });
  };

  return (
    <div className="page-wrapper">
      <h1 className="app-title">todos</h1>

      <div className="paper-stack">
        <div className="sheet-3"></div>
        <div className="sheet-2"></div>
        <div className="sheet-1">
          <div className="todo-container">
            {error && <div className="error-message">{error}</div>}

            <input
              className="todo-input"
              type="text"
              placeholder="What needs to be done?"
              onKeyDown={handleKeyDown}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id}>
                  {task.label}
                  <button onClick={() => deleteTask(task.id)}>✖</button>
                </li>
              ))}
            </ul>

            <div className="task-counter">
              {tasks.length} item{tasks.length !== 1 ? 's' : ''} left
            </div>

            <button onClick={deleteAllTasks}>🗑️ Delete All</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;



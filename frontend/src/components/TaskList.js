import React, { useState, useEffect } from 'react';
import { taskService } from '../services/api';
import './TaskList.css';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo' });
    const [editingTask, setEditingTask] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const taskData = await taskService.loadTasks();
            setTasks(taskData);
            setError(null);
        } catch (err) {
            setError('Failed to load tasks. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;
        try {
            const task = await taskService.addTask(newTask);
            setTasks([task, ...tasks]);
            setNewTask({ title: '', description: '', status: 'todo' });
        } catch (err) {
            setError('Failed to add task. Please try again.');
        }
    };

    const handleUpdateTask = async (id, updatedTask) => {
        try {
            const task = await taskService.updateTask(id, updatedTask);
            setTasks(tasks.map(t => t.id === id ? task : t));
            setEditingTask(null);
        } catch (err) {
            setError('Failed to update task. Please try again.');
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            await taskService.deleteTask(id);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (err) {
            setError('Failed to delete task. Please try again.');
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        try {
            const results = await taskService.searchTasks(searchQuery);
            setSearchResults(results);
        } catch (err) {
            setError('Search failed. Please try again.');
        }
    };

    const refreshCache = () => {
        taskService.clearCache();
        loadTasks();
    };

    if (loading) {
        return <div className="loading">Loading tasks...</div>;
    }

    return (
        <div className="task-list-container">
            <header className="header">
                <h1>Task Manager</h1>
                <button onClick={refreshCache} className="refresh-btn">
                    Refresh Cache
                </button>
            </header>
            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}
            {/* Add Task Form */}
            <form onSubmit={handleAddTask} className="add-task-form">
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Task title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        required
                    />
                    <textarea
                        placeholder="Task description"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                    <select
                        value={newTask.status}
                        onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    >
                        <option value="todo">To Do</option>
                        <option value="in progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                </div>
                <button type="submit">Add Task</button>
            </form>
            {/* Search Form */}
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Search similar tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>
            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="search-results">
                    <h3>Search Results:</h3>
                    {searchResults.map(task => (
                        <div key={task.id} className="task-item search-result">
                            <h4>{task.title}</h4>
                            <p>{task.description}</p>
                            <span className={`status ${task.status}`}>{task.status}</span>
                        </div>
                    ))}
                </div>
            )}
            {/* Tasks List */}
            <div className="tasks-grid">
                {tasks.map(task => (
                    <div key={task.id} className="task-item">
                        {editingTask === task.id ? (
                            <EditTaskForm
                                task={task}
                                onSave={(updatedTask) => handleUpdateTask(task.id, updatedTask)}
                                onCancel={() => setEditingTask(null)}
                            />
                        ) : (
                            <TaskCard
                                task={task}
                                onEdit={() => setEditingTask(task.id)}
                                onDelete={() => handleDeleteTask(task.id)}
                            />
                        )}
                    </div>
                ))}
            </div>
            {tasks.length === 0 && (
                <div className="empty-state">
                    <p>No tasks yet. Add your first task!</p>
                </div>
            )}
        </div>
    );
};

const TaskCard = ({ task, onEdit, onDelete }) => (
    <div className="task-card">
        <div className="task-header">
            <h3>{task.title}</h3>
            <div className="task-actions">
                <button onClick={onEdit} className="edit-btn">Edit</button>
                <button onClick={onDelete} className="delete-btn">Delete</button>
            </div>
        </div>
        <p className="task-description">{task.description}</p>
        <div className="task-footer">
            <span className={`status ${task.status}`}>{task.status}</span>
            <small className="created-at">
                {new Date(task.created_at).toLocaleDateString()}
            </small>
        </div>
    </div>
);

const EditTaskForm = ({ task, onSave, onCancel }) => {
    const [editedTask, setEditedTask] = useState({
        title: task.title,
        description: task.description,
        status: task.status
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(editedTask);
    };

    return (
        <form onSubmit={handleSubmit} className="edit-task-form">
            <input
                type="text"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                required
            />
            <textarea
                value={editedTask.description}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
            />
            <select
                value={editedTask.status}
                onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
            >
                <option value="todo">To Do</option>
                <option value="in progress">In Progress</option>
                <option value="done">Done</option>
            </select>
            <div className="form-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
};

export default TaskList;
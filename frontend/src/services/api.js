import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

class TaskService {
    constructor() {
        this.CACHE_KEY = 'tasks_cache';
        this.CACHE_TIMESTAMP_KEY = 'tasks_cache_timestamp';
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    }

    isCacheValid() {
        const timestamp = localStorage.getItem(this.CACHE_TIMESTAMP_KEY);
        if (!timestamp) return false;
        const now = Date.now();
        const cacheTime = parseInt(timestamp);
        return (now - cacheTime) < this.CACHE_DURATION;
    }

    getCachedTasks() {
        const cached = localStorage.getItem(this.CACHE_KEY);
        return cached ? JSON.parse(cached) : null;
    }

    saveTasks(tasks) {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(tasks));
        localStorage.setItem(this.CACHE_TIMESTAMP_KEY, Date.now().toString());
    }

    clearCache() {
        localStorage.removeItem(this.CACHE_KEY);
        localStorage.removeItem(this.CACHE_TIMESTAMP_KEY);
    }

    async loadTasks() {
        if (this.isCacheValid()) {
            const cachedTasks = this.getCachedTasks();
            if (cachedTasks) {
                console.log('Loading tasks from cache');
                return cachedTasks;
            }
        }
        try {
            console.log('Fetching tasks from server');
            const response = await api.get('/tasks');
            const tasks = response.data;
            this.saveTasks(tasks);
            return tasks;
        } catch (error) {
            console.error('Error loading tasks:', error);
            const cachedTasks = this.getCachedTasks();
            if (cachedTasks) {
                console.log('Server error, using cached data');
                return cachedTasks;
            }
            throw error;
        }
    }

    async addTask(task) {
        try {
            const response = await api.post('/tasks', task);
            const newTask = response.data;
            const cachedTasks = this.getCachedTasks() || [];
            const updatedTasks = [newTask, ...cachedTasks];
            this.saveTasks(updatedTasks);
            return newTask;
        } catch (error) {
            console.error('Error adding task:', error);
            throw error;
        }
    }

    async updateTask(id, task) {
        try {
            const response = await api.put(`/tasks/${id}`, task);
            const updatedTask = response.data;
            const cachedTasks = this.getCachedTasks() || [];
            const updatedTasks = cachedTasks.map(t => t.id === id ? updatedTask : t);
            this.saveTasks(updatedTasks);
            return updatedTask;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }

    async deleteTask(id) {
        try {
            await api.delete(`/tasks/${id}`);
            const cachedTasks = this.getCachedTasks() || [];
            const updatedTasks = cachedTasks.filter(t => t.id !== id);
            this.saveTasks(updatedTasks);
            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }

    async searchTasks(query) {
        try {
            const response = await api.post('/tasks/search', { query });
            return response.data;
        } catch (error) {
            console.error('Error searching tasks:', error);
            throw error;
        }
    }
}

export const taskService = new TaskService();
export default api;
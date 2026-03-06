// CodeClash API Client
const API_BASE = '/api';


const api = {
    getToken() {
        return localStorage.getItem('cc_token');
    },

    setAuth(data) {
        localStorage.setItem('cc_token', data.token);
        localStorage.setItem('cc_user', JSON.stringify({
            username: data.username,
            displayName: data.displayName,
            userId: data.userId
        }));
    },

    getUser() {
        const u = localStorage.getItem('cc_user');
        return u ? JSON.parse(u) : null;
    },

    logout() {
        localStorage.removeItem('cc_token');
        localStorage.removeItem('cc_user');
        window.location.href = 'login.html';
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const headers = { 'Content-Type': 'application/json' };
        const token = this.getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const res = await fetch(url, { ...options, headers });
            const contentType = res.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await res.json();
            } else {
                const text = await res.text();
                throw new Error(text || res.statusText || 'Request failed');
            }

            if (!res.ok) throw new Error(data.error || 'Request failed');
            return data;
        } catch (err) {
            console.error(`API Error [${endpoint}]:`, err);
            throw err;
        }

    },

    // Auth
    login(username, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },

    register(username, email, password, displayName) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password, displayName })
        });
    },

    // Users
    getProfile() { return this.request('/users/me'); },
    getDashboard() { return this.request('/users/dashboard'); },

    // Problems
    getProblems(difficulty) {
        const q = difficulty ? `?difficulty=${difficulty}` : '';
        return this.request(`/problems${q}`);
    },
    getProblem(id) { return this.request(`/problems/${id}`); },

    // Submissions
    submitCode(problemId, code, language) {
        return this.request('/submissions', {
            method: 'POST',
            body: JSON.stringify({ problemId, code, language })
        });
    },
    getSubmissions() { return this.request('/submissions'); },

    // Battles
    createBattle(problemId) {
        return this.request('/battles/create', {
            method: 'POST',
            body: JSON.stringify({ problemId })
        });
    },
    joinBattle(id) {
        return this.request(`/battles/${id}/join`, { method: 'POST' });
    },
    submitBattle(id, code, language) {
        return this.request(`/battles/${id}/submit`, {
            method: 'POST',
            body: JSON.stringify({ code, language })
        });
    },
    getBattle(id) { return this.request(`/battles/${id}`); },
    getAvailableBattles() { return this.request('/battles/available'); },

    // Coins
    getCoinBalance() { return this.request('/coins/balance'); },
    getCoinHistory() { return this.request('/coins/history'); },

    // Leaderboard
    getLeaderboard() { return this.request('/leaderboard'); },

    // Learning
    getLanguages() { return this.request('/languages'); },
    getTopics(languageId) { return this.request(`/topics?languageId=${languageId}`); },
    getLessons(topicId) { return this.request(`/lessons?topicId=${topicId}`); },
    getLesson(id) { return this.request(`/lessons/${id}`); },

    // LeetCode
    connectLeetcode(username) {
        return this.request('/leetcode/connect', {
            method: 'POST',
            body: JSON.stringify({ username })
        });
    },
    syncLeetcode() {
        return this.request('/leetcode/sync', { method: 'POST' });
    },
    getLeetcodeProfile() {
        return this.request('/leetcode/profile');
    }
};


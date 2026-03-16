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

            if (res.status === 401 || res.status === 403) {
                this.logout();
                throw new Error('Session expired. Please log in again.');
            }

            if (contentType && contentType.includes('application/json')) {
                data = await res.json();
                if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
                return data;
            } else {
                const text = await res.text();
                if (!res.ok) {
                    throw new Error(text || res.statusText || `Request failed (${res.status})`);
                }
                return text;
            }
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
    submitBattle(id, code, language) {
        return this.request(`/battles/${id}/submit`, {
            method: 'POST',
            body: JSON.stringify({ code, language })
        });
    },
    runBattle(id, code, language, inputData) {
        return this.request(`/battles/${id}/run`, {
            method: 'POST',
            body: JSON.stringify({ code, language, inputData })
        });
    },
    cancelBattle(id) {
        return this.request(`/battles/${id}/cancel`, {
            method: 'POST'
        });
    },
    getBattle(id) { return this.request(`/battles/${id}`); },
    findBattle(difficulty) {
        return this.request('/battles/find', {
            method: 'POST',
            body: JSON.stringify({ difficulty })
        });
    },
    checkMyActiveBattle() {
        return this.request('/battles/my-active');
    },

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


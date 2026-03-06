// Dashboard page logic
(async function () {
    renderNav('dashboard');
    if (!requireAuth()) return;

    try {
        const dash = await api.getDashboard();
        document.getElementById('userName').textContent = dash.displayName || dash.username;
        document.getElementById('totalCoins').textContent = dash.totalCoins;
        document.getElementById('problemsSolved').textContent = dash.problemsSolved;
        document.getElementById('userRank').textContent = `#${dash.userRank}`;
        document.getElementById('totalUsers').textContent = dash.totalUsers;
    } catch (err) {
        document.getElementById('userName').textContent = api.getUser()?.displayName || '';
    }

    try {
        const submissions = await api.getSubmissions();
        const el = document.getElementById('recentSubmissions');
        if (submissions.length === 0) {
            el.innerHTML = '<div class="empty-state"><span class="icon">📝</span><p>No submissions yet. Start solving problems!</p></div>';
            return;
        }
        el.innerHTML = `
            <div class="table-container">
                <table>
                    <thead><tr><th>Problem</th><th>Language</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                        ${submissions.slice(0, 10).map(s => `
                            <tr>
                                <td><a href="problem.html?id=${s.problemId}" style="color:var(--accent);text-decoration:none;">${s.problemTitle}</a></td>
                                <td>${s.language || '—'}</td>
                                <td><span class="badge ${s.status === 'ACCEPTED' ? 'badge-easy' : 'badge-hard'}">${s.status}</span></td>
                                <td style="color:var(--text-secondary);font-size:0.8125rem;">${new Date(s.createdAt).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        document.getElementById('recentSubmissions').innerHTML = '<div class="empty-state"><p>Could not load submissions.</p></div>';
    }
})();

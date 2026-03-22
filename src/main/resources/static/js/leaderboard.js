// Leaderboard page logic
(async function () {
    renderNav('leaderboard');

    try {
        const leaderboard = await api.getLeaderboard();
        const el = document.getElementById('leaderboard');

        if (leaderboard.length === 0) {
            el.innerHTML = '<div class="empty-state"><span class="icon">🏆</span><p>No rankings available yet.</p></div>';
            return;
        }

        // Calculate score and sort
        const rankedData = leaderboard.map(u => ({
            ...u,
            score: (u.totalCoins || 0) * 2 + (u.battleWins || 0) * 2 + (u.battlesAttended || 0)
        })).sort((a, b) => b.score - a.score);

        // Assign ranks
        rankedData.forEach((u, i) => u.rank = i + 1);

        el.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th style="width:70px">Rank</th>
                            <th>User</th>
                            <th style="text-align:right">Problems</th>
                            <th style="text-align:right">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rankedData.map(u => `
                            <tr>
                                <td style="font-weight:700; color:${u.rank <= 3 ? 'var(--accent)' : 'inherit'};">
                                    ${u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : u.rank === 3 ? '🥉' : `#${u.rank}`}
                                </td>
                                <td>
                                    <div style="font-weight:600;">${u.displayName || u.username}</div>
                                    <div style="font-size:0.75rem; color:var(--text-secondary);">@${u.username}</div>
                                </td>
                                <td style="text-align:right; font-family:'JetBrains Mono', monospace;">${u.problemsSolved}</td>
                                <td style="text-align:right; font-weight:800; color:var(--accent);">${u.score}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (e) {
        document.getElementById('leaderboard').innerHTML = '<div class="empty-state"><p>Could not load leaderboard.</p></div>';
    }
})();

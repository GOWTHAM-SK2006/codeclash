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

        // Assign ranks and format data
        rankedData.forEach((u, i) => u.rank = i + 1);

        const top3 = rankedData.slice(0, 3);
        const others = rankedData.slice(3);

        const renderPodium = () => {
            if (top3.length === 0) return '';

            const [p1, p2, p3] = [top3[0], top3[1], top3[2]];

            return `
                <div class="podium-container">
                    ${p2 ? `
                        <div class="podium-item second">
                            <div class="rank-badge">2</div>
                            <div class="card-user">
                                <span class="name">${p2.displayName || p2.username}</span>
                                <span class="handle">@${p2.username}</span>
                            </div>
                            <div class="score-display">${p2.score}</div>
                            <div class="podium-stats">
                                <span class="stat-badge">⚔️ ${p2.battleWins || 0}</span>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="podium-item first">
                        <div class="rank-badge">1</div>
                        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">👑</div>
                        <div class="card-user">
                            <span class="name" style="font-size: 1.3rem;">${p1.displayName || p1.username}</span>
                            <span class="handle">@${p1.username}</span>
                        </div>
                        <div class="score-display">${p1.score}</div>
                        <div class="podium-stats">
                            <span class="stat-badge">⚔️ ${p1.battleWins || 0}</span>
                        </div>
                    </div>
                    
                    ${p3 ? `
                        <div class="podium-item third">
                            <div class="rank-badge">3</div>
                            <div class="card-user">
                                <span class="name">${p3.displayName || p3.username}</span>
                                <span class="handle">@${p3.username}</span>
                            </div>
                            <div class="score-display">${p3.score}</div>
                            <div class="podium-stats">
                                <span class="stat-badge">⚔️ ${p3.battleWins || 0}</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        };

        const renderList = () => {
            return `
                <div class="leaderboard-list">
                    ${others.map((u, i) => `
                        <div class="leaderboard-card" style="animation-delay: ${0.4 + i * 0.05}s">
                            <div class="card-rank">#${u.rank}</div>
                            <div class="card-user">
                                <span class="name">${u.displayName || u.username}</span>
                                <span class="handle">@${u.username}</span>
                            </div>
                            <div class="card-stats">
                                <span><b>${u.battleWins || 0}</b> wins</span>
                                <span><b>${u.problemsSolved || 0}</b> solved</span>
                            </div>
                            <div class="card-score">${u.score}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        };

        el.innerHTML = renderPodium() + renderList();
    } catch (e) {
        document.getElementById('leaderboard').innerHTML = '<div class="empty-state"><p>Could not load leaderboard.</p></div>';
    }
})();

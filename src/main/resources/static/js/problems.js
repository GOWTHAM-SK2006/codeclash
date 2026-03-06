// Problems page logic
let allProblems = [];

(async function () {
    renderNav('problems');

    try {
        allProblems = await api.getProblems();
        renderProblems(allProblems);
    } catch (e) {
        document.getElementById('problemsList').innerHTML = '<div class="empty-state"><p>Could not load problems.</p></div>';
    }
})();

function filterProblems(difficulty) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    if (difficulty === 'all') {
        renderProblems(allProblems);
    } else {
        renderProblems(allProblems.filter(p => p.difficulty === difficulty));
    }
}

function renderProblems(problems) {
    const el = document.getElementById('problemsList');
    if (problems.length === 0) {
        el.innerHTML = '<div class="empty-state"><span class="icon">🔍</span><p>No problems found.</p></div>';
        return;
    }

    el.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th style="width:50px">#</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Difficulty</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    ${problems.map((p, i) => `
                        <tr style="cursor:pointer;" onclick="window.location.href='problem.html?id=${p.id}'">
                            <td style="color:var(--text-muted);">${p.id}</td>
                            <td><strong>${p.title}</strong></td>
                            <td style="color:var(--text-secondary);font-size:0.8125rem;">${p.category || '—'}</td>
                            <td><span class="badge badge-${p.difficulty.toLowerCase()}">${p.difficulty}</span></td>
                            <td style="color:var(--accent);font-weight:600;">🪙 ${p.points}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

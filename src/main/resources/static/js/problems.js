document.addEventListener('DOMContentLoaded', async () => {
    renderNav('problems');

    if (typeof requireAuth === 'function') {
        if (!requireAuth()) return;
    }

    const card = document.getElementById('leetcodePracticeCard');

    try {
        const profile = await api.getLeetcodeProfile();
        const username = profile?.leetcodeUsername;

        if (!username) {
            renderDisconnectedState(card);
            return;
        }

        const profileLink = `https://leetcode.com/u/${encodeURIComponent(username)}/`;

        card.innerHTML = `
            <div class="empty-state" style="padding:2rem 1rem;">
                <span class="icon">🔗</span>
                <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:0.75rem;">LeetCode Profile Connected</h2>
                <p style="margin-bottom:0.5rem;">Hi ${escapeHtml(username)}, solve your coding challenges directly on LeetCode.</p>
                <p style="margin-bottom:1.5rem;color:var(--text-muted);">Your profile link is ready below.</p>
                <a class="btn btn-primary" href="${profileLink}" target="_blank" rel="noopener noreferrer">Go to Your LeetCode</a>
            </div>
        `;
    } catch (e) {
        renderDisconnectedState(card);
    }
});

function renderDisconnectedState(card) {
    card.innerHTML = `
        <div class="empty-state" style="padding:2rem 1rem;">
            <span class="icon">👤</span>
            <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:0.75rem;">Connect Your LeetCode Profile</h2>
            <p style="margin-bottom:1.5rem;">No linked LeetCode account found. Connect it from your profile page and solve there.</p>
            <a class="btn btn-primary" href="profile.html">Connect in Profile</a>
        </div>
    `;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

// Auth helpers
function requireAuth() {
    const token = api.getToken();
    const looksLikeJwt = token && token.split('.').length === 3;

    if (!token || !looksLikeJwt) {
        localStorage.removeItem('cc_token');
        localStorage.removeItem('cc_user');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function renderNav(activePage) {
    const user = api.getUser();
    const isLoggedIn = api.isLoggedIn();
    const fullName = (user?.displayName || user?.username || 'User').trim();
    const initials = fullName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join('') || 'U';

    const nav = document.getElementById('navbar');
    if (!nav) return;

    nav.innerHTML = `
        <a href="index.html" class="logo">⚡ Code<span>Clash</span></a>
        <ul class="nav-links">
            <li><a href="dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a></li>
            <li><a href="learn.html" class="${activePage === 'learn' ? 'active' : ''}">Learn</a></li>
            <li><a href="problems.html" class="${activePage === 'problems' ? 'active' : ''}">Problems</a></li>
            <li><a href="battle-mode.html" class="${activePage === 'battle' ? 'active' : ''}">Battle</a></li>
            <li><a href="leaderboard.html" class="${activePage === 'leaderboard' ? 'active' : ''}">Leaderboard</a></li>
        </ul>
        <div class="nav-auth">
            ${isLoggedIn
             ? `<a href="profile.html" class="profile-chip">
                  <span class="profile-avatar">${initials}</span>
                  <span>Profile</span>
             </a>
             <button onclick="api.logout()" class="icon-logout-btn" aria-label="Logout" title="Logout">⏻</button>`
            : `<a href="login.html" class="btn btn-ghost">Log in</a>
                   <a href="register.html" class="btn btn-primary btn-sm">Sign up</a>`
        }
        </div>
    `;
}

function showAlert(id, message, type = 'error') {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = `alert alert-${type}`;
    el.textContent = message;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
}

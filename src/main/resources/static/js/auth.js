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

let friendNotificationPoller = null;
let notificationDocListenerBound = false;

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
            <li><a href="friends.html" class="${activePage === 'friends' ? 'active' : ''}">Friends</a></li>
        </ul>
        <div class="nav-auth">
            ${isLoggedIn
             ? `<div class="notification-wrap" id="friendNotificationWrap">
                  <button class="notification-bell" id="friendNotificationBell" aria-label="Friend notifications" title="Friend notifications">
                      🔔
                      <span class="notification-badge hidden" id="friendNotificationBadge">0</span>
                  </button>
                  <div class="notification-dropdown" id="friendNotificationDropdown">
                      <div class="notification-title">Friend Requests</div>
                      <div id="friendNotificationList" class="notification-list">
                          <div class="notification-empty">Checking notifications...</div>
                      </div>
                  </div>
             </div>
             <a href="profile.html" class="profile-chip">
                  <span class="profile-avatar">${initials}</span>
                  <span>Profile</span>
             </a>
             <button onclick="api.logout()" class="icon-logout-btn" aria-label="Logout" title="Logout">⏻</button>`
            : `<a href="login.html" class="btn btn-ghost">Log in</a>
                   <a href="register.html" class="btn btn-primary btn-sm">Sign up</a>`
        }
        </div>
    `;

    if (isLoggedIn) {
        initializeFriendNotifications();
    } else {
        teardownFriendNotifications();
    }
}

function teardownFriendNotifications() {
    if (friendNotificationPoller) {
        clearInterval(friendNotificationPoller);
        friendNotificationPoller = null;
    }
}

function initializeFriendNotifications() {
    const wrap = document.getElementById('friendNotificationWrap');
    const bell = document.getElementById('friendNotificationBell');
    const dropdown = document.getElementById('friendNotificationDropdown');
    const list = document.getElementById('friendNotificationList');

    if (!wrap || !bell || !dropdown || !list) return;

    bell.addEventListener('click', (event) => {
        event.stopPropagation();
        wrap.classList.toggle('open');
    });

    dropdown.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    list.addEventListener('click', async (event) => {
        const button = event.target.closest('.notification-accept-btn');
        if (!button) return;

        const requestId = button.dataset.requestId;
        if (!requestId) return;

        button.disabled = true;
        button.textContent = 'Accepting...';
        try {
            await api.acceptFriendRequest(requestId);
            await refreshFriendNotifications();
            window.dispatchEvent(new CustomEvent('cc:friendsUpdated'));
        } catch (error) {
            button.disabled = false;
            button.textContent = 'Accept';
        }
    });

    if (!notificationDocListenerBound) {
        document.addEventListener('click', () => {
            const currentWrap = document.getElementById('friendNotificationWrap');
            if (currentWrap) currentWrap.classList.remove('open');
        });
        notificationDocListenerBound = true;
    }

    refreshFriendNotifications();
    teardownFriendNotifications();
    friendNotificationPoller = setInterval(refreshFriendNotifications, 8000);
}

async function refreshFriendNotifications() {
    const badge = document.getElementById('friendNotificationBadge');
    const list = document.getElementById('friendNotificationList');
    if (!badge || !list || !api.isLoggedIn()) return;

    try {
        const notifications = await api.getFriendNotifications();
        const count = notifications.length;

        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : String(count);
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }

        if (count === 0) {
            list.innerHTML = '<div class="notification-empty">No pending friend requests</div>';
            return;
        }

        list.innerHTML = notifications.map(item => {
            const displayName = escapeHtml(item.fromDisplayName || item.fromUsername || 'Coder');
            const username = escapeHtml(item.fromUsername || 'user');
            return `
                <div class="notification-item">
                    <div class="notification-body">
                        <div class="notification-user">${displayName}</div>
                        <div class="notification-sub">@${username} sent you a request · ${timeAgo(item.createdAt)}</div>
                    </div>
                    <button class="btn btn-primary btn-sm notification-accept-btn" data-request-id="${item.requestId}">Accept</button>
                </div>
            `;
        }).join('');
    } catch (error) {
        list.innerHTML = '<div class="notification-empty">Could not load notifications</div>';
    }
}

function timeAgo(isoTime) {
    if (!isoTime) return 'just now';

    const createdAt = new Date(isoTime);
    const seconds = Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / 1000));
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showAlert(id, message, type = 'error') {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = `alert alert-${type}`;
    el.textContent = message;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
}

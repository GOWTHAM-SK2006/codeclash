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
let activeNotifTab = 'alerts'; // 'alerts' or 'friends'

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
            <li><a href="events.html" class="${activePage === 'events' ? 'active' : ''}">Events</a></li>
            <li><a href="leaderboard.html" class="${activePage === 'leaderboard' ? 'active' : ''}">Leaderboard</a></li>
            <li><a href="friends.html" class="${activePage === 'friends' ? 'active' : ''}">Friends</a></li>
        </ul>
        <div class="nav-auth">
            ${isLoggedIn
            ? `<div class="notification-wrap" id="friendNotificationWrap">
                  <button class="notification-bell" id="friendNotificationBell" aria-label="Notifications" title="Notifications">
                      🔔
                      <span class="notification-badge hidden" id="friendNotificationBadge">0</span>
                  </button>
                  <div class="notification-dropdown" id="friendNotificationDropdown">
                      <div style="display:flex;border-bottom:1px solid var(--border);">
                          <button class="notification-tab active" id="notifTabAlerts" data-tab="alerts" style="flex:1;padding:0.55rem 0.5rem;font-size:0.75rem;font-weight:700;cursor:pointer;border:none;background:transparent;color:var(--text-secondary);border-bottom:2px solid transparent;">📢 Alerts</button>
                          <button class="notification-tab" id="notifTabFriends" data-tab="friends" style="flex:1;padding:0.55rem 0.5rem;font-size:0.75rem;font-weight:700;cursor:pointer;border:none;background:transparent;color:var(--text-secondary);border-bottom:2px solid transparent;">👥 Requests</button>
                      </div>
                      <div id="notifContentAlerts" class="notification-list"></div>
                      <div id="notifContentFriends" class="notification-list" style="display:none;"></div>
                      <div id="notifMarkReadWrap" style="display:none;padding:0.4rem 0.6rem;border-top:1px solid var(--border);">
                          <button id="markAllReadBtn" style="width:100%;padding:0.4rem;font-size:0.7rem;font-weight:700;cursor:pointer;border:1px solid var(--border);border-radius:var(--radius-sm);background:transparent;color:var(--accent);">✓ Mark All Read</button>
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
        initializeNotifications();
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

function initializeNotifications() {
    const wrap = document.getElementById('friendNotificationWrap');
    const bell = document.getElementById('friendNotificationBell');
    const dropdown = document.getElementById('friendNotificationDropdown');

    if (!wrap || !bell || !dropdown) return;

    // Toggle dropdown
    bell.addEventListener('click', (event) => {
        event.stopPropagation();
        wrap.classList.toggle('open');
    });
    dropdown.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    // Tab switching
    const tabAlerts = document.getElementById('notifTabAlerts');
    const tabFriends = document.getElementById('notifTabFriends');
    const contentAlerts = document.getElementById('notifContentAlerts');
    const contentFriends = document.getElementById('notifContentFriends');
    const markReadWrap = document.getElementById('notifMarkReadWrap');

    function switchTab(tab) {
        activeNotifTab = tab;
        if (tab === 'alerts') {
            tabAlerts.classList.add('active');
            tabAlerts.style.borderBottomColor = 'var(--accent)';
            tabAlerts.style.color = 'var(--text-primary)';
            tabFriends.classList.remove('active');
            tabFriends.style.borderBottomColor = 'transparent';
            tabFriends.style.color = 'var(--text-secondary)';
            contentAlerts.style.display = '';
            contentFriends.style.display = 'none';
        } else {
            tabFriends.classList.add('active');
            tabFriends.style.borderBottomColor = 'var(--accent)';
            tabFriends.style.color = 'var(--text-primary)';
            tabAlerts.classList.remove('active');
            tabAlerts.style.borderBottomColor = 'transparent';
            tabAlerts.style.color = 'var(--text-secondary)';
            contentFriends.style.display = '';
            contentAlerts.style.display = 'none';
        }
    }

    tabAlerts?.addEventListener('click', () => switchTab('alerts'));
    tabFriends?.addEventListener('click', () => switchTab('friends'));
    switchTab(activeNotifTab);

    // Mark all read
    const markAllBtn = document.getElementById('markAllReadBtn');
    markAllBtn?.addEventListener('click', async () => {
        try {
            await api.markNotificationsRead();
            refreshAllNotifications();
        } catch (e) { /* ignore */ }
    });

    // Accept friend request delegation
    const friendsList = document.getElementById('notifContentFriends');
    friendsList?.addEventListener('click', async (event) => {
        const button = event.target.closest('.notification-accept-btn');
        if (!button) return;
        const requestId = button.dataset.requestId;
        if (!requestId) return;
        button.disabled = true;
        button.textContent = 'Accepting...';
        try {
            await api.acceptFriendRequest(requestId);
            await refreshAllNotifications();
            window.dispatchEvent(new CustomEvent('cc:friendsUpdated'));
        } catch (error) {
            button.disabled = false;
            button.textContent = 'Accept';
        }
    });

    // Close on outside click
    if (!notificationDocListenerBound) {
        document.addEventListener('click', () => {
            const currentWrap = document.getElementById('friendNotificationWrap');
            if (currentWrap) currentWrap.classList.remove('open');
        });
        notificationDocListenerBound = true;
    }

    refreshAllNotifications();
    teardownFriendNotifications();
    friendNotificationPoller = setInterval(refreshAllNotifications, 8000);
}

function getNotifIcon(type) {
    switch (type) {
        case 'EVENT_ANNOUNCED': return '📢';
        case 'BIDDING_SELECTED': return '🏆';
        case 'BIDDING_REFUNDED': return '💰';
        case 'CONTEST_READY': return '🏁';
        default: return '🔔';
    }
}

async function refreshAllNotifications() {
    const badge = document.getElementById('friendNotificationBadge');
    const alertsList = document.getElementById('notifContentAlerts');
    const friendsList = document.getElementById('notifContentFriends');
    const markReadWrap = document.getElementById('notifMarkReadWrap');
    if (!badge || !alertsList || !friendsList || !api.isLoggedIn()) return;

    let friendCount = 0;
    let alertCount = 0;

    // Fetch friend requests
    try {
        const friendNotifs = await api.getFriendNotifications();
        friendCount = friendNotifs.length;

        if (friendCount === 0) {
            friendsList.innerHTML = '<div class="notification-empty">No pending friend requests</div>';
        } else {
            friendsList.innerHTML = friendNotifs.map(item => {
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
        }
    } catch (e) {
        friendsList.innerHTML = '<div class="notification-empty">Could not load requests</div>';
    }

    // Fetch system notifications
    try {
        const countData = await api.getNotificationCount();
        alertCount = countData.count || 0;

        const notifications = await api.getNotifications();
        if (!notifications || notifications.length === 0) {
            alertsList.innerHTML = '<div class="notification-empty">No notifications yet</div>';
        } else {
            alertsList.innerHTML = notifications.slice(0, 20).map(n => {
                const icon = getNotifIcon(n.type);
                const readClass = n.read ? 'opacity: 0.6;' : '';
                return `
                    <div class="notification-item" style="${readClass}">
                        <div style="font-size:1.3rem;margin-right:0.5rem;">${icon}</div>
                        <div class="notification-body">
                            <div class="notification-user">${escapeHtml(n.title)}</div>
                            <div class="notification-sub">${escapeHtml(n.message)} · ${timeAgo(n.createdAt)}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Show mark read button only if unread alerts exist
        if (markReadWrap) {
            markReadWrap.style.display = alertCount > 0 ? '' : 'none';
        }
    } catch (e) {
        alertsList.innerHTML = '<div class="notification-empty">Could not load notifications</div>';
    }

    // Update badge
    const totalCount = friendCount + alertCount;
    if (totalCount > 0) {
        badge.textContent = totalCount > 99 ? '99+' : String(totalCount);
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
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

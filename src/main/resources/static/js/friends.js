(async function () {
    renderNav('friends');
    if (!requireAuth()) return;

    const friendsListEl = document.getElementById('friendsList');
    const receivedRequestsEl = document.getElementById('receivedRequests');
    const sentRequestsEl = document.getElementById('sentRequests');
    const allUsersEl = document.getElementById('allUsers');

    function showMessage(message, type = 'success') {
        showAlert('friendsAlert', message, type);
    }

    function formatDate(isoDate) {
        if (!isoDate) return 'Just now';
        return new Date(isoDate).toLocaleString();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function userLabel(user) {
        return escapeHtml(user.displayName || user.username || 'Coder');
    }

    function renderFriends(friends) {
        if (!friends || friends.length === 0) {
            friendsListEl.innerHTML = '<div class="friends-empty">You don’t have friends yet. Send a request from All Users.</div>';
            return;
        }

        friendsListEl.innerHTML = friends.map(friend => `
            <div class="friend-card">
                <div class="friend-avatar">${(friend.displayName || friend.username || 'U').trim().charAt(0).toUpperCase()}</div>
                <div>
                    <div class="friend-name">${userLabel(friend)}</div>
                    <div class="friend-username">@${escapeHtml(friend.username)}</div>
                </div>
            </div>
        `).join('');
    }

    function renderReceived(requests) {
        if (!requests || requests.length === 0) {
            receivedRequestsEl.innerHTML = '<div class="friends-empty">No incoming requests right now.</div>';
            return;
        }

        receivedRequestsEl.innerHTML = requests.map(request => `
            <div class="request-item">
                <div>
                    <div class="request-name">${escapeHtml(request.fromDisplayName || request.fromUsername)}</div>
                    <div class="request-meta">@${escapeHtml(request.fromUsername)} · ${formatDate(request.createdAt)}</div>
                </div>
                <button class="btn btn-primary btn-sm accept-request-btn" data-request-id="${request.requestId}">Accept</button>
            </div>
        `).join('');
    }

    function renderSent(requests) {
        if (!requests || requests.length === 0) {
            sentRequestsEl.innerHTML = '<div class="friends-empty">No outgoing requests.</div>';
            return;
        }

        sentRequestsEl.innerHTML = requests.map(request => `
            <div class="request-item">
                <div>
                    <div class="request-name">${escapeHtml(request.toDisplayName || request.toUsername)}</div>
                    <div class="request-meta">@${escapeHtml(request.toUsername)} · Sent ${formatDate(request.createdAt)}</div>
                </div>
                <span class="badge badge-accent">Pending</span>
            </div>
        `).join('');
    }

    function actionButton(user) {
        switch (user.relation) {
            case 'FRIEND':
                return '<button class="btn btn-secondary btn-sm" disabled>Friends</button>';
            case 'SENT':
                return '<button class="btn btn-secondary btn-sm" disabled>Requested</button>';
            case 'RECEIVED':
                return `<button class="btn btn-primary btn-sm accept-request-btn" data-request-id="${user.requestId}">Accept</button>`;
            default:
                return `<button class="btn btn-outline btn-sm add-friend-btn" data-user-id="${user.userId}">Add Friend</button>`;
        }
    }

    function renderAllUsers(users) {
        if (!users || users.length === 0) {
            allUsersEl.innerHTML = '<div class="friends-empty">No users found.</div>';
            return;
        }

        allUsersEl.innerHTML = users.map(user => `
            <div class="user-row">
                <div>
                    <div class="request-name">${userLabel(user)}</div>
                    <div class="request-meta">@${escapeHtml(user.username)}</div>
                </div>
                <div>
                    ${actionButton(user)}
                </div>
            </div>
        `).join('');
    }

    async function loadOverview() {
        try {
            const overview = await api.getFriendsOverview();
            renderFriends(overview.friends || []);
            renderReceived(overview.receivedRequests || []);
            renderSent(overview.sentRequests || []);
            renderAllUsers(overview.allUsers || []);
        } catch (error) {
            const message = '<div class="friends-empty">Could not load friends data.</div>';
            friendsListEl.innerHTML = message;
            receivedRequestsEl.innerHTML = message;
            sentRequestsEl.innerHTML = message;
            allUsersEl.innerHTML = message;
        }
    }

    async function sendFriendRequest(targetUserId, buttonEl) {
        buttonEl.disabled = true;
        buttonEl.textContent = 'Sending...';

        try {
            await api.sendFriendRequest(targetUserId);
            showMessage('Friend request sent successfully', 'success');
            await loadOverview();
            window.dispatchEvent(new CustomEvent('cc:friendsUpdated'));
        } catch (error) {
            showMessage(error.message || 'Failed to send friend request', 'error');
            buttonEl.disabled = false;
            buttonEl.textContent = 'Add Friend';
        }
    }

    async function acceptFriendRequest(requestId, buttonEl) {
        buttonEl.disabled = true;
        buttonEl.textContent = 'Accepting...';
        try {
            await api.acceptFriendRequest(requestId);
            showMessage('Friend request accepted', 'success');
            await loadOverview();
            window.dispatchEvent(new CustomEvent('cc:friendsUpdated'));
        } catch (error) {
            showMessage(error.message || 'Failed to accept request', 'error');
            buttonEl.disabled = false;
            buttonEl.textContent = 'Accept';
        }
    }

    document.addEventListener('click', async (event) => {
        const addButton = event.target.closest('.add-friend-btn');
        if (addButton) {
            const targetUserId = addButton.dataset.userId;
            if (targetUserId) {
                await sendFriendRequest(targetUserId, addButton);
            }
            return;
        }

        const acceptButton = event.target.closest('.accept-request-btn');
        if (acceptButton) {
            const requestId = acceptButton.dataset.requestId;
            if (requestId) {
                await acceptFriendRequest(requestId, acceptButton);
            }
        }
    });

    window.addEventListener('cc:friendsUpdated', loadOverview);
    await loadOverview();
    setInterval(loadOverview, 12000);
})();

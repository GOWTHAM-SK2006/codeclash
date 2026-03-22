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


})();

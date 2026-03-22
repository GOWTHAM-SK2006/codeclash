// timeline.js — handles roadmap UI, unlock logic, gamification

const levels = [
  {
    id: 1,
    title: 'Basics',
    difficulty: 'Easy',
    problems: [
      { name: 'Two Sum', id: 1 },
      { name: 'Palindrome Number', id: 9 },
      { name: 'Roman to Integer', id: 13 },
      { name: 'Longest Common Prefix', id: 14 },
      { name: 'Valid Parentheses', id: 20 },
      { name: 'Remove Duplicates from Sorted Array', id: 26 },
      { name: 'Remove Element', id: 27 },
      { name: 'Search Insert Position', id: 35 },
      { name: 'Length of Last Word', id: 58 },
      { name: 'Plus One', id: 66 },
    ],
    minSolve: 10,
    xp: 100,
  },
  {
    id: 2,
    title: 'Arrays',
    difficulty: 'Easy',
    problems: [
      { name: 'Best Time to Buy and Sell Stock', id: 121 },
      { name: 'Contains Duplicate', id: 217 },
      { name: 'Maximum Subarray', id: 53 },
      { name: 'Move Zeroes', id: 283 },
      { name: 'Product of Array Except Self', id: 238 },
      { name: 'Maximum Product Subarray', id: 152 },
      { name: 'Two Sum II', id: 167 },
      { name: 'Intersection of Two Arrays', id: 349 },
      { name: 'Merge Sorted Array', id: 88 },
      { name: 'Rotate Array', id: 189 },
    ],
    minSolve: 10,
    xp: 120,
  },
  {
    id: 3,
    title: 'Strings',
    difficulty: 'Easy',
    problems: [
      { name: 'Valid Anagram', id: 242 },
      { name: 'Reverse String', id: 344 },
      { name: 'First Unique Character', id: 387 },
      { name: 'Find the Difference', id: 389 },
      { name: 'Is Subsequence', id: 392 },
      { name: 'Detect Capital', id: 520 },
      { name: 'Reverse Words in String', id: 151 },
      { name: 'Longest Palindrome', id: 409 },
      { name: 'Implement strStr()', id: 28 },
      { name: 'Count and Say', id: 38 },
    ],
    minSolve: 10,
    xp: 130,
  },
  {
    id: 4,
    title: 'Sliding Window',
    difficulty: 'Medium',
    problems: [
      { name: 'Longest Substring Without Repeating', id: 3 },
      { name: 'Container With Most Water', id: 11 },
      { name: '3Sum', id: 15 },
      { name: 'Minimum Size Subarray Sum', id: 209 },
      { name: 'Permutation in String', id: 567 },
      { name: 'Find All Anagrams', id: 438 },
      { name: 'Sliding Window Maximum', id: 239 },
      { name: 'Subarray Sum Equals K', id: 560 },
      { name: 'Longest Repeating Character Replacement', id: 424 },
      { name: 'Fruit Into Baskets', id: 904 },
    ],
    minSolve: 10,
    xp: 150,
  },
  {
    id: 5,
    title: 'Linked List',
    difficulty: 'Medium',
    problems: [
      { name: 'Reverse Linked List', id: 206 },
      { name: 'Merge Two Sorted Lists', id: 21 },
      { name: 'Linked List Cycle', id: 141 },
      { name: 'Remove Nth Node', id: 19 },
      { name: 'Intersection of Linked List', id: 160 },
      { name: 'Palindrome Linked List', id: 234 },
      { name: 'Add Two Numbers', id: 2 },
      { name: 'Swap Nodes in Pairs', id: 24 },
      { name: 'Rotate List', id: 61 },
      { name: 'Delete Node', id: 237 },
    ],
    minSolve: 10,
    xp: 170,
  },
  {
    id: 6,
    title: 'Trees',
    difficulty: 'Medium',
    problems: [
      { name: 'Maximum Depth', id: 104 },
      { name: 'Same Tree', id: 100 },
      { name: 'Invert Binary Tree', id: 226 },
      { name: 'Symmetric Tree', id: 101 },
      { name: 'Level Order Traversal', id: 102 },
      { name: 'Balanced Binary Tree', id: 110 },
      { name: 'Path Sum', id: 112 },
      { name: 'Diameter of Binary Tree', id: 543 },
      { name: 'Subtree of Another Tree', id: 572 },
      { name: 'Validate BST', id: 98 },
    ],
    minSolve: 10,
    xp: 200,
  },
];

// Simulated user progress (should be loaded from backend in real app)
let userProgress = JSON.parse(localStorage.getItem('userProgress')) || {
  level: 1,
  problemsSolved: Array(levels.length).fill(0),
  xp: 0,
  streak: 0,
  badges: Array(levels.length).fill(false),
};

function saveProgress() {
  localStorage.setItem('userProgress', JSON.stringify(userProgress));
}

function renderTimeline() {
  const timeline = document.getElementById('timeline');
  timeline.innerHTML = '';
  levels.forEach((level, idx) => {
    const unlocked = userProgress.level >= level.id;
    const completed = userProgress.problemsSolved[idx] >= level.minSolve;
    const card = document.createElement('div');
    card.className = `timeline-level`;
    card.innerHTML = `
      <div class="level-card ${unlocked ? 'unlocked' : 'locked'} ${completed ? 'animated-unlock' : ''}" data-level="${level.id}">
        <span class="xp-badge">+${level.xp} XP</span>
        <div class="level-title">${level.title}</div>
        <div class="level-difficulty">${level.difficulty}</div>
        <div class="level-progress">
          <div class="level-progress-bar" style="width: ${(userProgress.problemsSolved[idx] / level.problems.length) * 100}%"></div>
        </div>
        <div class="text-xs mb-2">${userProgress.problemsSolved[idx]}/${level.problems.length} completed</div>
        ${!unlocked ? '<span class="lock-icon"><i class="fas fa-lock"></i></span>' : ''}
        ${completed ? '<span class="badge">Complete!</span>' : ''}
      </div>
    `;
    if (unlocked) {
      card.querySelector('.level-card').addEventListener('click', () => openLevelModal(level, idx));
    }
    timeline.appendChild(card);
    if (idx < levels.length - 1) {
      const connector = document.createElement('div');
      connector.className = 'h-1 w-16 bg-primary-400 rounded-full';
      timeline.appendChild(connector);
    }
  });
}

function openLevelModal(level, idx) {
  document.getElementById('problemModal').classList.remove('hidden');
  document.getElementById('modalLevelTitle').textContent = `Level ${level.id}: ${level.title}`;
  const list = document.getElementById('problemList');
  list.innerHTML = '';
  level.problems.forEach((p, i) => {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between py-2 px-2 rounded hover:bg-primary-100 transition';
    li.innerHTML = `<span>${p.name} <span class="text-gray-400 text-xs">#${p.id}</span></span>`;
    if (i < 3) {
      li.innerHTML += '<span class="text-success font-bold">Visible</span>';
    } else {
      li.innerHTML += '<span class="text-gray-400">Hidden</span>';
    }
    list.appendChild(li);
  });
}

document.getElementById('closeModal').onclick = () => {
  document.getElementById('problemModal').classList.add('hidden');
};

document.getElementById('problemModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('problemModal')) {
    document.getElementById('problemModal').classList.add('hidden');
  }
});

function updateGamification() {
  document.getElementById('xpPoints').textContent = `XP: ${userProgress.xp}`;
  document.getElementById('streakCounter').textContent = `Streak: ${userProgress.streak} 🔥`;
  const badge = document.getElementById('levelBadge');
  if (userProgress.badges[userProgress.level - 2]) {
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

// Simulate solving a problem (for demo)
window.solveProblem = function(levelIdx) {
  if (userProgress.problemsSolved[levelIdx] < levels[levelIdx].problems.length) {
    userProgress.problemsSolved[levelIdx]++;
    userProgress.xp += Math.floor(levels[levelIdx].xp / levels[levelIdx].problems.length);
    userProgress.streak++;
    // Unlock next level if completed
    if (userProgress.problemsSolved[levelIdx] === levels[levelIdx].minSolve && userProgress.level === levels[levelIdx].id) {
      userProgress.level++;
      userProgress.badges[levelIdx] = true;
      setTimeout(() => {
        renderTimeline();
        updateGamification();
      }, 500);
    }
    saveProgress();
    renderTimeline();
    updateGamification();
  }
};

// For demo: add solve buttons
function addSolveButtons() {
  const timeline = document.getElementById('timeline');
  Array.from(timeline.querySelectorAll('.level-card.unlocked')).forEach((card, idx) => {
    let btn = document.createElement('button');
    btn.textContent = 'Solve Problem';
    btn.className = 'mt-2 px-3 py-1 bg-success text-white rounded shadow hover:bg-primary-600 transition';
    btn.onclick = (e) => {
      e.stopPropagation();
      solveProblem(idx);
    };
    card.appendChild(btn);
  });
}

function main() {
  renderTimeline();
  updateGamification();
  addSolveButtons();
}

main();

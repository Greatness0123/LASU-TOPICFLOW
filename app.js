let topics = [];
let requests = [];
let supervisors = [];
let currentUser = null;
let csrfToken = null;
let dashboardStats = null;
let topicScores = [];
let currentReportView = 'summary';
let staticMode = false;
const isStaticFile = window.location.protocol === 'file:';

const defaultDemoUsers = [
  { id: 1, name: 'Pius Tana', email: 'piusutana121@gmail.com', password: 'Pius-1234', role: 'admin', capacity: 0, area: '' },
  { id: 2, name: 'Dr. Adaeze Okafor', email: 'adaeze@topicflow.test', password: 'Pius-1234', role: 'supervisor', capacity: 6, area: 'Artificial Intelligence' },
  { id: 3, name: 'Prof. Ibrahim Musa', email: 'ibrahim@topicflow.test', password: 'Pius-1234', role: 'supervisor', capacity: 6, area: 'Data Science' },
  { id: 4, name: 'Dr. Chinedu Eze', email: 'chinedu@topicflow.test', password: 'Pius-1234', role: 'supervisor', capacity: 6, area: 'Web Development' },
  { id: 5, name: 'Dr. Nneka Obi', email: 'nneka@topicflow.test', password: 'Pius-1234', role: 'supervisor', capacity: 6, area: 'Cybersecurity' },
  { id: 6, name: 'Chiamaka Bello', email: 'chiamaka@topicflow.test', password: 'Pius-1234', role: 'student', capacity: 0, area: '' },
  { id: 7, name: 'Ifeanyi Okoro', email: 'ifeanyi@topicflow.test', password: 'Pius-1234', role: 'student', capacity: 0, area: '' },
  { id: 8, name: 'Tunde Bakare', email: 'tunde@topicflow.test', password: 'Pius-1234', role: 'student', capacity: 0, area: '' }
];

const defaultDemoTopics = [
  { id: 1, title: 'AI-powered student performance prediction', area: 'Artificial Intelligence', supervisor_id: 2, status: 'available', created_at: '2026-07-28' },
  { id: 2, title: 'Secure e-voting system for student elections', area: 'Cybersecurity', supervisor_id: 5, status: 'available', created_at: '2026-07-27' },
  { id: 3, title: 'Online project topic allocation platform', area: 'Web Development', supervisor_id: 4, status: 'allocated', created_at: '2026-07-26' },
  { id: 4, title: 'Crop disease detection using image recognition', area: 'Artificial Intelligence', supervisor_id: 2, status: 'available', created_at: '2026-07-25' },
  { id: 5, title: 'Intelligent campus navigation with indoor mapping', area: 'Artificial Intelligence', supervisor_id: 2, status: 'review', created_at: '2026-07-24' },
  { id: 6, title: 'Data-driven library recommendation engine', area: 'Data Science', supervisor_id: 3, status: 'available', created_at: '2026-07-23' },
  { id: 7, title: 'Remote lab equipment scheduling dashboard', area: 'Web Development', supervisor_id: 4, status: 'review', created_at: '2026-07-22' },
  { id: 8, title: 'Privacy-first student credential wallet', area: 'Cybersecurity', supervisor_id: 5, status: 'allocated', created_at: '2026-07-21' },
  { id: 9, title: 'Adaptive exam scheduling and load balancing', area: 'Data Science', supervisor_id: 3, status: 'available', created_at: '2026-07-20' },
  { id: 10, title: 'Sensor-based campus energy monitoring system', area: 'Artificial Intelligence', supervisor_id: 2, status: 'available', created_at: '2026-07-19' },
  { id: 11, title: 'Collaborative research project tracker', area: 'Web Development', supervisor_id: 4, status: 'allocated', created_at: '2026-07-18' },
  { id: 12, title: 'Behavioral analytics for attendance trends', area: 'Cybersecurity', supervisor_id: 5, status: 'review', created_at: '2026-07-17' }
];

const defaultDemoRequests = [
  { id: 1, student_id: 6, student: 'Chiamaka Bello', title: 'Blockchain-based certificate verification', area: 'Cybersecurity', status: 'pending', created_at: '2026-07-29' },
  { id: 2, student_id: 7, student: 'Ifeanyi Okoro', title: 'Machine learning field study planner', area: 'Data Science', status: 'draft', created_at: '2026-07-28' }
];

const defaultDemoAllocations = [
  { id: 1, student_id: 6, topic_id: 3, supervisor_id: 4, allocated_at: '2026-07-30 10:00:00' },
  { id: 2, student_id: 7, topic_id: 8, supervisor_id: 5, allocated_at: '2026-07-29 11:20:00' },
  { id: 3, student_id: 7, topic_id: 11, supervisor_id: 4, allocated_at: '2026-07-28 14:15:00' }
];

const defaultDemoTopicScores = [
  { topic_id: 3, score: 4, note: 'Strong proposal and clear scope.', updated_at: '2026-07-30T10:10:00.000Z' },
  { topic_id: 8, score: 5, note: 'Excellent alignment with security practice.', updated_at: '2026-07-29T11:40:00.000Z' }
];

const defaultSavedLogins = [
  { id: 1, name: 'Pius Tana', email: 'piusutana121@gmail.com', password: 'Pius-1234', role: 'admin' },
  { id: 2, name: 'Dr. Adaeze Okafor', email: 'adaeze@topicflow.test', password: 'Pius-1234', role: 'supervisor' },
  { id: 6, name: 'Chiamaka Bello', email: 'chiamaka@topicflow.test', password: 'Pius-1234', role: 'student' }
];

const SAVED_LOGIN_STORAGE_KEY = 'topicflow-saved-logins';

function getStoredUsers() {
  return JSON.parse(localStorage.getItem('topicflow-users') || '[]');
}
function saveStoredUsers(users) {
  localStorage.setItem('topicflow-users', JSON.stringify(users));
}
function getStoredTopics() {
  return JSON.parse(localStorage.getItem('topicflow-topics') || '[]');
}
function saveStoredTopics(topics) {
  localStorage.setItem('topicflow-topics', JSON.stringify(topics));
}
function getStoredRequests() {
  return JSON.parse(localStorage.getItem('topicflow-requests') || '[]');
}
function saveStoredRequests(requests) {
  localStorage.setItem('topicflow-requests', JSON.stringify(requests));
}
function getStoredAllocations() {
  return JSON.parse(localStorage.getItem('topicflow-allocations') || '[]');
}
function saveStoredAllocations(allocations) {
  localStorage.setItem('topicflow-allocations', JSON.stringify(allocations));
}
function getStoredScores() {
  return JSON.parse(localStorage.getItem('topicflow-scores') || '[]');
}
function saveStoredScores(scores) {
  localStorage.setItem('topicflow-scores', JSON.stringify(scores));
}

function initLocalStorageDb() {
  if (!localStorage.getItem('topicflow-users')) {
    localStorage.setItem('topicflow-users', JSON.stringify(defaultDemoUsers));
  }
  if (!localStorage.getItem('topicflow-topics')) {
    localStorage.setItem('topicflow-topics', JSON.stringify(defaultDemoTopics));
  }
  if (!localStorage.getItem('topicflow-requests')) {
    localStorage.setItem('topicflow-requests', JSON.stringify(defaultDemoRequests));
  }
  if (!localStorage.getItem('topicflow-allocations')) {
    localStorage.setItem('topicflow-allocations', JSON.stringify(defaultDemoAllocations));
  }
  if (!localStorage.getItem('topicflow-scores')) {
    localStorage.setItem('topicflow-scores', JSON.stringify(defaultDemoTopicScores));
  }
  if (!localStorage.getItem(SAVED_LOGIN_STORAGE_KEY)) {
    localStorage.setItem(SAVED_LOGIN_STORAGE_KEY, JSON.stringify(defaultSavedLogins));
  }
}

function syncFromLocalStorage() {
  initLocalStorageDb();

  const storedUsers = getStoredUsers();
  const storedTopics = getStoredTopics();
  const storedRequests = getStoredRequests();
  const storedAllocations = getStoredAllocations();
  const storedScores = getStoredScores();
  const storedSession = localStorage.getItem('topicflow-current-user');

  supervisors = storedUsers
    .filter(u => u.role === 'supervisor')
    .map(s => ({
      id: s.id,
      name: s.name,
      area: s.area || 'General',
      capacity: s.capacity ?? 6,
      avatarLabel: s.name.split(' ').slice(-1)[0].toUpperCase()
    }));

  topics = storedTopics.map(t => {
    const supervisorObj = storedUsers.find(u => u.id === Number(t.supervisor_id));
    return {
      ...t,
      supervisor: supervisorObj ? supervisorObj.name : 'Unassigned'
    };
  });

  requests = storedRequests;
  topicScores = storedScores;

  if (storedSession) {
    currentUser = JSON.parse(storedSession);
    csrfToken = 'demo';
  } else {
    currentUser = null;
    csrfToken = null;
  }

  const totalStudents = storedUsers.filter(u => u.role === 'student').length;
  const allocatedCount = storedAllocations.length;
  const availableCount = topics.filter(t => t.status === 'available').length;
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  dashboardStats = {
    total: totalStudents,
    allocated: allocatedCount,
    available: availableCount,
    pending: pendingCount
  };
}

function readStoredScores() {
  try {
    const stored = localStorage.getItem('topicflow-topic-scores');
    if (stored) topicScores = JSON.parse(stored);
  } catch (error) {
    console.warn('Unable to read saved topic scores', error);
  }
}

function getSavedLogins() {
  try {
    const stored = localStorage.getItem(SAVED_LOGIN_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Unable to read saved logins', error);
    return [];
  }
}

function saveSavedLogins(logins) {
  try {
    localStorage.setItem(SAVED_LOGIN_STORAGE_KEY, JSON.stringify(logins));
  } catch (error) {
    console.warn('Unable to save saved logins', error);
  }
}

function saveLoginAccount(user, password) {
  const email = String(user?.email || '').trim().toLowerCase();
  if (!email || !password) return;
  const next = getSavedLogins().filter(entry => String(entry.email || '').toLowerCase() !== email);
  next.unshift({ id: user?.id || null, name: user?.name || email, email, password: String(password), role: user?.role || 'student' });
  saveSavedLogins(next.slice(0, 5));
  renderSavedAccounts();
}

function renderSavedAccounts() {
  const container = document.querySelector('#saved-accounts');
  if (!container) return;
  const saved = getSavedLogins();
  if (!saved.length) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }
  container.classList.remove('hidden');
  container.innerHTML = `<p class="saved-accounts-title">Saved accounts</p><div class="saved-account-list">${saved.map(account => `<button class="saved-account-card" type="button" data-email="${escapeHtml(account.email)}" data-password="${escapeHtml(account.password)}"><span class="saved-account-name">${escapeHtml(account.name || account.email)}</span><span class="saved-account-email">${escapeHtml(account.email)}</span></button>`).join('')}</div>`;
  container.querySelectorAll('.saved-account-card').forEach(button => {
    button.addEventListener('click', async () => {
      const email = button.dataset.email || '';
      const password = button.dataset.password || '';
      if (!email || !password) return;
      document.querySelector('#login-email').value = email;
      document.querySelector('#login-password').value = password;
      await submitLogin(email, password);
    });
  });
}

function writeStoredScores() {
  try {
    localStorage.setItem('topicflow-topic-scores', JSON.stringify(topicScores));
  } catch (error) {
    console.warn('Unable to save topic scores', error);
  }
}

function getRoleLabel(role) {
  const normalized = String(role || '').toLowerCase();
  if (normalized === 'supervisor') return 'Supervisor';
  if (normalized === 'admin') return 'Admin';
  return 'Student';
}

function getAssignedTopics() {
  if (!currentUser || currentUser.role !== 'supervisor') return [];
  return topics.filter(topic => Number(topic.supervisor_id) === Number(currentUser.id));
}

function getScoreForTopic(topicId) {
  const entry = topicScores.find(item => Number(item.topic_id) === Number(topicId));
  return entry ? entry.score : null;
}

function getNoteForTopic(topicId) {
  const entry = topicScores.find(item => Number(item.topic_id) === Number(topicId));
  return entry?.note || '';
}

function enableStaticDemoMode() {
  staticMode = true;
  syncFromLocalStorage();

  const loginWall = document.querySelector('#login-wall');
  if (!currentUser) {
    loginWall?.classList.remove('hidden');
  } else {
    loginWall?.classList.add('hidden');
  }

  updateAuthUi();
  populateSupervisors();
  renderSavedAccounts();
  render();
}

function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function avatarInitials(name) { return String(name || '').split(' ').filter(Boolean).slice(0,2).map(word => word[0].toUpperCase()).join(''); }
function avatarColor(name) { const colors = ['#f6ab63','#c7e7ed','#dff168','#e4d9fa','#85b8c5','#a1d4c6']; const hash = String(name || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0); return colors[hash % colors.length]; }
function avatarDataUri(name) { const initials = avatarInitials(name) || '?'; const bg = avatarColor(name); const fg = '#163a38'; const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="${bg}"/><text x="50%" y="56%" font-family="DM Sans, sans-serif" font-size="60" fill="${fg}" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`; return `data:image/svg+xml,${encodeURIComponent(svg)}`; }
function simulateApi(action, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  // First, ensure local storage database is initialized and local state is synced
  syncFromLocalStorage();

  const storedUsers = getStoredUsers();
  const storedTopics = getStoredTopics();
  const storedRequests = getStoredRequests();
  const storedAllocations = getStoredAllocations();
  const storedScores = getStoredScores();

  if (action === 'me') {
    return Promise.resolve({ user: currentUser, csrf: csrfToken });
  }

  if (action === 'login' && method === 'POST') {
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '').trim();
    const user = storedUsers.find(u => String(u.email || '').toLowerCase() === email);
    if (!user || password !== user.password) {
      return Promise.reject(new Error('Invalid email or password'));
    }
    currentUser = { ...user };
    delete currentUser.password; // sanitize
    csrfToken = 'demo';
    localStorage.setItem('topicflow-current-user', JSON.stringify(currentUser));
    syncFromLocalStorage();
    return Promise.resolve({ user: currentUser, csrf: csrfToken });
  }

  if (action === 'logout' && method === 'POST') {
    currentUser = null;
    csrfToken = null;
    localStorage.removeItem('topicflow-current-user');
    syncFromLocalStorage();
    return Promise.resolve({ ok: true });
  }

  if (action === 'register' && method === 'POST') {
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '').trim();
    if (!name || !email || !password) {
      return Promise.reject(new Error('All fields are required'));
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return Promise.reject(new Error('Enter a valid email address'));
    }
    if (storedUsers.some(u => String(u.email || '').toLowerCase() === email)) {
      return Promise.reject(new Error('Email already registered'));
    }
    const id = Math.max(0, ...storedUsers.map(u => u.id)) + 1;
    const newUser = {
      id,
      name,
      email,
      password,
      role: body.role || 'student',
      area: body.role === 'supervisor' ? (body.role === 'supervisor' ? 'Artificial Intelligence' : 'General') : '',
      capacity: body.role === 'supervisor' ? 6 : 0
    };
    storedUsers.push(newUser);
    saveStoredUsers(storedUsers);

    currentUser = { ...newUser };
    delete currentUser.password; // sanitize
    csrfToken = 'demo';
    localStorage.setItem('topicflow-current-user', JSON.stringify(currentUser));
    syncFromLocalStorage();
    return Promise.resolve({ user: currentUser, csrf: csrfToken });
  }

  if (action === 'supervisors') {
    return Promise.resolve(supervisors);
  }

  if (action === 'dashboard') {
    return Promise.resolve(dashboardStats);
  }

  if (action === 'scores') {
    return Promise.resolve(topicScores);
  }

  if (action === 'score-topic' && method === 'POST') {
    const topicId = Number(body.topic_id || 0);
    const score = Number(body.score || 0);
    if (!topicId || score < 1 || score > 5) {
      return Promise.reject(new Error('Choose a score between 1 and 5.'));
    }
    const targetTopic = storedTopics.find(t => t.id === topicId);
    if (!targetTopic || (currentUser.role === 'supervisor' && Number(targetTopic.supervisor_id) !== Number(currentUser.id))) {
      return Promise.reject(new Error('Topic not assigned to you'));
    }
    const idx = storedScores.findIndex(item => Number(item.topic_id) === topicId);
    const scoreRecord = {
      topic_id: topicId,
      score,
      note: body.note || '',
      updated_at: new Date().toISOString()
    };
    if (idx !== -1) {
      storedScores[idx] = scoreRecord;
    } else {
      storedScores.push(scoreRecord);
    }
    saveStoredScores(storedScores);
    syncFromLocalStorage();
    return Promise.resolve({ ok: true });
  }

  if (action === 'topics') {
    if (method === 'GET') {
      return Promise.resolve(topics);
    }
    const title = String(body.title || '').trim();
    const area = String(body.area || 'General').trim();
    if (title.length < 8) {
      return Promise.reject(new Error('Title must be at least 8 characters'));
    }
    // Similarity duplicate warning check
    const words = title.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    const terms = words.split(' ').filter(w => w.length > 4);
    const isDuplicate = terms.length > 0 && storedTopics.some(t => {
      const tTitle = t.title.toLowerCase();
      return terms.some(term => tTitle.includes(term));
    });
    if (isDuplicate) {
      return Promise.reject(new Error('Possible duplicate'));
    }

    const supervisorId = currentUser.role === 'supervisor' ? currentUser.id : Number(body.supervisor_id || 0);
    if (!storedUsers.some(u => u.id === supervisorId && u.role === 'supervisor')) {
      return Promise.reject(new Error('Select a valid supervisor'));
    }

    const nextTopicId = Math.max(0, ...storedTopics.map(t => t.id)) + 1;
    const newTopic = {
      id: nextTopicId,
      title,
      area,
      supervisor_id: supervisorId,
      status: 'available',
      created_at: new Date().toISOString().slice(0, 10)
    };
    storedTopics.unshift(newTopic);
    saveStoredTopics(storedTopics);
    syncFromLocalStorage();
    return Promise.resolve({ id: newTopic.id, message: 'Topic created' });
  }

  if (action === 'requests') {
    if (method === 'GET') {
      let filtered = [...storedRequests];
      if (currentUser?.role === 'student') {
        filtered = filtered.filter(r => r.student_id === currentUser.id);
      } else if (currentUser?.role === 'supervisor') {
        filtered = filtered.filter(r => String(r.area).toLowerCase() === String(currentUser.area || '').toLowerCase());
      }
      return Promise.resolve(filtered);
    }

    // POST request
    const title = String(body.title || '').trim();
    const area = String(body.area || 'General').trim();
    const mode = body.mode === 'draft' ? 'draft' : 'pending';
    if (title.length < 8) {
      return Promise.reject(new Error('Title must be at least 8 characters'));
    }
    if (mode === 'pending' && storedRequests.some(r => r.student_id === currentUser.id && r.status === 'pending')) {
      return Promise.reject(new Error('You already have a pending request'));
    }

    const nextRequestId = Math.max(0, ...storedRequests.map(r => r.id)) + 1;
    const newRequest = {
      id: nextRequestId,
      student_id: currentUser.id,
      student: currentUser.name,
      title,
      area,
      status: mode,
      created_at: new Date().toISOString().slice(0, 10)
    };
    storedRequests.unshift(newRequest);
    saveStoredRequests(storedRequests);
    syncFromLocalStorage();
    return Promise.resolve({ id: newRequest.id, status: newRequest.status });
  }

  if (action === 'review-request' && method === 'POST') {
    const requestId = Number(body.id || 0);
    const decision = body.decision;
    if (requestId < 1 || !['approved', 'rejected'].includes(decision)) {
      return Promise.reject(new Error('Invalid request review'));
    }
    const idx = storedRequests.findIndex(r => r.id === requestId && r.status === 'pending');
    if (idx === -1) {
      return Promise.reject(new Error('Request is unavailable'));
    }
    const request = storedRequests[idx];
    // Check permission
    const canUserReview = currentUser.role === 'admin' || (currentUser.role === 'supervisor' && String(currentUser.area || '').toLowerCase() === String(request.area || '').toLowerCase());
    if (!canUserReview) {
      return Promise.reject(new Error('Forbidden'));
    }
    request.status = decision;
    saveStoredRequests(storedRequests);
    syncFromLocalStorage();
    return Promise.resolve({ ok: true });
  }

  if (action === 'allocate' && method === 'POST') {
    const studentId = Number(body.student_id || 0);
    const topicId = Number(body.topic_id || 0);
    const student = storedUsers.find(u => u.id === studentId && u.role === 'student');
    if (!student) {
      return Promise.reject(new Error('Select a valid student'));
    }
    const topic = storedTopics.find(t => t.id === topicId);
    if (!topic || topic.status !== 'available') {
      return Promise.reject(new Error('Topic is unavailable'));
    }
    if (currentUser.role === 'supervisor' && Number(topic.supervisor_id) !== Number(currentUser.id)) {
      return Promise.reject(new Error('Forbidden'));
    }
    const supervisorObj = storedUsers.find(u => u.id === Number(topic.supervisor_id) && u.role === 'supervisor');
    const currentLoad = storedAllocations.filter(a => Number(a.supervisor_id) === Number(topic.supervisor_id)).length;
    if (!supervisorObj || currentLoad >= (supervisorObj.capacity ?? 6)) {
      return Promise.reject(new Error('Supervisor is at capacity'));
    }

    // Register allocation
    const nextAllocId = Math.max(0, ...storedAllocations.map(a => a.id)) + 1;
    storedAllocations.push({
      id: nextAllocId,
      student_id: studentId,
      topic_id: topicId,
      supervisor_id: topic.supervisor_id,
      allocated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    });
    topic.status = 'allocated';
    saveStoredAllocations(storedAllocations);
    saveStoredTopics(storedTopics);
    syncFromLocalStorage();
    return Promise.resolve({ ok: true });
  }

  return Promise.reject(new Error('Static demo action not supported'));
}

const titleCase = value => String(value || '').replace(/^./, char => char.toUpperCase());
function safeSetText(selector, value) {
  const el = document.querySelector(selector);
  if (!el) {
    console.warn(`Missing DOM element for selector: ${selector}`);
    return;
  }
  el.textContent = value;
}
function safeSetHtml(selector, value) {
  const el = document.querySelector(selector);
  if (!el) {
    console.warn(`Missing DOM element for selector: ${selector}`);
    return;
  }
  el.innerHTML = value;
}
function toast(message) {
  const el = document.querySelector('#toast');
  if (!el) {
    console.warn('Missing toast element:', message);
    return;
  }
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2800);
}
function updateAuthUi() {
  safeSetText('#dashboard-greeting-name', currentUser ? `${currentUser.name}` : 'Guest.');
  safeSetText('#profile-name', currentUser ? currentUser.name : 'Guest User');
  safeSetText('#profile-role', currentUser ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'Visitor');
  safeSetText('#profile-avatar', currentUser ? avatarInitials(currentUser.name) : 'T');
  safeSetText('#profile-menu-name', currentUser ? currentUser.name : 'Guest User');
  safeSetText('#profile-menu-email', currentUser ? currentUser.email : 'Not signed in');
  const logoutButton = document.querySelector('#logout-button');
  if (logoutButton) logoutButton.classList.toggle('hidden', !currentUser);
  const profileMenu = document.querySelector('#profile-menu');
  if (profileMenu && !currentUser) profileMenu.classList.add('hidden');
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.classList.toggle('hidden', !currentUser);
  const main = document.querySelector('main');
  if (main) main.classList.toggle('hidden', !currentUser);
  setTopicControls();
}
async function api(action, options = {}) {
  if (staticMode) return simulateApi(action, options);
  const headers = {...(options.headers || {})};
  if (options.body) { headers['Content-Type'] = 'application/json'; headers['X-CSRF-Token'] = csrfToken || ''; }
  try {
    const response = await fetch(`/api?action=${encodeURIComponent(action)}`, {...options, headers});
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes('application/json')) {
      throw new Error('Server did not return JSON. Open the app through the Node server, not a static-file server.');
    }
    const data = await response.json().catch(() => ({}));
    return data;
  } catch (error) {
    if (isStaticFile || error instanceof TypeError || error.message.includes('Server did not return JSON')) {
      if (!staticMode) {
        toast('Cannot reach backend. Switching to demo mode.');
      }
      enableStaticDemoMode();
      return simulateApi(action, options);
    }
    throw error;
  }
}
function renderTopics() {
  const query = document.querySelector('#topic-search')?.value.toLowerCase() || '';
  const filter = document.querySelector('#topic-filter')?.value || 'all';
  const matching = topics.filter(topic => (filter === 'all' || topic.area === filter) && Object.values(topic).join(' ').toLowerCase().includes(query));
  const grouped = {available: [], review: [], allocated: []};
  matching.forEach(topic => {
    const bucket = topic.status === 'allocated' ? 'allocated' : (topic.status === 'review' ? 'review' : 'available');
    grouped[bucket].push(topic);
  });
  const sections = [
    {key: 'available', title: 'Open for selection', subtitle: 'Ready for students to pick'},
    {key: 'review', title: 'Under review', subtitle: 'Waiting for approval'},
    {key: 'allocated', title: 'Allocated', subtitle: 'Already assigned to students'}
  ];
  safeSetHtml('#topic-grid', sections.map(section => {
    const items = grouped[section.key] || [];
    const cards = items.map(topic => `<article class="topic-card"><span class="tag">${escapeHtml(topic.area)}</span><h2>${escapeHtml(topic.title)}</h2><p>Supervisor · ${escapeHtml(topic.supervisor || 'Unassigned')}</p><div class="topic-foot"><span>${escapeHtml(titleCase(topic.status))}</span><span>${section.title}</span></div></article>`).join('');
    return `<section class="topic-section"><div class="topic-section-head"><div><h3>${escapeHtml(section.title)}</h3><p>${escapeHtml(section.subtitle)}</p></div></div><div class="topic-section-grid">${cards || '<p class="empty-state">No projects yet in this section.</p>'}</div></section>`;
  }).join(''));
  safeSetText('#topic-count', matching.length);
}
function renderRequests() {
  const body = document.querySelector('#requests-body');
  if (!body) return;
  body.innerHTML = requests.map(request => `<tr><td><span class="person"><span class="avatar">${escapeHtml(request.student.split(' ').map(word => word[0]).join('').slice(0, 2))}</span>${escapeHtml(request.student)}</span></td><td>${escapeHtml(request.title)}</td><td>${escapeHtml(request.area)}</td><td>${escapeHtml(request.created_at)}</td><td><span class="status ${escapeHtml(request.status)}">${escapeHtml(titleCase(request.status))}</span></td><td class="action-buttons">${request.status === 'pending' && (currentUser?.role === 'admin' || currentUser?.role === 'supervisor') ? `<button class="approve" data-request="${request.id}" data-decision="approved">Approve</button><button class="decline" data-request="${request.id}" data-decision="rejected">Decline</button>` : ''}</td></tr>`).join('');
}
function renderSupervisors() {
  const grid = document.querySelector('#supervisor-grid');
  if (!grid) return;
  if (!supervisors || supervisors.length === 0) {
    supervisors = demoSupervisors.map(s => ({...s}));
    populateSupervisors();
  }
  grid.innerHTML = supervisors.map(supervisor => {
    const used = topics.filter(topic => Number(topic.supervisor_id) === Number(supervisor.id) && topic.status === 'allocated').length;
    const percent = supervisor.capacity ? Math.min(100, used / supervisor.capacity * 100) : 0;
    const label = supervisor.avatarLabel || supervisor.name.split(' ').slice(-1)[0].toUpperCase();
    return `<article class="supervisor-card" data-supervisor-id="${supervisor.id}"><span class="avatar"><span class="avatar-text">${escapeHtml(label)}</span></span><div class="supervisor-meta"><h2>${escapeHtml(supervisor.name)}</h2><p>${escapeHtml(supervisor.area)}</p></div><div class="capacity-line"><span>${used} of ${supervisor.capacity} students</span><strong>${Math.round(percent)}%</strong></div><div class="capacity ${percent >= 95 ? 'high' : ''}"><i style="width:${percent}%"></i></div></article>`;
  }).join('');
}
function populateSupervisors() { safeSetHtml('#new-supervisor', supervisors.map(supervisor => `<option value="${supervisor.id}">${escapeHtml(supervisor.name)}</option>`).join('')); }
function renderDashboardStats() {
  const totalCard = document.querySelector('#stat-total');
  const availableCard = document.querySelector('#stat-available');
  const pendingCard = document.querySelector('#stat-pending');
  const allocatedCard = document.querySelector('#stat-allocated');
  const pendingBadge = document.querySelector('#pending-badge');
  const stats = dashboardStats || {total: 0, allocated: 0, available: 0, pending: 0};
  if (totalCard) totalCard.textContent = stats.total ?? 0;
  if (availableCard) availableCard.textContent = stats.available ?? 0;
  if (pendingCard) pendingCard.textContent = stats.pending ?? 0;
  if (allocatedCard) allocatedCard.textContent = stats.allocated ?? 0;
  if (pendingBadge) pendingBadge.textContent = stats.pending ?? 0;
}

function renderActivity() {
  const body = document.querySelector('#activity-body');
  if (!body) return;
  const recent = [...requests].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
  body.innerHTML = recent.map(request => `<tr><td><span class="person"><span class="avatar">${escapeHtml(request.student.split(' ').map(word => word[0]).join('').slice(0, 2))}</span>${escapeHtml(request.student)}</span></td><td>${escapeHtml(request.title)}</td><td>${escapeHtml(request.area)}</td><td><span class="status ${escapeHtml(request.status)}">${escapeHtml(titleCase(request.status))}</span></td><td>${escapeHtml(request.created_at)}</td></tr>`).join('') || '<tr><td colspan="5" class="empty-state">No recent activity available.</td></tr>';
}

function renderReports() {
  const panelTitle = document.querySelector('#report-panel-title');
  const panelCopy = document.querySelector('#report-panel-copy');
  const totalEl = document.querySelector('#summary-total');
  const allocatedEl = document.querySelector('#summary-allocated');
  const availableEl = document.querySelector('#summary-available');
  const pendingEl = document.querySelector('#summary-pending');
  const reportList = document.querySelector('#report-list');
  if (!panelTitle || !panelCopy || !totalEl || !allocatedEl || !availableEl || !pendingEl || !reportList) return;
  const stats = dashboardStats || {total: 0, allocated: 0, available: 0, pending: 0};
  const completion = stats.total ? Math.round(((stats.allocated ?? 0) / stats.total) * 100) : 0;
  totalEl.textContent = stats.total ?? 0;
  allocatedEl.textContent = stats.allocated ?? 0;
  availableEl.textContent = stats.available ?? 0;
  pendingEl.textContent = stats.pending ?? 0;
  document.querySelectorAll('.report-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.reportView === currentReportView));
  if (currentReportView === 'availability') {
    panelTitle.textContent = 'Topic availability';
    panelCopy.textContent = 'Current topics grouped by status and area.';
    const grouped = topics.reduce((acc, topic) => {
      const key = topic.area || 'General';
      if (!acc[key]) acc[key] = {count: 0, available: 0, allocated: 0};
      acc[key].count += 1;
      if (topic.status === 'available') acc[key].available += 1;
      if (topic.status === 'allocated') acc[key].allocated += 1;
      return acc;
    }, {});
    const rows = Object.entries(grouped).map(([area, data]) => `<li><strong>${escapeHtml(area)}</strong><span>${data.count} topics · ${data.available} open · ${data.allocated} allocated</span></li>`).join('');
    reportList.innerHTML = `<div class="report-progress"><div class="report-progress-bar"><i style="width:${Math.min(100, completion)}%"></i></div><span>${completion}% allocation completion</span></div><ul class="report-list-items">${rows}</ul>`;
  } else if (currentReportView === 'workload') {
    panelTitle.textContent = 'Supervisor workload';
    panelCopy.textContent = 'Current student load versus each supervisor capacity.';
    const rows = supervisors.map(supervisor => { const used = topics.filter(topic => Number(topic.supervisor_id) === Number(supervisor.id) && topic.status === 'allocated').length; const percent = supervisor.capacity ? Math.min(100, used / supervisor.capacity * 100) : 0; return `<li class="workload-row"><div><strong>${escapeHtml(supervisor.name)}</strong><span>${used} of ${supervisor.capacity} students</span></div><div class="mini-bar"><i style="width:${percent}%"></i></div><em>${Math.round(percent)}%</em></li>`; }).join('');
    reportList.innerHTML = `<div class="report-progress"><div class="report-progress-bar"><i style="width:${Math.min(100, completion)}%"></i></div><span>${completion}% allocation completion</span></div><ul class="report-list-items">${rows}</ul>`;
  } else {
    panelTitle.textContent = 'Allocation summary';
    panelCopy.textContent = 'Live overview of student proposals and allocation progress.';
    const rows = topics.filter(topic => topic.status === 'allocated').map(topic => `<li><strong>${escapeHtml(topic.title)}</strong><span>${escapeHtml(topic.area)} · ${escapeHtml(topic.supervisor || 'Unassigned')}</span></li>`).join('');
    reportList.innerHTML = `<div class="report-progress"><div class="report-progress-bar"><i style="width:${Math.min(100, completion)}%"></i></div><span>${completion}% allocation completion</span></div><ul class="report-list-items">${rows || '<li>No allocations yet.</li>'}</ul>`;
  }
}
function updateDashboardDate() {
  const now = new Date();
  const dayEl = document.querySelector('#date-day');
  const monthYearEl = document.querySelector('#date-month-year');
  const weekdayEl = document.querySelector('#date-weekday');
  if (!dayEl || !monthYearEl || !weekdayEl) return;
  const day = String(now.getDate()).padStart(2, '0');
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  dayEl.textContent = day;
  monthYearEl.textContent = `${monthNames[now.getMonth()]}, ${now.getFullYear()}`;
  weekdayEl.textContent = weekdayNames[now.getDay()];
}
function renderRoleDashboard() {
  const panel = document.querySelector('#role-dashboard-panel');
  if (!panel) return;
  if (!currentUser) {
    panel.innerHTML = '<div class="role-dashboard-card"><h3>Guest access</h3><p>Sign in to see your personalised dashboard.</p></div>';
    return;
  }
  const role = currentUser.role || 'student';
  if (role === 'supervisor') {
    const assignedTopics = getAssignedTopics();
    const scoredCount = assignedTopics.filter(topic => getScoreForTopic(topic.id) !== null).length;
    const pendingCount = assignedTopics.length - scoredCount;
    panel.innerHTML = `
      <div class="role-dashboard-card">
        <div class="role-dashboard-head">
          <div>
            <p class="section-label">SUPERVISOR VIEW</p>
            <h3>${escapeHtml(currentUser.name)}</h3>
          </div>
          <span class="role-chip">${escapeHtml(getRoleLabel(role))}</span>
        </div>
        <div class="role-metrics">
          <article><strong>${assignedTopics.length}</strong><span>Assigned topics</span></article>
          <article><strong>${scoredCount}</strong><span>Scored</span></article>
          <article><strong>${pendingCount}</strong><span>Pending</span></article>
        </div>
        <div class="role-score-list">
          ${assignedTopics.length ? assignedTopics.map(topic => `
            <div class="role-score-item">
              <div>
                <strong>${escapeHtml(topic.title)}</strong>
                <p>${escapeHtml(topic.area)} · ${escapeHtml(titleCase(topic.status))}</p>
              </div>
              <div class="role-score-controls">
                <select data-score-input data-topic-id="${topic.id}">
                  <option value="">Score</option>
                  ${[1,2,3,4,5].map(value => `<option value="${value}" ${Number(getScoreForTopic(topic.id)) === value ? 'selected' : ''}>${value}</option>`).join('')}
                </select>
                <button class="outline-button" type="button" data-save-score data-topic-id="${topic.id}">Save</button>
              </div>
            </div>`).join('') : '<p class="empty-state">No topics are currently assigned to you.</p>'}
        </div>
      </div>`;
    return;
  }
  if (role === 'admin') {
    panel.innerHTML = `
      <div class="role-dashboard-card">
        <div class="role-dashboard-head">
          <div>
            <p class="section-label">ADMIN VIEW</p>
            <h3>Portfolio overview</h3>
          </div>
          <span class="role-chip">${escapeHtml(getRoleLabel(role))}</span>
        </div>
        <div class="role-metrics">
          <article><strong>${topics.length}</strong><span>Topics in catalogue</span></article>
          <article><strong>${requests.filter(request => request.status === 'pending').length}</strong><span>Pending reviews</span></article>
          <article><strong>${supervisors.length}</strong><span>Supervisors</span></article>
        </div>
      </div>`;
    return;
  }
  panel.innerHTML = `
    <div class="role-dashboard-card">
      <div class="role-dashboard-head">
        <div>
          <p class="section-label">STUDENT VIEW</p>
          <h3>Your project journey</h3>
        </div>
        <span class="role-chip">${escapeHtml(getRoleLabel(role))}</span>
      </div>
      <div class="role-metrics">
        <article><strong>${requests.filter(request => request.student_id === currentUser.id).length}</strong><span>Proposals</span></article>
        <article><strong>${topics.filter(topic => topic.status === 'available').length}</strong><span>Open topics</span></article>
        <article><strong>${topics.filter(topic => topic.supervisor_id === currentUser.id).length}</strong><span>Assigned topics</span></article>
      </div>
    </div>`;
}

async function saveTopicScore(topicId, score, note = '') {
  if (!currentUser || currentUser.role !== 'supervisor') return;
  try {
    const payload = {topic_id: Number(topicId), score: Number(score), note};
    await api('score-topic', {method: 'POST', body: JSON.stringify(payload)});
    const existing = topicScores.find(item => Number(item.topic_id) === Number(topicId));
    if (existing) {
      existing.score = payload.score;
      existing.note = note;
      existing.updated_at = new Date().toISOString();
    } else {
      topicScores.push({topic_id: payload.topic_id, score: payload.score, note, updated_at: new Date().toISOString()});
    }
    writeStoredScores();
    renderRoleDashboard();
    toast('Topic score saved.');
  } catch (error) {
    toast(error.message);
  }
}

function render() { updateDashboardDate(); renderDashboardStats(); renderRoleDashboard(); renderActivity(); renderTopics(); renderRequests(); renderSupervisors(); renderReports(); }
function setTopicControls() {
  const isLoggedIn = Boolean(currentUser);
  document.querySelectorAll('#open-topic-modal,#open-topic-modal-2').forEach(button => { if (button) button.hidden = !isLoggedIn; });
  document.querySelectorAll('[data-view="requests"]').forEach(link => { if (link) link.hidden = !isLoggedIn; });
  document.querySelectorAll('[data-view="allocations"]').forEach(link => { if (link) link.hidden = !isLoggedIn; });
  document.querySelectorAll('[data-view="reports"]').forEach(link => { if (link) link.hidden = !isLoggedIn; });

  const isStudent = currentUser && currentUser.role === 'student';
  const proposalFormPanel = document.querySelector('#proposal-form-panel');
  if (proposalFormPanel) {
    if (isStudent) {
      proposalFormPanel.classList.remove('hidden');
      const studentInput = document.querySelector('#proposal-student');
      if (studentInput) {
        studentInput.value = currentUser.name;
      }
    } else {
      proposalFormPanel.classList.add('hidden');
    }
  }
}
document.querySelectorAll('[data-view]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active')); link.classList.add('active'); document.querySelectorAll('.view').forEach(view => view.classList.remove('active')); const targetView = document.querySelector('#' + link.dataset.view); if (targetView) targetView.classList.add('active'); const pageTitle = document.querySelector('#page-title'); if (pageTitle) pageTitle.textContent = link.textContent.trim().replace(/\d/g, ''); window.scrollTo(0, 0); const sidebar = document.querySelector('.sidebar'); if (sidebar) sidebar.classList.remove('open'); }));
document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => document.querySelector(`[data-view="${button.dataset.go}"]`)?.click()));
document.querySelectorAll('#open-topic-modal,#open-topic-modal-2').forEach(button => button.addEventListener('click', () => document.querySelector('#modal')?.classList.add('open')));
document.querySelector('.close-modal')?.addEventListener('click', () => document.querySelector('#modal')?.classList.remove('open'));
document.querySelector('#role-dashboard-panel')?.addEventListener('click', async event => {
  const button = event.target.closest('[data-save-score]');
  if (!button) return;
  const topicId = button.dataset.topicId;
  const scoreSelect = document.querySelector(`[data-score-input][data-topic-id="${topicId}"]`);
  const score = scoreSelect?.value || '';
  if (!score) return toast('Choose a score before saving.');
  await saveTopicScore(topicId, score, '');
});
document.querySelector('#role-dashboard-panel')?.addEventListener('change', event => {
  const select = event.target.closest('[data-score-input]');
  if (!select) return;
  const topicId = select.dataset.topicId;
  const score = select.value;
  if (!score) return;
  saveTopicScore(topicId, score, '');
});
document.querySelector('#modal')?.addEventListener('click', event => { if (event.target.id === 'modal') event.currentTarget.classList.remove('open'); });
document.querySelector('#topic-form')?.addEventListener('submit', async event => { event.preventDefault(); try { const payload = {title: document.querySelector('#new-title')?.value || '', area: document.querySelector('#new-area')?.value || ''}; if (currentUser && currentUser.role === 'admin') payload.supervisor_id = Number(document.querySelector('#new-supervisor')?.value); await api('topics', {method: 'POST', body: JSON.stringify(payload)}); await loadData(); document.querySelector('#modal')?.classList.remove('open'); event.target.reset(); toast('Topic added successfully.'); } catch (error) { toast(error.message); } });
document.querySelector('#proposal-form')?.addEventListener('submit', async event => { event.preventDefault(); const button = event.submitter; const mode = button?.dataset.mode || 'submit'; try { await api('requests', {method: 'POST', body: JSON.stringify({student: document.querySelector('#proposal-student')?.value || '', title: document.querySelector('#proposal-title')?.value || '', area: document.querySelector('#proposal-area')?.value || '', mode})}); await loadData(); event.target.reset(); toast(mode === 'draft' ? 'Proposal saved as draft.' : 'Proposal submitted successfully.'); } catch (error) { toast(error.message); } });
document.querySelector('#topic-search')?.addEventListener('input', renderTopics);
document.querySelector('#topic-filter')?.addEventListener('change', renderTopics);
document.querySelector('#check-duplicates')?.addEventListener('click', () => toast('New topics are checked for possible duplicates before they are saved.'));
document.querySelector('#requests-body')?.addEventListener('click', async event => { const button = event.target.closest('[data-request]'); if (!button) return; try { await api('review-request', {method: 'POST', body: JSON.stringify({id: Number(button.dataset.request), decision: button.dataset.decision})}); await loadData(); toast(`Request ${button.dataset.decision}.`); } catch (error) { toast(error.message); } });
function renderSupervisorDetails(supervisor) {
  const panel = document.querySelector('#selected-supervisor-panel');
  const nameEl = document.querySelector('#selected-supervisor-name');
  const areaEl = document.querySelector('#selected-supervisor-area');
  const projectsEl = document.querySelector('#supervisor-projects');
  const removeButton = document.querySelector('#remove-supervisor-btn');
  if (!panel || !nameEl || !areaEl || !projectsEl || !removeButton) return;
  const supervisorTopics = topics.filter(topic => Number(topic.supervisor_id) === Number(supervisor.id));
  const allocatedCount = supervisorTopics.filter(t => t.status === 'allocated').length;
  nameEl.textContent = supervisor.name;
  areaEl.textContent = `${supervisor.area} · ${allocatedCount} allocated ${allocatedCount === 1 ? 'project' : 'projects'}`;
  removeButton.dataset.supervisorId = supervisor.id;
  removeButton.hidden = !currentUser || currentUser.role !== 'admin';
  if (supervisorTopics.length) {
    projectsEl.innerHTML = supervisorTopics.map(topic => {
      const isAllocated = topic.status === 'allocated';
      const action = isAllocated ? 'unallocate' : 'allocate';
      const label = isAllocated ? 'Unallocate' : 'Allocate';
      return `<article class="project-card"><h3>${escapeHtml(topic.title)}</h3><p>${escapeHtml(topic.area)}</p><div class="project-actions"><span class="status ${isAllocated ? 'allocated' : 'available'}">${escapeHtml(titleCase(topic.status))}</span><button class="allocate-btn" data-topic-id="${topic.id}" data-action="${action}">${label}</button></div></article>`;
    }).join('');
  } else {
    projectsEl.innerHTML = '<p class="empty-state">No projects assigned to this supervisor.</p>';
  }
  panel.classList.remove('hidden');
  document.querySelectorAll('.supervisor-card').forEach(card => card.classList.toggle('active', Number(card.dataset.supervisorId) === Number(supervisor.id)));
}
document.querySelector('#supervisor-grid')?.addEventListener('click', event => { const card = event.target.closest('.supervisor-card'); if (!card) return; const supervisor = supervisors.find(s => Number(s.id) === Number(card.dataset.supervisorId)); if (!supervisor) return; renderSupervisorDetails(supervisor); toast(`${supervisor.name} — ${supervisor.area}`); });
document.querySelector('#close-allocate-modal')?.addEventListener('click', () => {
  document.querySelector('#allocate-modal')?.classList.remove('open');
});
document.querySelector('#allocate-modal')?.addEventListener('click', event => {
  if (event.target.id === 'allocate-modal') {
    event.currentTarget.classList.remove('open');
  }
});

document.querySelector('#allocate-form')?.addEventListener('submit', async event => {
  event.preventDefault();
  const topicId = Number(document.querySelector('#allocate-topic-id')?.value || 0);
  const studentId = Number(document.querySelector('#allocate-student-select')?.value || 0);
  if (!topicId || !studentId) return toast('Please select a student.');

  try {
    await api('allocate', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId, topic_id: topicId })
    });

    // Close modal
    document.querySelector('#allocate-modal')?.classList.remove('open');
    toast('Project allocated successfully.');

    // Reload and re-render
    syncFromLocalStorage();
    render();

    // Re-render supervisor details if a supervisor is selected
    const activeCard = document.querySelector('.supervisor-card.active');
    if (activeCard) {
      const activeSupId = Number(activeCard.dataset.supervisorId);
      const activeSup = supervisors.find(s => s.id === activeSupId);
      if (activeSup) {
        renderSupervisorDetails(activeSup);
      }
    }
  } catch (error) {
    toast(error.message);
  }
});

document.querySelector('#supervisor-projects')?.addEventListener('click', async event => {
  const btn = event.target.closest('.allocate-btn');
  if (!btn) return;
  const topicId = Number(btn.dataset.topicId);
  const action = btn.dataset.action;
  const topic = topics.find(t => Number(t.id) === topicId);
  if (!topic) return toast('Topic not found');
  const supervisor = supervisors.find(s => Number(s.id) === Number(topic.supervisor_id));

  if (action === 'allocate') {
    // Show student selection modal
    const storedUsers = getStoredUsers();
    const storedAllocations = getStoredAllocations();
    const allocatedStudentIds = storedAllocations.map(a => Number(a.student_id));
    const unallocatedStudents = storedUsers.filter(u => u.role === 'student' && !allocatedStudentIds.includes(Number(u.id)));

    if (unallocatedStudents.length === 0) {
      return toast('All students have already been allocated a topic.');
    }

    // Populate and open modal
    document.querySelector('#allocate-topic-title').textContent = topic.title;
    document.querySelector('#allocate-topic-id').value = topic.id;

    const select = document.querySelector('#allocate-student-select');
    select.innerHTML = unallocatedStudents.map(student => `<option value="${student.id}">${escapeHtml(student.name)} (${escapeHtml(student.email)})</option>`).join('');

    document.querySelector('#allocate-modal')?.classList.add('open');
  } else {
    // Unallocate
    const storedAllocations = getStoredAllocations();
    const nextAllocations = storedAllocations.filter(a => Number(a.topic_id) !== topicId);
    saveStoredAllocations(nextAllocations);

    const storedTopics = getStoredTopics();
    const targetTopic = storedTopics.find(t => Number(t.id) === topicId);
    if (targetTopic) {
      targetTopic.status = 'available';
      saveStoredTopics(storedTopics);
    }

    toast('Project unallocated.');
    syncFromLocalStorage();
    render();
    if (supervisor) renderSupervisorDetails(supervisor);
  }
});

document.querySelector('#selected-supervisor-panel')?.addEventListener('click', event => {
  const removeBtn = event.target.closest('.remove-supervisor-btn');
  if (!removeBtn) return;
  const supervisorId = Number(removeBtn.dataset.supervisorId);
  if (!supervisorId) return;
  if (!confirm('Remove this supervisor and unassign all their topics?')) return;
  removeSupervisor(supervisorId);
});

function removeSupervisor(supervisorId) {
  const storedUsers = getStoredUsers();
  const supervisorUserObj = storedUsers.find(u => u.id === supervisorId && u.role === 'supervisor');
  if (!supervisorUserObj) return toast('Supervisor not found.');

  // 1. Remove the supervisor user
  const nextUsers = storedUsers.filter(u => u.id !== supervisorId);
  saveStoredUsers(nextUsers);

  // 2. Unassign/clear supervisor on their topics in stored topics
  const storedTopics = getStoredTopics();
  storedTopics.forEach(topic => {
    if (Number(topic.supervisor_id) === supervisorId) {
      topic.supervisor_id = null;
      if (topic.status === 'allocated') {
        topic.status = 'available';
      }
    }
  });
  saveStoredTopics(storedTopics);

  // 3. Remove allocations associated with this supervisor
  const storedAllocations = getStoredAllocations();
  const nextAllocations = storedAllocations.filter(a => Number(a.supervisor_id) !== supervisorId);
  saveStoredAllocations(nextAllocations);

  toast(`${supervisorUserObj.name} removed and their topics were unassigned.`);

  // 4. Sync and re-render
  syncFromLocalStorage();
  render();
  document.querySelector('#selected-supervisor-panel')?.classList.add('hidden');
}
function showReportView(view = 'summary') {
  currentReportView = view;
  document.querySelector('[data-view="reports"]').click();
  setTimeout(() => {
    document.querySelector('#report-summary-panel')?.scrollIntoView({behavior: 'smooth', block: 'start'});
    renderReports();
  }, 50);
}
document.querySelector('#export-report')?.addEventListener('click', () => { showReportView('summary'); toast('Allocation summary is shown below in the app.'); });
document.querySelectorAll('.report-cards .text-button').forEach(button => button.addEventListener('click', () => { showReportView(button.dataset.report || 'summary'); }));
document.querySelectorAll('.report-tab').forEach(tab => tab.addEventListener('click', () => showReportView(tab.dataset.reportView || 'summary')));
document.querySelector('.menu-toggle')?.addEventListener('click', () => document.querySelector('.sidebar')?.classList.toggle('open'));
async function loadData() {
  const [remoteTopics, remoteRequests, remoteSupervisors, dashboard, remoteScores] = await Promise.all([api('topics'), api('requests'), api('supervisors'), api('dashboard'), api('scores').catch(() => [])]);
  topics = remoteTopics;
  requests = remoteRequests;
  supervisors = remoteSupervisors && remoteSupervisors.length ? remoteSupervisors : demoSupervisors.map(s => ({...s}));
  dashboardStats = dashboard;
  topicScores = Array.isArray(remoteScores) ? remoteScores : [];
  writeStoredScores();
  populateSupervisors();
  render();
}
async function loadDemoData() { supervisors = demoSupervisors.map(s => ({...s})); topics = demoTopics.map(t => ({...t})); requests = demoRequests.map(r => ({...r})); dashboardStats = {...demoDashboardStats}; readStoredScores(); populateSupervisors(); render(); }
function showAuthMode(mode) {
  const loginForm = document.querySelector('#login-form');
  const signupForm = document.querySelector('#signup-form');
  const loginTab = document.querySelector('#show-login');
  const signupTab = document.querySelector('#show-signup');
  const error = document.querySelector('#login-error');
  if (error) error.textContent = '';
  renderSavedAccounts();
  if (mode === 'signup') {
    loginForm?.classList.add('hidden');
    signupForm?.classList.remove('hidden');
    loginTab?.classList.remove('active');
    signupTab?.classList.add('active');
  } else {
    loginForm?.classList.remove('hidden');
    signupForm?.classList.add('hidden');
    loginTab?.classList.add('active');
    signupTab?.classList.remove('active');
  }
}
async function submitLogin(email, password) {
  const error = document.querySelector('#login-error');
  if (error) error.textContent = '';
  try {
    const session = await api('login', {method: 'POST', body: JSON.stringify({email: String(email || '').trim(), password: String(password || '').trim()})});
    currentUser = session.user;
    csrfToken = session.csrf;
    saveLoginAccount(session.user, password);
    updateAuthUi();
    document.querySelector('#login-wall')?.classList.add('hidden');
    await loadData();
  } catch (err) {
    if (error) error.textContent = err instanceof TypeError ? 'Cannot reach the API. Start the Node server, then open http://localhost:8000/index.html.' : (err.message.includes('Invalid email or password') ? 'The email or password is incorrect.' : err.message);
  }
}

async function boot() {
  enableStaticDemoMode();
}
document.querySelector('#show-signup')?.addEventListener('click', event => { event.preventDefault(); showAuthMode('signup'); });
document.querySelector('#show-login')?.addEventListener('click', event => { event.preventDefault(); showAuthMode('login'); });
document.querySelector('#login-form')?.addEventListener('submit', async event => { event.preventDefault(); const email = document.querySelector('#login-email')?.value || ''; const password = document.querySelector('#login-password')?.value || ''; await submitLogin(email, password); });
document.querySelector('#signup-form')?.addEventListener('submit', async event => { event.preventDefault(); const error = document.querySelector('#login-error'); if (error) error.textContent = ''; try { const password = document.querySelector('#signup-password')?.value || ''; const session = await api('register', {method: 'POST', body: JSON.stringify({name: document.querySelector('#signup-name')?.value || '', email: document.querySelector('#signup-email')?.value || '', password, role: document.querySelector('#signup-role')?.value || 'student'})}); currentUser = session.user; csrfToken = session.csrf; saveLoginAccount(session.user, password); updateAuthUi(); document.querySelector('#login-wall')?.classList.add('hidden'); await loadData(); } catch (err) { if (error) error.textContent = err instanceof TypeError ? 'Cannot reach the API. Start the Node server, then open http://localhost:8000/index.html.' : err.message; } });
document.querySelector('#logout-button')?.addEventListener('click', async () => {
  try {
    await api('logout', {method: 'POST'});
  } catch (error) {
    // ignore if static demo mode
  }
  currentUser = null;
  updateAuthUi();
  document.querySelector('#login-wall')?.classList.remove('hidden');
  toast('Logged out successfully.');
});
const profileButton = document.querySelector('#profile-button');
const profileMenu = document.querySelector('#profile-menu');
profileButton?.addEventListener('click', () => {
  profileMenu?.classList.toggle('hidden');
});
document.addEventListener('click', event => {
  if (!profileMenu || !profileButton) return;
  if (profileMenu.classList.contains('hidden')) return;
  if (profileMenu.contains(event.target) || profileButton.contains(event.target)) return;
  profileMenu.classList.add('hidden');
});
showAuthMode('login');
boot();

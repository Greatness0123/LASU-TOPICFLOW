<?php
declare(strict_types=1);

session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off']);
session_start();
header('Content-Type: application/json; charset=utf-8');

function db(): PDO {
  static $db;
  if ($db instanceof PDO) return $db;
  $db = new PDO('sqlite:' . __DIR__ . '/data/topicflow.sqlite');
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $db->exec('PRAGMA foreign_keys = ON');
  $db->exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ("admin","supervisor","student")), capacity INTEGER DEFAULT 6, area TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)');
  $db->exec('CREATE TABLE IF NOT EXISTS topics (id INTEGER PRIMARY KEY, title TEXT UNIQUE NOT NULL, area TEXT NOT NULL, supervisor_id INTEGER, status TEXT NOT NULL DEFAULT "available", created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(supervisor_id) REFERENCES users(id))');
  $db->exec('CREATE TABLE IF NOT EXISTS requests (id INTEGER PRIMARY KEY, student_id INTEGER NOT NULL, title TEXT NOT NULL, area TEXT NOT NULL, status TEXT NOT NULL DEFAULT "draft", reviewer_id INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(student_id) REFERENCES users(id), FOREIGN KEY(reviewer_id) REFERENCES users(id))');
  $db->exec('CREATE TABLE IF NOT EXISTS allocations (id INTEGER PRIMARY KEY, student_id INTEGER UNIQUE NOT NULL, topic_id INTEGER UNIQUE NOT NULL, supervisor_id INTEGER NOT NULL, allocated_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(student_id) REFERENCES users(id), FOREIGN KEY(topic_id) REFERENCES topics(id), FOREIGN KEY(supervisor_id) REFERENCES users(id))');
  if (!(int) $db->query('SELECT COUNT(*) FROM users')->fetchColumn()) seed($db);
  ensureDemoProjects($db);
  return $db;
}
function seed(PDO $db): void {
  $password = password_hash('Pius-1234', PASSWORD_DEFAULT);
  $insertUser = $db->prepare('INSERT INTO users(name,email,password,role,capacity,area) VALUES(?,?,?,?,?,?)');
  foreach ([['Pius Tana','piusutana121@gmail.com','admin',0,''],['Dr. Adaeze Okafor','adaeze@topicflow.test','supervisor',6,'Artificial Intelligence'],['Prof. Ibrahim Musa','ibrahim@topicflow.test','supervisor',6,'Data Science'],['Dr. Chinedu Eze','chinedu@topicflow.test','supervisor',6,'Web Development'],['Chiamaka Bello','chiamaka@topicflow.test','student',0,''],['Ifeanyi Okoro','ifeanyi@topicflow.test','student',0,'']] as $row) $insertUser->execute([$row[0],$row[1],$password,$row[2],$row[3],$row[4]]);
  $insertTopic = $db->prepare('INSERT INTO topics(title,area,supervisor_id,status) VALUES(?,?,?,?)');
  foreach ([['AI-powered student performance prediction','Artificial Intelligence',2,'available'],['Secure e-voting system for student elections','Cybersecurity',3,'available'],['Online project topic allocation platform','Web Development',4,'allocated'],['Crop disease detection using image recognition','Artificial Intelligence',2,'available']] as $row) $insertTopic->execute($row);
  $db->prepare('INSERT INTO requests(student_id,title,area) VALUES(?,?,?)')->execute([6,'Blockchain-based certificate verification','Cybersecurity']);
}
function ensureDemoProjects(PDO $db): void {
  $count = (int) $db->query('SELECT COUNT(*) FROM topics')->fetchColumn();
  if ($count >= 10) return;
  $insertTopic = $db->prepare('INSERT OR IGNORE INTO topics(title,area,supervisor_id,status) VALUES(?,?,?,?)');
  $projects = [
    ['Smart attendance analytics platform','Artificial Intelligence',2,'available'],
    ['Community health data exchange','Data Science',3,'available'],
    ['Accessible e-learning recommender','Web Development',4,'review'],
    ['Agricultural soil moisture predictor','Artificial Intelligence',2,'review'],
    ['Blockchain academic credential wallet','Cybersecurity',3,'allocated'],
    ['IoT waste monitoring dashboard','Web Development',4,'allocated']
  ];
  foreach ($projects as $project) $insertTopic->execute($project);
}
function input(): array { $body = json_decode(file_get_contents('php://input'), true); return is_array($body) ? $body : $_POST; }
function respond(array $data, int $code = 200): never { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }
function currentUser(): ?array { return $_SESSION['user'] ?? null; }
function requireRole(array $roles): array { $user = currentUser(); if (!$user || !in_array($user['role'], $roles, true)) respond(['error' => 'Unauthorized'], 401); return $user; }
function canAccess(array $user, string $action): bool { $role = $user['role'] ?? 'student'; return match ($action) { 'topics' => in_array($role, ['admin','supervisor','student'], true), 'requests' => in_array($role, ['admin','supervisor','student'], true), 'review' => in_array($role, ['admin','supervisor'], true), 'allocations' => in_array($role, ['admin','supervisor'], true), 'reports' => in_array($role, ['admin','supervisor'], true), default => in_array($role, ['admin','supervisor','student'], true) }; }
function requirePost(): void { if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(['error' => 'Method not allowed'], 405); }
function csrf(): string { if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32)); return $_SESSION['csrf']; }
function requireCsrf(): void { $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? input()['csrf'] ?? ''; if (!hash_equals(csrf(), (string) $token)) respond(['error' => 'Invalid request token'], 403); }
function validText(mixed $value, string $field, int $min = 1, int $max = 180): string { $text = trim((string) $value); if (strlen($text) < $min || strlen($text) > $max) respond(['error' => "$field must be between $min and $max characters"], 422); return $text; }
function supervisor(PDO $db, int $id): ?array { $q = $db->prepare('SELECT id,name,area,capacity FROM users WHERE id=? AND role="supervisor"'); $q->execute([$id]); return $q->fetch(PDO::FETCH_ASSOC) ?: null; }
function duplicate(PDO $db, string $title): ?array { $words = preg_replace('/[^a-z0-9 ]/', '', strtolower($title)); $terms = array_filter(explode(' ', $words), fn($word) => strlen($word) > 4); if (!$terms) return null; $q = $db->prepare('SELECT id,title FROM topics WHERE ' . implode(' OR ', array_fill(0, count($terms), 'lower(title) LIKE ?')) . ' LIMIT 1'); $q->execute(array_map(fn($term) => "%$term%", $terms)); return $q->fetch(PDO::FETCH_ASSOC) ?: null; }
function canReview(array $user, array $request): bool { return $user['role'] === 'admin' || ($user['role'] === 'supervisor' && strcasecmp((string) $user['area'], (string) $request['area']) === 0); }
function safeCsv(string $value): string { return preg_match('/^[=+\-@]/', $value) ? "'" . $value : $value; }

$db = db();
$action = $_GET['action'] ?? '';
if ($action === 'register') {
  requirePost(); $in = input();
  $name = validText($in['name'] ?? '', 'Name', 2, 80);
  $email = strtolower(trim((string) ($in['email'] ?? '')));
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respond(['error' => 'Enter a valid email address'], 422);
  $password = trim((string) ($in['password'] ?? ''));
  if (strlen($password) < 6) respond(['error' => 'Password must be at least 6 characters'], 422);
  $role = in_array(($in['role'] ?? 'student'), ['admin','supervisor','student'], true) ? (string) $in['role'] : 'student';
  $q = $db->prepare('SELECT id FROM users WHERE email=?');
  $q->execute([$email]);
  if ($q->fetchColumn()) respond(['error' => 'An account with this email already exists'], 409);
  $hash = password_hash($password, PASSWORD_DEFAULT);
  $insert = $db->prepare('INSERT INTO users(name,email,password,role,capacity,area) VALUES(?,?,?,?,?,?)');
  $insert->execute([$name, $email, $hash, $role, $role === 'supervisor' ? 6 : 0, '']);
  $userId = (int) $db->lastInsertId();
  $q = $db->prepare('SELECT id,name,email,role,area FROM users WHERE id=?');
  $q->execute([$userId]); $user = $q->fetch(PDO::FETCH_ASSOC);
  session_regenerate_id(true); $_SESSION['user'] = $user;
  respond(['user' => $user, 'csrf' => csrf()]);
}
if ($action === 'login') {
  requirePost(); $in = input();
  $q = $db->prepare('SELECT id,name,email,password,role,area FROM users WHERE email=?');
  $q->execute([strtolower(trim((string) ($in['email'] ?? '')))]); $user = $q->fetch(PDO::FETCH_ASSOC);
  if (!$user || !password_verify((string) ($in['password'] ?? ''), $user['password'])) respond(['error' => 'Invalid email or password'], 422);
  session_regenerate_id(true); unset($user['password']); $_SESSION['user'] = $user;
  respond(['user' => $user, 'csrf' => csrf()]);
}
if ($action === 'logout') { requirePost(); requireCsrf(); $_SESSION = []; session_destroy(); respond(['ok' => true]); }
if ($action === 'me') { $user = currentUser(); respond(['user' => $user, 'csrf' => $user ? csrf() : null]); }
if ($action === 'supervisors') { requireRole(['admin','supervisor','student']); $q = $db->query('SELECT id,name,area,capacity FROM users WHERE role="supervisor" ORDER BY name'); respond($q->fetchAll(PDO::FETCH_ASSOC)); }
if ($action === 'topics') {
  $user = requireRole(['admin','supervisor','student']);
  if (!canAccess($user, 'topics')) respond(['error' => 'Unauthorized'], 401);
  if ($_SERVER['REQUEST_METHOD'] === 'GET') { $q = $db->query('SELECT t.*,u.name supervisor FROM topics t LEFT JOIN users u ON u.id=t.supervisor_id ORDER BY t.created_at DESC'); respond($q->fetchAll(PDO::FETCH_ASSOC)); }
  requirePost(); requireCsrf(); $in = input(); $title = validText($in['title'] ?? '', 'Title', 8); $area = validText($in['area'] ?? 'General', 'Area', 2, 80);
  if ($match = duplicate($db, $title)) respond(['error' => 'Possible duplicate', 'duplicate' => $match], 409);
  $supervisorId = $user['role'] === 'supervisor' ? (int) $user['id'] : (int) ($in['supervisor_id'] ?? 0);
  if (!supervisor($db, $supervisorId)) respond(['error' => 'Select a valid supervisor'], 422);
  $q = $db->prepare('INSERT INTO topics(title,area,supervisor_id) VALUES(?,?,?)'); $q->execute([$title, $area, $supervisorId]); respond(['id' => $db->lastInsertId(), 'message' => 'Topic created'], 201);
}
if ($action === 'requests') {
  $user = requireRole(['admin','supervisor','student']);
  if (!canAccess($user, 'requests')) respond(['error' => 'Unauthorized'], 401);
  if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = 'SELECT r.*,u.name student FROM requests r JOIN users u ON u.id=r.student_id'; $params = [];
    if ($user['role'] === 'student') { $sql .= ' WHERE r.student_id=?'; $params[] = $user['id']; }
    elseif ($user['role'] === 'supervisor') { $sql .= ' WHERE lower(r.area)=lower(?)'; $params[] = $user['area']; }
    $q = $db->prepare($sql . ' ORDER BY r.created_at DESC'); $q->execute($params); respond($q->fetchAll(PDO::FETCH_ASSOC));
  }
  requirePost(); requireCsrf(); if ($user['role'] !== 'student') respond(['error' => 'Only students can submit requests'], 403);
  $title = validText(input()['title'] ?? '', 'Title', 8); $area = validText(input()['area'] ?? 'General', 'Area', 2, 80);
  $mode = isset(input()['mode']) ? (string) input()['mode'] : 'submit';
  $status = $mode === 'draft' ? 'draft' : 'pending';
  $q = $db->prepare('SELECT COUNT(*) FROM requests WHERE student_id=? AND status="pending"'); $q->execute([$user['id']]); if ($status === 'pending' && (int) $q->fetchColumn() > 0) respond(['error' => 'You already have a pending request'], 409);
  $q = $db->prepare('INSERT INTO requests(student_id,title,area,status) VALUES(?,?,?,?)'); $q->execute([$user['id'], $title, $area, $status]); respond(['id' => $db->lastInsertId(), 'status' => $status], 201);
}
if ($action === 'review-request') {
  requirePost(); requireCsrf(); $user = requireRole(['admin','supervisor']); if (!canAccess($user, 'review')) respond(['error' => 'Unauthorized'], 401); $in = input(); $id = (int) ($in['id'] ?? 0); $decision = $in['decision'] ?? '';
  if ($id < 1 || !in_array($decision, ['approved','rejected'], true)) respond(['error' => 'Invalid request review'], 422);
  $q = $db->prepare('SELECT id,area FROM requests WHERE id=? AND status="pending"'); $q->execute([$id]); $request = $q->fetch(PDO::FETCH_ASSOC);
  if (!$request) respond(['error' => 'Request is unavailable'], 404); if (!canReview($user, $request)) respond(['error' => 'Forbidden'], 403);
  $q = $db->prepare('UPDATE requests SET status=?,reviewer_id=? WHERE id=?'); $q->execute([$decision, $user['id'], $id]); respond(['ok' => true]);
}
if ($action === 'allocate') {
  requirePost(); requireCsrf(); $user = requireRole(['admin','supervisor']); if (!canAccess($user, 'allocations')) respond(['error' => 'Unauthorized'], 401); $in = input(); $studentId = (int) ($in['student_id'] ?? 0); $topicId = (int) ($in['topic_id'] ?? 0);
  $student = $db->prepare('SELECT id FROM users WHERE id=? AND role="student"'); $student->execute([$studentId]); if (!$student->fetchColumn()) respond(['error' => 'Select a valid student'], 422);
  $db->beginTransaction(); try {
    $q = $db->prepare('SELECT supervisor_id,status FROM topics WHERE id=?'); $q->execute([$topicId]); $topic = $q->fetch(PDO::FETCH_ASSOC);
    if (!$topic || $topic['status'] !== 'available') throw new RuntimeException('Topic is unavailable');
    if ($user['role'] === 'supervisor' && (int) $topic['supervisor_id'] !== (int) $user['id']) throw new RuntimeException('Forbidden');
    $load = $db->prepare('SELECT COUNT(*) FROM allocations WHERE supervisor_id=?'); $load->execute([$topic['supervisor_id']]); $capacity = supervisor($db, (int) $topic['supervisor_id']);
    if (!$capacity || (int) $load->fetchColumn() >= (int) $capacity['capacity']) throw new RuntimeException('Supervisor is at capacity');
    $db->prepare('INSERT INTO allocations(student_id,topic_id,supervisor_id) VALUES(?,?,?)')->execute([$studentId, $topicId, $topic['supervisor_id']]);
    $db->prepare('UPDATE topics SET status="allocated" WHERE id=?')->execute([$topicId]); $db->commit(); respond(['ok' => true]);
  } catch (Throwable $error) { if ($db->inTransaction()) $db->rollBack(); $message = $error instanceof RuntimeException ? $error->getMessage() : 'Allocation could not be saved'; respond(['error' => $message], $message === 'Forbidden' ? 403 : 422); }
}
if ($action === 'dashboard') { requireRole(['admin','supervisor','student']); $total = (int) $db->query('SELECT COUNT(*) FROM users WHERE role="student"')->fetchColumn(); $allocated = (int) $db->query('SELECT COUNT(*) FROM allocations')->fetchColumn(); $available = (int) $db->query('SELECT COUNT(*) FROM topics WHERE status="available"')->fetchColumn(); $pending = (int) $db->query('SELECT COUNT(*) FROM requests WHERE status="pending"')->fetchColumn(); respond(compact('total','allocated','available','pending')); }
if ($action === 'report') { $user = requireRole(['admin','supervisor']); if (!canAccess($user, 'reports')) respond(['error' => 'Unauthorized'], 401); header_remove('Content-Type'); header('Content-Type: text/csv; charset=utf-8'); header('Content-Disposition: attachment; filename="allocation-report.csv"'); $out = fopen('php://output', 'w'); fputcsv($out, ['Student','Topic','Supervisor','Allocated']); foreach ($db->query('SELECT s.name,t.title,u.name,a.allocated_at FROM allocations a JOIN users s ON s.id=a.student_id JOIN topics t ON t.id=a.topic_id JOIN users u ON u.id=a.supervisor_id') as $row) fputcsv($out, array_map(fn($value) => safeCsv((string) $value), $row)); exit; }
respond(['error' => 'Unknown endpoint'], 404);

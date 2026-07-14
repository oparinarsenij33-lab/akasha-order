<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");
header('Cache-Control: no-store, max-age=0');

const APP_VERSION = '2.5.0';
const MAX_BODY_BYTES = 1048576;
const DATA_DIR = __DIR__ . DIRECTORY_SEPARATOR . 'data';
const SQLITE_FILE = DATA_DIR . DIRECTORY_SEPARATOR . 'akasha.sqlite';
const JSON_FILE = DATA_DIR . DIRECTORY_SEPARATOR . 'akasha-store.json';
const SESSION_TTL = 43200; // 12 часов
const LOGIN_WINDOW = 600;
const LOGIN_ATTEMPTS = 8;
const COLLECTIONS = [
    'lessons', 'homework_assignments', 'homework_submissions', 'comments',
    'messages', 'blocked_users', 'lesson_reads', 'user_registrations',
    'manual_adjustments', 'audit_log'
];
const USER_COLLECTION = 'app_users';
const META_COLLECTION = 'app_meta';
const USER_SEED_MARKER = 'users_seeded_v1';
const USER_RANKS = [
    'адепт', 'юнлинг', 'падаван', 'старший падаван', 'рыцарь',
    'мастер', 'магистр', 'верховный магистр', 'старейшина'
];

ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Lax');
session_name('AKASHA_SESSION');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

final class ApiException extends RuntimeException {
    public int $status;
    public string $codeName;
    public function __construct(string $message, int $status = 400, string $codeName = 'bad_request') {
        parent::__construct($message);
        $this->status = $status;
        $this->codeName = $codeName;
    }
}

function respond(array $payload, int $status = 200): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}

function readPayload(): array {
    $length = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($length > MAX_BODY_BYTES) throw new ApiException('Слишком большой запрос.', 413, 'payload_too_large');
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') return [];
    try {
        $data = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        throw new ApiException('Некорректный JSON.', 400, 'invalid_json');
    }
    if (!is_array($data)) throw new ApiException('Ожидался JSON-объект.', 400, 'invalid_payload');
    return $data;
}

function normalizeName(string $value): string {
    $value = trim(preg_replace('/\s+/u', ' ', $value) ?? $value);
    $upper = ['А','Б','В','Г','Д','Е','Ё','Ж','З','И','Й','К','Л','М','Н','О','П','Р','С','Т','У','Ф','Х','Ц','Ч','Ш','Щ','Ъ','Ы','Ь','Э','Ю','Я'];
    $lower = ['а','б','в','г','д','е','е','ж','з','и','й','к','л','м','н','о','п','р','с','т','у','ф','х','ц','ч','ш','щ','ъ','ы','ь','э','ю','я'];
    return str_replace($upper, $lower, strtolower($value));
}

function seedUsersConfig(): array {
    static $users = null;
    if ($users === null) {
        $loaded = require __DIR__ . DIRECTORY_SEPARATOR . 'users.php';
        if (!is_array($loaded)) throw new ApiException('Некорректный users.php.', 500, 'server_config');
        $users = $loaded;
    }
    return $users;
}

function publicProfile(array $user): array {
    return array_filter([
        'name' => (string)($user['name'] ?? ''),
        'rank' => (string)($user['rank'] ?? ''),
        'teacher' => (string)($user['teacher'] ?? 'отсутствует'),
        'specialTitle' => $user['specialTitle'] ?? null,
        'description' => $user['description'] ?? null,
    ], static fn(mixed $value): bool => $value !== null && $value !== '');
}

function ensureUsersSeeded(Store $store): void {
    if ($store->get(META_COLLECTION, USER_SEED_MARKER) !== null) return;
    foreach (seedUsersConfig() as $user) {
        $name = trim((string)($user['name'] ?? ''));
        if ($name === '') continue;
        $id = 'user_' . substr(hash('sha256', normalizeName($name)), 0, 24);
        $record = $user;
        $record['createdAt'] = $record['createdAt'] ?? dateMarker(null);
        $record['createdBy'] = $record['createdBy'] ?? 'system_seed';
        $store->set(USER_COLLECTION, $id, $record);
    }
    $store->set(META_COLLECTION, USER_SEED_MARKER, [
        'seededAt' => dateMarker(null),
        'version' => 1,
    ]);
}

function userDocuments(Store $store): array {
    return array_values(array_filter(
        $store->query(USER_COLLECTION, []),
        static fn(array $document): bool => is_array($document['data'] ?? null) && trim((string)($document['data']['name'] ?? '')) !== ''
    ));
}

function findUserDocument(Store $store, string $name): ?array {
    $needle = normalizeName($name);
    if ($needle === '') return null;
    foreach (userDocuments($store) as $document) {
        $user = $document['data'];
        $names = [(string)($user['name'] ?? ''), ...($user['aliases'] ?? [])];
        foreach ($names as $candidate) {
            if (normalizeName((string)$candidate) === $needle) return $document;
        }
    }
    return null;
}

function findUser(Store $store, string $name): ?array {
    $document = findUserDocument($store, $name);
    return $document === null ? null : $document['data'];
}

function allUsers(Store $store): array {
    $users = array_map(static fn(array $document): array => $document['data'], userDocuments($store));
    usort($users, static fn(array $a, array $b): int => strcasecmp((string)($a['name'] ?? ''), (string)($b['name'] ?? '')));
    return $users;
}

function userExists(Store $store, string $name): bool { return findUserDocument($store, $name) !== null; }
function isMaster(array $profile): bool { return in_array($profile['rank'] ?? '', ['мастер','магистр','верховный магистр','старейшина'], true); }
function isAdmin(array $profile): bool { return in_array($profile['rank'] ?? '', ['магистр','верховный магистр','старейшина'], true); }

function validCollection(mixed $value): string {
    if (!is_string($value) || !in_array($value, COLLECTIONS, true)) {
        throw new ApiException('Неизвестная коллекция.', 400, 'invalid_collection');
    }
    return $value;
}

function validDocumentId(mixed $value): string {
    if (!is_string($value) || !preg_match('/^[\p{L}\p{N} _@.\-]{1,240}$/u', $value)) {
        throw new ApiException('Некорректный идентификатор документа.', 400, 'invalid_document_id');
    }
    return $value;
}

function normalizeData(mixed $value): array {
    if (!is_array($value)) throw new ApiException('Поле data должно быть объектом.', 400, 'invalid_data');
    return $value;
}

function textValue(mixed $value, string $label, int $min, int $max, bool $allowEmpty = false): string {
    if (!is_string($value)) throw new ApiException("Поле «{$label}» должно быть строкой.");
    $value = trim(str_replace("\0", '', $value));
    $length = function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : preg_match_all('/./us', $value, $m);
    $length = is_int($length) ? $length : strlen($value);
    if (!$allowEmpty && $length < $min) throw new ApiException("Заполните поле «{$label}».");
    if ($length > $max) throw new ApiException("Поле «{$label}» слишком длинное (максимум {$max} символов).");
    return $value;
}

function intValue(mixed $value, string $label, int $min, int $max): int {
    if (is_string($value) && preg_match('/^-?\d+$/', $value)) $value = (int)$value;
    if (!is_int($value) && !is_float($value)) throw new ApiException("Поле «{$label}» должно быть числом.");
    $number = (int)$value;
    if ($number < $min || $number > $max) throw new ApiException("Поле «{$label}» вне допустимого диапазона.");
    return $number;
}

function rankValue(mixed $value): string {
    $rank = normalizeName(textValue(is_string($value) ? $value : '', 'Ранг', 1, 80));
    if (!in_array($rank, USER_RANKS, true)) throw new ApiException('Выберите допустимый ранг пользователя.');
    return $rank;
}

function aliasList(mixed $value): array {
    if ($value === null || $value === '') return [];
    $items = is_array($value) ? $value : preg_split('/[,;\n]+/u', (string)$value);
    if (!is_array($items)) return [];
    $result = [];
    foreach ($items as $item) {
        $alias = textValue((string)$item, 'Псевдоним', 0, 240, true);
        if ($alias === '') continue;
        $key = normalizeName($alias);
        if ($key !== '' && !isset($result[$key])) $result[$key] = $alias;
    }
    return array_values($result);
}

function ensureIdentityAvailable(Store $store, string $name, array $aliases = [], ?string $ignoreId = null): void {
    $needles = array_values(array_unique(array_filter(array_map('normalizeName', [$name, ...$aliases]))));
    foreach (userDocuments($store) as $document) {
        if ($ignoreId !== null && (string)$document['id'] === $ignoreId) continue;
        $user = $document['data'];
        $candidates = [(string)($user['name'] ?? ''), ...($user['aliases'] ?? [])];
        foreach ($candidates as $candidate) {
            if (in_array(normalizeName((string)$candidate), $needles, true)) {
                throw new ApiException('Пользователь с таким именем или псевдонимом уже существует.', 409, 'user_exists');
            }
        }
    }
}

function validateTeacher(Store $store, mixed $value, string $selfName = ''): string {
    $teacher = textValue(is_string($value) ? $value : 'отсутствует', 'Наставник', 0, 240, true);
    if ($teacher === '' || normalizeName($teacher) === 'отсутствует' || normalizeName($teacher) === 'не назначен') return 'отсутствует';
    if ($selfName !== '' && normalizeName($teacher) === normalizeName($selfName)) throw new ApiException('Пользователь не может быть наставником самому себе.');
    $teacherUser = findUser($store, $teacher);
    if ($teacherUser === null) throw new ApiException('Выбранный наставник не найден.', 404, 'teacher_not_found');
    return (string)$teacherUser['name'];
}

function dateMarker(mixed $value): array {
    if (is_array($value) && isset($value['__akashaDate']) && is_string($value['__akashaDate'])) return $value;
    return ['__akashaDate' => gmdate('c')];
}

function safeHttpUrl(mixed $value, string $label, bool $allowEmpty = true): string {
    $url = textValue(is_string($value) ? $value : '', $label, 0, 2048, true);
    if ($url === '' && $allowEmpty) return '';
    if (!filter_var($url, FILTER_VALIDATE_URL)) throw new ApiException("Некорректная ссылка в поле «{$label}».");
    $scheme = strtolower((string)parse_url($url, PHP_URL_SCHEME));
    if (!in_array($scheme, ['http', 'https'], true)) throw new ApiException('Разрешены только ссылки http/https.');
    return $url;
}

function valueAtPath(array $data, string $path): mixed {
    $value = $data;
    foreach (explode('.', $path) as $segment) {
        if (!is_array($value) || !array_key_exists($segment, $value)) return null;
        $value = $value[$segment];
    }
    return $value;
}

function valuesEqual(mixed $left, mixed $right): bool {
    return json_encode($left, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ===
        json_encode($right, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

function filterDocuments(array $documents, array $filters): array {
    if (!$filters) return $documents;
    return array_values(array_filter($documents, static function (array $document) use ($filters): bool {
        $data = is_array($document['data'] ?? null) ? $document['data'] : [];
        foreach ($filters as $filter) {
            if (!is_array($filter)) return false;
            $field = (string)($filter['field'] ?? '');
            $operator = (string)($filter['operator'] ?? '==');
            if ($field === '' || $operator !== '==') return false;
            if (!valuesEqual(valueAtPath($data, $field), $filter['value'] ?? null)) return false;
        }
        return true;
    }));
}

interface Store {
    public function get(string $collection, string $id): ?array;
    public function query(string $collection, array $filters): array;
    public function add(string $collection, array $data): string;
    public function set(string $collection, string $id, array $data): void;
    public function update(string $collection, string $id, array $data): void;
    public function delete(string $collection, string $id): void;
    public function batch(array $operations): void;
    public function driver(): string;
}

final class SqliteStore implements Store {
    private PDO $pdo;
    public function __construct(string $path) {
        $this->pdo = new PDO('sqlite:' . $path, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $this->pdo->exec('PRAGMA journal_mode=WAL');
        $this->pdo->exec('PRAGMA foreign_keys=ON');
        $this->pdo->exec('PRAGMA busy_timeout=5000');
        $this->pdo->exec('CREATE TABLE IF NOT EXISTS documents (
            collection_name TEXT NOT NULL,
            document_id TEXT NOT NULL,
            document_json TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            PRIMARY KEY (collection_name, document_id)
        )');
        $this->pdo->exec('CREATE INDEX IF NOT EXISTS idx_documents_collection ON documents(collection_name)');
    }
    public function driver(): string { return 'sqlite'; }
    public function get(string $collection, string $id): ?array {
        $stmt = $this->pdo->prepare('SELECT document_json FROM documents WHERE collection_name = :collection AND document_id = :id');
        $stmt->execute(['collection' => $collection, 'id' => $id]);
        $row = $stmt->fetch();
        return $row ? json_decode($row['document_json'], true, 512, JSON_THROW_ON_ERROR) : null;
    }
    public function query(string $collection, array $filters): array {
        $stmt = $this->pdo->prepare('SELECT document_id, document_json FROM documents WHERE collection_name = :collection ORDER BY created_at ASC');
        $stmt->execute(['collection' => $collection]);
        $documents = [];
        foreach ($stmt as $row) {
            $documents[] = ['id' => $row['document_id'], 'data' => json_decode($row['document_json'], true, 512, JSON_THROW_ON_ERROR)];
        }
        return filterDocuments($documents, $filters);
    }
    public function add(string $collection, array $data): string {
        do { $id = bin2hex(random_bytes(10)); } while ($this->get($collection, $id) !== null);
        $this->set($collection, $id, $data);
        return $id;
    }
    public function set(string $collection, string $id, array $data): void {
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        $now = gmdate('c');
        $stmt = $this->pdo->prepare('INSERT INTO documents(collection_name, document_id, document_json, created_at, updated_at)
            VALUES(:collection, :id, :json, :created, :updated)
            ON CONFLICT(collection_name, document_id)
            DO UPDATE SET document_json = excluded.document_json, updated_at = excluded.updated_at');
        $stmt->execute(['collection' => $collection, 'id' => $id, 'json' => $json, 'created' => $now, 'updated' => $now]);
    }
    public function update(string $collection, string $id, array $data): void {
        $current = $this->get($collection, $id);
        if ($current === null) throw new ApiException('Документ не найден.', 404, 'not_found');
        $this->set($collection, $id, array_replace($current, $data));
    }
    public function delete(string $collection, string $id): void {
        $stmt = $this->pdo->prepare('DELETE FROM documents WHERE collection_name = :collection AND document_id = :id');
        $stmt->execute(['collection' => $collection, 'id' => $id]);
    }
    public function batch(array $operations): void {
        $this->pdo->beginTransaction();
        try {
            foreach ($operations as $operation) applyRawOperation($this, $operation);
            $this->pdo->commit();
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $error;
        }
    }
}

final class JsonStore implements Store {
    private string $path;
    public function __construct(string $path) {
        $this->path = $path;
        if (!file_exists($path) && file_put_contents($path, "{}", LOCK_EX) === false) {
            throw new ApiException('Не удалось создать файл данных.', 500, 'storage_error');
        }
    }
    public function driver(): string { return 'json'; }
    private function readStore(): array {
        $handle = fopen($this->path, 'rb');
        if ($handle === false) throw new ApiException('Не удалось открыть файл данных.', 500, 'storage_error');
        try {
            if (!flock($handle, LOCK_SH)) throw new ApiException('Не удалось заблокировать файл данных.', 500, 'storage_error');
            $raw = stream_get_contents($handle);
            $store = $raw && trim($raw) !== '' ? json_decode($raw, true, 512, JSON_THROW_ON_ERROR) : [];
            flock($handle, LOCK_UN);
            return is_array($store) ? $store : [];
        } finally { fclose($handle); }
    }
    private function mutate(callable $callback): mixed {
        $handle = fopen($this->path, 'c+');
        if ($handle === false) throw new ApiException('Не удалось открыть файл данных.', 500, 'storage_error');
        try {
            if (!flock($handle, LOCK_EX)) throw new ApiException('Не удалось заблокировать файл данных.', 500, 'storage_error');
            rewind($handle);
            $raw = stream_get_contents($handle);
            $store = $raw && trim($raw) !== '' ? json_decode($raw, true, 512, JSON_THROW_ON_ERROR) : [];
            if (!is_array($store)) $store = [];
            $result = $callback($store);
            rewind($handle); ftruncate($handle, 0);
            fwrite($handle, json_encode($store, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));
            fflush($handle); flock($handle, LOCK_UN);
            return $result;
        } finally { fclose($handle); }
    }
    public function get(string $collection, string $id): ?array {
        $store = $this->readStore();
        return $store[$collection][$id]['data'] ?? null;
    }
    public function query(string $collection, array $filters): array {
        $store = $this->readStore();
        $documents = [];
        foreach (($store[$collection] ?? []) as $id => $record) $documents[] = ['id' => (string)$id, 'data' => $record['data'] ?? []];
        usort($documents, static fn(array $a, array $b): int => strcmp($a['id'], $b['id']));
        return filterDocuments($documents, $filters);
    }
    public function add(string $collection, array $data): string {
        return $this->mutate(static function (array &$store) use ($collection, $data): string {
            do { $id = bin2hex(random_bytes(10)); } while (isset($store[$collection][$id]));
            $now = gmdate('c');
            $store[$collection][$id] = ['data' => $data, 'createdAt' => $now, 'updatedAt' => $now];
            return $id;
        });
    }
    public function set(string $collection, string $id, array $data): void {
        $this->mutate(static function (array &$store) use ($collection, $id, $data): void {
            $now = gmdate('c');
            $created = $store[$collection][$id]['createdAt'] ?? $now;
            $store[$collection][$id] = ['data' => $data, 'createdAt' => $created, 'updatedAt' => $now];
        });
    }
    public function update(string $collection, string $id, array $data): void {
        $this->mutate(static function (array &$store) use ($collection, $id, $data): void {
            if (!isset($store[$collection][$id])) throw new ApiException('Документ не найден.', 404, 'not_found');
            $store[$collection][$id]['data'] = array_replace($store[$collection][$id]['data'] ?? [], $data);
            $store[$collection][$id]['updatedAt'] = gmdate('c');
        });
    }
    public function delete(string $collection, string $id): void {
        $this->mutate(static function (array &$store) use ($collection, $id): void {
            unset($store[$collection][$id]);
            if (isset($store[$collection]) && !$store[$collection]) unset($store[$collection]);
        });
    }
    public function batch(array $operations): void {
        $this->mutate(static function (array &$store) use ($operations): void {
            foreach ($operations as $operation) {
                $action = (string)($operation['action'] ?? '');
                $collection = validCollection($operation['collection'] ?? null);
                $id = validDocumentId($operation['id'] ?? null);
                if ($action === 'delete') { unset($store[$collection][$id]); continue; }
                $data = normalizeData($operation['data'] ?? null);
                $now = gmdate('c');
                if ($action === 'set') {
                    $created = $store[$collection][$id]['createdAt'] ?? $now;
                    $store[$collection][$id] = ['data' => $data, 'createdAt' => $created, 'updatedAt' => $now];
                } elseif ($action === 'update') {
                    if (!isset($store[$collection][$id])) throw new ApiException('Документ не найден.', 404, 'not_found');
                    $store[$collection][$id]['data'] = array_replace($store[$collection][$id]['data'] ?? [], $data);
                    $store[$collection][$id]['updatedAt'] = $now;
                } else throw new ApiException('Неизвестная операция пакета.');
            }
        });
    }
}

function applyRawOperation(Store $store, array $operation): void {
    $action = (string)($operation['action'] ?? '');
    $collection = validCollection($operation['collection'] ?? null);
    $id = validDocumentId($operation['id'] ?? null);
    if ($action === 'delete') { $store->delete($collection, $id); return; }
    $data = normalizeData($operation['data'] ?? null);
    if ($action === 'set') { $store->set($collection, $id, $data); return; }
    if ($action === 'update') { $store->update($collection, $id, $data); return; }
    throw new ApiException('Неизвестная операция пакета.');
}

function makeStore(): Store {
    if (!is_dir(DATA_DIR) && !mkdir(DATA_DIR, 0775, true) && !is_dir(DATA_DIR)) throw new ApiException('Не удалось создать папку data.', 500, 'storage_error');
    if (!is_writable(DATA_DIR)) throw new ApiException('Папка data недоступна для записи.', 500, 'storage_error');
    return extension_loaded('pdo_sqlite') ? new SqliteStore(SQLITE_FILE) : new JsonStore(JSON_FILE);
}

function currentProfile(Store $store): array {
    $profile = $_SESSION['profile'] ?? null;
    $lastActivity = (int)($_SESSION['last_activity'] ?? 0);
    if (!is_array($profile) || $lastActivity < time() - SESSION_TTL) {
        $_SESSION = [];
        throw new ApiException('Сессия истекла. Войдите снова.', 401, 'unauthorized');
    }
    $user = findUser($store, (string)($profile['name'] ?? ''));
    if ($user === null) {
        $_SESSION = [];
        throw new ApiException('Учётная запись больше не существует.', 401, 'unauthorized');
    }
    $blocked = $store->get('blocked_users', (string)$user['name']);
    if (($blocked['blocked'] ?? false) === true) {
        $_SESSION = [];
        throw new ApiException('Доступ заблокирован. Обратитесь к администрации.', 403, 'blocked');
    }
    $_SESSION['profile'] = publicProfile($user);
    $_SESSION['last_activity'] = time();
    return $_SESSION['profile'];
}

function loginRateLimit(): void {
    $now = time();
    $attempts = array_values(array_filter($_SESSION['login_attempts'] ?? [], static fn(mixed $ts): bool => is_int($ts) && $ts >= $now - LOGIN_WINDOW));
    if (count($attempts) >= LOGIN_ATTEMPTS) throw new ApiException('Слишком много попыток входа. Подождите несколько минут.', 429, 'rate_limited');
    $attempts[] = $now;
    $_SESSION['login_attempts'] = $attempts;
}

function documentReadable(string $collection, array $data, array $profile): bool {
    $name = (string)$profile['name'];
    if ($collection === 'messages') return ($data['from'] ?? null) === $name || ($data['to'] ?? null) === $name;
    if ($collection === 'homework_submissions') return isMaster($profile) || ($data['studentName'] ?? null) === $name;
    if ($collection === 'lesson_reads') return isMaster($profile) || ($data['userId'] ?? null) === $name;
    if ($collection === 'manual_adjustments') return isMaster($profile) || ($data['userName'] ?? null) === $name;
    if ($collection === 'audit_log') return isAdmin($profile);
    return true;
}

function stripPrivateFields(string $collection, array $data, array $profile): array {
    if ($collection === 'blocked_users' && !isAdmin($profile)) {
        unset($data['reason'], $data['blockedBy'], $data['unblockedBy']);
    }
    if ($collection === 'manual_adjustments' && !isMaster($profile)) {
        unset($data['reason'], $data['adjustedBy']);
    }
    return $data;
}

function filterReadableDocuments(string $collection, array $documents, array $profile): array {
    $result = [];
    foreach ($documents as $document) {
        $data = is_array($document['data'] ?? null) ? $document['data'] : [];
        if (!documentReadable($collection, $data, $profile)) continue;
        $document['data'] = stripPrivateFields($collection, $data, $profile);
        $result[] = $document;
    }
    return $result;
}

function sanitizeWrite(Store $store, string $action, string $collection, ?string $id, array $data, array $profile): array {
    $name = (string)$profile['name'];
    $rank = (string)$profile['rank'];
    $current = $id !== null ? $store->get($collection, $id) : null;
    $now = ['__akashaDate' => gmdate('c')];

    if ($collection === 'audit_log') throw new ApiException('Запись в журнал доступна только серверу.', 403, 'forbidden');

    if ($collection === 'lessons') {
        if (!isAdmin($profile)) throw new ApiException('Недостаточно прав для изменения уроков.', 403, 'forbidden');
        if ($action === 'delete') return [];
        $allowed = [];
        if ($action === 'add' || array_key_exists('category', $data)) {
            $category = textValue($data['category'] ?? '', 'Категория', 1, 40);
            if (!in_array($category, ['адепт','юнлинг','падаван','старший падаван','рыцарь','мастер','магистр'], true)) throw new ApiException('Неизвестная категория урока.');
            $allowed['category'] = $category;
        }
        if ($action === 'add' || array_key_exists('title', $data)) $allowed['title'] = textValue($data['title'] ?? '', 'Название', 1, 180);
        if ($action === 'add' || array_key_exists('content', $data)) $allowed['content'] = textValue($data['content'] ?? '', 'Текст урока', 1, 50000);
        if ($action === 'add' || array_key_exists('mediaUrl', $data)) $allowed['mediaUrl'] = safeHttpUrl($data['mediaUrl'] ?? '', 'Медиа', true);
        if ($action === 'add') { $allowed['createdAt'] = dateMarker($data['createdAt'] ?? null); $allowed['addedBy'] = $name; }
        else { $allowed['updatedAt'] = $now; $allowed['updatedBy'] = $name; }
        return $allowed;
    }

    if ($collection === 'homework_assignments') {
        if (!isMaster($profile)) throw new ApiException('Только Мастер может менять домашние задания.', 403, 'forbidden');
        if ($action === 'delete') return [];
        $allowed = [];
        if ($action === 'add' || array_key_exists('title', $data)) $allowed['title'] = textValue($data['title'] ?? '', 'Название', 1, 180);
        if ($action === 'add' || array_key_exists('description', $data)) $allowed['description'] = textValue($data['description'] ?? '', 'Описание', 1, 10000);
        if (array_key_exists('dueAt', $data)) $allowed['dueAt'] = $data['dueAt'] ? dateMarker($data['dueAt']) : null;
        if ($action === 'add') { $allowed['createdBy'] = $name; $allowed['createdAt'] = dateMarker($data['createdAt'] ?? null); }
        else { $allowed['updatedBy'] = $name; $allowed['updatedAt'] = $now; }
        return $allowed;
    }

    if ($collection === 'homework_submissions') {
        if ($action === 'add') {
            $assignmentId = validDocumentId($data['assignmentId'] ?? null);
            if ($store->get('homework_assignments', $assignmentId) === null) throw new ApiException('Домашнее задание не найдено.', 404, 'not_found');
            return [
                'assignmentId' => $assignmentId,
                'studentName' => $name,
                'studentRank' => $rank,
                'content' => textValue($data['content'] ?? '', 'Ответ', 1, 20000),
                'status' => 'pending',
                'submittedAt' => dateMarker($data['submittedAt'] ?? null),
                'masterFeedback' => '',
                'reviewedAt' => null,
            ];
        }
        if ($current === null) throw new ApiException('Ответ не найден.', 404, 'not_found');
        if ($action === 'delete') {
            $isOwner = ($current['studentName'] ?? null) === $name;
            $canOwnerDelete = $isOwner && in_array($current['status'] ?? 'pending', ['pending','needs_revision'], true);
            if (!isMaster($profile) && !$canOwnerDelete) throw new ApiException('Нельзя удалить этот ответ.', 403, 'forbidden');
            return [];
        }
        $isOwner = ($current['studentName'] ?? null) === $name;
        if (!isMaster($profile) && $isOwner && ($current['status'] ?? '') === 'needs_revision') {
            return [
                'content' => textValue($data['content'] ?? '', 'Ответ', 1, 20000),
                'status' => 'pending',
                'submittedAt' => $now,
                'masterFeedback' => '',
                'reviewedAt' => null,
                'reviewedBy' => null,
            ];
        }
        if (!isMaster($profile)) throw new ApiException('Только Мастер может проверять ответы.', 403, 'forbidden');
        $status = textValue($data['status'] ?? ($current['status'] ?? 'pending'), 'Статус', 1, 40);
        if (!in_array($status, ['pending','approved','needs_revision'], true)) throw new ApiException('Некорректный статус ответа.');
        return [
            'status' => $status,
            'masterFeedback' => textValue((string)($data['masterFeedback'] ?? ''), 'Комментарий', 0, 5000, true),
            'reviewedAt' => $now,
            'reviewedBy' => $name,
        ];
    }

    if ($collection === 'comments') {
        if ($action === 'add') {
            $lessonId = validDocumentId($data['lessonId'] ?? null);
            if ($store->get('lessons', $lessonId) === null) throw new ApiException('Урок не найден.', 404, 'not_found');
            $type = (string)($data['type'] ?? 'question');
            if (!in_array($type, ['question','task'], true)) $type = 'question';
            if ($type === 'task' && !isMaster($profile)) throw new ApiException('Только Мастер может публиковать задания в комментариях.', 403, 'forbidden');
            return [
                'lessonId' => $lessonId,
                'text' => textValue($data['text'] ?? '', 'Комментарий', 1, 5000),
                'type' => $type,
                'authorName' => $name,
                'authorRank' => $rank,
                'createdAt' => dateMarker($data['createdAt'] ?? null),
            ];
        }
        if ($current === null) throw new ApiException('Комментарий не найден.', 404, 'not_found');
        $isOwner = ($current['authorName'] ?? null) === $name;
        if (!$isOwner && !isAdmin($profile)) throw new ApiException('Нельзя изменить чужой комментарий.', 403, 'forbidden');
        if ($action === 'delete') return [];
        return ['text' => textValue($data['text'] ?? '', 'Комментарий', 1, 5000), 'updatedAt' => $now];
    }

    if ($collection === 'messages') {
        if ($action === 'add') {
            $to = textValue($data['to'] ?? '', 'Получатель', 1, 240);
            $recipient = findUser($store, $to);
            if ($recipient === null) throw new ApiException('Получатель не найден.', 404, 'not_found');
            return [
                'from' => $name,
                'to' => (string)$recipient['name'],
                'text' => textValue($data['text'] ?? '', 'Сообщение', 1, 5000),
                'timestamp' => dateMarker($data['timestamp'] ?? null),
                'read' => false,
            ];
        }
        if ($current === null || !documentReadable($collection, $current, $profile)) throw new ApiException('Сообщение не найдено.', 404, 'not_found');
        if ($action === 'delete') return [];
        if (($current['to'] ?? null) !== $name) throw new ApiException('Только получатель может отметить сообщение прочитанным.', 403, 'forbidden');
        return ['read' => true, 'readAt' => $now];
    }

    if ($collection === 'blocked_users') {
        if (!isAdmin($profile)) throw new ApiException('Только Магистр может управлять блокировками.', 403, 'forbidden');
        if ($id === null || !userExists($store, $id)) throw new ApiException('Пользователь не найден.', 404, 'not_found');
        if (normalizeName($id) === normalizeName($name)) throw new ApiException('Нельзя заблокировать самого себя.');
        if ($action === 'delete') return [];
        $blocked = (bool)($data['blocked'] ?? true);
        $result = ['blocked' => $blocked];
        if ($blocked) {
            $result['reason'] = textValue($data['reason'] ?? '', 'Причина', 1, 2000);
            $result['blockedBy'] = $name;
            $result['blockedAt'] = $now;
        } else {
            $result['unblockedBy'] = $name;
            $result['unblockedAt'] = $now;
        }
        return $result;
    }

    if ($collection === 'lesson_reads') {
        if ($action === 'delete') throw new ApiException('Удаление отметок о чтении отключено.', 403, 'forbidden');
        $lessonId = validDocumentId($data['lessonId'] ?? null);
        if ($store->get('lessons', $lessonId) === null) throw new ApiException('Урок не найден.', 404, 'not_found');
        return ['userId' => $name, 'lessonId' => $lessonId, 'readAt' => dateMarker($data['readAt'] ?? null), 'userRank' => $rank];
    }

    if ($collection === 'user_registrations') {
        if ($id === null || normalizeName($id) !== normalizeName($name)) throw new ApiException('Можно менять только собственную регистрацию.', 403, 'forbidden');
        if ($action === 'delete') throw new ApiException('Удаление регистрации отключено.', 403, 'forbidden');
        return ['userName' => $name, 'userRank' => $rank, 'registeredAt' => $current['registeredAt'] ?? dateMarker($data['registeredAt'] ?? null), 'lastSeenAt' => $now];
    }

    if ($collection === 'manual_adjustments') {
        if (!isMaster($profile)) throw new ApiException('Только Мастер может корректировать успеваемость.', 403, 'forbidden');
        if ($id === null || !userExists($store, $id)) throw new ApiException('Пользователь не найден.', 404, 'not_found');
        if ($action === 'delete') return [];
        return [
            'userName' => $id,
            'adjustedLessons' => intValue($data['adjustedLessons'] ?? 0, 'Уроки', 0, 100000),
            'adjustedHomework' => intValue($data['adjustedHomework'] ?? 0, 'ДЗ', 0, 100000),
            'reason' => textValue($data['reason'] ?? '', 'Причина', 1, 2000),
            'adjustedBy' => $name,
            'adjustedAt' => $now,
        ];
    }

    throw new ApiException('Операция не разрешена.', 403, 'forbidden');
}

function audit(Store $store, array $profile, string $action, string $collection, ?string $id, array $meta = []): void {
    if (!in_array($collection, ['blocked_users','manual_adjustments','homework_assignments','homework_submissions','lessons','users'], true)) return;
    try {
        $store->add('audit_log', [
            'actor' => $profile['name'],
            'actorRank' => $profile['rank'],
            'action' => $action,
            'collection' => $collection,
            'documentId' => $id,
            'meta' => $meta,
            'createdAt' => ['__akashaDate' => gmdate('c')],
        ]);
    } catch (Throwable $error) { error_log('Audit error: ' . $error->getMessage()); }
}


function cascadeDelete(Store $store, string $collection, string $id): void {
    $targets = [];
    if ($collection === 'homework_assignments') {
        $targets[] = ['homework_submissions', 'assignmentId'];
    } elseif ($collection === 'lessons') {
        $targets[] = ['comments', 'lessonId'];
        $targets[] = ['lesson_reads', 'lessonId'];
    }
    foreach ($targets as [$childCollection, $field]) {
        $documents = $store->query($childCollection, [['field' => $field, 'operator' => '==', 'value' => $id]]);
        foreach ($documents as $document) {
            if (isset($document['id'])) $store->delete($childCollection, (string)$document['id']);
        }
    }
}

try {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') respond(['ok' => true]);
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') throw new ApiException('Используйте POST.', 405, 'method_not_allowed');

    $payload = readPayload();
    $action = (string)($payload['action'] ?? 'health');
    $store = makeStore();
    ensureUsersSeeded($store);

    if ($action === 'health') respond(['ok' => true, 'driver' => $store->driver(), 'version' => APP_VERSION]);

    if ($action === 'login') {
        loginRateLimit();
        $name = textValue($payload['name'] ?? '', 'Имя', 1, 240);
        $password = textValue($payload['password'] ?? '', 'Пароль', 1, 240);
        $user = findUser($store, $name);
        usleep(random_int(80000, 180000));
        if ($user === null || !password_verify($password, (string)($user['password_hash'] ?? ''))) {
            throw new ApiException('Неверное имя или пароль.', 401, 'invalid_credentials');
        }
        $blocked = $store->get('blocked_users', (string)$user['name']);
        if (($blocked['blocked'] ?? false) === true) throw new ApiException('Доступ заблокирован. Обратитесь к администрации.', 403, 'blocked');
        session_regenerate_id(true);
        $_SESSION['profile'] = publicProfile($user);
        $_SESSION['last_activity'] = time();
        $_SESSION['login_attempts'] = [];
        respond(['ok' => true, 'profile' => $_SESSION['profile']]);
    }

    if ($action === 'logout') {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', (bool)$params['secure'], (bool)$params['httponly']);
        }
        session_destroy();
        respond(['ok' => true]);
    }

    if ($action === 'session' && !isset($_SESSION['profile'])) respond(['ok' => true, 'authenticated' => false]);

    $profile = currentProfile($store);

    if ($action === 'session') respond(['ok' => true, 'authenticated' => true, 'profile' => $profile]);
    if ($action === 'profiles') respond(['ok' => true, 'profiles' => array_map('publicProfile', allUsers($store))]);

    if ($action === 'create_user') {
        if (!isAdmin($profile)) throw new ApiException('Создавать пользователей могут только Магистры.', 403, 'forbidden');
        $name = textValue($payload['name'] ?? '', 'Имя', 2, 240);
        $rank = rankValue($payload['rank'] ?? '');
        $password = textValue($payload['password'] ?? '', 'Пароль', 6, 240);
        $aliases = aliasList($payload['aliases'] ?? []);
        ensureIdentityAvailable($store, $name, $aliases);
        $teacher = validateTeacher($store, $payload['teacher'] ?? 'отсутствует', $name);
        $record = [
            'name' => $name,
            'rank' => $rank,
            'teacher' => $teacher,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
            'aliases' => $aliases,
            'specialTitle' => textValue((string)($payload['specialTitle'] ?? ''), 'Особый титул', 0, 240, true),
            'description' => textValue((string)($payload['description'] ?? ''), 'Описание', 0, 2000, true),
            'createdAt' => dateMarker(null),
            'createdBy' => (string)$profile['name'],
        ];
        $id = $store->add(USER_COLLECTION, $record);
        audit($store, $profile, 'create', 'users', $id, ['title' => $name]);
        respond(['ok' => true, 'profile' => publicProfile($record)], 201);
    }

    if ($action === 'update_user') {
        if (!isAdmin($profile)) throw new ApiException('Редактировать пользователей могут только Магистры.', 403, 'forbidden');
        $targetName = textValue($payload['userName'] ?? '', 'Пользователь', 1, 240);
        $document = findUserDocument($store, $targetName);
        if ($document === null) throw new ApiException('Пользователь не найден.', 404, 'not_found');
        $current = $document['data'];
        $aliases = array_key_exists('aliases', $payload) ? aliasList($payload['aliases']) : ($current['aliases'] ?? []);
        ensureIdentityAvailable($store, (string)$current['name'], $aliases, (string)$document['id']);
        $updated = [
            'rank' => array_key_exists('rank', $payload) ? rankValue($payload['rank']) : (string)$current['rank'],
            'teacher' => array_key_exists('teacher', $payload) ? validateTeacher($store, $payload['teacher'], (string)$current['name']) : (string)($current['teacher'] ?? 'отсутствует'),
            'aliases' => $aliases,
            'specialTitle' => array_key_exists('specialTitle', $payload) ? textValue((string)$payload['specialTitle'], 'Особый титул', 0, 240, true) : (string)($current['specialTitle'] ?? ''),
            'description' => array_key_exists('description', $payload) ? textValue((string)$payload['description'], 'Описание', 0, 2000, true) : (string)($current['description'] ?? ''),
            'updatedAt' => dateMarker(null),
            'updatedBy' => (string)$profile['name'],
        ];
        $store->update(USER_COLLECTION, (string)$document['id'], $updated);
        audit($store, $profile, 'update', 'users', (string)$document['id'], ['title' => (string)$current['name']]);
        $fresh = array_replace($current, $updated);
        if (normalizeName((string)$profile['name']) === normalizeName((string)$current['name'])) $_SESSION['profile'] = publicProfile($fresh);
        respond(['ok' => true, 'profile' => publicProfile($fresh)]);
    }

    if ($action === 'reset_user_password') {
        if (!isAdmin($profile)) throw new ApiException('Менять пароли могут только Магистры.', 403, 'forbidden');
        $targetName = textValue($payload['userName'] ?? '', 'Пользователь', 1, 240);
        $password = textValue($payload['password'] ?? '', 'Новый пароль', 6, 240);
        $document = findUserDocument($store, $targetName);
        if ($document === null) throw new ApiException('Пользователь не найден.', 404, 'not_found');
        $store->update(USER_COLLECTION, (string)$document['id'], [
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
            'passwordChangedAt' => dateMarker(null),
            'passwordChangedBy' => (string)$profile['name'],
        ]);
        audit($store, $profile, 'password_reset', 'users', (string)$document['id'], ['title' => $targetName]);
        respond(['ok' => true]);
    }

    if ($action === 'batch') {
        $operations = $payload['operations'] ?? null;
        if (!is_array($operations)) throw new ApiException('Поле operations должно быть массивом.');
        if (count($operations) > 500) throw new ApiException('Слишком много операций в пакете.');
        $safeOperations = [];
        foreach ($operations as $operation) {
            if (!is_array($operation)) throw new ApiException('Некорректная операция пакета.');
            $opAction = (string)($operation['action'] ?? '');
            $collection = validCollection($operation['collection'] ?? null);
            $id = validDocumentId($operation['id'] ?? null);
            $data = $opAction === 'delete' ? [] : normalizeData($operation['data'] ?? []);
            $safe = sanitizeWrite($store, $opAction, $collection, $id, $data, $profile);
            $safeOperations[] = ['action' => $opAction, 'collection' => $collection, 'id' => $id, 'data' => $safe];
        }
        $store->batch($safeOperations);
        foreach ($safeOperations as $op) audit($store, $profile, $op['action'], $op['collection'], $op['id']);
        respond(['ok' => true]);
    }

    $collection = validCollection($payload['collection'] ?? null);

    switch ($action) {
        case 'query':
            $filters = $payload['filters'] ?? [];
            if (!is_array($filters)) throw new ApiException('Поле filters должно быть массивом.');
            $documents = filterReadableDocuments($collection, $store->query($collection, $filters), $profile);
            respond(['ok' => true, 'documents' => $documents]);

        case 'get':
            $id = validDocumentId($payload['id'] ?? null);
            $data = $store->get($collection, $id);
            if ($data !== null && !documentReadable($collection, $data, $profile)) $data = null;
            if ($data !== null) $data = stripPrivateFields($collection, $data, $profile);
            respond(['ok' => true, 'exists' => $data !== null, 'data' => $data ?? new stdClass()]);

        case 'add':
            $safe = sanitizeWrite($store, 'add', $collection, null, normalizeData($payload['data'] ?? null), $profile);
            $id = $store->add($collection, $safe);
            audit($store, $profile, 'add', $collection, $id, ['title' => $safe['title'] ?? null]);
            respond(['ok' => true, 'id' => $id], 201);

        case 'set':
            $id = validDocumentId($payload['id'] ?? null);
            $safe = sanitizeWrite($store, 'set', $collection, $id, normalizeData($payload['data'] ?? null), $profile);
            if (($payload['merge'] ?? false) === true && $store->get($collection, $id) !== null) $store->update($collection, $id, $safe);
            else $store->set($collection, $id, $safe);
            audit($store, $profile, 'set', $collection, $id);
            respond(['ok' => true]);

        case 'update':
            $id = validDocumentId($payload['id'] ?? null);
            $safe = sanitizeWrite($store, 'update', $collection, $id, normalizeData($payload['data'] ?? null), $profile);
            $store->update($collection, $id, $safe);
            audit($store, $profile, 'update', $collection, $id, ['status' => $safe['status'] ?? null]);
            respond(['ok' => true]);

        case 'delete':
            $id = validDocumentId($payload['id'] ?? null);
            sanitizeWrite($store, 'delete', $collection, $id, [], $profile);
            cascadeDelete($store, $collection, $id);
            $store->delete($collection, $id);
            audit($store, $profile, 'delete', $collection, $id);
            respond(['ok' => true]);

        default:
            throw new ApiException('Неизвестное действие.', 400, 'unknown_action');
    }
} catch (ApiException $error) {
    respond(['ok' => false, 'error' => $error->getMessage(), 'code' => $error->codeName], $error->status);
} catch (Throwable $error) {
    error_log($error->__toString());
    respond(['ok' => false, 'error' => 'Внутренняя ошибка сервера. Проверьте права на папку data и журнал PHP.', 'code' => 'server_error'], 500);
}

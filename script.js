// ===== FIREBASE CONFIG =====
const firebaseConfig = {
    apiKey: "AIzaSyCwTw-52bQ_MxtdFAT3s9pkEN9rQ2qiMEE",
    authDomain: "akasha-2b362.firebaseapp.com",
    projectId: "akasha-2b362",
    storageBucket: "akasha-2b362.firebasestorage.app",
    messagingSenderId: "352516960841",
    appId: "1:352516960841:web:88cdd6b970b14b5ced8598",
    measurementId: "G-GDYYS12EQH"
};

let knowledgeBase = {}, lessonsById = {}, assignmentsList = [], submissionsList = [], scheduleList = [], sectionsList = [], libraryDepartments = [], libraryBooks = [], onlineStatuses = {};
window.currentChatPartner = null;
let currentUser = null, addLessonState = null, windowDb = null, storageRef = null, isInitialized = false, heartbeatTimer = null, isCustomKeyboardActive = false;

const usersDatabase = {
    'аранэль хальдарон': { ранг: 'верховный магистр', учитель: 'отсутствует', пароль: 'A1H23', fullName: 'Аранэль Хальдарон', specialTitle: 'Верховный Магистр', description: 'Глава Ордена Вольных Джедаев', статусы: ['Член Совета Мастеров', 'Верховный Судья'], звания: [{звание: 'Верховный Магистр', уточнение: 'Глава Ордена'}] },
    'дорхат минас тур': { ранг: 'мастер', учитель: 'отсутствует', пароль: 'D1M1T', fullName: 'Дорхат Минас Тур', specialTitle: 'Заместитель Верховного Магистра', description: 'Глава безопасности Ордена Вольных Джедаев', статусы: ['Страж', 'Член Малого Совета'], звания: [{звание: 'Мастер', уточнение: 'Боевой Магии и Защиты от Тьмы'}] },
    'нарнэлион эдрад': { ранг: 'мастер', учитель: 'отсутствует', пароль: 'N1E1', fullName: 'Нарнэлион Эдрад', specialTitle: 'Мастер Артефактов и Целительства', description: 'Мастер по созданию магических Артефактов', статусы: ['Целитель', 'Исследователь'], звания: [{звание: 'Мастер', уточнение: 'Артефактов и Целительства'}] },
    'рондрил лаур': { ранг: 'мастер', учитель: 'отсутствует', пароль: 'R1L1', fullName: 'Рондрил Лаур', specialTitle: 'Мастер-Целитель', description: 'Мастер-Целитель, специалист по травам', статусы: ['Целитель'], звания: [{звание: 'Мастер', уточнение: 'Физического Целительства'}] },
    'далисса вестуро': { ранг: 'старший падаван', учитель: 'Аранэль Хальдарон', пароль: 'D5i10V3', fullName: 'Далисса Иденааль Вестуро', specialTitle: 'Архивариус Ордена', description: 'Глава Библиотеки Ордена', статусы: ['Архивариус', 'Хранитель Знаний'], звания: [] },
    'даниил ионов': { ранг: 'падаван', учитель: 'Нарнэлион Эдрад', пароль: 'D5i10', fullName: 'Даниил Ионов', статусы: [], звания: [] },
    'кайренарт ветэрмайтерос': { ранг: 'юнлинг', учитель: 'отсутствует', пароль: 'K12A1V3', fullName: 'Кайренарт Авандалэр Ветэрмайтерос', статусы: [], звания: [] },
    'тейраналь лоаннен-тиарастес': { ранг: 'юнлинг', учитель: 'отсутствует', пароль: 'T20A1LT13', fullName: 'Тейраналь Арианарт Лоаннен-Тиарастес', статусы: [], звания: [] },
    'асстария ламанш': { ранг: 'юнлинг', учитель: 'отсутствует', пароль: 'A1A1L13', fullName: 'Асстария Авангорн Ламанш', статусы: [], звания: [] },
    'наталья кузовцова': { ранг: 'юнлинг', учитель: 'отсутствует', пароль: 'N15K12', fullName: 'Наталья Кузовцова', статусы: [], звания: [] }
};

const rankHierarchy = ['адепт', 'юнлинг', 'падаван', 'старший падаван', 'рыцарь', 'мастер', 'магистр', 'верховный магистр', 'старейшина'];
const availableStatuses = ['Целитель', 'Воин', 'Страж', 'Исследователь', 'Учёный', 'Рекрутёр', 'Инструктор', 'Библиотекарь', 'Хранитель', 'Провидец', 'Судья', 'Верховный Судья', 'Член Малого Совета', 'Член Совета Мастеров', 'Член Совета', 'Архивариус', 'Другие'];
const availableTitles = ['Рядовой', 'Капитан', 'Генерал', 'Архивариус', 'Рыцарь', 'Мастер', 'Предвестник', 'Вестник', 'Лорд', 'Леди'];

function getRankLevel(r) { const l = rankHierarchy.indexOf(r.toLowerCase()); return l === -1 ? 0 : l; }
function isHigherRank(a, b) { return getRankLevel(a) > getRankLevel(b); }
function isSameOrHigherRank(a, b) { return getRankLevel(a) >= getRankLevel(b); }
function hasStatus(u, s) { return !!(u.статусы) && u.статусы.some(x => typeof x === 'string' && x.toLowerCase() === s.toLowerCase()); }
function hasTitle(u, t) { return !!(u.звания) && u.звания.some(x => typeof x === 'object' && x.звание.toLowerCase() === t.toLowerCase()); }
function canEditSchedule() { return !!currentUser && getRankLevel(currentUser.ранг) >= getRankLevel('старший падаван'); }
function isArchivist() { return !!currentUser && (hasStatus(currentUser, 'Архивариус') || currentUser.fullName === 'Далисса Иденааль Вестуро'); }
function isAdmin() { return !!currentUser && ['магистр', 'верховный магистр', 'старейшина'].includes(currentUser.ранг); }
function isMaster() { return !!currentUser && ['мастер', 'магистр', 'верховный магистр', 'старейшина'].includes(currentUser.ранг); }

const accessLevels = {
    'адепт': ['адепт'], 'юнлинг': ['адепт', 'юнлинг'], 'падаван': ['адепт', 'юнлинг', 'падаван'],
    'старший падаван': ['адепт', 'юнлинг', 'падаван', 'старший падаван'],
    'рыцарь': ['адепт', 'юнлинг', 'падаван', 'старший падаван', 'рыцарь'],
    'мастер': ['адепт', 'юнлинг', 'падаван', 'старший падаван', 'рыцарь', 'мастер'],
    'магистр': ['адепт', 'юнлинг', 'падаван', 'старший падаван', 'рыцарь', 'мастер', 'магистр'],
    'верховный магистр': ['адепт', 'юнлинг', 'падаван', 'старший падаван', 'рыцарь', 'мастер', 'магистр', 'верховный магистр'],
    'старейшина': ['адепт', 'юнлинг', 'падаван', 'старший падаван', 'рыцарь', 'мастер', 'магистр', 'верховный магистр', 'старейшина']
};

function applySeasonTheme() {
    const m = new Date().getMonth() + 1; let s, n, e;
    if (m >= 3 && m <= 5) { s = 'spring'; n = 'Весна'; e = '🌸'; }
    else if (m >= 6 && m <= 8) { s = 'summer'; n = 'Лето'; e = '☀️'; }
    else if (m >= 9 && m <= 11) { s = 'autumn'; n = 'Осень'; e = '🍂'; }
    else { s = 'winter'; n = 'Зима'; e = '❄️'; }
    document.body.className = `season-${s}`;
    const ind = document.getElementById('season-indicator'); if (ind) ind.textContent = `${e} ${n}`;
}

function getStrangerGreeting() {
    return `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">
        <h3 style="color:#64ffda; margin-bottom:15px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">🌟 Приветствую тебя, Странник</h3>
        <p style="color:var(--text-color); line-height:1.8; margin-bottom:15px;">Я — <strong>Акаша</strong>, Хранительница Знаний Ордена Вольных Джедаев.</p>
        <p style="color:var(--text-color); line-height:1.8; margin-bottom:15px;">Орден Вольных Джедаев — это братство тех, кто посвятил себя изучению высших искусств, защите и сохранению целостности и единства Света.</p>
        <h4 style="color:#8bc34a; margin:20px 0 10px 0; font-family:'Playfair Display',serif;">📋 Как получить доступ:</h4>
        <p style="color:var(--text-color); line-height:1.8; margin-bottom:15px;">Чтобы войти в систему, назови мне своё <strong>Имя</strong>, <strong>Ранг</strong>, имя своего <strong>Учителя</strong> и <strong>Пароль</strong>.<br><br><em>Пример:</em> "Меня зовут Оби-Ван Кеноби, я Магистр, мой Учитель — Квай-Гон Джинн, пароль O2V7K9"</p>
        <p style="color:#a89b7e; font-style:italic; text-align:center; margin-top:20px;">✨ Орден ждёт тебя, Странник. Назови себя.</p>
    </div>`;
}

function getRankGreeting(user) {
    const rank = user.ранг, name = user.name;
    const isM = ['мастер', 'магистр', 'верховный магистр', 'старейшина'].includes(rank);
    if (isM) {
        return `<div style="background:rgba(13,31,15,0.5); border:1px solid rgba(255,215,0,0.3); border-radius:15px; padding:25px; margin:15px 0;">
            <h3 style="color:#ffd700; margin-bottom:15px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">🌟 Приветствую тебя, ${rank} ${name}</h3>
            <p style="color:var(--text-color); line-height:1.8; margin-bottom:15px;">Орден Вольных Джедаев рад видеть тебя среди своих хранителей.</p>
            <h4 style="color:#8bc34a; margin:20px 0 10px 0; font-family:'Playfair Display',serif;">📋 Твои возможности:</h4>
            <ul style="color:var(--text-color); line-height:1.8; padding-left:20px; margin-bottom:15px;">
                <li>📚 Доступ ко всем разделам знаний Ордена</li><li>📝 Создание и проверка домашних заданий</li>
                <li>✏️ Добавление и редактирование уроков</li><li>💬 Общение с учениками через личный чат</li>
                <li>📊 Просмотр таблицы успеваемости</li><li>📅 Управление расписанием занятий</li>
                ${rank === 'магистр' || rank === 'верховный магистр' || rank === 'старейшина' ? '<li>⚙️ Админ-панель: управление пользователями, назначение Рангов/Статусов/Званий</li>' : ''}
            </ul>
            <p style="color:#a89b7e; font-style:italic; text-align:center; margin-top:20px;">Используй свои возможности мудро, ${rank}. Орден доверяет тебе.</p>
        </div>`;
    }
    return `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">
        <h3 style="color:#64ffda; margin-bottom:15px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">🌟 Я рада приветствовать тебя в Ордене Вольных Джедаев, ${rank} ${name}!</h3>
        <p style="color:var(--text-color); line-height:1.8; margin-bottom:15px;">Твой путь только начинается. Впереди тебя ждут знания, испытания и рост.</p>
        <h4 style="color:#8bc34a; margin:20px 0 10px 0; font-family:'Playfair Display',serif;">📜 Как пользоваться Акашей:</h4>
        <ul style="color:var(--text-color); line-height:1.8; padding-left:20px; margin-bottom:15px;">
            <li>📝 <strong>Домашние задания</strong></li><li>✉️ <strong>Написать Мастеру</strong></li>
            <li>📚 <strong>Оглавление знаний</strong></li><li>📖 <strong>Библиотека</strong></li>
            <li>📅 <strong>Расписание</strong></li><li>🏛️ <strong>Совет Мастеров</strong></li>
            <li>👥 <strong>Члены Ордена</strong></li><li>📊 <strong>Успеваемость</strong></li>
        </ul>
        <p style="color:#a89b7e; font-style:italic; text-align:center; margin-top:20px;">Да пребудет с тобой Сила, ${rank} ${name}.</p>
    </div>`;
}

const chatContainer = document.getElementById('chat-container');
const customTextarea = document.getElementById('custom-textarea');
const customKeyboard = document.getElementById('custom-keyboard');

function isLocalStorageAvailable() { try { localStorage.setItem('t', 't'); localStorage.removeItem('t'); return true; } catch (e) { return false; } }
const LOCAL_STORAGE_AVAILABLE = isLocalStorageAvailable();
const STORAGE_KEY = 'akasha_chat_history', USER_KEY = 'akasha_current_user';

function saveMessageToStorage(text, isUser) { if (!LOCAL_STORAGE_AVAILABLE) return; try { let h = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; h.push({ text, isUser, timestamp: Date.now() }); localStorage.setItem(STORAGE_KEY, JSON.stringify(h)); } catch (e) {} }
function loadHistoryFromStorage() { if (!LOCAL_STORAGE_AVAILABLE) return; try { (JSON.parse(localStorage.getItem(STORAGE_KEY)) || []).forEach(m => addMessage(m.text, m.isUser, false)); } catch (e) {} }
function clearHistory() { if (LOCAL_STORAGE_AVAILABLE) localStorage.removeItem(STORAGE_KEY); }
function saveUserToStorage() { if (!LOCAL_STORAGE_AVAILABLE) return; if (currentUser) localStorage.setItem(USER_KEY, JSON.stringify(currentUser)); else localStorage.removeItem(USER_KEY); }
function loadUserFromStorage() { if (!LOCAL_STORAGE_AVAILABLE) return; try { const u = JSON.parse(localStorage.getItem(USER_KEY)); if (u) { currentUser = u; updateLogoutButton(); loadLessonsFromFirebase(); loadAssignments(); loadSubmissions(); loadScheduleFromFirebase(); loadSectionsFromFirebase(); loadLibraryFromFirebase(); loadOnlineStatuses(); registerUserIfNeeded(); } } catch (e) { console.error(e); } }

// ===== ДИНАМИЧЕСКАЯ ПОДГРУЗКА FIREBASE STORAGE (без правки index.html) =====
function loadFirebaseStorageSDK() {
    return new Promise((resolve, reject) => {
        if (typeof firebase !== 'undefined' && firebase.storage) { resolve(); return; }
        const s = document.createElement('script');
        s.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js';
        s.onload = () => { console.log('✅ Firebase Storage SDK подгружен'); resolve(); };
        s.onerror = () => { console.error('❌ Не удалось подгрузить Storage SDK'); reject(new Error('Storage SDK load failed')); };
        document.head.appendChild(s);
    });
}

async function initFirebaseStorage() {
    try {
        await loadFirebaseStorageSDK();
        if (typeof firebase !== 'undefined' && firebase.storage) {
            storageRef = firebase.storage().ref();
            console.log('✅ Firebase Storage готов');
        }
    } catch (e) { console.error('Storage init error:', e); }
}

async function loadSectionsFromFirebase() {
    sectionsList = [];
    if (LOCAL_STORAGE_AVAILABLE) { try { const s = localStorage.getItem('akasha_sections'); if (s) sectionsList = JSON.parse(s); } catch (e) {} }
    if (!windowDb) return;
    try {
        const snap = await windowDb.collection('sections').get();
        sectionsList = [];
        snap.forEach(d => sectionsList.push({ id: d.id, ...d.data() }));
        if (LOCAL_STORAGE_AVAILABLE) localStorage.setItem('akasha_sections', JSON.stringify(sectionsList));
    } catch (e) { console.error(e); }
}
async function addSectionToFirebase(year, rank, name, order) {
    if (!windowDb) return false;
    try {
        const ref = await windowDb.collection('sections').add({ year, rank, name, order, createdAt: firebase.firestore.Timestamp.fromDate(new Date()), createdBy: currentUser.name });
        const ns = { id: ref.id, year, rank, name, order };
        sectionsList.push(ns);
        if (LOCAL_STORAGE_AVAILABLE) localStorage.setItem('akasha_sections', JSON.stringify(sectionsList));
        return true;
    } catch (e) { console.error(e); return false; }
}
async function deleteSectionFromFirebase(id) {
    if (!windowDb || !id) return false;
    try {
        await windowDb.collection('sections').doc(id).delete();
        sectionsList = sectionsList.filter(s => s.id !== id);
        if (LOCAL_STORAGE_AVAILABLE) localStorage.setItem('akasha_sections', JSON.stringify(sectionsList));
        return true;
    } catch (e) { console.error(e); return false; }
}
window.editSection = async function(id) {
    const sec = sectionsList.find(s => s.id === id);
    if (!sec) { showAlert('Ошибка', 'Раздел не найден!'); return; }
    const nn = await askPrompt('Редактирование раздела', `Текущее название: "${sec.name}"\n\nВведите новое название:`, sec.name);
    if (!nn || !nn.trim()) { showAlert('Отменено', 'Название не может быть пустым.'); return; }
    if (!windowDb) { showAlert('Ошибка', 'База не подключена!'); return; }
    try {
        await windowDb.collection('sections').doc(id).update({ name: nn.trim() });
        const i = sectionsList.findIndex(s => s.id === id); if (i !== -1) sectionsList[i].name = nn.trim();
        if (LOCAL_STORAGE_AVAILABLE) localStorage.setItem('akasha_sections', JSON.stringify(sectionsList));
        showAlert('Успех', `Раздел переименован в "${nn.trim()}"!`); window.showYearSections(sec.year);
    } catch (e) { showAlert('Ошибка', `Не удалось: ${e.message}`); }
};
window.deleteSection = async function(id, nm) {
    const c = await askConfirm('⚠️ ВНИМАНИЕ!', `Удалить раздел "${nm}"?\nЭто НЕОБРАТИМО!`);
    if (!c) return;
    const ok = await deleteSectionFromFirebase(id);
    if (ok) { showAlert('Успех', `Раздел "${nm}" удалён!`); const s = sectionsList.find(x => x.id === id); if (s) window.showYearSections(s.year); else showTOC(); }
    else showAlert('Ошибка', 'Не удалось удалить.');
};

// ===== LIBRARY =====
async function loadLibraryFromFirebase() {
    libraryDepartments = []; libraryBooks = [];
    if (LOCAL_STORAGE_AVAILABLE) { try { const d = localStorage.getItem('akasha_library_departments'); const b = localStorage.getItem('akasha_library_books'); if (d) libraryDepartments = JSON.parse(d); if (b) libraryBooks = JSON.parse(b); } catch (e) {} }
    if (!windowDb) return;
    try {
        const ds = await windowDb.collection('library_departments').orderBy('order', 'asc').get();
        libraryDepartments = []; ds.forEach(d => libraryDepartments.push({ id: d.id, ...d.data() }));
        const bs = await windowDb.collection('library_books').orderBy('number', 'asc').get();
        libraryBooks = []; bs.forEach(d => libraryBooks.push({ id: d.id, ...d.data() }));
        if (LOCAL_STORAGE_AVAILABLE) { localStorage.setItem('akasha_library_departments', JSON.stringify(libraryDepartments)); localStorage.setItem('akasha_library_books', JSON.stringify(libraryBooks)); }
    } catch (e) { console.error(e); }
}
async function addDepartmentToFirebase(name, description) {
    if (!windowDb) return false;
    try {
        const order = libraryDepartments.length + 1;
        const ref = await windowDb.collection('library_departments').add({ name, description: description || '', order, createdAt: firebase.firestore.Timestamp.fromDate(new Date()), createdBy: currentUser.name });
        libraryDepartments.push({ id: ref.id, name, description: description || '', order });
        if (LOCAL_STORAGE_AVAILABLE) localStorage.setItem('akasha_library_departments', JSON.stringify(libraryDepartments));
        return true;
    } catch (e) { console.error(e); return false; }
}
async function deleteDepartmentFromFirebase(id) {
    if (!windowDb || !id) return false;
    try {
        await windowDb.collection('library_departments').doc(id).delete();
        const bd = libraryBooks.filter(b => b.departmentId === id);
        for (const b of bd) await windowDb.collection('library_books').doc(b.id).delete();
        libraryDepartments = libraryDepartments.filter(d => d.id !== id);
        libraryBooks = libraryBooks.filter(b => b.departmentId !== id);
        if (LOCAL_STORAGE_AVAILABLE) { localStorage.setItem('akasha_library_departments', JSON.stringify(libraryDepartments)); localStorage.setItem('akasha_library_books', JSON.stringify(libraryBooks)); }
        return true;
    } catch (e) { console.error(e); return false; }
}
async function addBookToFirebase(departmentId, title, author, description, fileUrl, coverUrl) {
    if (!windowDb) return false;
    try {
        const n = libraryBooks.filter(b => b.departmentId === departmentId).length + 1;
        const ref = await windowDb.collection('library_books').add({ departmentId, title: title || 'Без названия', author: author || 'Неизвестный автор', description: description || '', fileUrl: fileUrl || '', coverUrl: coverUrl || '', number: n, createdAt: firebase.firestore.Timestamp.fromDate(new Date()), addedBy: currentUser.name });
        libraryBooks.push({ id: ref.id, departmentId, title: title || 'Без названия', author: author || 'Неизвестный автор', description: description || '', fileUrl: fileUrl || '', coverUrl: coverUrl || '', number: n });
        if (LOCAL_STORAGE_AVAILABLE) localStorage.setItem('akasha_library_books', JSON.stringify(libraryBooks));
        return true;
    } catch (e) { console.error(e); return false; }
}
async function deleteBookFromFirebase(id) {
    if (!windowDb || !id) return false;
    try {
        await windowDb.collection('library_books').doc(id).delete();
        libraryBooks = libraryBooks.filter(b => b.id !== id);
        if (LOCAL_STORAGE_AVAILABLE) localStorage.setItem('akasha_library_books', JSON.stringify(libraryBooks));
        return true;
    } catch (e) { console.error(e); return false; }
}

// ===== ЗАГРУЗКА ФАЙЛА (обложка ИЛИ книга) В ХРАНИЛИЩЕ =====
window.uploadBookFile = function(target) {
    const fi = document.createElement('input');
    fi.type = 'file';
    fi.accept = target === 'cover' ? 'image/*' : '.pdf,.epub,.fb2,.txt,.doc,.docx,application/pdf,application/epub+zip,text/plain';
    fi.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!storageRef) {
            addMessage('<p>❌ Хранилище ещё не готово. Подождите пару секунд и попробуйте снова, либо вставьте прямую ссылку (URL).</p>');
            return;
        }
        try {
            const path = (target === 'cover' ? 'library/covers/' : 'library/books/') + Date.now() + '_' + file.name;
            const ref = storageRef.child(path);
            addMessage(`<p>📥 Загружаю "${file.name}"... подождите.</p>`);
            const snap = await ref.put(file);
            const url = await snap.ref.getDownloadURL();
            if (target === 'cover') {
                addLessonState.coverUrl = url;
                addMessage(`<p>✅ Обложка загружена! Теперь напишите <em>"готово"</em>, чтобы перейти дальше.</p>`);
            } else {
                addLessonState.fileUrl = url;
                addMessage(`<p>✅ Файл книги загружен! Теперь напишите <em>"готово"</em>, чтобы сохранить книгу.</p>`);
            }
        } catch (err) {
            addMessage(`<p>❌ Ошибка загрузки файла: ${err.message}</p><p>Если хранилище недоступно — вставьте прямую ссылку (URL) вместо слова "файл".</p>`);
        }
    };
    fi.click();
};

// ===== ARCHIVIST CHAT =====
window.openArchivistChat = async function() {
    const an = 'Далисса Иденааль Вестуро';
    chatContainer.classList.add('chat-open');
    document.getElementById('main-input-wrapper').style.display = 'none';
    document.getElementById('archivist-chat-wrapper').style.display = 'block';
    const c = document.getElementById('archivist-chat-container');
    if (!c) return;
    c.innerHTML = '<p style="color:#6b5f4a; text-align:center;">Загрузка...</p>';
    const msgs = await loadArchivistChat();
    if (msgs.length === 0) c.innerHTML = '<p style="color:#6b5f4a; text-align:center; font-style:italic;">Пока нет сообщений. Напиши первый вопрос о книге!</p>';
    else {
        c.innerHTML = '';
        msgs.forEach(m => {
            const mine = m.from === currentUser.name;
            const t = m.timestamp ? new Date(m.timestamp.seconds * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '';
            const b = document.createElement('div'); b.className = `chat-bubble ${mine ? 'mine' : 'theirs'}`;
            b.innerHTML = `<div class="bubble-text">${m.text}</div><div class="bubble-time">${t}</div>`; c.appendChild(b);
        });
        c.scrollTop = c.scrollHeight;
    }
    if (msgs.length > 0) await markArchivistMessagesAsRead();
    window.currentChatPartner = an;
};
async function loadArchivistChat() {
    if (!windowDb || !currentUser) return [];
    try {
        const an = 'Далисса Иденааль Вестуро';
        const s1 = await windowDb.collection('archivist_messages').where('from', '==', currentUser.name).where('to', '==', an).get();
        const s2 = await windowDb.collection('archivist_messages').where('from', '==', an).where('to', '==', currentUser.name).get();
        const m = [];
        s1.forEach(d => m.push({ id: d.id, ...d.data() })); s2.forEach(d => m.push({ id: d.id, ...d.data() }));
        m.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
        return m;
    } catch (e) { console.error(e); return []; }
}
window.sendArchivistChatMessage = async function() {
    const inp = document.getElementById('archivist-chat-input'); if (!inp) return;
    const t = inp.value.trim(); if (!t) return;
    const an = 'Далисса Иденааль Вестуро';
    try {
        await windowDb.collection('archivist_messages').add({ from: currentUser.name, to: an, text: t, timestamp: firebase.firestore.Timestamp.fromDate(new Date()), read: false });
        inp.value = ''; await window.openArchivistChat();
    } catch (e) { console.error(e); }
};
window.closeArchivistChat = function() {
    document.getElementById('archivist-chat-wrapper').style.display = 'none';
    document.getElementById('main-input-wrapper').style.display = 'block';
    chatContainer.classList.remove('chat-open');
    window.currentChatPartner = null;
    window.showLibrary();
};
async function markArchivistMessagesAsRead() {
    if (!windowDb || !currentUser) return;
    try {
        const an = 'Далисса Иденааль Вестуро';
        const s = await windowDb.collection('archivist_messages').where('from', '==', an).where('to', '==', currentUser.name).where('read', '==', false).get();
        const b = windowDb.batch(); s.forEach(d => b.update(d.ref, { read: true })); await b.commit();
    } catch (e) { console.error(e); }
}
async function getUnreadArchivistMessages() {
    if (!windowDb || !currentUser) return 0;
    try {
        const an = 'Далисса Иденааль Вестуро';
        const s = await windowDb.collection('archivist_messages').where('from', '==', an).where('to', '==', currentUser.name).where('read', '==', false).get();
        return s.size;
    } catch (e) { return 0; }
}

window.showLibrary = async function() {
    const c = document.getElementById('chat-container'); if (c) c.innerHTML = '';
    await loadLibraryFromFirebase();
    const uc = await getUnreadArchivistMessages();
    const badge = uc > 0 ? `<span style="background:#ff6b6b; color:white; padding:2px 8px; border-radius:10px; font-size:0.8em; margin-left:10px;">${uc}</span>` : '';
    let h = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">`;
    h += `<h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">📖 Библиотека Ордена</h3>`;
    h += `<p style="color:var(--text-secondary); text-align:center; font-style:italic; margin-bottom:20px;">Хранилище знаний и мудрости</p>`;
    if (libraryDepartments.length === 0) h += `<p style="color:#6b5f4a; text-align:center; font-style:italic; font-size:1.1em;">Библиотека пока пуста. Отделы не созданы.</p>`;
    else {
        h += `<div style="margin-bottom:20px;">`;
        libraryDepartments.forEach(d => {
            const bc = libraryBooks.filter(b => b.departmentId === d.id).length;
            h += `<button onclick="window.showLibraryDepartment('${d.id}')" style="width:100%; margin-bottom:10px; background:rgba(139,195,74,0.2); color:var(--accent-color); font-size:1.1em; padding:15px; border-radius:8px; border:1px solid rgba(139,195,74,0.4);">📚 ${d.name} <span style="color:#6b5f4a; font-size:0.9em;">(${bc} книг)</span></button>`;
        });
        h += `</div>`;
    }
    if (isArchivist() || isAdmin()) h += `<button class="hw-btn" onclick="window.startAddDepartment()" style="width:100%; margin-top:20px; background:rgba(76,175,80,0.3); color:#4caf50; font-size:1.1em;">➕ Создать Отдел</button>`;
    h += `<button class="hw-btn" onclick="window.openArchivistChat()" style="width:100%; margin-top:10px; background:rgba(139,195,74,0.3); color:#8bc34a; font-size:1.1em;">📚 Чат с Архивариусом ${badge}</button>`;
    h += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:15px; padding:12px; font-size:1.1em;">🔙 Вернуться в меню</button></div>`;
    addRawHTML(h);
};
window.showLibraryDepartment = async function(id) {
    const c = document.getElementById('chat-container'); if (c) c.innerHTML = '';
    await loadLibraryFromFirebase();
    const d = libraryDepartments.find(x => x.id === id);
    if (!d) { addMessage('<p>❌ Отдел не найден!</p>'); return; }
    const bd = libraryBooks.filter(b => b.departmentId === id);
    let h = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">`;
    h += `<h3 style="color:#64ffda; margin-bottom:10px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">📚 ${d.name}</h3>`;
    if (d.description) h += `<p style="color:var(--text-secondary); text-align:center; font-style:italic; margin-bottom:20px;">${d.description}</p>`;
    if (bd.length === 0) h += `<p style="color:#6b5f4a; text-align:center; font-style:italic; font-size:1.1em;">В этом отделе пока нет книг.</p>`;
    else {
        h += `<div style="margin-bottom:20px;">`;
        bd.forEach(b => {
            h += `<div style="background:rgba(0,0,0,0.2); border-radius:8px; padding:12px; margin:8px 0; display:flex; gap:10px; align-items:flex-start;">`;
            if (b.coverUrl) h += `<img src="${b.coverUrl}" style="width:60px; height:80px; object-fit:cover; border-radius:5px; border:1px solid var(--border-color); flex-shrink:0;">`;
            h += `<div style="flex:1; cursor:pointer;" onclick="window.showBookDetails('${b.id}')">`;
            h += `<div style="color:var(--accent-color); font-size:1.1em; font-weight:600;">📖 №${b.number}. ${b.title}</div>`;
            h += `<div style="color:#8bc34a; font-size:0.9em; margin-top:3px;">✍️ ${b.author}</div>`;
            if (b.description) h += `<div style="color:var(--text-secondary); font-size:0.85em; margin-top:5px;">${b.description.substring(0, 100)}${b.description.length > 100 ? '...' : ''}</div>`;
            if (b.fileUrl) {
                const isLink = b.fileUrl.startsWith('http');
                h += `<div style="margin-top:8px;">`;
                if (isLink) h += `<a href="${b.fileUrl}" target="_blank" onclick="event.stopPropagation()" style="color:#64ffda; text-decoration:underline; font-size:0.9em;">🔗 Открыть книгу</a>`;
                else h += `<span style="color:var(--text-secondary); font-size:0.9em;">📄 Файл загружен</span>`;
                h += `</div>`;
            }
            h += `</div>`;
            if (isArchivist() || isAdmin()) h += `<button onclick="event.stopPropagation(); window.deleteBook('${b.id}', '${b.title.replace(/'/g, "\\'")}')" style="background:rgba(255,80,80,0.2); color:#ff6b6b; padding:8px 12px; border-radius:6px; border:1px solid rgba(255,80,80,0.4); font-size:0.9em; min-width:40px; flex-shrink:0;">🗑️</button>`;
            h += `</div>`;
        });
        h += `</div>`;
    }
    if (isArchivist() || isAdmin()) {
        h += `<button class="hw-btn" onclick="window.startAddBook('${d.id}')" style="width:100%; margin-top:20px; background:rgba(76,175,80,0.3); color:#4caf50; font-size:1.1em;">➕ Добавить книгу в этот отдел</button>`;
        h += `<button class="hw-btn" onclick="window.deleteDepartment('${d.id}', '${d.name.replace(/'/g, "\\'")}')" style="width:100%; margin-top:10px; background:rgba(255,80,80,0.2); color:#ff6b6b; font-size:1.1em;">🗑️ Удалить весь отдел</button>`;
    }
    h += `<button class="hw-btn" onclick="window.showLibrary()" style="width:100%; margin-top:15px; padding:12px; font-size:1.1em;">🔙 Назад к отделам</button></div>`;
    addRawHTML(h);
};
window.showBookDetails = function(id) {
    const b = libraryBooks.find(x => x.id === id); if (!b) { addMessage('<p>❌ Книга не найдена.</p>'); return; }
    const d = libraryDepartments.find(x => x.id === b.departmentId);
    let h = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">`;
    if (b.coverUrl) h += `<div style="text-align:center; margin-bottom:15px;"><img src="${b.coverUrl}" style="max-width:180px; border-radius:10px; border:2px solid var(--border-color);"></div>`;
    h += `<h3 style="color:#64ffda; font-family:'Playfair Display',serif; text-align:center;">📖 №${b.number}. ${b.title}</h3>`;
    h += `<p style="color:#8bc34a; text-align:center; margin:8px 0;">✍️ ${b.author}</p>`;
    if (d) h += `<p style="color:var(--text-secondary); text-align:center; font-style:italic;">Отдел: ${d.name}</p>`;
    if (b.description) h += `<div style="background:rgba(0,0,0,0.2); border-radius:8px; padding:15px; margin:15px 0;"><p style="color:var(--text-color); line-height:1.6;">${b.description}</p></div>`;
    if (b.fileUrl) {
        h += `<div style="margin:15px 0; text-align:center;"><a href="${b.fileUrl}" target="_blank" style="display:inline-block; background:rgba(100,255,218,0.2); color:#64ffda; padding:12px 24px; border-radius:10px; text-decoration:none; border:1px solid rgba(100,255,218,0.4); font-size:1.1em;">📥 Открыть / скачать книгу</a></div>`;
    } else h += `<p style="color:#6b5f4a; text-align:center; font-style:italic;">Файл книги не прикреплён.</p>`;
    h += `<button class="hw-btn" onclick="window.showLibraryDepartment('${b.departmentId}')" style="width:100%; margin-top:15px; padding:12px;">🔙 Назад к отделу</button></div>`;
    addRawHTML(h);
};
window.startAddDepartment = function() { addMessage(`<p>📚 <strong>Создание нового Отдела Библиотеки</strong></p><p>Введите <strong>название отдела</strong> (или <em>"отмена"</em>):</p>`); addLessonState = { step: 'add_department_name' }; };
window.startAddBook = function(id) {
    const d = libraryDepartments.find(x => x.id === id); if (!d) { addMessage('<p>❌ Отдел не найден!</p>'); return; }
    addMessage(`<p>📖 <strong>Добавление книги в "${d.name}"</strong></p>
        <p><strong>Шаг 1/5 — Обложка.</strong> Вставьте прямую ссылку на картинку обложки, ИЛИ напишите <em>"файл"</em> чтобы загрузить картинку с устройства, ИЛИ <em>"нет"</em> если обложки нет, ИЛИ <em>"отмена"</em>:</p>`);
    addLessonState = { step: 'add_book_cover', departmentId: id, coverUrl: '', fileUrl: '' };
};
async function handleBookCreation(input) {
    const q = input.toLowerCase().trim();
    const st = addLessonState;
    if (st.step === 'add_book_cover') {
        if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
        if (q === 'нет') { st.coverUrl = ''; st.step = 'add_book_title'; return '<p><strong>Шаг 2/5 — Название книги</strong> (или <em>"нет"</em> / <em>"отмена"</em>):</p>'; }
        if (q === 'файл') { st.step = 'add_book_cover_upload'; addMessage(`<p>📤 Нажмите кнопку, чтобы выбрать файл обложки с устройства:</p><button class="hw-btn" onclick="window.uploadBookFile('cover')" style="background:rgba(76,175,80,0.3); color:#4caf50;">📤 Выбрать файл обложки</button><p>После загрузки напишите <em>"готово"</em> (или <em>"отмена"</em>).</p>`); return ''; }
        st.coverUrl = input; st.step = 'add_book_title'; return '<p><strong>Шаг 2/5 — Название книги</strong> (или <em>"нет"</em> / <em>"отмена"</em>):</p>';
    }
    if (st.step === 'add_book_cover_upload') {
        if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
        if (q === 'готово') { if (!st.coverUrl) { return '<p>⚠️ Файл ещё не загружен. Нажмите кнопку выбора файла или напишите <em>"нет"</em>, чтобы пропустить обложку.</p>'; } st.step = 'add_book_title'; return '<p><strong>Шаг 2/5 — Название книги</strong> (или <em>"нет"</em> / <em>"отмена"</em>):</p>'; }
        return '<p>Сначала загрузите файл кнопкой выше, затем напишите <em>"готово"</em> (или <em>"нет"</em> чтобы пропустить, <em>"отмена"</em>).</p>';
    }
    if (st.step === 'add_book_title') {
        if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
        st.title = q === 'нет' ? 'Без названия' : input; st.step = 'add_book_author';
        return '<p><strong>Шаг 3/5 — Автор</strong> (или <em>"неизвестно"</em> / <em>"отмена"</em>):</p>';
    }
    if (st.step === 'add_book_author') {
        if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
        st.author = q === 'неизвестно' ? 'Неизвестный автор' : input; st.step = 'add_book_desc';
        return '<p><strong>Шаг 4/5 — Аннотация</strong> (или <em>"нет"</em> / <em>"отмена"</em>):</p>';
    }
    if (st.step === 'add_book_desc') {
        if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
        st.description = q === 'нет' ? '' : input; st.step = 'add_book_file';
        return '<p><strong>Шаг 5/5 — Сама книга.</strong> Вставьте прямую ссылку (URL) на книгу, ИЛИ напишите <em>"файл"</em> чтобы загрузить PDF/EPUB/TXT с устройства, ИЛИ <em>"нет"</em> если файла пока нет, ИЛИ <em>"отмена"</em>:</p>';
    }
    if (st.step === 'add_book_file') {
        if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
        if (q === 'нет') { await finalizeBook(); return ''; }
        if (q === 'файл') { st.step = 'add_book_file_upload'; addMessage(`<p>📤 Нажмите кнопку, чтобы выбрать файл книги с устройства:</p><button class="hw-btn" onclick="window.uploadBookFile('book')" style="background:rgba(76,175,80,0.3); color:#4caf50;">📤 Выбрать файл книги</button><p>После загрузки напишите <em>"готово"</em> (или <em>"отмена"</em>).</p>`); return ''; }
        st.fileUrl = input; await finalizeBook(); return '';
    }
    if (st.step === 'add_book_file_upload') {
        if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
        if (q === 'готово') { if (!st.fileUrl) { return '<p>⚠️ Файл ещё не загружен. Нажмите кнопку выбора файла или напишите <em>"нет"</em>, чтобы сохранить без файла.</p>'; } await finalizeBook(); return ''; }
        return '<p>Сначала загрузите файл кнопкой выше, затем напишите <em>"готово"</em> (или <em>"нет"</em>, <em>"отмена"</em>).</p>';
    }
    return '';
}
async function finalizeBook() {
    const st = addLessonState;
    const ok = await addBookToFirebase(st.departmentId, st.title, st.author, st.description, st.fileUrl || '', st.coverUrl || '');
    if (ok) { addMessage(`<p>✅ Книга "<strong>${st.title}</strong>" добавлена в библиотеку!</p>`); const did = st.departmentId; addLessonState = null; await loadLibraryFromFirebase(); window.showLibraryDepartment(did); }
    else { addMessage('<p>❌ Ошибка добавления книги.</p>'); addLessonState = null; }
}
window.deleteDepartment = async function(id, nm) {
    const c = await askConfirm('⚠️ ВНИМАНИЕ!', `Удалить отдел "${nm}"?\nВсе книги в нём тоже удалятся!`);
    if (!c) return;
    const ok = await deleteDepartmentFromFirebase(id);
    if (ok) { showAlert('Успех', `Отдел "${nm}" удалён!`); window.showLibrary(); } else showAlert('Ошибка', 'Не удалось удалить.');
};
window.deleteBook = async function(id, t) {
    const c = await askConfirm('⚠️ ВНИМАНИЕ!', `Удалить книгу "${t}"?`);
    if (!c) return;
    const ok = await deleteBookFromFirebase(id);
    if (ok) { showAlert('Успех', `Книга "${t}" удалена!`); const b = libraryBooks.find(x => x.id === id); if (b) window.showLibraryDepartment(b.departmentId); else window.showLibrary(); }
    else showAlert('Ошибка', 'Не удалось удалить.');
};

// ===== ONLINE STATUS =====
async function loadOnlineStatuses() { if (!windowDb) return; try { const s = await windowDb.collection('online_status').get(); onlineStatuses = {}; s.forEach(d => onlineStatuses[d.id] = d.data()); } catch (e) { console.error(e); } }
async function updateOnlineStatus() { if (!windowDb || !currentUser) return; try { const n = firebase.firestore.Timestamp.fromDate(new Date()); await windowDb.collection('online_status').doc(currentUser.name).set({ lastSeen: n, online: true, updatedAt: n }, { merge: true }); onlineStatuses[currentUser.name] = { lastSeen: n, online: true, updatedAt: n }; } catch (e) { console.error(e); } }
async function sendOfflineStatus() { if (!windowDb || !currentUser) return; try { const n = firebase.firestore.Timestamp.fromDate(new Date()); await windowDb.collection('online_status').doc(currentUser.name).update({ online: false, updatedAt: n }); } catch (e) { console.error(e); } }
function formatOnlineStatus(n) { const s = onlineStatuses[n]; if (!s || !s.lastSeen) return '<span style="color:#6b5f4a; font-size:0.85em;">⚫ Не в сети</span>'; const d = s.lastSeen.toDate(); const m = Math.floor((new Date() - d) / 60000); if (m < 2) return '<span style="color:#4caf50; font-size:0.85em;">🟢 Онлайн</span>'; return `<span style="color:#ff9800; font-size:0.85em;">⚪ Был(а) ${m} мин. назад</span>`; }

async function loadUsersFromFirebase() { if (!windowDb) return; try { const s = await windowDb.collection('users').get(); s.forEach(d => { const data = d.data(); const k = d.id; if (!usersDatabase[k]) usersDatabase[k] = { fullName: data.fullName, ранг: data.rank, учитель: data.teacher, пароль: data.password, specialTitle: data.specialTitle || '', description: data.description || '', статусы: data.статусы || [], звания: data.звания || [] }; }); } catch (e) { console.error(e); } }
async function loadScheduleFromFirebase() { if (!windowDb) return; try { const s = await windowDb.collection('schedule').orderBy('dateTime', 'asc').get(); scheduleList = []; s.forEach(d => scheduleList.push({ id: d.id, ...d.data() })); } catch (e) { console.error(e); } }

function addMessage(text, isUser = false, save = true) {
    const c = document.getElementById('chat-container'); if (!c) return;
    const m = document.createElement('div'); m.className = `message ${isUser ? 'user-message' : 'akasha-message'}`;
    const cd = document.createElement('div'); cd.className = 'message-content'; cd.innerHTML = parseMarkdown(text); m.appendChild(cd); c.appendChild(m);
    if (save) saveMessageToStorage(text, isUser);
    setTimeout(() => { c.scrollTop = c.scrollHeight; }, 100);
}
function addRawHTML(html) {
    const c = document.getElementById('chat-container'); if (!c) return;
    const m = document.createElement('div'); m.className = 'message akasha-message'; m.innerHTML = html; c.appendChild(m);
    setTimeout(() => { c.scrollTop = c.scrollHeight; }, 100);
}
function parseMarkdown(t) {
    t = t.replace(/\n/g, '<br>');
    t = t.replace(/<br><br>/g, '</p><p style="text-indent:20px; margin:15px 0;">');
    if (!t.startsWith('<p>')) t = '<p style="text-indent:20px; margin:15px 0;">' + t + '</p>';
    t = t.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    t = t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return t;
}

async function loadLessonsFromFirebase() { if (!windowDb) return; try { const s = await windowDb.collection('lessons').get(); knowledgeBase = {}; lessonsById = {}; s.forEach(d => { const data = d.data(); const id = d.id; lessonsById[id] = { id, ...data }; if (!knowledgeBase[data.category]) knowledgeBase[data.category] = []; knowledgeBase[data.category].push({ id, ...data }); }); } catch (e) { console.error(e); } }
async function loadAssignments() { if (!windowDb) return; try { const s = await windowDb.collection('homework_assignments').get(); assignmentsList = []; s.forEach(d => assignmentsList.push({ id: d.id, ...d.data() })); assignmentsList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)); } catch (e) {} }
async function loadSubmissions() { if (!windowDb) return; try { const s = await windowDb.collection('homework_submissions').get(); submissionsList = []; s.forEach(d => submissionsList.push({ id: d.id, ...d.data() })); } catch (e) {} }
async function createAssignment(t, d) { if (!windowDb) return false; try { await windowDb.collection('homework_assignments').add({ title: t, description: d, createdBy: currentUser.name, createdAt: new Date() }); return true; } catch (e) { return false; } }
async function submitHomeworkToFirebase(id, c) { if (!windowDb) return false; try { await windowDb.collection('homework_submissions').add({ assignmentId: id, studentName: currentUser.name, studentRank: currentUser.ранг, content: c, status: 'pending', submittedAt: new Date(), masterFeedback: '', reviewedAt: null }); return true; } catch (e) { return false; } }
async function updateSubmissionStatus(id, st, fb) { if (!windowDb) return false; try { await windowDb.collection('homework_submissions').doc(id).update({ status: st, masterFeedback: fb, reviewedAt: new Date() }); return true; } catch (e) { return false; } }
async function loadCommentsForLesson(id) { if (!windowDb || !id) return []; try { const s = await windowDb.collection('comments').where('lessonId', '==', id).get(); const c = []; s.forEach(d => c.push({ id: d.id, ...d.data() })); c.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)); return c; } catch (e) { return []; } }
async function addCommentToFirebase(id, t, type) { if (!windowDb || !id) return false; try { await windowDb.collection('comments').add({ lessonId: id, text: t, type: type, authorName: currentUser.name, authorRank: currentUser.ранг, createdAt: new Date() }); return true; } catch (e) { return false; } }
async function updateCommentInFirebase(id, t) { if (!windowDb || !id) return false; try { await windowDb.collection('comments').doc(id).update({ text: t, updatedAt: new Date() }); return true; } catch (e) { return false; } }
async function deleteCommentFromFirebase(id) { if (!windowDb || !id) return false; try { await windowDb.collection('comments').doc(id).delete(); return true; } catch (e) { return false; } }
async function addLessonToFirebase(cat, t, c, m = '', y = '', sid = '') { if (!windowDb) return false; try { await windowDb.collection('lessons').add({ category: cat, title: t, content: c, mediaUrl: m, year: y, sectionId: sid, createdAt: new Date(), addedBy: currentUser.name }); return true; } catch (e) { return false; } }
async function updateLessonInFirebase(id, u) { if (!windowDb || !id) return false; try { await windowDb.collection('lessons').doc(id).update(u); return true; } catch (e) { return false; } }
async function deleteLesson(id) { if (!windowDb || !id) return false; try { await windowDb.collection('lessons').doc(id).delete(); delete lessonsById[id]; return true; } catch (e) { return false; } }
async function addScheduleToFirebase(dt, t, m, te) { if (!windowDb) return false; try { await windowDb.collection('schedule').add({ dateTime: dt, topic: t, materials: m, teacher: te, createdBy: currentUser.name, createdAt: firebase.firestore.Timestamp.fromDate(new Date()) }); return true; } catch (e) { return false; } }
async function updateScheduleInFirebase(id, u) { if (!windowDb || !id) return false; try { await windowDb.collection('schedule').doc(id).update(u); return true; } catch (e) { return false; } }
async function deleteScheduleFromFirebase(id) { if (!windowDb || !id) return false; try { await windowDb.collection('schedule').doc(id).delete(); return true; } catch (e) { return false; } }
function formatDateTimeMSK(s) { if (!s) return '—'; const d = new Date(s); return d.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' (МСК)'; }

window.showSchedule = async function() {
    const c = document.getElementById('chat-container'); if (c) c.innerHTML = '';
    await loadScheduleFromFirebase();
    let h = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">`;
    h += `<h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">📅 Расписание занятий Ордена</h3>`;
    if (scheduleList.length === 0) h += `<p style="color:#6b5f4a; text-align:center; font-style:italic;">Расписание пока пусто.</p>`;
    else {
        h += `<div style="overflow-x:auto;"><table class="progress-table"><tr><th>Дата и время (МСК)</th><th>Тема</th><th>Что понадобится</th><th>Учитель</th>`;
        if (canEditSchedule()) h += `<th>Действия</th>`;
        h += `</tr>`;
        scheduleList.forEach(it => {
            h += `<tr><td style="font-size:0.9em; white-space:nowrap;">${formatDateTimeMSK(it.dateTime)}</td><td>${it.topic || '—'}</td><td>${it.materials || '—'}</td><td>${it.teacher || '—'}</td>`;
            if (canEditSchedule()) h += `<td style="white-space:nowrap;"><button onclick="window.editScheduleItem('${it.id}')" style="background:rgba(100,255,218,0.2); color:#64ffda; border:1px solid rgba(100,255,218,0.4); padding:4px 8px; border-radius:6px; cursor:pointer; margin-right:5px;">✏️</button><button onclick="window.deleteScheduleItem('${it.id}')" style="background:rgba(255,80,80,0.2); color:#ff6b6b; border:1px solid rgba(255,80,80,0.4); padding:4px 8px; border-radius:6px; cursor:pointer;">🗑️</button></td>`;
            h += `</tr>`;
        });
        h += `</table></div>`;
    }
    if (canEditSchedule()) h += `<button class="hw-btn" onclick="window.startAddSchedule()" style="width:100%; margin-top:20px; background:rgba(76,175,80,0.3); color:#4caf50;">➕ Добавить занятие</button>`;
    h += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:15px; padding:12px;">🔙 Вернуться в меню</button></div>`;
    addRawHTML(h);
};
window.startAddSchedule = function() { addMessage(`<p>📅 <strong>Добавление занятия</strong></p><p>Введите <strong>дату и время</strong> в формате <em>ГГГГ-ММ-ДД ЧЧ:ММ</em> (например <em>2026-07-20 18:00</em>), или <em>"отмена"</em>:</p>`); addLessonState = { step: 'add_schedule_datetime' }; };
window.editScheduleItem = function(id) { const it = scheduleList.find(s => s.id === id); if (!it) { showAlert('Ошибка', 'Не найдено!'); return; } addMessage(`<p>✏️ <strong>Редактирование</strong></p><p>📅 ${it.dateTime || '—'}</p><p>📚 ${it.topic || '—'}</p><p>📦 ${it.materials || '—'}</p><p>👤 ${it.teacher || '—'}</p><p>Что менять? <em>"дата"</em>, <em>"тема"</em>, <em>"материалы"</em>, <em>"учитель"</em>, <em>"всё"</em> или <em>"отмена"</em></p>`); addLessonState = { step: 'edit_schedule_choose', scheduleId: id, currentData: it }; };
window.deleteScheduleItem = async function(id) { const it = scheduleList.find(s => s.id === id); if (!it) return; const c = await askConfirm('⚠️ ВНИМАНИЕ!', `Удалить занятие "${it.topic}"?`); if (!c) return; const ok = await deleteScheduleFromFirebase(id); if (ok) { showAlert('Успех', 'Удалено!'); window.showSchedule(); } else showAlert('Ошибка', 'Не удалось.'); };

async function sendMessageToMaster(t) { if (!windowDb || !currentUser) return false; const mn = currentUser.учитель; if (!mn || mn === 'отсутствует') { addMessage('<p>❌ Нет назначенного Мастера!</p>'); return false; } try { await windowDb.collection('messages').add({ from: currentUser.name, to: mn, text: t, timestamp: firebase.firestore.Timestamp.fromDate(new Date()), read: false }); return true; } catch (e) { addMessage(`<p>❌ ${e.message}</p>`); return false; } }
async function loadChatWith(p) { if (!windowDb || !currentUser) return []; try { const s1 = await windowDb.collection('messages').where('from', '==', currentUser.name).where('to', '==', p).get(); const s2 = await windowDb.collection('messages').where('from', '==', p).where('to', '==', currentUser.name).get(); const m = []; s1.forEach(d => m.push({ id: d.id, ...d.data() })); s2.forEach(d => m.push({ id: d.id, ...d.data() })); m.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0)); return m; } catch (e) { return []; } }
async function markAsRead(f) { if (!windowDb || !currentUser) return; try { const s = await windowDb.collection('messages').where('from', '==', f).where('to', '==', currentUser.name).where('read', '==', false).get(); const b = windowDb.batch(); s.forEach(d => b.update(d.ref, { read: true })); await b.commit(); } catch (e) {} }

window.openMasterChat = async function() {
    if (!currentUser) return;
    chatContainer.classList.add('chat-open');
    if (!currentUser.учитель || currentUser.учитель === 'отсутствует') { await showMasterDashboard(); }
    else {
        document.getElementById('main-input-wrapper').style.display = 'none';
        document.getElementById('master-chat-wrapper').style.display = 'block';
        const c = document.getElementById('master-chat-container'); if (!c) return;
        c.innerHTML = '<p style="color:#6b5f4a; text-align:center;">Загрузка...</p>';
        const mn = currentUser.учитель;
        if (mn && mn !== 'отсутствует') {
            const msgs = await loadChatWith(mn);
            if (msgs.length === 0) c.innerHTML = '<p style="color:#6b5f4a; text-align:center; font-style:italic;">Пока нет сообщений.</p>';
            else { c.innerHTML = ''; msgs.forEach(m => { const mine = m.from === currentUser.name; const t = m.timestamp ? new Date(m.timestamp.seconds * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''; const b = document.createElement('div'); b.className = `chat-bubble ${mine ? 'mine' : 'theirs'}`; b.innerHTML = `<div class="bubble-text">${m.text}</div><div class="bubble-time">${t}</div>`; c.appendChild(b); }); c.scrollTop = c.scrollHeight; }
            if (msgs.length > 0) await markAsRead(mn);
        }
    }
};
async function showMasterDashboard() {
    if (!windowDb) return;
    try {
        const s = await windowDb.collection('messages').where('to', '==', currentUser.name).get();
        const mp = new Map();
        s.forEach(d => { const data = d.data(); const n = data.from; if (!mp.has(n)) mp.set(n, { name: n, lastMessage: data.text, timestamp: data.timestamp, unread: data.read === false }); });
        const st = Array.from(mp.values());
        let h = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;"><h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">📋 Сообщения от учеников</h3>`;
        if (st.length === 0) h += `<p style="color:#6b5f4a; text-align:center; font-style:italic;">Пока нет сообщений.</p>`;
        else st.forEach(x => { const t = x.timestamp ? new Date(x.timestamp.seconds * 1000).toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''; const ub = x.unread ? '<span style="background:#ff6b6b; color:white; padding:2px 8px; border-radius:10px; font-size:0.8em; margin-left:10px;">NEW</span>' : ''; h += `<div style="background:rgba(100,255,218,0.1); border:1px solid rgba(100,255,218,0.3); border-radius:10px; padding:15px; margin:10px 0; cursor:pointer;" onclick="window.openChatWithStudent('${x.name}')"><div style="display:flex; justify-content:space-between; align-items:center;"><div style="font-size:1.15em; color:#64ffda; font-weight:bold;">👤 ${x.name} ${ub}</div><div style="color:#6b5f4a; font-size:0.9em;">${t}</div></div><div style="color:#a89b7e; margin-top:8px; font-style:italic;">"${x.lastMessage.substring(0, 50)}${x.lastMessage.length > 50 ? '...' : ''}"</div></div>`; });
        h += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:15px; padding:12px;">🔙 Вернуться в меню</button></div>`;
        addMessage(h);
    } catch (e) { addMessage('<p>❌ Ошибка.</p>'); }
}
window.openChatWithStudent = async function(n) {
    chatContainer.classList.add('chat-open');
    document.getElementById('main-input-wrapper').style.display = 'none';
    document.getElementById('master-chat-wrapper').style.display = 'block';
    const c = document.getElementById('master-chat-container'); if (!c) return;
    c.innerHTML = '<p style="color:#6b5f4a; text-align:center;">Загрузка...</p>';
    try {
        const s1 = await windowDb.collection('messages').where('from', '==', currentUser.name).where('to', '==', n).get();
        const s2 = await windowDb.collection('messages').where('from', '==', n).where('to', '==', currentUser.name).get();
        const m = []; s1.forEach(d => m.push({ id: d.id, ...d.data() })); s2.forEach(d => m.push({ id: d.id, ...d.data() })); m.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
        if (m.length === 0) c.innerHTML = `<p style="color:#6b5f4a; text-align:center; font-style:italic;">Нет переписки с ${n}</p>`;
        else { c.innerHTML = ''; m.forEach(x => { const mine = x.from === currentUser.name; const t = x.timestamp ? new Date(x.timestamp.seconds * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''; const b = document.createElement('div'); b.className = `chat-bubble ${mine ? 'mine' : 'theirs'}`; b.innerHTML = `<div class="bubble-text">${x.text}</div><div class="bubble-time">${t}</div>`; c.appendChild(b); }); c.scrollTop = c.scrollHeight; }
        const bat = windowDb.batch(); m.forEach(x => { if (x.from === n && x.to === currentUser.name && x.read === false) bat.update(windowDb.collection('messages').doc(x.id), { read: true }); }); await bat.commit();
        window.currentChatPartner = n;
    } catch (e) { c.innerHTML = '<p>❌ Ошибка.</p>'; }
};
window.sendMasterChatMessage = async function() {
    const inp = document.getElementById('master-chat-input'); if (!inp) return;
    const t = inp.value.trim(); if (!t) return;
    if (window.currentChatPartner) {
        try { await windowDb.collection('messages').add({ from: currentUser.name, to: window.currentChatPartner, text: t, timestamp: firebase.firestore.Timestamp.fromDate(new Date()), read: false }); inp.value = ''; await window.openChatWithStudent(window.currentChatPartner); } catch (e) { addMessage('<p>❌ Ошибка.</p>'); }
    } else {
        const ok = await sendMessageToMaster(t);
        if (ok) { inp.value = ''; const mn = currentUser.учитель; const msgs = await loadChatWith(mn); const c = document.getElementById('master-chat-container'); if (c) { c.innerHTML = ''; msgs.forEach(x => { const mine = x.from === currentUser.name; const tm = x.timestamp ? new Date(x.timestamp.seconds * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''; const b = document.createElement('div'); b.className = `chat-bubble ${mine ? 'mine' : 'theirs'}`; b.innerHTML = `<div class="bubble-text">${x.text}</div><div class="bubble-time">${tm}</div>`; c.appendChild(b); }); c.scrollTop = c.scrollHeight; } }
    }
};
window.closeMasterChat = function() { chatContainer.classList.remove('chat-open'); document.getElementById('main-input-wrapper').style.display = 'block'; document.getElementById('master-chat-wrapper').style.display = 'none'; window.currentChatPartner = null; showMainMenu(); };

function parseUserInput(t) {
    const d = { name: '', ранг: '', учитель: '', пароль: '' };
    const p = t.split(',');
    if (p.length > 0) d.name = p[0].trim().toLowerCase().replace(/(?:меня\s+)?(?:зовут|зову)\s+/i, '').trim();
    if (p.length > 1) { const rp = p[1].trim().toLowerCase(); const r = ['верховный магистр', 'старший падаван', 'старейшина', 'магистр', 'мастер', 'рыцарь', 'падаван', 'юнлинг', 'адепт']; for (let x of r) if (rp.includes(x)) { d.ранг = x; break; } }
    const tm = t.match(/(?:учитель|учителя)\s+([^,]+),/i); if (tm) { d.учитель = tm[1].trim(); if (d.учитель.toLowerCase().includes('нет')) d.учитель = 'отсутствует'; }
    const pm = t.match(/(?:пароль|пароль:)\s*(.+)$/i); if (pm) { let x = pm[1].trim().replace(/[—–\-]/g, ''); x = x.replace(/I/g, 'i'); d.пароль = x; }
    return d;
}
function checkAccess(t) { const a = { 'ганн': ['адепт','юнлинг','падаван','старший падаван','рыцарь','мастер','магистр','верховный магистр','старейшина'], 'берг': ['падаван','старший падаван','рыцарь','мастер','магистр','верховный магистр','старейшина'], 'катарн': ['рыцарь','мастер','магистр','верховный магистр','старейшина'], 'крайт': ['мастер','магистр','верховный магистр','старейшина'] }; return a[t].includes(currentUser.ранг); }

function showMainMenu() {
    const c = document.getElementById('chat-container'); if (!c) return; c.innerHTML = '';
    let h = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">`;
    h += `<h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">🔮 Главное меню</h3>`;
    h += `<button class="menu-btn" onclick="window.showHomeworkBoard()">📝 Домашние задания</button>`;
    h += `<button class="menu-btn chat-btn" onclick="window.openMasterChat()">✉️ Написать Мастеру</button>`;
    h += `<button class="menu-btn" onclick="showTOC()">📚 Оглавление знаний</button>`;
    h += `<button class="menu-btn" onclick="window.showLibrary()">📖 Библиотека</button>`;
    h += `<button class="menu-btn" onclick="window.showSchedule()">📅 Расписание</button>`;
    h += `<button class="menu-btn" onclick="window.showCouncilOfMasters()" style="background:rgba(100,255,218,0.15); border-color:rgba(100,255,218,0.4); color:#64ffda;">🏛️ Совет Мастеров</button>`;
    h += `<button class="menu-btn" onclick="window.showMembersList()">👥 Члены Ордена</button>`;
    h += `<button class="menu-btn" onclick="window.showProgressTable()">📊 Успеваемость</button>`;
    if (isAdmin()) h += `<button class="menu-btn" onclick="window.showAdminPanel()" style="background:rgba(255,80,80,0.2); border-color:rgba(255,80,80,0.5); color:#ff6b6b;">⚙️ Админ-панель</button>`;
    h += `<hr style="border-color:var(--border-color); margin:20px 0;"><p style="color:var(--text-secondary); text-align:center; font-style:italic;">Выбери раздел или задай вопрос Акаше</p></div>`;
    const m = document.createElement('div'); m.className = 'message akasha-message'; m.innerHTML = h; c.appendChild(m);
    setTimeout(() => { c.scrollTop = c.scrollHeight; }, 50);
}

window.showTOC = async function() {
    const c = document.getElementById('chat-container'); if (c) c.innerHTML = '';
    await loadSectionsFromFirebase();
    let h = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">`;
    h += `<h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">📚 Оглавление знаний Ордена</h3>`;
    const years = [...new Set(sectionsList.map(s => s.year))].sort((a, b) => b - a);
    if (years.length === 0) { h += `<p style="color:#6b5f4a; text-align:center; font-style:italic; font-size:1.1em;">Разделы пока не созданы.</p>`; if (isAdmin()) h += `<button class="hw-btn" onclick="window.startAddYear()" style="width:100%; margin-top:20px; background:rgba(76,175,80,0.3); color:#4caf50; font-size:1.1em;">➕ Добавить новый год</button>`; }
    else { h += `<div style="margin-bottom:20px;">`; years.forEach(y => { h += `<button class="hw-btn" onclick="window.showYearSections(${y})" style="width:100%; margin-bottom:10px; background:rgba(100,255,218,0.2); color:#64ffda; font-size:1.2em; padding:15px;">📅 ${y} год</button>`; }); h += `</div>`; if (isAdmin()) h += `<button class="hw-btn" onclick="window.startAddYear()" style="width:100%; margin-top:20px; background:rgba(76,175,80,0.3); color:#4caf50; font-size:1.1em;">➕ Добавить новый год</button>`; }
    h += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:15px; padding:12px; font-size:1.1em;">🔙 Вернуться в меню</button></div>`;
    addRawHTML(h);
};
window.showYearSections = async function(y) {
    const c = document.getElementById('chat-container'); if (c) c.innerHTML = '';
    await loadSectionsFromFirebase();
    const ys = sectionsList.filter(s => s.year === y);
    const ar = accessLevels[currentUser.ранг];
    let h = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">`;
    h += `<h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">📅 ${y} год</h3>`;
    if (ys.length === 0) h += `<p style="color:#6b5f4a; text-align:center; font-style:italic; font-size:1.1em;">В этом году разделов пока нет.</p>`;
    else { h += `<div style="margin-bottom:20px;">`; ys.forEach(s => { if (ar.includes(s.rank)) { h += `<div style="display:flex; gap:10px; margin-bottom:10px; align-items:center;"><button onclick="window.showSectionLessons('${s.id}')" style="flex:1; background:rgba(139,195,74,0.2); color:var(--accent-color); font-size:1.1em; padding:12px; border-radius:8px; border:1px solid rgba(139,195,74,0.4);">📖 ${s.name}</button>`; if (isAdmin()) { h += `<button onclick="window.editSection('${s.id}')" style="background:rgba(100,255,218,0.2); color:#64ffda; padding:12px; border-radius:8px; border:1px solid rgba(100,255,218,0.4); font-size:1em; min-width:50px;">✏️</button><button onclick="window.deleteSection('${s.id}', '${s.name.replace(/'/g, "\\'")}')" style="background:rgba(255,80,80,0.2); color:#ff6b6b; padding:12px; border-radius:8px; border:1px solid rgba(255,80,80,0.4); font-size:1em; min-width:50px;">🗑️</button>`; } h += `</div>`; } }); h += `</div>`; }
    if (isAdmin()) h += `<button class="hw-btn" onclick="window.startAddSection(${y})" style="width:100%; margin-top:20px; background:rgba(76,175,80,0.3); color:#4caf50; font-size:1.1em;">➕ Добавить раздел в ${y} год</button>`;
    h += `<button class="hw-btn" onclick="showTOC()" style="width:100%; margin-top:15px; padding:12px; font-size:1.1em;">🔙 Назад к годам</button></div>`;
    addRawHTML(h);
};
window.showSectionLessons = async function(id) {
    const c = document.getElementById('chat-container'); if (c) c.innerHTML = '';
    await loadLessonsFromFirebase();
    const s = sectionsList.find(x => x.id === id); if (!s) { addMessage('<p>❌ Раздел не найден!</p>'); return; }
    const sl = Object.values(lessonsById).filter(l => l.sectionId === id);
    let h = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">`;
    h += `<h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">📖 ${s.name} (${s.year})</h3>`;
    if (sl.length === 0) h += `<p style="color:#6b5f4a; text-align:center; font-style:italic; font-size:1.1em;">Уроков пока нет.</p>`;
    else { h += `<div style="margin-bottom:20px;">`; sl.forEach(l => { h += `<div class="toc-lesson-link" onclick="window.showLessonContent('${l.id}')" style="padding:12px; margin:5px 0; background:rgba(0,0,0,0.2); border-radius:8px; font-size:1.1em; cursor:pointer;">📚 ${l.title}</div>`; }); h += `</div>`; }
    if (isMaster()) h += `<button class="hw-btn" onclick="window.startAddLessonToSection('${id}')" style="width:100%; margin-top:20px; background:rgba(76,175,80,0.3); color:#4caf50; font-size:1.1em;">➕ Добавить урок в этот раздел</button>`;
    h += `<button class="hw-btn" onclick="window.showYearSections(${s.year})" style="width:100%; margin-top:15px; padding:12px; font-size:1.1em;">🔙 Назад к разделам</button></div>`;
    addRawHTML(h);
};
window.startAddYear = function() { addMessage(`<p>📅 <strong>Новый год</strong></p><p>Введите год (например <em>2026</em>) или <em>"отмена"</em>:</p>`); addLessonState = { step: 'add_year' }; };
window.startAddSection = function(y) { addMessage(`<p>📖 <strong>Раздел в ${y} год</strong></p><p>Ранг раздела: <em>адепт, юнлинг, падаван, старший падаван, рыцарь, мастер</em> или <em>"отмена"</em></p>`); addLessonState = { step: 'add_section_rank', year: y }; };
window.startAddLessonToSection = function(id) { const s = sectionsList.find(x => x.id === id); if (!s) { addMessage('<p>❌ Раздел не найден!</p>'); return; } addMessage(`<p>📚 <strong>Урок в "${s.name}"</strong></p><p>Название урока или <em>"отмена"</em>:</p>`); addLessonState = { step: 'add_lesson_title', sectionId: id, section: s }; };

window.showHomeworkBoard = async function() {
    const c = document.getElementById('chat-container'); if (c) c.innerHTML = '';
    await loadAssignments(); await loadSubmissions();
    let h = `<div class="homework-board"><div class="homework-header">📝 Домашние задания Ордена</div>`;
    if (assignmentsList.length === 0) { h += `<p style="color:#6b5f4a; text-align:center; font-style:italic;">Заданий пока нет.</p><p style="color:#8bc34a; text-align:center; margin-top:20px;">💡 Мастер может создать первое задание!</p>`; }
    else assignmentsList.forEach(hw => {
        if (!hw) return; const t = hw.title || 'Без названия'; const id = hw.id || ''; if (!id) return;
        const hs = submissionsList.filter(s => s.assignmentId === id); const pc = hs.filter(s => s.status === 'pending').length;
        const my = submissionsList.filter(s => s.assignmentId === id && s.studentName === currentUser.name);
        const ml = my.length > 0 ? my.sort((a, b) => (a.submittedAt?.seconds || 0) - (b.submittedAt?.seconds || 0))[0] : null;
        h += `<div class="hw-card"><div class="hw-title">${t}</div><div class="hw-desc">${hw.description || ''}</div>`;
        const ds = hw.createdAt ? new Date(hw.createdAt.seconds * 1000).toLocaleString('ru-RU') : '—';
        h += `<div class="hw-meta">👤 ${hw.createdBy || 'неизвестно'} | 📅 ${ds}</div>`;
        if (ml) {
            const se = ml.status === 'approved' ? '✅' : (ml.status === 'needs_revision' ? '⚠️' : '');
            const stx = ml.status === 'approved' ? 'Одобрено' : (ml.status === 'needs_revision' ? 'На доработку' : 'На проверке');
            const sc = ml.status === 'approved' ? '#4caf50' : (ml.status === 'needs_revision' ? '#ff9800' : '#2196f3');
            h += `<div style="margin:15px 0; padding:12px; background:rgba(${ml.status === 'approved' ? '76,175,80' : (ml.status === 'needs_revision' ? '255,152,0' : '33,150,243')},0.1); border-radius:8px; border-left:3px solid ${sc};">`;
            h += `<p style="color:${sc}; margin:0 0 8px 0; font-weight:bold;">${se} Статус: ${stx}</p>`;
            h += `<p style="color:var(--text-color); margin:0 0 8px 0; font-size:0.95em;"><strong>Мой ответ:</strong> ${ml.content}</p>`;
            if (ml.masterFeedback) h += `<p style="color:#64ffda; margin:0 0 8px 0; font-size:0.95em;"><strong>💬 Комментарий Мастера:</strong> ${ml.masterFeedback}</p>`;
            const sd = ml.submittedAt ? new Date(ml.submittedAt.seconds * 1000).toLocaleString('ru-RU') : '';
            h += `<p style="color:#6b5f4a; margin:8px 0 0 0; font-size:0.85em; font-style:italic;">📅 Отправлено: ${sd}</p>`;
            if (ml.id) h += `<div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;"><button class="hw-btn" onclick="window.deleteMySubmission('${ml.id}', '${id}')" style="background:rgba(255,80,80,0.2); color:#ff6b6b; border:1px solid rgba(255,80,80,0.4); flex:1; min-width:150px;">🗑️ Удалить мой ответ</button></div>`;
            h += `</div>`;
        }
        if (isMaster()) {
            h += `<div style="margin:10px 0; padding:10px; background:rgba(255,165,0,0.1); border-radius:8px; border:1px solid rgba(255,165,0,0.3);"><p style="color:#ffa500; margin:0;">📬 Ответов: ${hs.length} | ⏳ На проверке: ${pc}</p><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">`;
            if (hs.length > 0) h += `<button class="hw-btn" onclick="window.reviewSubmissions('${id}')" style="flex:1; min-width:150px; background:rgba(255,165,0,0.3); color:#ffa500;">🔍 Проверить ответы</button>`;
            h += `<button class="hw-btn" onclick="window.deleteAssignment('${id}', '${t.replace(/'/g, "\\'")}')" style="flex:1; min-width:150px; background:rgba(255,80,80,0.2); color:#ff6b6b; border:1px solid rgba(255,80,80,0.4);">🗑️ Удалить задание</button></div></div>`;
        }
        if (!isMaster() || hw.createdBy !== currentUser.name) { const et = t.replace(/'/g, "\\'").replace(/"/g, '&quot;'); h += `<div class="hw-actions"><button class="hw-btn submit" onclick="window.submitHomework('${id}', '${et}')">📤 Отправить ответ</button></div>`; }
        h += `</div>`;
    });
    if (isMaster()) h += `<button class="hw-btn create" onclick="window.startCreateAssignment()" style="width:100%; margin-top:20px; padding:15px;">➕ Создать новое задание</button>`;
    h += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:10px; padding:12px;">🔙 Вернуться в меню</button></div>`;
    addRawHTML(h);
};
window.reviewSubmissions = function(id) {
    const c = document.getElementById('chat-container'); if (c) c.innerHTML = '';
    const hw = assignmentsList.find(a => a.id === id); if (!hw) return;
    const hs = submissionsList.filter(s => s.assignmentId === id);
    let h = `<div class="homework-board"><div class="homework-header">🔍 Проверка: ${hw.title}</div>`;
    if (hs.length === 0) h += `<p style="color:#6b5f4a; text-align:center;">Ответов пока нет.</p>`;
    else hs.forEach(s => {
        const se = s.status === 'approved' ? '✅' : (s.status === 'needs_revision' ? '⚠️' : '⏳');
        const stx = s.status === 'approved' ? 'Одобрено' : (s.status === 'needs_revision' ? 'На доработку' : 'На проверке');
        h += `<div class="hw-card" style="border-left-color: ${s.status === 'approved' ? '#4caf50' : (s.status === 'needs_revision' ? '#ff9800' : '#2196f3')};"><div class="hw-title">${se} ${s.studentName} <span style="font-size:0.8em; color:#a89b7e;">(${s.studentRank})</span></div><div class="hw-desc">${s.content}</div>`;
        const ds = s.submittedAt ? new Date(s.submittedAt.seconds * 1000).toLocaleString('ru-RU') : '';
        h += `<div class="hw-meta">📅 ${ds} | Статус: ${stx}</div>`;
        if (s.masterFeedback) h += `<div style="margin:10px 0; padding:10px; background:rgba(100,255,218,0.1); border-radius:8px;"><p style="color:#64ffda; margin:0;"><strong>💬 Комментарий Мастера:</strong> ${s.masterFeedback}</p></div>`;
        h += `<div class="hw-actions"><button class="hw-btn" onclick="window.gradeSubmission('${s.id}', '${hw.id}', 'approved')" style="background:rgba(76,175,80,0.3); color:#4caf50;">✅ Одобрить</button><button class="hw-btn" onclick="window.gradeSubmission('${s.id}', '${hw.id}', 'needs_revision')" style="background:rgba(255,152,0,0.3); color:#ff9800;">⚠️ На доработку</button><button class="hw-btn" onclick="window.addFeedback('${s.id}', '${hw.id}')" style="background:rgba(100,255,218,0.2); color:#64ffda;">💬 Комментарий</button></div></div>`;
    });
    h += `<button class="hw-btn" onclick="window.showHomeworkBoard()" style="width:100%; margin-top:10px; padding:12px;">🔙 Назад</button></div>`;
    addRawHTML(h);
};
window.startCreateAssignment = function() { addMessage(`<p>Новое задание.</p><p><strong>Название</strong> (или <em>"отмена"</em>):</p>`); addLessonState = { step: 'create_hw_title' }; };
window.submitHomework = function(id, t) { if (!id || !t) { addMessage('<p>❌ Задание не найдено!</p>'); return; } addMessage(`<p>Ответ на <strong>${t}</strong></p><p>Ваш ответ (или <em>"отмена"</em>):</p>`); addLessonState = { step: 'submit_hw_text', hwId: id, hwTitle: t }; };
window.deleteAssignment = async function(id, t) {
    if (!windowDb) return showAlert('Ошибка', 'База не подключена!');
    if (!isMaster()) return showAlert('Доступ запрещён', 'Только Мастерам.');
    const sc = submissionsList.filter(s => s.assignmentId === id).length;
    const c = await askConfirm('⚠️ ВНИМАНИЕ!', `Удалить задание "${t}"?\nУдалятся и все ${sc} ответов!`);
    if (!c) return;
    const ct = await askPrompt('Подтверждение', 'Напишите "УДАЛИТЬ":');
    if (ct !== 'УДАЛИТЬ') return showAlert('Отменено', 'Отменено.');
    try {
        await windowDb.collection('homework_assignments').doc(id).delete();
        const ss = await windowDb.collection('homework_submissions').where('assignmentId', '==', id).get();
        if (!ss.empty) { const b = windowDb.batch(); ss.forEach(d => b.delete(d.ref)); await b.commit(); }
        assignmentsList = assignmentsList.filter(a => a.id !== id); submissionsList = submissionsList.filter(s => s.assignmentId !== id);
        showAlert('Успех', `Удалено!`); window.showHomeworkBoard();
    } catch (e) { showAlert('Ошибка', e.message); }
};

async function showLessonContentWithReadButton(id) {
    const c = document.getElementById('chat-container'); if (c) c.innerHTML = '';
    if (!id) { addMessage('<p>❌ Нет ID!</p>'); return; }
    const l = lessonsById[id]; if (!l) { addMessage('<p>❌ Урок не найден.</p>'); return; }
    const ir = await isLessonRead(id);
    let h = `<h3 style="color:#64ffda; font-family:'Playfair Display',serif;">📖 ${l.title}</h3>`;
    h += `<p style="color:#a89b7e; font-size:0.9em; margin-bottom:15px;">Категория: <em>${l.category}</em></p>`;
    h += `<div style="line-height:1.9;">${l.content}</div>`;
    if (l.mediaUrl) {
        h += `<div style="margin-top:20px;">`;
        if (l.mediaUrl.includes('youtube.com') || l.mediaUrl.includes('rutube.ru')) h += `<iframe width="100%" height="315" src="${l.mediaUrl}" frameborder="0" allowfullscreen style="border-radius:10px;"></iframe>`;
        else if (l.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) h += `<img src="${l.mediaUrl}" style="max-width:100%; border-radius:10px; margin-top:10px;">`;
        else if (l.mediaUrl.match(/\.(mp4|webm|ogg)$/i)) h += `<video controls style="max-width:100%; margin-top:10px; border-radius:10px;"><source src="${l.mediaUrl}"></video>`;
        else h += `<a href="${l.mediaUrl}" target="_blank" rel="noopener noreferrer" style="color:#64ffda; text-decoration:underline;">🔗 Открыть медиа</a>`;
        h += `</div>`;
    }
    if (ir) h += `<button class="read-btn read" disabled>✅ Прочитано</button>`;
    else h += `<button class="read-btn" onclick="window.markLessonRead('${id}')">👁️ Отметить как прочитанное</button>`;
    if (isAdmin()) h += `<div style="margin-top:20px; display:flex; gap:10px; flex-wrap:wrap;"><button class="edit-btn" onclick="window.editLesson('${l.id}')">✏️ Редактировать</button><button class="delete-btn" onclick="window.confirmDeleteLesson('${l.id}')">🗑️ Удалить</button></div>`;
    h += `<div class="comments-section"><div class="comments-header">💬 Комментарии</div>`;
    const cm = await loadCommentsForLesson(id);
    if (cm.length === 0) h += `<p style="color:#6b5f4a; font-style:italic;">Комментариев пока нет.</p>`;
    else cm.forEach(cm => {
        const im = cm.type === 'task'; const ia = cm.authorName === currentUser.name; const cd = ia || isAdmin(); const ce = ia;
        h += `<div class="comment-item ${im ? 'master-comment' : ''}"><div class="comment-author ${im ? 'master' : ''}">${cm.authorName}<span class="comment-type-badge ${im ? 'badge-task' : 'badge-question'}">${im ? '📝 Задание' : '💬 Комментарий'}</span></div><div class="comment-text">${cm.text}</div><div class="comment-meta">${cm.createdAt ? new Date(cm.createdAt.seconds * 1000).toLocaleString('ru-RU') : ''}</div>`;
        if (ce || cd) { h += `<div class="comment-actions">`; if (ce) h += `<button class="comment-edit-btn" onclick="window.editComment('${cm.id}', '${id}')">✏️ Изменить</button>`; if (cd) h += `<button class="comment-delete-btn" onclick="window.deleteComment('${cm.id}', '${id}')">🗑️ Удалить</button>`; h += `</div>`; }
        h += `</div>`;
    });
    h += `<button class="comment-btn" onclick="window.startAddComment('${id}')">💬 Добавить комментарий</button></div><button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:10px; padding:12px;">🔙 Вернуться в меню</button>`;
    addMessage(h);
}
window.markLessonRead = async function(id) { const ok = await markLessonAsRead(id); if (ok) { addMessage('<p>✅ Прочитано!</p>'); showLessonContentWithReadButton(id); } else addMessage('<p>❌ Ошибка.</p>'); };
window.showLessonContent = showLessonContentWithReadButton;
window.startAddComment = function(id) { if (!id) { addMessage('<p>❌ Ошибка!</p>'); return; } if (isMaster()) { addMessage(`<p>Тип комментария:</p><p>• <em>"задание"</em></p><p>• <em>"комментарий"</em></p><p>• <em>"отмена"</em></p>`); addLessonState = { step: 'ask_comment_type', lessonId: id }; } else { addMessage(`<p>Ваш комментарий (или <em>"отмена"</em>):</p>`); addLessonState = { step: 'add_comment_text', lessonId: id, type: 'question' }; } };
window.editComment = function(id, lid) { addMessage(`<p>Новый текст (или <em>"отмена"</em>):</p>`); addLessonState = { step: 'edit_comment', commentId: id, lessonId: lid }; };
window.deleteComment = async function(id, lid) { const ok = await deleteCommentFromFirebase(id); if (ok) { addMessage('<p>✅ Удалён!</p>'); showLessonContent(lid); } else addMessage('<p>❌ Ошибка.</p>'); };
window.editLesson = function(id) { const l = lessonsById[id]; if (!l) return; addMessage(`<div style="background:rgba(100,255,218,0.1); border:1px solid rgba(100,255,218,0.3); border-radius:10px; padding:15px; margin:10px 0;"><p style="color:#64ffda; font-weight:bold; margin-bottom:10px;">⚠️ РЕДАКТИРОВАНИЕ</p><p><strong>Название:</strong> ${l.title}</p><p><strong>Текст:</strong> ${l.content.substring(0, 100)}${l.content.length > 100 ? '...' : ''}</p><p><strong>Медиа:</strong> ${l.mediaUrl || 'нет'}</p></div><p>Что менять? <em>"название"</em>, <em>"текст"</em>, <em>"медиа"</em>, <em>"всё"</em> или <em>"отмена"</em></p>`); addLessonState = { step: 'edit_choose', lessonId: id, currentData: l }; };
window.confirmDeleteLesson = async function(id) { const l = lessonsById[id]; if (!l) return; addMessage(`<p>⚠️ Удалить "<strong>${l.title}</strong>"?<br><em>"да, удалить"</em> или <em>"отмена"</em></p>`); addLessonState = { step: 'confirm_delete', lessonId: id, lessonTitle: l.title }; };
function startAddLesson() { addMessage('<p>📝 <strong>Новый урок</strong></p><p>Ранг: <em>адепт, юнлинг, падаван, рыцарь, мастер, магистр</em></p>'); addLessonState = { step: 'category' }; }

async function findAnswer(question) {
    const q = question.toLowerCase().trim();
    // Книга
    if (addLessonState && ['add_book_cover','add_book_cover_upload','add_book_title','add_book_author','add_book_desc','add_book_file','add_book_file_upload'].includes(addLessonState.step)) return handleBookCreation(question);
    // Отдел
    if (addLessonState && addLessonState.step === 'add_department_name') { if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; } addLessonState = { step: 'add_department_desc', name: question }; return '<p><strong>Описание отдела</strong> (или <em>"нет"</em> / <em>"отмена"</em>):</p>'; }
    if (addLessonState && addLessonState.step === 'add_department_desc') { if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; } const d = q === 'нет' ? '' : question; const ok = await addDepartmentToFirebase(addLessonState.name, d); if (ok) { addMessage(`<p>✅ Отдел "<strong>${addLessonState.name}</strong>" создан!</p>`); await loadLibraryFromFirebase(); window.showLibrary(); } else addMessage('<p>❌ Ошибка.</p>'); addLessonState = null; return ''; }
    // Год/раздел/урок
    if (addLessonState && addLessonState.step === 'add_year') { if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; } const y = parseInt(q); if (isNaN(y) || y < 2020 || y > 2100) return '<p>❌ Год от 2020 до 2100.</p>'; addLessonState = { step: 'add_section_rank', year: y }; return `<p>Ранг раздела (${y}): <em>адепт, юнлинг, падаван, старший падаван, рыцарь, мастер</em> или <em>"отмена"</em></p>`; }
    if (addLessonState && addLessonState.step === 'add_section_rank') { if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; } const vr = ['адепт','юнлинг','падаван','старший падаван','рыцарь','мастер']; if (!vr.includes(q)) return `<p>❌ Выберите: ${vr.join(', ')}</p>`; addLessonState = { step: 'add_section_name', year: addLessonState.year, rank: q }; return `<p>Название раздела или <em>"отмена"</em>:</p>`; }
    if (addLessonState && addLessonState.step === 'add_section_name') { if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; } const y = addLessonState.year, r = addLessonState.rank, n = question, o = sectionsList.filter(s => s.year === y).length + 1; const ok = await addSectionToFirebase(y, r, n, o); if (ok) { addMessage(`<p>✅ Раздел "${n}" добавлен в ${y}!</p>`); await loadSectionsFromFirebase(); window.showYearSections(y); } else addMessage('<p>❌ Ошибка.</p>'); addLessonState = null; return ''; }
    if (addLessonState && addLessonState.step === 'add_lesson_title') { if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; } addLessonState.lessonTitle = question; addLessonState.step = 'add_lesson_content'; return '<p><strong>Текст урока</strong> (или <em>"отмена"</em>):</p>'; }
    if (addLessonState && addLessonState.step === 'add_lesson_content') { if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; } addLessonState.lessonContent = question; addLessonState.step = 'add_lesson_media'; return '<p>Ссылка на медиа (или <em>нет</em> / <em>отмена</em>):</p>'; }
    if (addLessonState && addLessonState.step === 'add_lesson_media') { if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; } const m = q === 'нет' ? '' : question; const s = addLessonState.section; const ok = await addLessonToFirebase(s.rank, addLessonState.lessonTitle, addLessonState.lessonContent, m, s.year, addLessonState.sectionId); if (ok) { addMessage(`<p>✅ Урок добавлен!</p>`); await loadLessonsFromFirebase(); window.showSectionLessons(addLessonState.sectionId); } else addMessage('<p>❌ Ошибка.</p>'); addLessonState = null; return ''; }
    // Расписание
    if (addLessonState && addLessonState.step === 'add_schedule_datetime') { if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; } if (!/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}$/.test(q)) return '<p>❌ Формат: <em>ГГГГ-ММ-ДД ЧЧ:ММ</em></p>'; addLessonState.dateTime = q; addLessonState.step = 'add_schedule_topic'; return '<p><strong>Тема</strong> (или <em>"отмена"</em>):</p>'; }
    if (addLessonState && addLessonState.step === 'add_schedule_topic') { if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; } addLessonState.topic = question; addLessonState.step = 'add_schedule_materials'; return '<p><strong>Что понадобится</strong> (или <em>"нет"</em> / <em>"отмена"</em>):</p>'; }
    if (addLessonState && addLessonState.step === 'add_schedule_materials') { if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; } addLessonState.materials = q === 'нет' ? '' : question; addLessonState.step = 'add_schedule_teacher'; return '<p><strong>Учитель</strong> (или <em>"отмена"</em>):</p>'; }
    if (addLessonState && addLessonState.step === 'add_schedule_teacher') { if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; } const ok = await addScheduleToFirebase(addLessonState.dateTime, addLessonState.topic, addLessonState.materials, question); if (ok) { addMessage(`<p>✅ Добавлено!</p><p>📅 ${formatDateTimeMSK(addLessonState.dateTime)}</p><p>📚 ${addLessonState.topic}</p><p>👤 ${question}</p>`); window.showSchedule(); } else addMessage('<p>❌ Ошибка.</p>'); addLessonState = null; return ''; }
    if (addLessonState && addLessonState.step === 'edit_schedule_choose') { if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; } if (q === 'дата') { addLessonState.step = 'edit_schedule_datetime'; return '<p>Новая дата (<em>ГГГГ-ММ-ДД ЧЧ:ММ</em>) или <em>"пропустить"</em>:</p>'; } if (q === 'тема') { addLessonState.step = 'edit_schedule_topic'; return '<p>Новая тема или <em>"пропустить"</em>:</p>'; } if (q === 'материалы') { addLessonState.step = 'edit_schedule_materials'; return '<p>Новые материалы или <em>"пропустить"</em>:</p>'; } if (q === 'учитель') { addLessonState.step = 'edit_schedule_teacher'; return '<p>Новый учитель или <em>"пропустить"</em>:</p>'; } if (q === 'всё') { addLessonState.step = 'edit_schedule_datetime'; addLessonState.editAll = true; return '<p>Новая дата или <em>"пропустить"</em>:</p>'; } return '<p><em>дата / тема / материалы / учитель / "всё" / "отмена"</em></p>'; }
    if (addLessonState && addLessonState.step === 'edit_schedule_datetime') { if (q !== 'пропустить') { if (!/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}$/.test(q)) return '<p>❌ Формат!</p>'; addLessonState.newDateTime = q; } else addLessonState.newDateTime = addLessonState.currentData.dateTime; if (addLessonState.editAll) { addLessonState.step = 'edit_schedule_topic'; return '<p>Тема или <em>"пропустить"</em>:</p>'; } await updateScheduleInFirebase(addLessonState.scheduleId, { dateTime: addLessonState.newDateTime }); addMessage('<p>✅ Дата изменена!</p>'); addLessonState = null; window.showSchedule(); return ''; }
    if (addLessonState && addLessonState.step === 'edit_schedule_topic') { if (q !== 'пропустить') addLessonState.newTopic = question; else addLessonState.newTopic = addLessonState.currentData.topic; if (addLessonState.editAll) { addLessonState.step = 'edit_schedule_materials'; return '<p>Материалы или <em>"пропустить"</em>:</p>'; } await updateScheduleInFirebase(addLessonState.scheduleId, { topic: addLessonState.newTopic }); addMessage('<p>✅ Тема изменена!</p>'); addLessonState = null; window.showSchedule(); return ''; }
    if (addLessonState && addLessonState.step === 'edit_schedule_materials') { if (q !== 'пропустить') addLessonState.newMaterials = question; else addLessonState.newMaterials = addLessonState.currentData.materials; if (addLessonState.editAll) { addLessonState.step = 'edit_schedule_teacher'; return '<p>Учитель или <em>"пропустить"</em>:</p>'; } await updateScheduleInFirebase(addLessonState.scheduleId, { materials: addLessonState.newMaterials }); addMessage('<p>✅ Материалы!</p>'); addLessonState = null; window.showSchedule(); return ''; }
    if (addLessonState && addLessonState.step === 'edit_schedule_teacher') { const nt = q === 'пропустить' ? addLessonState.currentData.teacher : question; const u = {}; if (addLessonState.newDateTime !== undefined) u.dateTime = addLessonState.newDateTime; if (addLessonState.newTopic !== undefined) u.topic = addLessonState.newTopic; if (addLessonState.newMaterials !== undefined) u.materials = addLessonState.newMaterials; u.teacher = nt; await updateScheduleInFirebase(addLessonState.scheduleId, u); addMessage('<p>✅ Обновлено!</p>'); addLessonState = null; window.showSchedule(); return ''; }
    // ДЗ
    if (addLessonState && addLessonState.step === 'create_hw_title') { if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; } addLessonState.hwTitle = question; addLessonState.step = 'create_hw_desc'; return '<p><strong>Описание</strong> (или <em>"отмена"</em>):</p>'; }
    if (addLessonState && addLessonState.step === 'create_hw_desc') { if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; } createAssignment(addLessonState.hwTitle, question).then(ok => { if (ok) { addMessage(`<p>✅ Создано!</p>`); window.showHomeworkBoard(); } else addMessage('<p>❌ Ошибка.</p>'); }); addLessonState = null; return ''; }
    if (addLessonState && addLessonState.step === 'submit_hw_text') { if (q === 'отмена') { addLessonState = null; return '<p>❌ Отмена.</p>'; } const hid = addLessonState.hwId, ht = addLessonState.hwTitle; addLessonState = null; submitHomeworkToFirebase(hid, question).then(ok => { if (ok) { addMessage(`<p>✅ Отправлено Мастеру!</p>`); showMainMenu(); } else addMessage('<p>❌ Ошибка.</p>'); }); return ''; }
    // Комментарии
    if (addLessonState && addLessonState.step === 'ask_comment_type') { if (q === 'отмена') { addLessonState = null; return ''; } if (q === 'задание' || q === 'task') { addLessonState.type = 'task'; addLessonState.step = 'add_comment_text'; return '<p>Текст задания (или <em>"отмена"</em>):</p>'; } if (q === 'комментарий' || q === 'comment') { addLessonState.type = 'question'; addLessonState.step = 'add_comment_text'; return '<p>Комментарий (или <em>"отмена"</em>):</p>'; } return '<p><em>"задание"</em> или <em>"комментарий"</em></p>'; }
    if (addLessonState && addLessonState.step === 'add_comment_text') { if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; } const lid = addLessonState.lessonId; addCommentToFirebase(lid, question, addLessonState.type).then(ok => { if (ok) { addMessage('<p>✅ Добавлен!</p>'); setTimeout(() => showLessonContent(lid), 500); } else addMessage('<p>❌ Ошибка.</p>'); }); addLessonState = null; return ''; }
    if (addLessonState && addLessonState.step === 'edit_comment') { if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; } const lid = addLessonState.lessonId; updateCommentInFirebase(addLessonState.commentId, question).then(ok => { if (ok) { addMessage('<p>✅ Обновлён!</p>'); showLessonContent(lid); } else addMessage('<p>❌ Ошибка.</p>'); }); addLessonState = null; return ''; }
    // Редактирование урока
    if (addLessonState && addLessonState.step && addLessonState.step.startsWith('edit_') && !addLessonState.step.startsWith('edit_schedule')) {
        const lid = addLessonState.lessonId, l = addLessonState.currentData;
        if (addLessonState.step === 'edit_choose') { if (q === 'отмена') { addLessonState = null; return ''; } if (q === 'название') { addLessonState.step = 'edit_title'; return '<p>Новое название или <em>"пропустить"</em>:</p>'; } if (q === 'текст') { addLessonState.step = 'edit_content'; return '<p>Новый текст или <em>"пропустить"</em>:</p>'; } if (q === 'медиа') { addLessonState.step = 'edit_media'; return '<p>Новая ссылка или <em>"пропустить"</em>/<em>"нет"</em>:</p>'; } if (q === 'всё') { addLessonState.step = 'edit_title'; addLessonState.editAll = true; return '<p>Новое название или <em>"пропустить"</em>:</p>'; } return '<p><em>название / текст / медиа / "всё" / "отмена"</em></p>'; }
        if (addLessonState.step === 'edit_title') { if (q !== 'пропустить') addLessonState.newTitle = question; else addLessonState.newTitle = l.title; if (addLessonState.editAll) { addLessonState.step = 'edit_content'; return '<p>Новый текст или <em>"пропустить"</em>:</p>'; } updateLessonInFirebase(lid, { title: addLessonState.newTitle }).then(s => { if (s) { addMessage('<p>✅ Название!</p>'); loadLessonsFromFirebase(); } else addMessage('<p>❌ Ошибка.</p>'); }); addLessonState = null; return ''; }
        if (addLessonState.step === 'edit_content') { if (q !== 'пропустить') addLessonState.newContent = question; else addLessonState.newContent = l.content; if (addLessonState.editAll) { addLessonState.step = 'edit_media'; return '<p>Новая ссылка или <em>"пропустить"</em>/<em>"нет"</em>:</p>'; } updateLessonInFirebase(lid, { content: addLessonState.newContent }).then(s => { if (s) { addMessage('<p>✅ Текст!</p>'); loadLessonsFromFirebase(); } else addMessage('<p>❌ Ошибка.</p>'); }); addLessonState = null; return ''; }
        if (addLessonState.step === 'edit_media') { let nm = q === 'пропустить' ? l.mediaUrl : (q === 'нет' ? '' : question); const u = {}; if (addLessonState.newTitle !== undefined) u.title = addLessonState.newTitle; if (addLessonState.newContent !== undefined) u.content = addLessonState.newContent; u.mediaUrl = nm; updateLessonInFirebase(lid, u).then(s => { if (s) { addMessage('<p>✅ Обновлено!</p>'); loadLessonsFromFirebase(); } else addMessage('<p>❌ Ошибка.</p>'); }); addLessonState = null; return ''; }
    }
    if (addLessonState && currentUser && isAdmin()) {
        if (addLessonState.step === 'confirm_delete') { if (q === 'да, удалить' || q === 'да' || q === 'удалить') deleteLesson(addLessonState.lessonId).then(s => { if (s) { addMessage('<p>✅ Удалён!</p>'); loadLessonsFromFirebase(); } else addMessage('<p>❌ Ошибка.</p>'); }); else addMessage('<p>❌ Отменено.</p>'); addLessonState = null; return ''; }
        if (addLessonState.step === 'category') { const cs = ['адепт','юнлинг','падаван','рыцарь','мастер','магистр']; if (cs.includes(q)) { addLessonState.category = q; addLessonState.step = 'title'; return '<p>Название урока:</p>'; } return '<p>Выбери ранг.</p>'; }
        if (addLessonState.step === 'title') { addLessonState.title = question; addLessonState.step = 'content'; return '<p>Текст урока:</p>'; }
        if (addLessonState.step === 'content') { addLessonState.content = question; addLessonState.step = 'media'; return '<p>Ссылка на медиа (или <em>нет</em>):</p>'; }
        if (addLessonState.step === 'media') { const m = q === 'нет' ? '' : question; addLessonToFirebase(addLessonState.category, addLessonState.title, addLessonState.content, m).then(s => { if (s) { addMessage('<p>✅ Урок добавлен!</p>'); loadLessonsFromFirebase(); } else addMessage('<p>❌ Ошибка.</p>'); }); addLessonState = null; return ''; }
    }
    // Вход
    if (!currentUser) {
        if (question.includes(',') || q.includes('имя') || q.includes('ранг') || q.includes('пароль') || q.includes('учитель')) {
            const ud = parseUserInput(question);
            if (ud.name && ud.ранг && ud.пароль) {
                let fu = null;
                for (let k in usersDatabase) { if (usersDatabase[k].fullName.toLowerCase() === ud.name) { fu = usersDatabase[k]; break; } }
                if (!fu && windowDb) { try { const s = await windowDb.collection('users').get(); s.forEach(d => { const data = d.data(); if (data.fullName.toLowerCase() === ud.name) { fu = { fullName: data.fullName, ранг: data.rank, учитель: data.teacher, пароль: data.password, specialTitle: data.specialTitle || '', description: data.description || '', статусы: data.статусы || [], звания: data.звания || [] }; usersDatabase[d.id] = fu; } }); } catch (e) {} }
                if (fu && fu.ранг === ud.ранг && fu.пароль === ud.пароль) {
                    currentUser = { name: fu.fullName, ранг: fu.ранг, учитель: ud.учитель || fu.учитель };
                    saveUserToStorage(); updateLogoutButton(); loadLessonsFromFirebase(); loadAssignments(); loadSubmissions(); loadScheduleFromFirebase(); loadSectionsFromFirebase(); loadLibraryFromFirebase(); loadOnlineStatuses(); registerUserIfNeeded();
                    addMessage(getRankGreeting(currentUser)); showMainMenu(); return '';
                } else return '<p>❌ Данные не найдены.</p>';
            } else return '<p>📋 Имя, Ранг, Учитель, Пароль через запятую.</p>';
        }
        return '<p>👋 Назови Имя, Ранг, Учителя и Пароль.</p>';
    }
    if (q.includes('выйти') || q.includes('logout')) { handleLogout(); return ''; }
    if (q.includes('очистить историю') || q.includes('очистить переписку')) { clearHistory(); chatContainer.innerHTML = ''; addMessage('<p>🧹 Очищено.</p>'); return ''; }
    if (q.includes('оглавлен') || q.includes('меню')) { showMainMenu(); return ''; }
    if (q.includes('библиотек')) { window.showLibrary(); return ''; }
    let k = '';
    if (q.includes('ганн')) k = checkAccess('ганн') ? (knowledgeBase['ганн'] ? knowledgeBase['ганн'].map(l => `<p><strong>${l.title}:</strong> ${l.content}</p>`).join('') : '<p>Пусто.</p>') : '<p>Недоступно.</p>';
    else if (q.includes('берг')) k = checkAccess('берг') ? (knowledgeBase['берг'] ? knowledgeBase['берг'].map(l => `<p><strong>${l.title}:</strong> ${l.content}</p>`).join('') : '<p>Пусто.</p>') : '<p>Недоступно.</p>';
    else if (q.includes('катарн')) k = checkAccess('катарн') ? (knowledgeBase['катарн'] ? knowledgeBase['катарн'].map(l => `<p><strong>${l.title}:</strong> ${l.content}</p>`).join('') : '<p>Пусто.</p>') : '<p>Недоступно.</p>';
    else if (q.includes('крайт')) k = checkAccess('крайт') ? (knowledgeBase['крайт'] ? knowledgeBase['крайт'].map(l => `<p><strong>${l.title}:</strong> ${l.content}</p>`).join('') : '<p>Пусто.</p>') : '<p>Недоступно.</p>';
    else k = '<p>Спроси о Кланах или напиши "оглавление".</p>';
    return k;
}

async function handleSend() { const t = customTextarea.innerText.trim(); if (!t) return; addMessage(t, true); customTextarea.innerText = ''; const a = await findAnswer(t); if (a) addMessage(a); }
function handleLogout() { sendOfflineStatus(); currentUser = null; saveUserToStorage(); updateLogoutButton(); chatContainer.innerHTML = ''; addMessage('<p>👋 До встречи.</p>'); }
function updateLogoutButton() { const b = document.querySelector('.logout-btn'); if (b) b.style.display = currentUser ? 'block' : 'none'; }

// ===== KEYBOARD =====
const layouts = {
    ru: [['й','ц','у','к','е','н','г','ш','щ','з','х','ъ'], ['ф','ы','в','а','п','р','о','л','д','ж','э'], ['shift','я','ч','с','м','и','т','ь','б','ю','backspace'], ['123', ',', 'enter', 'space']],
    en: [['q','w','e','r','t','y','u','i','o','p'], ['a','s','d','f','g','h','j','k','l'], ['shift','z','x','c','v','b','n','m','backspace'], ['123', ',', 'enter', 'space']],
    numbers: [['1','2','3','4','5','6','7','8','9','0'], ['-','/',':',';','(',')','$','&','@','"'], ['.','!','?','#','%','*','+','=','№','\\'], ['abc', ',', 'enter', 'space']]
};
let currentLang = 'ru', currentMode = 'letters', isShift = false, isCaps = false, shiftTimeout = null;
function insertTextAtCursor(t) { if (customTextarea) { customTextarea.focus(); document.execCommand('insertText', false, t); } }
function deleteCharAtCursor() { if (customTextarea) { customTextarea.focus(); document.execCommand('delete', false, null); } }
function renderKeyboard() {
    if (!customKeyboard) return; customKeyboard.innerHTML = '';
    let layout = currentMode === 'numbers' ? layouts.numbers : (currentLang === 'ru' ? layouts.ru : layouts.en);
    const lb = document.getElementById('lang-toggle-btn'); if (lb) lb.textContent = currentLang === 'ru' ? 'RU' : 'EN';
    layout.forEach(row => {
        const rd = document.createElement('div'); rd.className = 'keyboard-row';
        row.forEach(key => {
            const kd = document.createElement('div'); kd.className = 'key';
            if (key === 'shift') {
                kd.classList.add('special'); kd.textContent = isCaps ? '⇪' : '⇧'; if (isCaps) kd.classList.add('caps-active');
                let ts = 0;
                kd.addEventListener('touchstart', e => { e.preventDefault(); ts = Date.now(); kd.classList.add('pressed'); }, { passive: false });
                kd.addEventListener('touchend', e => { e.preventDefault(); kd.classList.remove('pressed'); const d = Date.now() - ts; if (d < 200) { clearTimeout(shiftTimeout); if (isCaps) { isCaps = false; isShift = false; } else { isShift = !isShift; shiftTimeout = setTimeout(() => { isShift = false; renderKeyboard(); }, 2000); } } else { isCaps = !isCaps; isShift = false; } renderKeyboard(); if (navigator.vibrate) navigator.vibrate(10); });
            } else if (key === '123' || key === 'abc') {
                kd.classList.add('special'); kd.textContent = currentMode === 'letters' ? '123' : (currentLang === 'ru' ? 'RU' : 'EN');
                kd.addEventListener('touchstart', e => { e.preventDefault(); kd.classList.add('pressed'); toggleMode(); }, { passive: false });
                kd.addEventListener('touchend', () => kd.classList.remove('pressed'));
            } else if (key === ',') {
                kd.textContent = ',';
                kd.addEventListener('touchstart', e => { e.preventDefault(); kd.classList.add('pressed'); insertTextAtCursor(','); }, { passive: false });
                kd.addEventListener('touchend', () => kd.classList.remove('pressed'));
            } else if (key === 'backspace') {
                kd.classList.add('special'); kd.textContent = '⌫';
                kd.addEventListener('touchstart', e => { e.preventDefault(); kd.classList.add('pressed'); deleteCharAtCursor(); }, { passive: false });
                kd.addEventListener('touchend', () => kd.classList.remove('pressed'));
            } else if (key === 'space') {
                kd.classList.add('space');
                kd.addEventListener('touchstart', e => { e.preventDefault(); kd.classList.add('pressed'); insertTextAtCursor(' '); }, { passive: false });
                kd.addEventListener('touchend', () => kd.classList.remove('pressed'));
            } else if (key === 'enter') {
                kd.classList.add('enter'); kd.textContent = '↵';
                kd.addEventListener('touchstart', e => { e.preventDefault(); kd.classList.add('pressed'); insertTextAtCursor('\n'); }, { passive: false });
                kd.addEventListener('touchend', () => kd.classList.remove('pressed'));
            } else {
                let dc = key; if (currentMode === 'letters' && /^[а-яёa-z]$/.test(key)) dc = (isShift || isCaps) ? key.toUpperCase() : key;
                kd.textContent = dc;
                kd.addEventListener('touchstart', e => { e.preventDefault(); kd.classList.add('pressed'); insertTextAtCursor(dc); if (isShift && !isCaps) { isShift = false; renderKeyboard(); } }, { passive: false });
                kd.addEventListener('touchend', () => kd.classList.remove('pressed'));
            }
            rd.appendChild(kd);
        });
        customKeyboard.appendChild(rd);
    });
}
function toggleLanguage() { currentLang = currentLang === 'ru' ? 'en' : 'ru'; currentMode = 'letters'; isShift = false; isCaps = false; renderKeyboard(); if (navigator.vibrate) navigator.vibrate(10); }
function toggleMode() { currentMode = currentMode === 'letters' ? 'numbers' : 'letters'; isShift = false; isCaps = false; renderKeyboard(); if (navigator.vibrate) navigator.vibrate(10); }
window.toggleLanguage = toggleLanguage;

if (customTextarea) {
    customTextarea.addEventListener('focus', () => { customTextarea.style.borderColor = 'rgba(100,255,218,0.6)'; customTextarea.style.boxShadow = '0 0 10px rgba(100,255,218,0.2)'; });
    customTextarea.addEventListener('blur', () => { customTextarea.style.borderColor = 'var(--border-color)'; customTextarea.style.boxShadow = 'none'; });
    customTextarea.addEventListener('paste', e => { e.preventDefault(); insertTextAtCursor(e.clipboardData.getData('text')); });
    customTextarea.addEventListener('keydown', e => { if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); insertTextAtCursor('\n'); } else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } });
    customTextarea.addEventListener('input', () => { customTextarea.scrollTop = customTextarea.scrollHeight; });
}

function toggleKeyboardVisibility() {
    const k = document.getElementById('custom-keyboard'); const iw = document.getElementById('main-input-wrapper'); const ta = document.getElementById('custom-textarea');
    if (k.style.display === 'none') { k.style.display = 'flex'; iw.classList.remove('keyboard-hidden'); localStorage.setItem('akasha-keyboard-visible', 'true'); isCustomKeyboardActive = true; if (ta) { ta.setAttribute('readonly', 'true'); ta.setAttribute('inputmode', 'none'); } }
    else { k.style.display = 'none'; iw.classList.add('keyboard-hidden'); localStorage.setItem('akasha-keyboard-visible', 'false'); isCustomKeyboardActive = false; if (ta) { ta.removeAttribute('readonly'); ta.removeAttribute('inputmode'); } }
}
function restoreKeyboardState() { const v = localStorage.getItem('akasha-keyboard-visible'); if (v === 'false') { const k = document.getElementById('custom-keyboard'); const iw = document.getElementById('main-input-wrapper'); k.style.display = 'none'; iw.classList.add('keyboard-hidden'); } }
function toggleLargeText() { document.body.classList.toggle('keyboard-large-text'); localStorage.setItem('akasha-large-text', document.body.classList.contains('keyboard-large-text') ? 'true' : 'false'); }
function restoreLargeTextPreference() { if (localStorage.getItem('akasha-large-text') === 'true') document.body.classList.add('keyboard-large-text'); }

function showCustomModal(title, body, buttons) {
    const m = document.getElementById('custom-modal'), mt = document.getElementById('modal-title'), mb = document.getElementById('modal-body'), mf = document.getElementById('modal-footer');
    if (!m || !mt || !mb || !mf) return;
    mt.textContent = title || 'Сообщение'; mb.innerHTML = body || ''; mf.innerHTML = '';
    buttons.forEach(b => { const btn = document.createElement('button'); btn.className = b.class || 'hw-btn'; btn.textContent = b.text; if (b.style) btn.style.cssText = b.style; btn.onclick = e => { e.preventDefault(); e.stopPropagation(); if (b.action) b.action(); closeCustomModal(); }; mf.appendChild(btn); });
    m.style.display = 'flex';
}
function closeCustomModal() { const m = document.getElementById('custom-modal'); if (m) { m.style.display = 'none'; if (currentModalResolve) { currentModalResolve(null); currentModalResolve = null; } } }
document.addEventListener('click', e => { const m = document.getElementById('custom-modal'); if (m && e.target === m) closeCustomModal(); });
function askPrompt(title, msg, def = '') { return new Promise(r => { currentModalResolve = r; showCustomModal(title, `<p>${msg}</p><input type="text" id="modal-prompt-input" class="modal-input" value="${String(def || '')}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">`, [{ text: 'Отмена', class: 'hw-btn', action: () => r(null) }, { text: 'OK', class: 'hw-btn', style: 'background:rgba(100,255,218,0.3); color:#64ffda;', action: () => { const i = document.getElementById('modal-prompt-input'); r(i ? i.value : ''); } }]); setTimeout(() => { const i = document.getElementById('modal-prompt-input'); if (i) { i.focus(); i.select(); } }, 100); }); }
function askConfirm(title, msg) { return new Promise(r => { currentModalResolve = r; showCustomModal(title, `<p>${msg}</p>`, [{ text: 'Отмена', class: 'hw-btn', action: () => r(false) }, { text: 'Подтвердить', class: 'hw-btn', style: 'background:rgba(255,80,80,0.3); color:#ff6b6b;', action: () => r(true) }]); }); }
function showAlert(title, msg) { return new Promise(r => { showCustomModal(title, `<p>${msg}</p>`, [{ text: 'OK', class: 'hw-btn', action: () => r() }]); }); }

async function isUserBlocked(n) { if (!windowDb) return false; try { const d = await windowDb.collection('blocked_users').doc(n).get(); return d.exists && d.data().blocked === true; } catch (e) { return false; } }
async function blockUserInDb(n, r) { if (!windowDb) return false; try { await windowDb.collection('blocked_users').doc(n).set({ blocked: true, reason: r, blockedBy: currentUser.name, blockedAt: firebase.firestore.Timestamp.fromDate(new Date()) }, { merge: true }); return true; } catch (e) { return false; } }
async function unblockUserInDb(n) { if (!windowDb) return false; try { await windowDb.collection('blocked_users').doc(n).update({ blocked: false, unblockedAt: firebase.firestore.Timestamp.fromDate(new Date()) }); return true; } catch (e) { return false; } }
async function markLessonAsRead(id) { if (!windowDb || !currentUser) return false; try { await windowDb.collection('lesson_reads').doc(`${currentUser.name}_${id}`).set({ userId: currentUser.name, lessonId: id, readAt: firebase.firestore.Timestamp.fromDate(new Date()), userRank: currentUser.ранг }, { merge: true }); return true; } catch (e) { return false; } }
async function isLessonRead(id) { if (!windowDb || !currentUser) return false; try { const d = await windowDb.collection('lesson_reads').doc(`${currentUser.name}_${id}`).get(); return d.exists; } catch (e) { return false; } }
async function getAllLessonReads() { if (!windowDb) return []; try { const s = await windowDb.collection('lesson_reads').get(); const r = []; s.forEach(d => r.push({ id: d.id, ...d.data() })); return r; } catch (e) { return []; } }
async function getBlockedUsers() { if (!windowDb) return []; try { const s = await windowDb.collection('blocked_users').where('blocked', '==', true).get(); const b = []; s.forEach(d => b.push({ id: d.id, ...d.data() })); return b; } catch (e) { return []; } }
async function getUserRegistrationDate(n) { if (!windowDb) return null; try { const d = await windowDb.collection('user_registrations').doc(n).get(); return d.exists && d.data().registeredAt ? d.data().registeredAt.toDate() : null; } catch (e) { return null; } }
async function getUserAdjustments(n) { if (!windowDb) return { adjustedLessons: 0, adjustedHomework: 0, reason: '' }; try { const d = await windowDb.collection('manual_adjustments').doc(n).get(); return d.exists ? d.data() : { adjustedLessons: 0, adjustedHomework: 0, reason: '' }; } catch (e) { return { adjustedLessons: 0, adjustedHomework: 0, reason: '' }; } }
async function saveManualAdjustment(n, l, h, r) { if (!windowDb) return false; try { await windowDb.collection('manual_adjustments').doc(n).set({ userName: n, adjustedLessons: parseInt(l) || 0, adjustedHomework: parseInt(h) || 0, reason: r, adjustedBy: currentUser.name, adjustedAt: firebase.firestore.Timestamp.fromDate(new Date()) }, { merge: true }); return true; } catch (e) { return false; } }
function calculateGrade(lr, hd, tl, th, al, ah) { const rs = lr + hd, as = rs + al + ah, ms = tl + th; if (ms === 0) return { percent: 0, grade: '—', gradeColor: '#6b5f4a' }; const p = Math.min(100, Math.round((as / ms) * 100)); let g, gc; if (p >= 90) { g = '🏆 Отлично'; gc = '#ffd700'; } else if (p >= 70) { g = '✨ Хорошо'; gc = '#4caf50'; } else if (p >= 50) { g = '✅ Удовлетворительно'; gc = '#ff9800'; } else { g = '❌ Плохо'; gc = '#ff6b6b'; } return { percent: p, grade: g, gradeColor: gc, realScore: rs, adjustedScore: as, maxScore: ms }; }
function formatTimeInAkasha(d) { const n = new Date(), df = n - d, dy = Math.floor(df / 86400000), h = Math.floor((df % 86400000) / 3600000); if (dy > 0) return `${dy} дн. ${h} ч.`; if (h > 0) return `${h} ч.`; return 'только что'; }
async function registerUserIfNeeded() { if (!currentUser || !windowDb) return; try { const d = await windowDb.collection('user_registrations').doc(currentUser.name).get(); if (!d.exists) await windowDb.collection('user_registrations').doc(currentUser.name).set({ userName: currentUser.name, userRank: currentUser.ранг, registeredAt: firebase.firestore.Timestamp.fromDate(new Date()) }); } catch (e) {} }

window.deleteMySubmission = async function(id, aid) { const c = await askConfirm('Подтверждение', '⚠️ Удалить ваш ответ?'); if (!c) return; try { await windowDb.collection('homework_submissions').doc(id).delete(); showAlert('Успех', 'Удалено!'); window.showHomeworkBoard(); } catch (e) { showAlert('Ошибка', e.message); } };
window.gradeSubmission = async function(id, aid, st) { const fb = await askPrompt('Комментарий', 'Комментарий (можно пусто):', ''); if (fb === null) return; const ok = await updateSubmissionStatus(id, st, fb); if (ok) { showAlert('Успех', 'Обновлено!'); window.reviewSubmissions(aid); } else showAlert('Ошибка', 'Ошибка.'); };
window.addFeedback = async function(id, aid) { const fb = await askPrompt('Комментарий Мастера', 'Комментарий:', ''); if (!fb) return; const s = submissionsList.find(x => x.id === id); const cf = s.masterFeedback || ''; const nf = cf ? cf + '\n\n' + fb : fb; const ok = await updateSubmissionStatus(id, s.status, nf); if (ok) { showAlert('Успех', 'Добавлено!'); window.reviewSubmissions(aid); } else showAlert('Ошибка', 'Ошибка.'); };
window.blockUser = async function(n) { if (!windowDb) return showAlert('Ошибка', 'База не подключена!'); if (!currentUser || !isAdmin()) return showAlert('Доступ запрещён', 'Только Магистрам.'); const r = await askPrompt('Блокировка', `Причина блокировки ${n}:`); if (!r) return; try { const ok = await blockUserInDb(n, r); if (ok) { showAlert('Успех', `${n} заблокирован.`); window.showAdminPanel(); } else showAlert('Ошибка', 'Не удалось.'); } catch (e) { showAlert('Ошибка', e.message); } };
window.unblockUser = async function(n) { if (!windowDb) return showAlert('Ошибка', 'База не подключена!'); const c = await askConfirm('Разблокировка', `Разблокировать ${n}?`); if (!c) return; try { const ok = await unblockUserInDb(n); if (ok) { showAlert('Успех', `${n} разблокирован.`); window.showAdminPanel(); } else showAlert('Ошибка', 'Не удалось.'); } catch (e) { showAlert('Ошибка', e.message); } };
window.openAdjustmentForm = async function(n) { if (!windowDb) return showAlert('Ошибка', 'База не подключена!'); try { const a = await getUserAdjustments(n); const l = await askPrompt('Корректировка', `Доп. уроков для ${n} (сейчас ${a.adjustedLessons || 0}):`, String(a.adjustedLessons || 0)); if (l === null) return; const h = await askPrompt('Корректировка', `Доп. ДЗ для ${n} (сейчас ${a.adjustedHomework || 0}):`, String(a.adjustedHomework || 0)); if (h === null) return; const r = await askPrompt('Корректировка', `Причина:`, a.reason || ''); if (r === null) return; const ok = await saveManualAdjustment(n, l, h, r); if (ok) { showAlert('Успех', 'Сохранено!'); window.showAdjustmentPanel(); } else showAlert('Ошибка', 'Не удалось.'); } catch (e) { showAlert('Ошибка', e.message); } };
window.addNewMember = async function() { if (!windowDb) return showAlert('Ошибка', 'База не подключена!'); if (!isAdmin()) return showAlert('Доступ запрещён', 'Только Магистрам.'); const n = await askPrompt('Новый член', 'Полное имя:'); if (!n) return; const r = await askPrompt('Ранг', 'Ранг:'); if (!r) return; const t = await askPrompt('Учитель', 'Учитель (или "нет"):', 'нет'); if (!t) return; const p = await askPrompt('Пароль', 'Пароль (мин. 6):'); if (!p || p.length < 6) return showAlert('Ошибка', 'Пароль мин. 6 символов!'); const st = await askPrompt('Спец. звание', 'Спец. звание (можно пусто):', ''); const d = await askPrompt('Описание', 'Описание (можно пусто):', ''); try { const nn = n.toLowerCase().trim(); if (usersDatabase[nn]) return showAlert('Ошибка', 'Уже существует!'); await windowDb.collection('users').doc(nn).set({ fullName: n, rank: r.toLowerCase().trim(), teacher: (t.toLowerCase().trim() === 'нет' || t.toLowerCase().trim() === 'отсутствует') ? 'отсутствует' : t, password: p, specialTitle: st || '', description: d || '', статусы: [], звания: [], createdAt: firebase.firestore.Timestamp.fromDate(new Date()), createdBy: currentUser.name }); usersDatabase[nn] = { fullName: n, ранг: r.toLowerCase().trim(), учитель: (t.toLowerCase().trim() === 'нет' || t.toLowerCase().trim() === 'отсутствует') ? 'отсутствует' : t, пароль: p, specialTitle: st || '', description: d || '', статусы: [], звания: [] }; showAlert('Успех', `${n} добавлен!`); window.showAdminPanel(); } catch (e) { showAlert('Ошибка', e.message); } };
window.excludeJedi = async function(n) { if (!windowDb) return showAlert('Ошибка', 'База не подключена!'); if (!isAdmin()) return showAlert('Доступ запрещён', 'Только Магистрам.'); const c = await askConfirm('⚠️ ВНИМАНИЕ!', `ИСКЛЮЧИТЬ ${n}?\nНЕОБРАТИМО!`); if (!c) return; const ct = await askPrompt('Подтверждение', 'Напишите "ИСКЛЮЧИТЬ":'); if (ct !== 'ИСКЛЮЧИТЬ') return showAlert('Отменено', 'Отменено.'); try { const nn = n.toLowerCase().trim(); await windowDb.collection('users').doc(nn).delete(); const rs = await windowDb.collection('lesson_reads').where('userId', '==', n).get(); if (!rs.empty) { const b = windowDb.batch(); rs.forEach(d => b.delete(d.ref)); await b.commit(); } const ss = await windowDb.collection('homework_submissions').where('studentName', '==', n).get(); if (!ss.empty) { const b = windowDb.batch(); ss.forEach(d => b.delete(d.ref)); await b.commit(); } const cs = await windowDb.collection('comments').where('authorName', '==', n).get(); if (!cs.empty) { const b = windowDb.batch(); cs.forEach(d => b.delete(d.ref)); await b.commit(); } delete usersDatabase[nn]; showAlert('Успех', `${n} исключён.`); window.showAdminPanel(); } catch (e) { showAlert('Ошибка', e.message); } };

window.showCouncilOfMasters = async function() {
    const c = document.getElementById('chat-container'); if (c) c.innerHTML = '';
    const bu = await getBlockedUsers(); const bn = bu.map(u => u.id);
    let h = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;"><h3 class="council-title">🏛️ Совет Мастеров</h3><p class="council-subtitle">Руководство Ордена Вольных Джедаев</p>`;
    const sm = Object.values(usersDatabase).find(u => u.ранг === 'верховный магистр' && u.specialTitle);
    if (sm) { const ib = bn.includes(sm.fullName); h += `<div class="council-supreme"><div style="display:flex; align-items:center; gap:15px; margin-bottom:10px;"><div style="font-size:2em;">🔮</div><div style="flex:1;"><div style="color:#64ffda; font-family:'Playfair Display',serif; font-size:1.3em; font-weight:700;">${sm.fullName}</div><div style="color:#8bc34a; font-size:1em; font-weight:600; margin-top:3px;">${sm.specialTitle}</div></div><div class="member-status ${ib ? 'status-blocked' : 'status-active'}">${ib ? '🚫 Заблок.' : '✅ Активен'} ${formatOnlineStatus(sm.fullName)}</div></div>`; if (sm.description) h += `<div style="color:var(--text-color); font-size:0.95em; line-height:1.5; padding-left:50px; font-style:italic;">${sm.description}</div>`; h += `</div>`; }
    h += `<h4 class="council-master-header">👑 Мастера</h4>`;
    Object.values(usersDatabase).filter(u => u.ранг === 'мастер' && u.specialTitle).forEach(m => { const ib = bn.includes(m.fullName); h += `<div class="council-master-card"><div style="display:flex; align-items:center; gap:15px; margin-bottom:10px;"><div style="font-size:2em;">⚔️</div><div style="flex:1;"><div style="color:#64ffda; font-family:'Playfair Display',serif; font-size:1.3em; font-weight:700;">${m.fullName}</div><div style="color:#8bc34a; font-size:1em; font-weight:600; margin-top:3px;">${m.specialTitle}</div></div><div class="member-status ${ib ? 'status-blocked' : 'status-active'}">${ib ? '🚫 Заблок.' : '✅ Активен'} ${formatOnlineStatus(m.fullName)}</div></div>`; if (m.description) h += `<div style="color:var(--text-color); font-size:0.95em; line-height:1.5; padding-left:50px; font-style:italic;">${m.description}</div>`; h += `</div>`; });
    h += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:20px; padding:12px;">🔙 Вернуться в меню</button></div>`;
    addRawHTML(h);
};
window.showMembersList = async function() {
    const c = document.getElementById('chat-container'); if (c) c.innerHTML = '';
    const bu = await getBlockedUsers(); const bn = bu.map(u => u.id);
    let h = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;"><h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">👥 Члены Ордена</h3><p style="color:var(--text-secondary); text-align:center; margin-bottom:20px; font-style:italic;">От Адепта до Старейшины</p>`;
    ['старейшина','верховный магистр','магистр','мастер','рыцарь','старший падаван','падаван','юнлинг','адепт'].forEach(r => {
        const m = Object.values(usersDatabase).filter(u => u.ранг === r);
        if (m.length > 0) { h += `<div style="margin:20px 0;"><h4 style="color:var(--accent-color); font-family:'Playfair Display',serif; font-size:1.3em; margin-bottom:10px; border-bottom:2px solid var(--border-color); padding-bottom:8px;">${r}</h4>`; m.forEach(mb => { const ib = bn.includes(mb.fullName); const tn = mb.учитель && mb.учитель !== 'отсутствует' ? mb.учитель : 'нет'; const rd = await getUserRegistrationDate(mb.fullName); const ta = rd ? formatTimeInAkasha(rd) : '—'; h += `<div class="member-card"><div style="flex:1;"><div class="member-name">${mb.fullName} ${formatOnlineStatus(mb.fullName)}</div><div style="color:var(--text-secondary); font-size:0.9em; margin-top:3px;">🧙‍♂️ Учитель: ${tn}</div><div style="color:var(--text-secondary); font-size:0.85em; margin-top:2px;">⏱️ В Акаше: ${ta}</div></div><div class="member-status ${ib ? 'status-blocked' : 'status-active'}">${ib ? '🚫 Заблок.' : '✅ Активен'}</div></div>`; }); h += `</div>`; }
    });
    h += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:15px; padding:12px;">🔙 Вернуться в меню</button></div>`;
    addRawHTML(h);
};
window.showProgressTable = async function() {
    const c = document.getElementById('chat-container'); if (c) c.innerHTML = '';
    const r = await getAllLessonReads(); const im = isMaster(); const tl = Object.keys(lessonsById).length, th = assignmentsList.length;
    let h = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;"><h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">📊 Успеваемость Ордена</h3><p style="color:var(--text-secondary); text-align:center; margin-bottom:20px; font-style:italic;">Уроков: ${tl} | ДЗ: ${th}</p>`;
    h += `<div style="overflow-x:auto;"><table class="progress-table"><tr><th>Ученик</th><th>Ранг</th><th>Учитель</th><th>В Акаше</th><th>Уроки</th><th>ДЗ</th><th>Оценка</th></tr>`;
    for (const u of Object.values(usersDatabase)) { if (['мастер','магистр','верховный магистр','старейшина'].includes(u.ранг)) continue; const ur = r.filter(x => x.userId === u.fullName); const us = submissionsList.filter(s => s.studentName === u.fullName); const ah = us.filter(s => s.status === 'approved').length; const rd = await getUserRegistrationDate(u.fullName); const ta = rd ? formatTimeInAkasha(rd) : '—'; const a = await getUserAdjustments(u.fullName); const g = calculateGrade(ur.length, ah, tl, th, a.adjustedLessons || 0, a.adjustedHomework || 0); const tn = u.учитель && u.учитель !== 'отсутствует' ? u.учитель : '—'; h += `<tr><td style="font-weight:600;">${u.fullName} ${formatOnlineStatus(u.fullName)}</td><td>${u.ранг}</td><td style="font-size:0.9em;">${tn}</td><td style="font-size:0.9em;">${ta}</td><td>${ur.length}/${tl}</td><td>${us.length} сдано<br><small style="color:#a89b7e;">(${ah} одобр.)</small></td><td style="color:${g.gradeColor}; font-weight:700; text-align:center;">${g.grade}<br><small>${g.percent}%</small></td></tr>`; }
    h += `</table></div>`;
    if (im) { h += `<div class="admin-panel"><h3>✏️ Ручная корректировка</h3><p style="color:var(--text-secondary); margin:10px 0;">Мастер может добавить баллы за материалы вне Акаши.</p><button class="hw-btn" onclick="window.showAdjustmentPanel()" style="background:rgba(100,255,218,0.2); color:#64ffda; width:100%; margin-top:10px;">⚙️ Панель корректировки</button></div><button class="hw-btn" onclick="window.showDetailedProgress()" style="width:100%; margin-top:10px; background:rgba(100,255,218,0.2); color:#64ffda;">🔒 Детали</button>`; }
    h += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:15px; padding:12px;">🔙 Вернуться в меню</button></div>`;
    addRawHTML(h);
};
window.showAdjustmentPanel = async function() {
    const c = document.getElementById('chat-container'); if (c) c.innerHTML = '';
    if (!isMaster()) { addMessage('<p>❌ Запрещено.</p>'); return; }
    let h = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;"><h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">⚙️ Корректировка</h3><p style="color:var(--text-secondary); text-align:center; margin-bottom:20px;">Добавь баллы за материалы вне Акаши</p>`;
    for (const u of Object.values(usersDatabase)) { if (['мастер','магистр','верховный магистр','старейшина'].includes(u.ранг)) continue; const a = await getUserAdjustments(u.fullName); const ha = (a.adjustedLessons || 0) > 0 || (a.adjustedHomework || 0) > 0; h += `<div style="background:rgba(0,0,0,0.3); border-radius:10px; padding:15px; margin:10px 0; border-left:3px solid ${ha ? '#64ffda' : 'var(--border-color)'};"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;"><div><div style="color:var(--text-color); font-weight:600;">${u.fullName}</div><div style="color:var(--text-secondary); font-size:0.9em;">${u.ранг}</div></div>`; if (ha) h += `<div style="color:#64ffda; font-size:0.85em;">+${a.adjustedLessons} ур., +${a.adjustedHomework} ДЗ</div>`; h += `</div><button class="hw-btn" onclick="window.openAdjustmentForm('${u.fullName}')" style="width:100%; background:rgba(100,255,218,0.2); color:#64ffda; padding:8px; font-size:0.95em;">✏️ ${ha ? 'Изменить' : 'Добавить'}</button></div>`; }
    h += `<button class="hw-btn" onclick="window.showProgressTable()" style="width:100%; margin-top:15px; padding:12px;">🔙 Назад</button></div>`;
    addRawHTML(h);
};
window.showDetailedProgress = async function() {
    const c = document.getElementById('chat-container'); if (c) c.innerHTML = '';
    if (!isMaster()) { addMessage('<p>❌ Запрещено.</p>'); return; }
    const r = await getAllLessonReads(); const tl = Object.keys(lessonsById).length, th = assignmentsList.length;
    let h = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;"><h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">🔒 Детали</h3>`;
    for (const u of Object.values(usersDatabase)) { if (['мастер','магистр','верховный магистр','старейшина'].includes(u.ранг)) continue; const ur = r.filter(x => x.userId === u.fullName); const us = submissionsList.filter(s => s.studentName === u.fullName); const a = await getUserAdjustments(u.fullName); const g = calculateGrade(ur.length, us.filter(s => s.status === 'approved').length, tl, th, a.adjustedLessons || 0, a.adjustedHomework || 0); h += `<div style="background:rgba(0,0,0,0.3); border-radius:10px; padding:15px; margin:15px 0; border-left:3px solid ${g.gradeColor};"><h4 style="color:${g.gradeColor}; margin-bottom:10px;">${u.fullName} — ${g.grade} (${g.percent}%)</h4><p style="color:#8bc34a; margin:10px 0 5px 0; font-weight:600;">📖 Прочитано (${ur.length}/${tl}):</p>`; if (ur.length > 0) { h += `<ul style="color:var(--text-color); margin:5px 0; padding-left:20px; font-size:0.95em;">`; ur.forEach(x => { const l = lessonsById[x.lessonId]; if (l) { const rd = x.readAt ? new Date(x.readAt.seconds * 1000).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''; h += `<li>${l.title} <span style="color:#6b5f4a; font-size:0.85em;">— ${rd}</span></li>`; } }); h += `</ul>`; } else h += `<p style="color:#6b5f4a; font-style:italic; margin:5px 0;">Нет.</p>`; h += `<p style="color:#ffa500; margin:10px 0 5px 0; font-weight:600;">📝 ДЗ (${us.length}, одобр. ${us.filter(s => s.status === 'approved').length}):</p>`; if (us.length > 0) { h += `<ul style="color:var(--text-color); margin:5px 0; padding-left:20px; font-size:0.95em;">`; us.forEach(s => { const as = assignmentsList.find(x => x.id === s.assignmentId); const se = s.status === 'approved' ? '✅' : (s.status === 'needs_revision' ? '⚠️' : ''); h += `<li>${se} ${as ? as.title : '?'}</li>`; }); h += `</ul>`; } else h += `<p style="color:#6b5f4a; font-style:italic; margin:5px 0;">Нет.</p>`; if ((a.adjustedLessons || 0) > 0 || (a.adjustedHomework || 0) > 0) { h += `<div style="background:rgba(100,255,218,0.1); border-radius:8px; padding:10px; margin-top:10px;"><p style="color:#64ffda; margin:0; font-weight:600;">✏️ Корректировка:</p><p style="color:var(--text-color); margin:5px 0 0 0; font-size:0.9em;">+${a.adjustedLessons} ур., +${a.adjustedHomework} ДЗ</p>`; if (a.reason) h += `<p style="color:var(--text-secondary); margin:5px 0 0 0; font-size:0.85em; font-style:italic;">Причина: ${a.reason}</p>`; if (a.adjustedBy) h += `<p style="color:#6b5f4a; margin:5px 0 0 0; font-size:0.8em;">Внёс: ${a.adjustedBy}</p>`; h += `</div>`; } h += `</div>`; }
    h += `<button class="hw-btn" onclick="window.showProgressTable()" style="width:100%; margin-top:15px; padding:12px;">🔙 Назад</button></div>`;
    addRawHTML(h);
};
window.showAdminPanel = async function() {
    const c = document.getElementById('chat-container'); if (c) c.innerHTML = '';
    if (!isAdmin()) { addMessage('<p>❌ Запрещено.</p>'); return; }
    const bu = await getBlockedUsers();
    let h = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;"><h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">⚙️ Админ-панель</h3><div class="admin-panel"><h3>👥 Пользователи</h3><button class="hw-btn" onclick="window.addNewMember()" style="background:rgba(76,175,80,0.3); color:#4caf50; margin-bottom:15px;">➕ Добавить члена Ордена</button>`;
    Object.entries(usersDatabase).forEach(([k, u]) => { const ib = bu.find(b => b.id === u.fullName); const rc = u.ранг.includes('магистр') || u.ранг.includes('мастер') ? '#ffd700' : 'var(--accent-color)'; h += `<div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid var(--border-color); background:rgba(0,0,0,0.2); border-radius:8px; margin:8px 0; flex-wrap:wrap; gap:8px;"><div style="flex:1; min-width:200px;"><div style="color:var(--text-color); font-weight:600; font-size:1.1em;">${u.fullName} ${formatOnlineStatus(u.fullName)}</div><div style="color:${rc}; font-size:0.9em;">${u.ранг}</div>`; if (u.статусы && u.статусы.length > 0) h += `<div style="color:#8bc34a; font-size:0.85em; margin-top:3px;">🏷️ ${u.статусы.join(', ')}</div>`; if (u.звания && u.звания.length > 0) h += `<div style="color:#ffd700; font-size:0.85em; margin-top:3px;">🎖️ ${u.звания.map(t => t.уточнение ? `${t.звание} (${t.уточнение})` : t.звание).join(', ')}</div>`; h += `</div><div style="display:flex; gap:5px; flex-wrap:wrap;">`; if (ib) h += `<button class="unblock-btn" onclick="window.unblockUser('${u.fullName}')">✅ Разблок.</button>`; else h += `<button class="block-btn" onclick="window.blockUser('${u.fullName}')">🚫 Блок</button>`; h += `<button class="hw-btn" onclick="window.excludeJedi('${u.fullName}')" style="background:rgba(255,0,0,0.2); color:#ff0000; border:1px solid rgba(255,0,0,0.5); padding:6px 12px; font-size:0.85em; margin:0;">⚠️ Исключить</button>`; if (isAdmin()) h += `<button class="hw-btn" onclick="window.manageUserRanks('${k}')" style="background:rgba(100,255,218,0.2); color:#64ffda; border:1px solid rgba(100,255,218,0.5); padding:6px 12px; font-size:0.85em; margin:0;">🎖️ Ранг/Статус/Звание</button>`; h += `</div></div>`; });
    h += `</div><button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:15px; padding:12px;">🔙 Вернуться в меню</button></div>`;
    addRawHTML(h);
};

// 🔥 ГЛАВНОЕ ИСПРАВЛЕНИЕ: очистка контейнера в начале (иначе блоки копились и select ломался)
window.manageUserRanks = async function(userKey) {
    const c = document.getElementById('chat-container'); if (c) c.innerHTML = ''; // 🔥 ОЧИСТКА
    const u = usersDatabase[userKey];
    if (!u) { showAlert('Ошибка', 'Пользователь не найден!'); return; }
    let h = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;"><h3 style="color:#64ffda; margin-bottom:20px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">🎖️ Управление кадрами</h3>`;
    h += `<div style="background:rgba(0,0,0,0.3); border-radius:10px; padding:15px; margin-bottom:20px;"><div style="color:var(--text-color); font-size:1.2em; font-weight:600; margin-bottom:5px;">${u.fullName}</div><div style="color:var(--text-secondary); font-size:0.95em;">Ранг: <strong style="color:var(--accent-color);">${u.ранг}</strong></div><div style="color:var(--text-secondary); font-size:0.95em; margin-top:5px;">🧙‍♂️ Учитель: <strong>${u.учитель || 'отсутствует'}</strong></div>`;
    if (u.статусы && u.статусы.length > 0) h += `<div style="color:#8bc34a; font-size:0.9em; margin-top:5px;">🏷️ Статусы: ${u.статусы.join(', ')}</div>`;
    if (u.звания && u.звания.length > 0) h += `<div style="color:#ffd700; font-size:0.9em; margin-top:5px;">🎖️ Звания: ${u.звания.map(t => t.уточнение ? `${t.звание} (${t.уточнение})` : t.звание).join(', ')}</div>`;
    h += `</div>`;
    h += `<div style="margin-bottom:20px;"><h4 style="color:#64ffda; margin-bottom:10px; font-family:'Playfair Display',serif;">🔹 Изменить Ранг</h4><select id="rank-select" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border-color); background:rgba(13,31,15,0.8); color:var(--text-color); font-family:'Cormorant Garamond',serif; font-size:1.1em; margin-bottom:10px;">`;
    rankHierarchy.forEach(r => { const sel = r === u.ранг ? 'selected' : ''; const rd = r.charAt(0).toUpperCase() + r.slice(1); h += `<option value="${r}" ${sel}>${rd}</option>`; });
    h += `</select><div id="teacher-input-wrapper" style="display:${(u.ранг === 'падаван' || u.ранг === 'старший падаван') ? 'block' : 'none'}; margin-bottom:10px;"><input type="text" id="teacher-input-field" placeholder="Имя Учителя (или 'нет')" value="${u.учитель || ''}" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border-color); background:rgba(13,31,15,0.8); color:var(--text-color); font-family:'Cormorant Garamond',serif; font-size:1em;"></div><button class="hw-btn" onclick="window.changeUserRank('${userKey}')" style="width:100%; background:rgba(100,255,218,0.2); color:#64ffda;">💾 Сохранить Ранг</button></div>`;
    h += `<div style="margin-bottom:20px;"><h4 style="color:#64ffda; margin-bottom:10px; font-family:'Playfair Display',serif;">🔹 Добавить Статус</h4><select id="status-select" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border-color); background:rgba(13,31,15,0.8); color:var(--text-color); font-family:'Cormorant Garamond',serif; font-size:1.1em; margin-bottom:10px;" onchange="window.handleStatusChange()"><option value="">-- Выберите статус --</option>`;
    availableStatuses.forEach(s => { h += `<option value="${s}">${s}</option>`; });
    h += `</select><div id="council-input-wrapper" style="display:none; margin-bottom:10px;"><input type="text" id="council-name-input" placeholder="Название Совета" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border-color); background:rgba(13,31,15,0.8); color:var(--text-color); font-family:'Cormorant Garamond',serif; font-size:1em;"></div><div id="custom-status-input-wrapper" style="display:none; margin-bottom:10px;"><input type="text" id="custom-status-input" placeholder="Свой статус" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border-color); background:rgba(13,31,15,0.8); color:var(--text-color); font-family:'Cormorant Garamond',serif; font-size:1em;"></div><button class="hw-btn" onclick="window.addUserStatus('${userKey}')" style="width:100%; background:rgba(139,195,74,0.3); color:#8bc34a;">➕ Добавить Статус</button></div>`;
    if (u.статусы && u.статусы.length > 0) { h += `<div style="margin-bottom:20px;"><h4 style="color:#8bc34a; margin-bottom:10px; font-family:'Playfair Display',serif;">📋 Текущие Статусы</h4>`; u.статусы.forEach((s, i) => { h += `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(139,195,74,0.1); border-radius:8px; padding:10px; margin:5px 0;"><span style="color:var(--text-color);">${s}</span><button onclick="window.removeUserStatus('${userKey}', ${i})" style="background:rgba(255,80,80,0.3); color:#ff6b6b; border:none; border-radius:6px; padding:5px 10px; cursor:pointer; font-size:0.9em;">🗑️ Удалить</button></div>`; }); h += `</div>`; }
    h += `<div style="margin-bottom:20px;"><h4 style="color:#64ffda; margin-bottom:10px; font-family:'Playfair Display',serif;">🔹 Добавить Звание</h4><select id="title-select" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border-color); background:rgba(13,31,15,0.8); color:var(--text-color); font-family:'Cormorant Garamond',serif; font-size:1.1em; margin-bottom:10px;" onchange="window.handleTitleChange()"><option value="">-- Выберите звание --</option>`;
    availableTitles.forEach(t => { h += `<option value="${t}">${t}</option>`; });
    h += `</select><div id="title-clarification-input-wrapper" style="display:none; margin-bottom:10px;"><input type="text" id="title-clarification-input" placeholder="Какой именно?" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border-color); background:rgba(13,31,15,0.8); color:var(--text-color); font-family:'Cormorant Garamond',serif; font-size:1em;"></div><button class="hw-btn" onclick="window.addUserTitle('${userKey}')" style="width:100%; background:rgba(255,215,0,0.2); color:#ffd700;">🎖️ Добавить Звание</button></div>`;
    if (u.звания && u.звания.length > 0) { h += `<div style="margin-bottom:20px;"><h4 style="color:#ffd700; margin-bottom:10px; font-family:'Playfair Display',serif;">📋 Текущие Звания</h4>`; u.звания.forEach((t, i) => { const td = t.уточнение ? `${t.звание} (${t.уточнение})` : t.звание; h += `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,215,0,0.1); border-radius:8px; padding:10px; margin:5px 0;"><span style="color:var(--text-color);">${td}</span><button onclick="window.removeUserTitle('${userKey}', ${i})" style="background:rgba(255,80,80,0.3); color:#ff6b6b; border:none; border-radius:6px; padding:5px 10px; cursor:pointer; font-size:0.9em;">🗑️ Удалить</button></div>`; }); h += `</div>`; }
    h += `<button class="hw-btn" onclick="window.showAdminPanel()" style="width:100%; margin-top:15px; padding:12px;">🔙 В Админ-панель</button></div>`;
    addRawHTML(h);
};
window.handleRankChange = function() {};
window.handleStatusChange = function() { const s = document.getElementById('status-select'); const ci = document.getElementById('council-input-wrapper'); const cu = document.getElementById('custom-status-input-wrapper'); if (!s) return; if (s.value === 'Член Совета') { ci.style.display = 'block'; cu.style.display = 'none'; } else if (s.value === 'Другие') { ci.style.display = 'none'; cu.style.display = 'block'; } else { ci.style.display = 'none'; cu.style.display = 'none'; } };
window.handleTitleChange = function() { const s = document.getElementById('title-select'); const ci = document.getElementById('title-clarification-input-wrapper'); if (!s) return; ci.style.display = ['Рыцарь','Мастер','Предвестник','Вестник','Лорд','Леди'].includes(s.value) ? 'block' : 'none'; };
window.changeUserRank = async function(k) {
    const s = document.getElementById('rank-select'); if (!s) { showAlert('Ошибка', 'Список не найден.'); return; }
    const nr = s.value; let ti = '';
    if (nr === 'падаван' || nr === 'старший падаван') { const tf = document.getElementById('teacher-input-field'); if (tf) { ti = tf.value.trim(); if (!ti) { showAlert('Ошибка', 'Для Падавана нужен Учитель!'); return; } } }
    try {
        const ur = windowDb.collection('users').doc(k); const ud = await ur.get();
        const up = { rank: nr }; if (ti) up.teacher = (ti.toLowerCase() === 'нет' || ti.toLowerCase() === 'отсутствует') ? 'отсутствует' : ti;
        if (!ud.exists) { const u = usersDatabase[k]; await ur.set({ fullName: u.fullName, rank: nr, teacher: ti || (u.учитель || 'отсутствует'), password: u.пароль || '', specialTitle: u.specialTitle || '', description: u.description || '', статусы: u.статусы || [], звания: u.звания || [], createdAt: firebase.firestore.Timestamp.fromDate(new Date()), createdBy: currentUser.name }); }
        else await ur.update(up);
        usersDatabase[k].ранг = nr; if (ti) usersDatabase[k].учитель = (ti.toLowerCase() === 'нет' || ti.toLowerCase() === 'отсутствует') ? 'отсутствует' : ti;
        showAlert('Успех', `Ранг → "${nr}"!`); window.manageUserRanks(k);
    } catch (e) { showAlert('Ошибка', e.message); }
};
window.addUserStatus = async function(k) {
    const s = document.getElementById('status-select'); if (!s) { showAlert('Ошибка', 'Список не найден. Обновите страницу.'); return; }
    const ci = document.getElementById('council-name-input'); const cu = document.getElementById('custom-status-input');
    let ns = s.value;
    if (!ns || ns === '') { showAlert('Ошибка', 'Сначала ВЫБЕРИТЕ статус из выпадающего списка!'); return; }
    if (ns === 'Член Совета') { const cn = ci ? ci.value.trim() : ''; if (!cn) { showAlert('Ошибка', 'Введите название Совета!'); return; } ns = `Член Совета (${cn})`; }
    else if (ns === 'Другие') { const cs = cu ? cu.value.trim() : ''; if (!cs) { showAlert('Ошибка', 'Введите свой статус!'); return; } ns = cs; }
    try {
        const ur = windowDb.collection('users').doc(k); const ud = await ur.get();
        const cur = (ud.exists && Array.isArray(ud.data().статусы)) ? ud.data().статусы : (usersDatabase[k].статусы || []);
        const nn = [...cur, ns];
        if (!ud.exists) { const u = usersDatabase[k]; await ur.set({ fullName: u.fullName, rank: u.ранг, teacher: u.учитель, password: u.пароль || '', specialTitle: u.specialTitle || '', description: u.description || '', статусы: nn, звания: u.звания || [], createdAt: firebase.firestore.Timestamp.fromDate(new Date()) }); }
        else await ur.update({ статусы: nn });
        usersDatabase[k].статусы = nn;
        showAlert('Успех', `Статус "${ns}" добавлен!`); window.manageUserRanks(k);
    } catch (e) { showAlert('Ошибка', e.message); }
};
window.removeUserStatus = async function(k, i) {
    try {
        const ur = windowDb.collection('users').doc(k); const ud = await ur.get();
        const cur = (ud.exists && Array.isArray(ud.data().статусы)) ? ud.data().статусы : (usersDatabase[k].статусы || []);
        const nn = cur.filter((_, x) => x !== i);
        if (!ud.exists) { const u = usersDatabase[k]; await ur.set({ fullName: u.fullName, rank: u.ранг, teacher: u.учитель, password: u.пароль || '', specialTitle: u.specialTitle || '', description: u.description || '', статусы: nn, звания: u.звания || [], createdAt: firebase.firestore.Timestamp.fromDate(new Date()) }); }
        else await ur.update({ статусы: nn });
        usersDatabase[k].статусы = nn; showAlert('Успех', 'Удалено!'); window.manageUserRanks(k);
    } catch (e) { showAlert('Ошибка', e.message); }
};
window.addUserTitle = async function(k) {
    const s = document.getElementById('title-select'); if (!s) { showAlert('Ошибка', 'Список не найден. Обновите страницу.'); return; }
    const ci = document.getElementById('title-clarification-input');
    let nt = s.value;
    if (!nt || nt === '') { showAlert('Ошибка', 'Сначала ВЫБЕРИТЕ звание из выпадающего списка!'); return; }
    let u = '';
    if (['Рыцарь','Мастер','Предвестник','Вестник','Лорд','Леди'].includes(nt)) { u = ci ? ci.value.trim() : ''; if (!u) { showAlert('Ошибка', 'Введите уточнение звания!'); return; } }
    try {
        const ur = windowDb.collection('users').doc(k); const ud = await ur.get();
        const cur = (ud.exists && Array.isArray(ud.data().звания)) ? ud.data().звания : (usersDatabase[k].звания || []);
        const nn = [...cur, { звание: nt, уточнение: u }];
        if (!ud.exists) { const us = usersDatabase[k]; await ur.set({ fullName: us.fullName, rank: us.ранг, teacher: us.учитель, password: us.пароль || '', specialTitle: us.specialTitle || '', description: us.description || '', статусы: us.статусы || [], звания: nn, createdAt: firebase.firestore.Timestamp.fromDate(new Date()) }); }
        else await ur.update({ звания: nn });
        usersDatabase[k].звания = nn;
        showAlert('Успех', `Звание "${u ? nt + ' (' + u + ')' : nt}" добавлено!`); window.manageUserRanks(k);
    } catch (e) { showAlert('Ошибка', e.message); }
};
window.removeUserTitle = async function(k, i) {
    try {
        const ur = windowDb.collection('users').doc(k); const ud = await ur.get();
        const cur = (ud.exists && Array.isArray(ud.data().звания)) ? ud.data().звания : (usersDatabase[k].звания || []);
        const nn = cur.filter((_, x) => x !== i);
        if (!ud.exists) { const u = usersDatabase[k]; await ur.set({ fullName: u.fullName, rank: u.ранг, teacher: u.учитель, password: u.пароль || '', specialTitle: u.specialTitle || '', description: u.description || '', статусы: u.статусы || [], звания: nn, createdAt: firebase.firestore.Timestamp.fromDate(new Date()) }); }
        else await ur.update({ звания: nn });
        usersDatabase[k].звания = nn; showAlert('Успех', 'Удалено!'); window.manageUserRanks(k);
    } catch (e) { showAlert('Ошибка', e.message); }
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
    if (isInitialized) return; isInitialized = true;
    applySeasonTheme(); renderKeyboard();
    if (typeof firebase !== 'undefined' && firebaseConfig) { try { if (!firebase.apps.length) firebase.initializeApp(firebaseConfig); windowDb = firebase.firestore(); await initFirebaseStorage(); console.log('✅ Firebase готов'); } catch (e) { console.error(e); } }
    setTimeout(async () => {
        if (windowDb) {
            loadUserFromStorage();
            await loadUsersFromFirebase(); await loadOnlineStatuses(); await loadSectionsFromFirebase(); await loadLibraryFromFirebase();
            loadHistoryFromStorage();
            const c = document.getElementById('chat-container'); if (c) c.innerHTML = '';
            if (currentUser) { loadLessonsFromFirebase(); loadAssignments(); loadSubmissions(); loadScheduleFromFirebase(); updateLogoutButton(); addMessage(getRankGreeting(currentUser)); showMainMenu(); updateOnlineStatus(); heartbeatTimer = setInterval(updateOnlineStatus, 30000); }
            else addMessage(getStrangerGreeting());
            restoreKeyboardState(); restoreLargeTextPreference();
        }
    }, 500);
});
window.addEventListener('beforeunload', () => { sendOfflineStatus(); if (heartbeatTimer) clearInterval(heartbeatTimer); });
window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { sendOfflineStatus(); if (heartbeatTimer) clearInterval(heartbeatTimer); } else if (currentUser) { updateOnlineStatus(); heartbeatTimer = setInterval(updateOnlineStatus, 30000); } });
window.addEventListener('resize', () => { if (window.visualViewport) { const kh = window.innerHeight - window.visualViewport.height; document.body.style.paddingBottom = kh > 150 ? '350px' : '300px'; } });

// ===== EXPORT =====
window.showLessonContent = showLessonContent; window.startAddLesson = startAddLesson; window.editLesson = editLesson; window.confirmDeleteLesson = confirmDeleteLesson; window.startAddComment = startAddComment; window.editComment = editComment; window.deleteComment = deleteComment; window.showHomeworkBoard = window.showHomeworkBoard; window.startCreateAssignment = startCreateAssignment; window.submitHomework = submitHomework; window.deleteMySubmission = window.deleteMySubmission; window.deleteAssignment = window.deleteAssignment; window.openMasterChat = window.openMasterChat; window.closeMasterChat = window.closeMasterChat; window.openChatWithStudent = window.openChatWithStudent; window.reviewSubmissions = window.reviewSubmissions; window.gradeSubmission = window.gradeSubmission; window.addFeedback = window.addFeedback; window.sendMasterChatMessage = window.sendMasterChatMessage; window.showMembersList = window.showMembersList; window.showProgressTable = window.showProgressTable; window.showAdjustmentPanel = window.showAdjustmentPanel; window.openAdjustmentForm = window.openAdjustmentForm; window.showDetailedProgress = window.showDetailedProgress; window.showAdminPanel = window.showAdminPanel; window.blockUser = window.blockUser; window.unblockUser = window.unblockUser; window.markLessonRead = window.markLessonRead; window.showCouncilOfMasters = window.showCouncilOfMasters; window.addNewMember = window.addNewMember; window.excludeJedi = window.excludeJedi; window.toggleKeyboardVisibility = toggleKeyboardVisibility; window.toggleLargeText = toggleLargeText; window.showSchedule = window.showSchedule; window.manageUserRanks = window.manageUserRanks; window.handleStatusChange = window.handleStatusChange; window.handleTitleChange = window.handleTitleChange; window.changeUserRank = window.changeUserRank; window.addUserStatus = window.addUserStatus; window.removeUserStatus = window.removeUserStatus; window.addUserTitle = window.addUserTitle; window.removeUserTitle = window.removeUserTitle; window.editScheduleItem = window.editScheduleItem; window.deleteScheduleItem = window.deleteScheduleItem; window.startAddSchedule = window.startAddSchedule; window.handleRankChange = window.handleRankChange; window.showTOC = window.showTOC; window.showYearSections = window.showYearSections; window.showSectionLessons = window.showSectionLessons; window.startAddYear = window.startAddYear; window.startAddSection = window.startAddSection; window.startAddLessonToSection = window.startAddLessonToSection; window.editSection = window.editSection; window.deleteSection = window.deleteSection; window.showLibrary = window.showLibrary; window.showLibraryDepartment = window.showLibraryDepartment; window.showBookDetails = window.showBookDetails; window.startAddDepartment = window.startAddDepartment; window.startAddBook = window.startAddBook; window.deleteDepartment = window.deleteDepartment; window.deleteBook = window.deleteBook; window.openArchivistChat = window.openArchivistChat; window.sendArchivistChatMessage = window.sendArchivistChatMessage; window.closeArchivistChat = window.closeArchivistChat; window.uploadBookFile = window.uploadBookFile;

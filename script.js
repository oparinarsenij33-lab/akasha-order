// ===== FIREBASE =====
const firebaseConfig = {
    apiKey: "AIzaSyCwTw-52bQ_MxtdFAT3s9pkEN9rQ2qiMEE",
    authDomain: "akasha-2b362.firebaseapp.com",
    projectId: "akasha-2b362",
    storageBucket: "akasha-2b362.firebasestorage.app",
    messagingSenderId: "352516960841",
    appId: "1:352516960841:web:88cdd6b970b14b5ced8598",
    measurementId: "G-GDYYS12EQH"
};

let knowledgeBase = {};
let lessonsById = {};
let assignmentsList = [];
let submissionsList = [];
window.currentChatPartner = null;
let currentModalResolve = null;

const usersDatabase = {
    'аранэль хальдарон': { ранг: 'верховный магистр', учитель: 'отсутствует', пароль: 'A1H23', fullName: 'Аранэль Хальдарон', specialTitle: 'Верховный Магистр', description: 'Глава Ордена Вольных Джедаев' },
    'дорхат минас тур': { ранг: 'мастер', учитель: 'отсутствует', пароль: 'D1M1T', fullName: 'Дорхат Минас Тур', specialTitle: 'Заместитель Верховного Магистра', description: 'Глава безопасности Ордена Вольных Джедаев, Мастер Боевой Магии и специалист по Защите от тёмных искусств' },
    'нарнэлион эдрад': { ранг: 'мастер', учитель: 'отсутствует', пароль: 'N1E1', fullName: 'Нарнэлион Эдрад', specialTitle: 'Мастер Артефактов и Целительства', description: 'Мастер по созданию различного рода магических Артефактов, а также специалист в знаниях о потусторонних мирах, измерениях и Мастер Целительства' },
    'рондрил лаур': { ранг: 'мастер', учитель: 'отсутствует', пароль: 'R1L1', fullName: 'Рондрил Лаур', specialTitle: 'Мастер-Целитель', description: 'Мастер-Целитель, специалист по травам и всему что связано с физическим Целительством' },
    'далисса вестуро': { ранг: 'старший падаван', учитель: 'Аранэль Хальдарон', пароль: 'D5i10V3', fullName: 'Далисса Иденааль Вестуро' },
    'даниил ионов': { ранг: 'падаван', учитель: 'Нарнэлион Эдрад', пароль: 'D5i10', fullName: 'Даниил Ионов' },
    'кайренарт ветэрмайтерос': { ранг: 'юнлинг', учитель: 'отсутствует', пароль: 'K12A1V3', fullName: 'Кайренарт Авандалэр Ветэрмайтерос' },
    'тейраналь лоаннен-тиарастес': { ранг: 'юнлинг', учитель: 'отсутствует', пароль: 'T20A1LT13', fullName: 'Тейраналь Арианарт Лоаннен-Тиарастес' },
    'асстария ламанш': { ранг: 'юнлинг', учитель: 'отсутствует', пароль: 'A1A1L13', fullName: 'Асстария Авангорн Ламанш' },
    'наталья кузовцова': { ранг: 'юнлинг', учитель: 'отсутствует', пароль: 'N15K12', fullName: 'Наталья Кузовцова' }
};

let currentUser = null;
let addLessonState = null;
let windowDb = null;
let isInitialized = false;

const accessLevels = {
    'адепт': ['адепт'], 'юнлинг': ['адепт', 'юнлинг'], 'падаван': ['адепт', 'юнлинг', 'падаван'],
    'старший падаван': ['адепт', 'юнлинг', 'падаван', 'старший падаван'],
    'рыцарь': ['адепт', 'юнлинг', 'падаван', 'старший падаван', 'рыцарь'],
    'мастер': ['адепт', 'юнлинг', 'падаван', 'старший падаван', 'рыцарь', 'мастер'],
    'магистр': ['адепт', 'юнлинг', 'падаван', 'старший падаван', 'рыцарь', 'мастер', 'магистр'],
    'верховный магистр': ['адепт', 'юнлинг', 'падаван', 'старший падаван', 'рыцарь', 'мастер', 'магистр', 'верховный магистр'],
    'старейшина': ['адепт', 'юнлинг', 'падаван', 'старший падаван', 'рыцарь', 'мастер', 'магистр', 'верховный магистр', 'старейшина']
};

// ===== СЕЗОННАЯ ТЕМА =====
function applySeasonTheme() {
    const month = new Date().getMonth() + 1;
    let season, seasonName, emoji;
    if (month >= 3 && month <= 5) { season = 'spring'; seasonName = 'Весна'; emoji = '🌸'; }
    else if (month >= 6 && month <= 8) { season = 'summer'; seasonName = 'Лето'; emoji = '☀️'; }
    else if (month >= 9 && month <= 11) { season = 'autumn'; seasonName = 'Осень'; emoji = '🍂'; }
    else { season = 'winter'; seasonName = 'Зима'; emoji = '❄️'; }
    document.body.className = `season-${season}`;
    const indicator = document.getElementById('season-indicator');
    if (indicator) indicator.textContent = `${emoji} ${seasonName}`;
}

// ===== ПРИВЕТСТВИЕ ДЛЯ СТРАННИКА =====
function getStrangerGreeting() {
    return `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">
        <h3 style="color:#64ffda; margin-bottom:15px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">🌟 Приветствую тебя, Странник</h3>
        <p style="color:var(--text-color); line-height:1.8; margin-bottom:15px;">Я — <strong>Акаша</strong>, Хранительница Знаний Ордена Вольных Джедаев. В моих архивах хранится мудрость веков, тайны магии и знания, что передавались через Великих Мастеров и Магистров всех времён и эпох.</p>
        <p style="color:var(--text-color); line-height:1.8; margin-bottom:15px;">Орден Вольных Джедаев — это братство тех, кто посвятил себя изучению высших искусств, защите, сохранению целостности и единства Света. Здесь ты найдёшь уроки, задания и возможность общаться с Наставниками.</p>
        <h4 style="color:#8bc34a; margin:20px 0 10px 0; font-family:'Playfair Display',serif;"> Как получить доступ:</h4>
        <p style="color:var(--text-color); line-height:1.8; margin-bottom:15px;">Чтобы войти в систему, назови мне своё <strong>Имя</strong>, <strong>Ранг</strong>, имя своего <strong>Учителя</strong> и <strong>Пароль</strong>.<br><br><em>Пример:</em> "Меня зовут Оби-Ван Кеноби, я Магистр, мой Учитель — Квай-Гон Джинн, пароль O2V7K9"</p>
        <p style="color:#a89b7e; font-style:italic; text-align:center; margin-top:20px;">✨ Орден ждёт тебя, Странник. Назови себя.</p>
    </div>`;
}

// ===== ПРИВЕТСТВИЕ ПОСЛЕ РЕГИСТРАЦИИ =====
function getRankGreeting(user) {
    const rank = user.ранг;
    const name = user.name;
    const isMasterRank = ['мастер', 'магистр', 'верховный магистр', 'старейшина'].includes(rank);
    if (isMasterRank) {
        return `<div style="background:rgba(13,31,15,0.5); border:1px solid rgba(255,215,0,0.3); border-radius:15px; padding:25px; margin:15px 0;">
            <h3 style="color:#ffd700; margin-bottom:15px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">🌟 Приветствую тебя, ${rank} ${name}</h3>
            <p style="color:var(--text-color); line-height:1.8; margin-bottom:15px;">Орден Вольных Джедаев рад видеть тебя среди своих хранителей. Твоя мудрость и опыт — бесценный дар для наших учеников.</p>
            <h4 style="color:#8bc34a; margin:20px 0 10px 0; font-family:'Playfair Display',serif;">📋 Твои возможности:</h4>
            <ul style="color:var(--text-color); line-height:1.8; padding-left:20px; margin-bottom:15px;">
                <li>📚 Доступ ко всем разделам знаний Ордена</li>
                <li>📝 Создание и проверка домашних заданий</li>
                <li>✏️ Добавление и редактирование уроков</li>
                <li>💬 Общение с учениками через личный чат</li>
                <li>📊 Просмотр таблицы успеваемости</li>
                ${rank === 'магистр' || rank === 'верховный магистр' || rank === 'старейшина' ? '<li>⚙️ Админ-панель: управление пользователями и блокировка</li>' : ''}
            </ul>
            <p style="color:#a89b7e; font-style:italic; text-align:center; margin-top:20px;">Используй свои возможности мудро, ${rank}. Орден доверяет тебе.</p>
        </div>`;
    } else {
        return `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">
            <h3 style="color:#64ffda; margin-bottom:15px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">🌟 Я рада приветствовать тебя в Ордене Вольных Джедаев, ${rank} ${name}!</h3>
            <p style="color:var(--text-color); line-height:1.8; margin-bottom:15px;">Твой путь только начинается. Впереди тебя ждут знания, испытания и рост. Помни — дисциплина и усердие суть ключи к мастерству.</p>
            <h4 style="color:#8bc34a; margin:20px 0 10px 0; font-family:'Playfair Display',serif;">📜 Как пользоваться Акашей:</h4>
            <ul style="color:var(--text-color); line-height:1.8; padding-left:20px; margin-bottom:15px;">
                <li>📝 <strong>Домашние задания</strong> — просматривай задания от Мастеров и отправляй свои ответы</li>
                <li>✉️ <strong>Написать Мастеру</strong> — личный чат с твоим Наставником</li>
                <li>📚 <strong>Оглавление знаний</strong> — уроки, доступные твоему Рангу</li>
                <li>🏛️ <strong>Совет Мастеров</strong> — узнай, кто руководит Орденом</li>
                <li>👥 <strong>Члены Ордена</strong> — список всех братьев и сестёр</li>
                <li>📊 <strong>Успеваемость</strong> — следи за своим прогрессом</li>
            </ul>
            <p style="color:#a89b7e; font-style:italic; text-align:center; margin-top:20px;">Да пребудет с тобой Сила, ${rank} ${name}. Используй главное меню для навигации.</p>
        </div>`;
    }
}

// ===== DOM ЭЛЕМЕНТЫ =====
const chatContainer = document.getElementById('chat-container');
const customTextarea = document.getElementById('custom-textarea');
const customKeyboard = document.getElementById('custom-keyboard');

// ===== LOCAL STORAGE =====
function isLocalStorageAvailable() {
    try { localStorage.setItem('test', 'test'); localStorage.removeItem('test'); return true; }
    catch (e) { return false; }
}
const LOCAL_STORAGE_AVAILABLE = isLocalStorageAvailable();
const STORAGE_KEY = 'akasha_chat_history';
const USER_KEY = 'akasha_current_user';

function saveMessageToStorage(text, isUser) {
    if (!LOCAL_STORAGE_AVAILABLE) return;
    try {
        let history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        history.push({ text, isUser, timestamp: Date.now() });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {}
}

function loadHistoryFromStorage() {
    if (!LOCAL_STORAGE_AVAILABLE) return;
    try {
        const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        history.forEach(msg => { addMessage(msg.text, msg.isUser, false); });
    } catch (error) {}
}

function clearHistory() {
    if (!LOCAL_STORAGE_AVAILABLE) return;
    localStorage.removeItem(STORAGE_KEY);
}

function saveUserToStorage() {
    if (!LOCAL_STORAGE_AVAILABLE) return;
    if (currentUser) { localStorage.setItem(USER_KEY, JSON.stringify(currentUser)); }
    else { localStorage.removeItem(USER_KEY); }
}

function loadUserFromStorage() {
    if (!LOCAL_STORAGE_AVAILABLE) return;
    try {
        const user = JSON.parse(localStorage.getItem(USER_KEY));
        if (user) { 
            currentUser = user;
            updateLogoutButton();
            loadLessonsFromFirebase();
            loadAssignments();
            loadSubmissions();
            registerUserIfNeeded();
        }
    } catch (error) {
        console.error('Ошибка загрузки пользователя:', error);
    }
}

// ===== ДОБАВЛЕНИЕ СООБЩЕНИЯ =====
function addMessage(text, isUser = false, saveToStorage = true) {
    const container = document.getElementById('chat-container');
    if (!container) return;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'akasha-message'}`;
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = parseMarkdown(text);
    messageDiv.appendChild(contentDiv);
    container.appendChild(messageDiv);
    if (saveToStorage) saveMessageToStorage(text, isUser);
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
        container.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
}

// ===== MARKDOWN ПАРСИНГ =====
function parseMarkdown(text) {
    // ***жирный и курсив*** → <strong><em>...</em></strong>
    text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    // **жирный** → <strong>...</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // *курсив* → <em>...</em>
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return text;
}

// ===== FIREBASE CRUD =====
async function loadLessonsFromFirebase() {
    if (!windowDb) return;
    try {
        const snapshot = await windowDb.collection('lessons').get();
        knowledgeBase = {}; lessonsById = {};
        snapshot.forEach((doc) => {
            const data = doc.data(); const id = doc.id;
            lessonsById[id] = { id, ...data };
            if (!knowledgeBase[data.category]) knowledgeBase[data.category] = [];
            knowledgeBase[data.category].push({ id, ...data });
        });
    } catch (error) { console.error('Ошибка загрузки уроков:', error); }
}

async function loadAssignments() {
    if (!windowDb) return;
    try {
        const snapshot = await windowDb.collection('homework_assignments').get();
        assignmentsList = [];
        snapshot.forEach((doc) => { assignmentsList.push({ id: doc.id, ...doc.data() }); });
        assignmentsList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    } catch (error) {}
}

async function loadSubmissions() {
    if (!windowDb) return;
    try {
        const snapshot = await windowDb.collection('homework_submissions').get();
        submissionsList = [];
        snapshot.forEach((doc) => { submissionsList.push({ id: doc.id, ...doc.data() }); });
    } catch (error) {}
}

async function createAssignment(title, description) {
    if (!windowDb) return false;
    try {
        await windowDb.collection('homework_assignments').add({
            title: title, description: description,
            createdBy: currentUser.name, createdAt: new Date()
        });
        return true;
    } catch (error) { console.error('Ошибка создания:', error); return false; }
}

async function submitHomeworkToFirebase(assignmentId, content) {
    if (!windowDb) return false;
    try {
        await windowDb.collection('homework_submissions').add({
            assignmentId: assignmentId, studentName: currentUser.name,
            studentRank: currentUser.ранг, content: content,
            status: 'pending', submittedAt: new Date(),
            masterFeedback: '', reviewedAt: null
        });
        return true;
    } catch (error) { console.error('Ошибка отправки:', error); return false; }
}

async function updateSubmissionStatus(submissionId, status, feedback) {
    if (!windowDb) return false;
    try {
        await windowDb.collection('homework_submissions').doc(submissionId).update({
            status: status, masterFeedback: feedback, reviewedAt: new Date()
        });
        return true;
    } catch (error) { console.error('Ошибка обновления:', error); return false; }
}

async function loadCommentsForLesson(lessonId) {
    if (!windowDb || !lessonId) return [];
    try {
        const snapshot = await windowDb.collection('comments').where('lessonId', '==', lessonId).get();
        const comments = [];
        snapshot.forEach((doc) => { comments.push({ id: doc.id, ...doc.data() }); });
        comments.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        return comments;
    } catch (error) { return []; }
}

async function addCommentToFirebase(lessonId, text, type) {
    if (!windowDb || !lessonId) return false;
    try {
        await windowDb.collection('comments').add({
            lessonId: lessonId, text: text, type: type,
            authorName: currentUser.name, authorRank: currentUser.ранг, createdAt: new Date()
        });
        return true;
    } catch (error) { console.error('Ошибка добавления:', error); return false; }
}

async function updateCommentInFirebase(commentId, newText) {
    if (!windowDb || !commentId) return false;
    try {
        await windowDb.collection('comments').doc(commentId).update({ text: newText, updatedAt: new Date() });
        return true;
    } catch (error) { return false; }
}

async function deleteCommentFromFirebase(commentId) {
    if (!windowDb || !commentId) return false;
    try {
        await windowDb.collection('comments').doc(commentId).delete();
        return true;
    } catch (error) { return false; }
}

async function addLessonToFirebase(category, title, content, mediaUrl = '') {
    if (!windowDb) return false;
    try {
        await windowDb.collection('lessons').add({
            category, title, content, mediaUrl, createdAt: new Date(), addedBy: currentUser.name
        });
        return true;
    } catch (error) { return false; }
}

async function updateLessonInFirebase(lessonId, updates) {
    if (!windowDb || !lessonId) return false;
    try {
        await windowDb.collection('lessons').doc(lessonId).update(updates);
        return true;
    } catch (error) { return false; }
}

async function deleteLesson(lessonId) {
    if (!windowDb || !lessonId) return false;
    try {
        await windowDb.collection('lessons').doc(lessonId).delete();
        delete lessonsById[lessonId];
        return true;
    } catch (error) { return false; }
}

// ===== ЧАТ С МАСТЕРОМ =====
async function sendMessageToMaster(text) {
    if (!windowDb || !currentUser) return false;
    const masterName = currentUser.учитель;
    if (!masterName || masterName === 'отсутствует') {
        addMessage('<p>❌ У тебя нет назначенного Мастера!</p>');
        return false;
    }
    try {
        await windowDb.collection('messages').add({
            from: currentUser.name, to: masterName, text: text,
            timestamp: firebase.firestore.Timestamp.fromDate(new Date()), read: false
        });
        return true;
    } catch (error) {
        console.error('💥 Ошибка:', error);
        addMessage(`<p>❌ Ошибка отправки: ${error.message}</p>`);
        return false;
    }
}

async function loadChatWith(partnerName) {
    if (!windowDb || !currentUser) return [];
    try {
        const snap1 = await windowDb.collection('messages').where('from', '==', currentUser.name).where('to', '==', partnerName).get();
        const snap2 = await windowDb.collection('messages').where('from', '==', partnerName).where('to', '==', currentUser.name).get();
        const messages = [];
        snap1.forEach(doc => messages.push({ id: doc.id, ...doc.data() }));
        snap2.forEach(doc => messages.push({ id: doc.id, ...doc.data() }));
        messages.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
        return messages;
    } catch (error) {
        console.error('Ошибка загрузки чата:', error);
        return [];
    }
}

async function markAsRead(fromUser) {
    if (!windowDb || !currentUser) return;
    try {
        const snapshot = await windowDb.collection('messages').where('from', '==', fromUser).where('to', '==', currentUser.name).where('read', '==', false).get();
        const batch = windowDb.batch();
        snapshot.forEach(doc => { batch.update(doc.ref, { read: true }); });
        await batch.commit();
    } catch (error) { console.error('Ошибка отметки:', error); }
}

window.openMasterChat = async function() {
    if (!currentUser) return;
    chatContainer.classList.add('chat-open');
    if (!currentUser.учитель || currentUser.учитель === 'отсутствует') {
        await showMasterDashboard();
    } else {
        document.getElementById('main-input-wrapper').style.display = 'none';
        document.getElementById('master-chat-wrapper').style.display = 'block';
        const container = document.getElementById('master-chat-container');
        if (!container) return;
        container.innerHTML = '<p style="color:#6b5f4a; text-align:center;">Загрузка...</p>';
        const masterName = currentUser.учитель;
        if (masterName && masterName !== 'отсутствует') {
            const messages = await loadChatWith(masterName);
            if (messages.length === 0) {
                container.innerHTML = '<p style="color:#6b5f4a; text-align:center; font-style:italic;">Пока нет сообщений. Напиши первым!</p>';
            } else {
                container.innerHTML = '';
                messages.forEach(msg => {
                    const isMine = msg.from === currentUser.name;
                    const time = msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}) : '';
                    const bubble = document.createElement('div');
                    bubble.className = `chat-bubble ${isMine ? 'mine' : 'theirs'}`;
                    bubble.innerHTML = `<div class="bubble-text">${msg.text}</div><div class="bubble-time">${time}</div>`;
                    container.appendChild(bubble);
                });
                container.scrollTop = container.scrollHeight;
            }
            if (messages.length > 0) await markAsRead(masterName);
        }
    }
};

async function showMasterDashboard() {
    if (!windowDb) return;
    try {
        const snapshot = await windowDb.collection('messages').where('to', '==', currentUser.name).get();
        const studentsMap = new Map();
        snapshot.forEach(doc => {
            const data = doc.data();
            const studentName = data.from;
            if (!studentsMap.has(studentName)) {
                studentsMap.set(studentName, { name: studentName, lastMessage: data.text, timestamp: data.timestamp, unread: data.read === false });
            }
        });
        const students = Array.from(studentsMap.values());
        let html = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">`;
        html += `<h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">📋 Сообщения от учеников</h3>`;
        if (students.length === 0) {
            html += `<p style="color:#6b5f4a; text-align:center; font-style:italic;">Пока нет сообщений от учеников.</p>`;
        } else {
            students.forEach(student => {
                const time = student.timestamp ? new Date(student.timestamp.seconds * 1000).toLocaleString('ru-RU', {hour: '2-digit', minute: '2-digit'}) : '';
                const unreadBadge = student.unread ? '<span style="background:#ff6b6b; color:white; padding:2px 8px; border-radius:10px; font-size:0.8em; margin-left:10px;">NEW</span>' : '';
                html += `<div style="background:rgba(100,255,218,0.1); border:1px solid rgba(100,255,218,0.3); border-radius:10px; padding:15px; margin:10px 0; cursor:pointer;" onclick="window.openChatWithStudent(\'${student.name}\')">`;
                html += `<div style="display:flex; justify-content:space-between; align-items:center;">`;
                html += `<div style="font-size:1.15em; color:#64ffda; font-weight:bold;">👤 ${student.name} ${unreadBadge}</div>`;
                html += `<div style="color:#6b5f4a; font-size:0.9em;">${time}</div></div>`;
                html += `<div style="color:#a89b7e; margin-top:8px; font-style:italic;">"${student.lastMessage.substring(0, 50)}${student.lastMessage.length > 50 ? '...' : ''}"</div></div>`;
            });
        }
        html += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:15px; padding:12px;"> Вернуться в меню</button></div>`;
        addMessage(html);
    } catch (error) {
        console.error('Ошибка загрузки панели Мастера:', error);
        addMessage('<p>❌ Ошибка загрузки сообщений.</p>');
    }
}

window.openChatWithStudent = async function(studentName) {
    chatContainer.classList.add('chat-open');
    document.getElementById('main-input-wrapper').style.display = 'none';
    document.getElementById('master-chat-wrapper').style.display = 'block';
    const container = document.getElementById('master-chat-container');
    if (!container) return;
    container.innerHTML = '<p style="color:#6b5f4a; text-align:center;">Загрузка...</p>';
    try {
        const snap1 = await windowDb.collection('messages').where('from', '==', currentUser.name).where('to', '==', studentName).get();
        const snap2 = await windowDb.collection('messages').where('from', '==', studentName).where('to', '==', currentUser.name).get();
        const messages = [];
        snap1.forEach(doc => messages.push({ id: doc.id, ...doc.data() }));
        snap2.forEach(doc => messages.push({ id: doc.id, ...doc.data() }));
        messages.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
        if (messages.length === 0) {
            container.innerHTML = `<p style="color:#6b5f4a; text-align:center; font-style:italic;">Нет переписки с ${studentName}</p>`;
        } else {
            container.innerHTML = '';
            messages.forEach(msg => {
                const isMine = msg.from === currentUser.name;
                const time = msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}) : '';
                const bubble = document.createElement('div');
                bubble.className = `chat-bubble ${isMine ? 'mine' : 'theirs'}`;
                bubble.innerHTML = `<div class="bubble-text">${msg.text}</div><div class="bubble-time">${time}</div>`;
                container.appendChild(bubble);
            });
            container.scrollTop = container.scrollHeight;
        }
        const batch = windowDb.batch();
        messages.forEach(msg => {
            if (msg.from === studentName && msg.to === currentUser.name && msg.read === false) {
                batch.update(windowDb.collection('messages').doc(msg.id), { read: true });
            }
        });
        await batch.commit();
        window.currentChatPartner = studentName;
    } catch (error) {
        console.error('Ошибка:', error);
        container.innerHTML = '<p>❌ Ошибка загрузки переписки.</p>';
    }
};

window.sendMasterChatMessage = async function() {
    const input = document.getElementById('master-chat-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    if (window.currentChatPartner) {
        try {
            await windowDb.collection('messages').add({
                from: currentUser.name, to: window.currentChatPartner, text: text,
                timestamp: firebase.firestore.Timestamp.fromDate(new Date()), read: false
            });
            input.value = '';
            await window.openChatWithStudent(window.currentChatPartner);
        } catch (error) {
            console.error('Ошибка отправки:', error);
            addMessage('<p>❌ Ошибка отправки.</p>');
        }
    } else {
        const success = await sendMessageToMaster(text);
        if (success) {
            input.value = '';
            const masterName = currentUser.учитель;
            const messages = await loadChatWith(masterName);
            const container = document.getElementById('master-chat-container');
            if (container) {
                container.innerHTML = '';
                messages.forEach(msg => {
                    const isMine = msg.from === currentUser.name;
                    const time = msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}) : '';
                    const bubble = document.createElement('div');
                    bubble.className = `chat-bubble ${isMine ? 'mine' : 'theirs'}`;
                    bubble.innerHTML = `<div class="bubble-text">${msg.text}</div><div class="bubble-time">${time}</div>`;
                    container.appendChild(bubble);
                });
                container.scrollTop = container.scrollHeight;
            }
        }
    }
};

window.closeMasterChat = function() {
    chatContainer.classList.remove('chat-open');
    document.getElementById('main-input-wrapper').style.display = 'block';
    document.getElementById('master-chat-wrapper').style.display = 'none';
    window.currentChatPartner = null;
    showMainMenu();
};

// ===== УТИЛИТЫ =====
function parseUserInput(text) {
    const data = { name: '', ранг: '', учитель: '', пароль: '' };
    const parts = text.split(',');
    if (parts.length > 0) {
        const namePart = parts[0].trim().toLowerCase();
        data.name = namePart.replace(/(?:меня\s+)?(?:зовут|зову)\s+/i, '').trim();
    }
    if (parts.length > 1) {
        const rankPart = parts[1].trim().toLowerCase();
        const ranks = ['верховный магистр', 'старший падаван', 'старейшина', 'магистр', 'мастер', 'рыцарь', 'падаван', 'юнлинг', 'адепт'];
        for (let rank of ranks) { if (rankPart.includes(rank)) { data.ранг = rank; break; } }
    }
    const teacherMatch = text.match(/(?:учитель|учителя)\s+([^,]+),/i);
    if (teacherMatch) { data.учитель = teacherMatch[1].trim(); if (data.учитель.toLowerCase().includes('нет')) data.учитель = 'отсутствует'; }
    const passMatch = text.match(/(?:пароль|пароль:)\s*(.+)$/i);
    if (passMatch) {
        let pass = passMatch[1].trim().replace(/[—–\-]/g, '');
        pass = pass.replace(/I/g, 'i');
        data.пароль = pass;
    }
    return data;
}

function checkAccess(topic) {
    const topicAccess = {
        'ганн': ['адепт', 'юнлинг', 'падаван', 'старший падаван', 'рыцарь', 'мастер', 'магистр', 'верховный магистр', 'старейшина'],
        'берг': ['падаван', 'старший падаван', 'рыцарь', 'мастер', 'магистр', 'верховный магистр', 'старейшина'],
        'катарн': ['рыцарь', 'мастер', 'магистр', 'верховный магистр', 'старейшина'],
        'крайт': ['мастер', 'магистр', 'верховный магистр', 'старейшина']
    };
    return topicAccess[topic].includes(currentUser.ранг);
}

function isAdmin() { return currentUser && ['магистр', 'верховный магистр', 'старейшина'].includes(currentUser.ранг); }
function isMaster() { return currentUser && ['мастер', 'магистр', 'верховный магистр', 'старейшина'].includes(currentUser.ранг); }

// ===== ГЛАВНОЕ МЕНЮ =====
function showMainMenu() {
    const container = document.getElementById('chat-container');
    if (!container) return;
    container.innerHTML = '';
    let html = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">`;
    html += `<h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">🔮 Главное меню</h3>`;
    html += `<button class="menu-btn" onclick="window.showHomeworkBoard()"> Домашние задания</button>`;
    html += `<button class="menu-btn chat-btn" onclick="window.openMasterChat()">✉️ Написать Мастеру</button>`;
    html += `<button class="menu-btn" onclick="showTOC()"> Оглавление знаний</button>`;
    html += `<button class="menu-btn" onclick="window.showCouncilOfMasters()" style="background:rgba(100,255,218,0.15); border-color:rgba(100,255,218,0.4); color:#64ffda;">🏛️ Совет Мастеров</button>`;
    html += `<button class="menu-btn" onclick="window.showMembersList()">👥 Члены Ордена</button>`;
    html += `<button class="menu-btn" onclick="window.showProgressTable()">📊 Успеваемость</button>`;
    if (isAdmin()) {
        html += `<button class="menu-btn" onclick="window.showAdminPanel()" style="background:rgba(255,80,80,0.2); border-color:rgba(255,80,80,0.5); color:#ff6b6b;">⚙️ Админ-панель</button>`;
    }
    html += `<hr style="border-color:var(--border-color); margin:20px 0;">`;
    html += `<p style="color:var(--text-secondary); text-align:center; font-style:italic;">Выбери раздел или задай вопрос Акаше</p>`;
    html += `</div>`;
    const menuDiv = document.createElement('div');
    menuDiv.className = 'message akasha-message';
    menuDiv.innerHTML = html;
    container.appendChild(menuDiv);
    setTimeout(() => { container.scrollTop = container.scrollHeight; }, 50);
}

// ===== ДОМАШНИЕ ЗАДАНИЯ =====
window.showHomeworkBoard = async function() {
    const container = document.getElementById('chat-container');
    if (container) container.innerHTML = '';
    await loadAssignments();
    await loadSubmissions();
    let html = `<div class="homework-board">`;
    html += `<div class="homework-header">📝 Домашние задания Ордена</div>`;
    if (assignmentsList.length === 0) {
        html += `<p style="color:#6b5f4a; text-align:center; font-style:italic;">Заданий пока нет.</p>`;
        html += `<p style="color:#8bc34a; text-align:center; margin-top:20px;">💡 Мастер может создать первое задание!</p>`;
    } else {
        assignmentsList.forEach((hw) => {
            if (!hw) return;
            const hwTitle = hw.title || 'Без названия';
            const hwId = hw.id || '';
            if (!hwId) return;
            const hwSubmissions = submissionsList.filter(s => s.assignmentId === hwId);
            const pendingCount = hwSubmissions.filter(s => s.status === 'pending').length;
            const mySubmissions = submissionsList.filter(s => s.assignmentId === hwId && s.studentName === currentUser.name);
            const myLastSubmission = mySubmissions.length > 0 ? mySubmissions.sort((a, b) => (a.submittedAt?.seconds || 0) - (b.submittedAt?.seconds || 0))[0] : null;
            html += `<div class="hw-card"><div class="hw-title">${hwTitle}</div><div class="hw-desc">${hw.description || ''}</div>`;
            const dateStr = hw.createdAt ? new Date(hw.createdAt.seconds * 1000).toLocaleString('ru-RU') : 'дата неизвестна';
            html += `<div class="hw-meta"> ${hw.createdBy || 'неизвестно'} | 📅 ${dateStr}</div>`;
            if (myLastSubmission) {
                const statusEmoji = myLastSubmission.status === 'approved' ? '✅' : (myLastSubmission.status === 'needs_revision' ? '⚠️' : '');
                const statusText = myLastSubmission.status === 'approved' ? 'Одобрено' : (myLastSubmission.status === 'needs_revision' ? 'На доработку' : 'На проверке');
                const statusColor = myLastSubmission.status === 'approved' ? '#4caf50' : (myLastSubmission.status === 'needs_revision' ? '#ff9800' : '#2196f3');
                html += `<div style="margin:15px 0; padding:12px; background:rgba(${myLastSubmission.status === 'approved' ? '76,175,80' : (myLastSubmission.status === 'needs_revision' ? '255,152,0' : '33,150,243')},0.1); border-radius:8px; border-left:3px solid ${statusColor};">`;
                html += `<p style="color:${statusColor}; margin:0 0 8px 0; font-weight:bold;">${statusEmoji} Статус: ${statusText}</p>`;
                html += `<p style="color:var(--text-color); margin:0 0 8px 0; font-size:0.95em;"><strong>Мой ответ:</strong> ${myLastSubmission.content}</p>`;
                if (myLastSubmission.masterFeedback) html += `<p style="color:#64ffda; margin:0 0 8px 0; font-size:0.95em;"><strong>💬 Комментарий Мастера:</strong> ${myLastSubmission.masterFeedback}</p>`;
                const submitDate = myLastSubmission.submittedAt ? new Date(myLastSubmission.submittedAt.seconds * 1000).toLocaleString('ru-RU') : '';
                html += `<p style="color:#6b5f4a; margin:8px 0 0 0; font-size:0.85em; font-style:italic;"> Отправлено: ${submitDate}</p>`;
                if (myLastSubmission && myLastSubmission.id) {
                    html += `<div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
                        <button class="hw-btn" onclick="window.deleteMySubmission('${myLastSubmission.id}', '${hwId}')" 
                                style="background:rgba(255,80,80,0.2); color:#ff6b6b; border:1px solid rgba(255,80,80,0.4); flex:1; min-width:150px;">
                            🗑️ Удалить мой ответ
                        </button>
                    </div>`;
                }
                html += `</div>`;
            }
            if (isMaster()) {
                html += `<div style="margin:10px 0; padding:10px; background:rgba(255,165,0,0.1); border-radius:8px; border:1px solid rgba(255,165,0,0.3);">`;
                html += `<p style="color:#ffa500; margin:0;"> Ответов: ${hwSubmissions.length} | ⏳ На проверке: ${pendingCount}</p>`;
                html += `<div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">`;
                if (hwSubmissions.length > 0) {
                    html += `<button class="hw-btn" onclick="window.reviewSubmissions('${hwId}')" style="flex:1; min-width:150px; background:rgba(255,165,0,0.3); color:#ffa500;">🔍 Проверить ответы</button>`;
                }
                html += `<button class="hw-btn" onclick="window.deleteAssignment('${hwId}', '${hwTitle.replace(/'/g, "\\'")}')" 
                         style="flex:1; min-width:150px; background:rgba(255,80,80,0.2); color:#ff6b6b; border:1px solid rgba(255,80,80,0.4);">🗑️ Удалить задание</button>`;
                html += `</div></div>`;
            }
            if (!isMaster() || hw.createdBy !== currentUser.name) {
                const escapedTitle = hwTitle.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                html += `<div class="hw-actions"><button class="hw-btn submit" onclick="window.submitHomework('${hwId}', '${escapedTitle}')">📤 Отправить ответ</button></div>`;
            }
            html += `</div>`;
        });
    }
    if (isMaster()) html += `<button class="hw-btn create" onclick="window.startCreateAssignment()" style="width:100%; margin-top:20px; padding:15px;"> Создать новое задание</button>`;
    html += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:10px; padding:12px;"> Вернуться в меню</button></div>`;
    addMessage(html);
};

window.reviewSubmissions = function(assignmentId) {
    const container = document.getElementById('chat-container');
    if (container) container.innerHTML = '';
    const hw = assignmentsList.find(a => a.id === assignmentId);
    if (!hw) return;
    const hwSubmissions = submissionsList.filter(s => s.assignmentId === assignmentId);
    let html = `<div class="homework-board"><div class="homework-header">🔍 Проверка ответов: ${hw.title}</div>`;
    if (hwSubmissions.length === 0) html += `<p style="color:#6b5f4a; text-align:center;">Ответов пока нет.</p>`;
    else {
        hwSubmissions.forEach(sub => {
            const statusEmoji = sub.status === 'approved' ? '✅' : (sub.status === 'needs_revision' ? '⚠️' : '⏳');
            const statusText = sub.status === 'approved' ? 'Одобрено' : (sub.status === 'needs_revision' ? 'На доработку' : 'На проверке');
            html += `<div class="hw-card" style="border-left-color: ${sub.status === 'approved' ? '#4caf50' : (sub.status === 'needs_revision' ? '#ff9800' : '#2196f3')};">`;
            html += `<div class="hw-title">${statusEmoji} ${sub.studentName} <span style="font-size:0.8em; color:#a89b7e;">(${sub.studentRank})</span></div><div class="hw-desc">${sub.content}</div>`;
            const dateStr = sub.submittedAt ? new Date(sub.submittedAt.seconds * 1000).toLocaleString('ru-RU') : '';
            html += `<div class="hw-meta"> ${dateStr} | Статус: ${statusText}</div>`;
            if (sub.masterFeedback) html += `<div style="margin:10px 0; padding:10px; background:rgba(100,255,218,0.1); border-radius:8px;"><p style="color:#64ffda; margin:0;"><strong>💬 Комментарий Мастера:</strong> ${sub.masterFeedback}</p></div>`;
            html += `<div class="hw-actions"><button class="hw-btn" onclick="window.gradeSubmission('${sub.id}', '${hw.id}', 'approved')" style="background:rgba(76,175,80,0.3); color:#4caf50;">✅ Одобрить</button><button class="hw-btn" onclick="window.gradeSubmission('${sub.id}', '${hw.id}', 'needs_revision')" style="background:rgba(255,152,0,0.3); color:#ff9800;">⚠️ На доработку</button><button class="hw-btn" onclick="window.addFeedback('${sub.id}', '${hw.id}')" style="background:rgba(100,255,218,0.2); color:#64ffda;">💬 Комментарий</button></div></div>`;
        });
    }
    html += `<button class="hw-btn" onclick="window.showHomeworkBoard()" style="width:100%; margin-top:10px; padding:12px;">🔙 Назад к заданиям</button></div>`;
    addMessage(html);
};

window.startCreateAssignment = function() {
    addMessage(`<p>Создание нового задания.</p><p>Введите <strong>название</strong> задания (или <em>"отмена"</em>):</p>`);
    addLessonState = { step: 'create_hw_title' };
};

window.submitHomework = function(hwId, hwTitle) {
    if (!hwId || !hwTitle) { addMessage(`<p>❌ Ошибка: задание не найдено!</p>`); return; }
    addMessage(`<p>Отправка ответа на задание: <strong>${hwTitle}</strong></p><p>Напишите ваш ответ (или <em>"отмена"</em>):</p>`);
    addLessonState = { step: 'submit_hw_text', hwId: hwId, hwTitle: hwTitle };
};

// ===== УДАЛЕНИЕ ЗАДАНИЯ ДЛЯ МАСТЕРОВ =====
window.deleteAssignment = async function(assignmentId, assignmentTitle) {
    if (!windowDb) return showAlert('Ошибка', 'База данных не подключена!');
    if (!isMaster()) return showAlert('Доступ запрещён', 'Только для Мастеров и Магистров.');

    const submissionCount = submissionsList.filter(s => s.assignmentId === assignmentId).length;
    
    const confirmed = await askConfirm(
        '⚠️ ВНИМАНИЕ!', 
        `Вы действительно хотите УДАЛИТЬ задание "${assignmentTitle}"?\n\nЭто действие НЕОБРАТИМО!\n\nБудут удалены:\n• Само задание\n• ВСЕ ответы учеников (${submissionCount} шт.)`
    );
    
    if (!confirmed) return;

    const confirmText = await askPrompt('Подтверждение', 'Напишите "УДАЛИТЬ" для подтверждения:');
    if (confirmText !== 'УДАЛИТЬ') {
        return showAlert('Отменено', 'Удаление отменено.');
    }

    try {
        await windowDb.collection('homework_assignments').doc(assignmentId).delete();
        
        const submissionsSnap = await windowDb.collection('homework_submissions').where('assignmentId', '==', assignmentId).get();
        if (!submissionsSnap.empty) {
            const batch1 = windowDb.batch();
            submissionsSnap.forEach(doc => batch1.delete(doc.ref));
            await batch1.commit();
        }
        
        assignmentsList = assignmentsList.filter(a => a.id !== assignmentId);
        submissionsList = submissionsList.filter(s => s.assignmentId !== assignmentId);
        
        showAlert('Успех', `Задание "${assignmentTitle}" и все ответы (${submissionCount} шт.) удалены!`);
        window.showHomeworkBoard();
    } catch (error) {
        showAlert('Ошибка', `Не удалось удалить задание: ${error.message}`);
    }
};

// ===== ОГЛАВЛЕНИЕ =====
function showTOC() {
    const container = document.getElementById('chat-container');
    if (container) container.innerHTML = '';
    const availableSections = accessLevels[currentUser.ранг];
    const isAdminUser = isAdmin();
    let tocHTML = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:10px; padding:20px; margin:10px 0;"><h3 style="color:#64ffda; margin-bottom:20px; font-family:'Playfair Display',serif;">📚 Оглавление знаний Ордена</h3>`;
    const sections = [{ key: 'адепт', name: '1. Занятия для Адептов' }, { key: 'юнлинг', name: '2. Занятия для Юнлингов' }, { key: 'падаван', name: '3. Занятия для Падаванов' }, { key: 'рыцарь', name: '4. Занятия для Рыцарей' }, { key: 'мастер', name: '5. Занятия для Мастеров' }];
    sections.forEach(section => {
        if (availableSections.includes(section.key)) {
            tocHTML += `<div class="toc-section"><div class="toc-section-title">${section.name}</div>`;
            const lessons = knowledgeBase[section.key] || [];
            if (lessons.length === 0) tocHTML += `<div class="toc-empty">• Уроков пока нет</div>`;
            else lessons.forEach(lesson => { if (lesson.id) tocHTML += `<div class="toc-lesson-link" onclick="window.showLessonContent('${lesson.id}')">• ${lesson.title}</div>`; });
            tocHTML += `</div>`;
        }
    });
    if (isAdminUser) tocHTML += `<div class="toc-section"><div class="toc-section-title">6. Админ-панель</div><div class="toc-lesson-link" onclick="window.startAddLesson()">➕ Добавить новый урок</div></div>`;
    tocHTML += `</div><button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:10px; padding:12px;">🔙 Вернуться в меню</button>`;
    addMessage(tocHTML);
}

// ===== УРОКИ =====
async function showLessonContentWithReadButton(lessonId) {
    const container = document.getElementById('chat-container');
    if (container) container.innerHTML = '';
    if (!lessonId) { addMessage('<p>❌ Ошибка: нет ID урока!</p>'); return; }
    const lesson = lessonsById[lessonId];
    if (!lesson) { addMessage('<p>❌ Урок не найден.</p>'); return; }
    const isRead = await isLessonRead(lessonId);
    let html = `<h3 style="color:#64ffda; font-family:'Playfair Display',serif;">📖 ${lesson.title}</h3>`;
    html += `<p style="color:#a89b7e; font-size:0.9em; margin-bottom:15px;">Категория: <em>${lesson.category}</em></p>`;
    html += `<div style="line-height:1.9;">${lesson.content}</div>`;
    if (lesson.mediaUrl) {
        html += `<div style="margin-top:20px;">`;
        if (lesson.mediaUrl.includes('youtube.com') || lesson.mediaUrl.includes('rutube.ru')) html += `<iframe width="100%" height="315" src="${lesson.mediaUrl}" frameborder="0" allowfullscreen style="border-radius:10px;"></iframe>`;
        else if (lesson.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) html += `<img src="${lesson.mediaUrl}" style="max-width:100%; border-radius:10px; margin-top:10px;">`;
        else if (lesson.mediaUrl.match(/\.(mp4|webm|ogg)$/i)) html += `<video controls style="max-width:100%; margin-top:10px; border-radius:10px;"><source src="${lesson.mediaUrl}"></video>`;
        else html += `<a href="${lesson.mediaUrl}" target="_blank" rel="noopener noreferrer" style="color:#64ffda; text-decoration:underline;">🔗 Открыть медиа</a>`;
        html += `</div>`;
    }
    if (isRead) {
        html += `<button class="read-btn read" disabled>✅ Прочитано</button>`;
    } else {
        html += `<button class="read-btn" onclick="window.markLessonRead('${lessonId}')">👁️ Отметить как прочитанное</button>`;
    }
    const isAdminUser = isAdmin();
    if (isAdminUser) html += `<div style="margin-top:20px; display:flex; gap:10px; flex-wrap:wrap;"><button class="edit-btn" onclick="window.editLesson('${lesson.id}')">✏️ Редактировать</button><button class="delete-btn" onclick="window.confirmDeleteLesson('${lesson.id}')">🗑️ Удалить</button></div>`;
    html += `<div class="comments-section"><div class="comments-header">💬 Комментарии</div>`;
    const comments = await loadCommentsForLesson(lessonId);
    if (comments.length === 0) html += `<p style="color:#6b5f4a; font-style:italic;">Комментариев пока нет. Будь первым!</p>`;
    else {
        comments.forEach(comment => {
            const isMasterComment = comment.type === 'task';
            const isAuthor = comment.authorName === currentUser.name;
            const canDelete = isAuthor || isAdminUser;
            const canEdit = isAuthor;
            html += `<div class="comment-item ${isMasterComment ? 'master-comment' : ''}"><div class="comment-author ${isMasterComment ? 'master' : ''}">${comment.authorName}<span class="comment-type-badge ${isMasterComment ? 'badge-task' : 'badge-question'}">${isMasterComment ? '📝 Задание' : '💬 Комментарий'}</span></div><div class="comment-text">${comment.text}</div><div class="comment-meta">${comment.createdAt ? new Date(comment.createdAt.seconds * 1000).toLocaleString('ru-RU') : ''}</div>`;
            if (canEdit || canDelete) {
                html += `<div class="comment-actions">`;
                if (canEdit) html += `<button class="comment-edit-btn" onclick="window.editComment('${comment.id}', '${lesson.id}')">✏️ Изменить</button>`;
                if (canDelete) html += `<button class="comment-delete-btn" onclick="window.deleteComment('${comment.id}', '${lesson.id}')">🗑️ Удалить</button>`;
                html += `</div>`;
            }
            html += `</div>`;
        });
    }
    html += `<button class="comment-btn" onclick="window.startAddComment('${lesson.id}')">💬 Добавить комментарий</button></div><button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:10px; padding:12px;">🔙 Вернуться в меню</button>`;
    addMessage(html);
}

window.markLessonRead = async function(lessonId) {
    const success = await markLessonAsRead(lessonId);
    if (success) {
        addMessage('<p>✅ Урок отмечен как прочитанный!</p>');
        showLessonContentWithReadButton(lessonId);
    } else {
        addMessage('<p>❌ Ошибка отметки урока.</p>');
    }
};

window.showLessonContent = showLessonContentWithReadButton;

window.startAddComment = function(lessonId) {
    if (!lessonId) { addMessage('<p>❌ Ошибка!</p>'); return; }
    const isMasterUser = isMaster();
    if (isMasterUser) {
        addMessage(`<p>Какой тип комментария? Напиши:</p><p>• <em>"задание"</em> — задание от Мастера</p><p>• <em>"комментарий"</em> — обычный комментарий</p><p>• <em>"отмена"</em> — отменить</p>`);
        addLessonState = { step: 'ask_comment_type', lessonId: lessonId };
    } else {
        addMessage(`<p>Напиши свой комментарий (или <em>"отмена"</em>):</p>`);
        addLessonState = { step: 'add_comment_text', lessonId: lessonId, type: 'question' };
    }
};

window.editComment = function(commentId, lessonId) {
    addMessage(`<p>Введите новый текст (или <em>"отмена"</em>):</p>`);
    addLessonState = { step: 'edit_comment', commentId: commentId, lessonId: lessonId };
};

window.deleteComment = async function(commentId, lessonId) {
    const success = await deleteCommentFromFirebase(commentId);
    if (success) { addMessage(`<p>✅ Комментарий удалён!</p>`); showLessonContent(lessonId); }
    else { addMessage(`<p>❌ Ошибка.</p>`); }
};

window.editLesson = function(lessonId) {
    const lesson = lessonsById[lessonId];
    if (!lesson) return;
    addMessage(`<div style="background:rgba(100,255,218,0.1); border:1px solid rgba(100,255,218,0.3); border-radius:10px; padding:15px; margin:10px 0;"><p style="color:#64ffda; font-weight:bold; margin-bottom:10px;">⚠️ РЕДАКТИРОВАНИЕ УРОКА</p><p><strong>Название:</strong> ${lesson.title}</p><p><strong>Текст:</strong> ${lesson.content.substring(0, 100)}${lesson.content.length > 100 ? '...' : ''}</p><p><strong>Медиа:</strong> ${lesson.mediaUrl || 'нет'}</p></div><p>Что изменить? Напиши:</p><p>• <em>"название"</em>, <em>"текст"</em>, <em>"медиа"</em>, <em>"всё"</em> или <em>"отмена"</em></p>`);
    addLessonState = { step: 'edit_choose', lessonId: lessonId, currentData: lesson };
};

window.confirmDeleteLesson = async function(lessonId) {
    const lesson = lessonsById[lessonId];
    if (!lesson) return;
    addMessage(`<p>️ Удалить урок "<strong>${lesson.title}</strong>"?<br>Напиши <em>"да, удалить"</em> или <em>"отмена"</em>.</p>`);
    addLessonState = { step: 'confirm_delete', lessonId: lessonId, lessonTitle: lesson.title };
};

function startAddLesson() {
    addMessage('<p>📝 <strong>Добавление урока</strong></p><p>Для какого ранга?<br><em>адепт, юнлинг, падаван, рыцарь, мастер, магистр</em></p>');
    addLessonState = { step: 'category' };
}

// ===== FIND ANSWER =====
function findAnswer(question) {
    const q = question.toLowerCase().trim();
    if (addLessonState && addLessonState.step === 'create_hw_title') {
        if (q === 'отмена') { addLessonState = null; return '<p>❌ Создание отменено.</p>'; }
        addLessonState.hwTitle = question; addLessonState.step = 'create_hw_desc'; return '<p>Введите <strong>описание задания</strong> (или <em>"отмена"</em>):</p>';
    }
    if (addLessonState && addLessonState.step === 'create_hw_desc') {
        if (q === 'отмена') { addLessonState = null; return '<p>❌ Создание отменено.</p>'; }
        createAssignment(addLessonState.hwTitle, question).then(success => { if (success) { addMessage(`<p>✅ Задание "<strong>${addLessonState.hwTitle}</strong>" создано!</p>`); window.showHomeworkBoard(); } else { addMessage('<p>❌ Ошибка создания.</p>'); } });
        addLessonState = null; return '';
    }
    if (addLessonState && addLessonState.step === 'submit_hw_text') {
        if (q === 'отмена') { addLessonState = null; return '<p>❌ Отмена.</p>'; }
        const savedHwId = addLessonState.hwId; const savedHwTitle = addLessonState.hwTitle; addLessonState = null;
        submitHomeworkToFirebase(savedHwId, question).then(success => { if (success) { addMessage(`<p>✅ Ваш ответ на задание "<strong>${savedHwTitle}</strong>" отправлен Мастеру на проверку!</p>`); showMainMenu(); } else { addMessage('<p>❌ Ошибка отправки.</p>'); } });
        return '';
    }
    if (addLessonState && addLessonState.step === 'ask_comment_type') {
        if (q === 'отмена') { addLessonState = null; return ''; }
        if (q === 'задание' || q === 'task') { addLessonState.type = 'task'; addLessonState.step = 'add_comment_text'; return '<p>Напиши текст задания (или <em>"отмена"</em>):</p>'; }
        if (q === 'комментарий' || q === 'comment') { addLessonState.type = 'question'; addLessonState.step = 'add_comment_text'; return '<p>Напиши комментарий (или <em>"отмена"</em>):</p>'; }
        return '<p>Напиши <em>"задание"</em> или <em>"комментарий"</em>:</p>';
    }
    if (addLessonState && addLessonState.step === 'add_comment_text') {
        if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
        addCommentToFirebase(addLessonState.lessonId, question, addLessonState.type).then(success => { if (success) { addMessage(`<p>✅ Комментарий добавлен!</p>`); setTimeout(() => { showLessonContent(addLessonState.lessonId); }, 500); } else { addMessage('<p>❌ Ошибка.</p>'); } });
        addLessonState = null; return '';
    }
    if (addLessonState && addLessonState.step === 'edit_comment') {
        if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
        updateCommentInFirebase(addLessonState.commentId, question).then(success => { if (success) { addMessage(`<p>✅ Обновлён!</p>`); showLessonContent(addLessonState.lessonId); } else { addMessage('<p>❌ Ошибка.</p>'); } });
        addLessonState = null; return '';
    }
    if (addLessonState && addLessonState.step && addLessonState.step.startsWith('edit_')) {
        const lessonId = addLessonState.lessonId; const lesson = addLessonState.currentData;
        if (addLessonState.step === 'edit_choose') {
            if (q === 'отмена') { addLessonState = null; return ''; }
            if (q === 'название') { addLessonState.step = 'edit_title'; return `<p>Новое название (или <em>"пропустить"</em>):</p>`; }
            if (q === 'текст') { addLessonState.step = 'edit_content'; return `<p>Новый текст (или <em>"пропустить"</em>):</p>`; }
            if (q === 'медиа') { addLessonState.step = 'edit_media'; return `<p>Новая ссылка (или <em>"пропустить"</em>, <em>"нет"</em>):</p>`; }
            if (q === 'всё') { addLessonState.step = 'edit_title'; addLessonState.editAll = true; return `<p>Новое название (или <em>"пропустить"</em>):</p>`; }
            return '<p>Напиши: <em>название</em>, <em>текст</em>, <em>медиа</em>, <em>"всё"</em> или <em>"отмена"</em>.</p>';
        }
        if (addLessonState.step === 'edit_title') {
            if (q !== 'пропустить') addLessonState.newTitle = question; else addLessonState.newTitle = lesson.title;
            if (addLessonState.editAll) { addLessonState.step = 'edit_content'; return `<p>Новый текст (или <em>"пропустить"</em>):</p>`; }
            updateLessonInFirebase(lessonId, { title: addLessonState.newTitle }).then(s => { if (s) { addMessage(`<p>✅ Название изменено!</p>`); loadLessonsFromFirebase(); } else { addMessage('<p>❌ Ошибка.</p>'); } });
            addLessonState = null; return '';
        }
        if (addLessonState.step === 'edit_content') {
            if (q !== 'пропустить') addLessonState.newContent = question; else addLessonState.newContent = lesson.content;
            if (addLessonState.editAll) { addLessonState.step = 'edit_media'; return `<p>Новая ссылка (или <em>"пропустить"</em>, <em>"нет"</em>):</p>`; }
            updateLessonInFirebase(lessonId, { content: addLessonState.newContent }).then(s => { if (s) { addMessage(`<p>✅ Текст обновлён!</p>`); loadLessonsFromFirebase(); } else { addMessage('<p>❌ Ошибка.</p>'); } });
            addLessonState = null; return '';
        }
        if (addLessonState.step === 'edit_media') {
            let newMedia = q === 'пропустить' ? lesson.mediaUrl : (q === 'нет' ? '' : question);
            const updates = {};
            if (addLessonState.newTitle !== undefined) updates.title = addLessonState.newTitle;
            if (addLessonState.newContent !== undefined) updates.content = addLessonState.newContent;
            updates.mediaUrl = newMedia;
            updateLessonInFirebase(lessonId, updates).then(s => { if (s) { addMessage(`<p>✅ Урок обновлён!</p>`); loadLessonsFromFirebase(); } else { addMessage('<p>❌ Ошибка.</p>'); } });
            addLessonState = null; return '';
        }
    }
    if (addLessonState && currentUser && isAdmin()) {
        if (addLessonState.step === 'confirm_delete') {
            if (q === 'да, удалить' || q === 'да' || q === 'удалить') { deleteLesson(addLessonState.lessonId).then(s => { if (s) { addMessage(`<p>✅ Урок удалён!</p>`); loadLessonsFromFirebase(); } else { addMessage('<p>❌ Ошибка.</p>'); } }); }
            else { addMessage('<p>❌ Отменено.</p>'); }
            addLessonState = null; return '';
        }
        if (addLessonState.step === 'category') {
            const categories = ['адепт', 'юнлинг', 'падаван', 'рыцарь', 'мастер', 'магистр'];
            if (categories.includes(q)) { addLessonState.category = q; addLessonState.step = 'title'; return '<p>Название урока:</p>'; }
            else { return '<p>Выбери ранг.</p>'; }
        }
        if (addLessonState.step === 'title') { addLessonState.title = question; addLessonState.step = 'content'; return '<p>Текст урока:</p>'; }
        if (addLessonState.step === 'content') { addLessonState.content = question; addLessonState.step = 'media'; return '<p>Ссылка на медиа (или <em>нет</em>):</p>'; }
        if (addLessonState.step === 'media') {
            const mediaUrl = q === 'нет' ? '' : question;
            addLessonToFirebase(addLessonState.category, addLessonState.title, addLessonState.content, mediaUrl).then(s => { if (s) { addMessage(`<p>✅ Урок добавлен!</p>`); loadLessonsFromFirebase(); } else { addMessage('<p>❌ Ошибка.</p>'); } });
            addLessonState = null; return '';
        }
    }
    if (!currentUser) {
        if (question.includes(',') || q.includes('имя') || q.includes('ранг') || q.includes('пароль') || q.includes('учитель')) {
            const userData = parseUserInput(question);
            if (userData.name && userData.ранг && userData.пароль) {
                let foundUser = null;
                for (let key in usersDatabase) { 
                    const user = usersDatabase[key]; 
                    if (user.fullName.toLowerCase() === userData.name) { 
                        foundUser = user; 
                        break; 
                    } 
                }
                if (!foundUser) foundUser = usersDatabase[userData.name];
                
                if (foundUser && foundUser.ранг === userData.ранг && foundUser.пароль === userData.пароль) {
                    currentUser = { 
                        name: foundUser.fullName, 
                        ранг: foundUser.ранг, 
                        учитель: userData.учитель || foundUser.учитель 
                    };
                    saveUserToStorage();
                    updateLogoutButton();
                    loadLessonsFromFirebase();
                    loadAssignments();
                    loadSubmissions();
                    registerUserIfNeeded();
                    addMessage(getRankGreeting(currentUser));
                    showMainMenu();
                    return '';
                } else { 
                    return '<p>❌ Данные не найдены. Проверьте Имя, Ранг и Пароль.</p>'; 
                }
            } else { 
                return '<p>📋 Назови Имя, Ранг, Учителя и Пароль через запятую.</p>'; 
            }
        }
        return '<p>👋 Назови своё Имя, Ранг, Учителя и Пароль.</p>';
    }
    if (q.includes('выйти') || q.includes('logout')) { handleLogout(); return ''; }
    if (q.includes('очистить историю') || q.includes('очистить переписку')) { clearHistory(); chatContainer.innerHTML = ''; addMessage('<p>🧹 Очищено.</p>'); return ''; }
    if (q.includes('оглавлен') || q.includes('меню')) { showMainMenu(); return ''; }
    let knowledge = '';
    if (q.includes('ганн')) knowledge = checkAccess('ганн') ? (knowledgeBase['ганн'] ? knowledgeBase['ганн'].map(l => `<p><strong>${l.title}:</strong> ${l.content}</p>`).join('') : '<p>Пусто.</p>') : '<p>Недоступно.</p>';
    else if (q.includes('берг')) knowledge = checkAccess('берг') ? (knowledgeBase['берг'] ? knowledgeBase['берг'].map(l => `<p><strong>${l.title}:</strong> ${l.content}</p>`).join('') : '<p>Пусто.</p>') : '<p>Недоступно.</p>';
    else if (q.includes('катарн')) knowledge = checkAccess('катарн') ? (knowledgeBase['катарн'] ? knowledgeBase['катарн'].map(l => `<p><strong>${l.title}:</strong> ${l.content}</p>`).join('') : '<p>Пусто.</p>') : '<p>Недоступно.</p>';
    else if (q.includes('крайт')) knowledge = checkAccess('крайт') ? (knowledgeBase['крайт'] ? knowledgeBase['крайт'].map(l => `<p><strong>${l.title}:</strong> ${l.content}</p>`).join('') : '<p>Пусто.</p>') : '<p>Недоступно.</p>';
    else knowledge = '<p>Спроси о Кланах или напиши "оглавление".</p>';
    return knowledge;
}

async function handleSend() {
    const text = customTextarea.value.trim();
    if (!text) return;
    addMessage(text, true);
    customTextarea.value = '';
    const answer = await findAnswer(text);
    if (answer) addMessage(answer);
}

function handleLogout() {
    currentUser = null; saveUserToStorage(); updateLogoutButton();
    chatContainer.innerHTML = '';
    addMessage('<p>👋 До встречи.</p>');
}

function updateLogoutButton() {
    const btn = document.querySelector('.logout-btn');
    if (btn) btn.style.display = currentUser ? 'block' : 'none';
}

// ===== КЛАВИАТУРА =====
const layouts = {
    ru: [['й','ц','у','к','е','н','г','ш','щ','з','х','ъ'], ['ф','ы','в','а','п','р','о','л','д','ж','э'], ['shift','я','ч','с','м','и','т','ь','б','ю','backspace'], ['123', ',', 'enter', 'space']],
    en: [['q','w','e','r','t','y','u','i','o','p'], ['a','s','d','f','g','h','j','k','l'], ['shift','z','x','c','v','b','n','m','backspace'], ['123', ',', 'enter', 'space']],
    numbers: [['1','2','3','4','5','6','7','8','9','0'], ['-','/',':',';','(',')','$','&','@','"'], ['!','?','#','%','*','+','=','backspace'], ['abc', ',', 'enter', 'space']]
};

let currentLang = 'ru';
let currentMode = 'letters';
let isShift = false;
let isCaps = false;
let shiftTimeout = null;

function insertTextAtCursor(text) {
    const start = customTextarea.selectionStart;
    const end = customTextarea.selectionEnd;
    const value = customTextarea.value;
    customTextarea.value = value.substring(0, start) + text + value.substring(end);
    const newPos = start + text.length;
    customTextarea.setSelectionRange(newPos, newPos);
    customTextarea.focus();
}

function deleteCharAtCursor() {
    const start = customTextarea.selectionStart;
    const end = customTextarea.selectionEnd;
    const value = customTextarea.value;
    if (start === end && start > 0) {
        customTextarea.value = value.substring(0, start - 1) + value.substring(end);
        customTextarea.setSelectionRange(start - 1, start - 1);
    } else if (start !== end) {
        customTextarea.value = value.substring(0, start) + value.substring(end);
        customTextarea.setSelectionRange(start, start);
    }
    customTextarea.focus();
}

function renderKeyboard() {
    if (!customKeyboard) return;
    customKeyboard.innerHTML = '';
    let layout;
    if (currentMode === 'numbers') layout = layouts.numbers;
    else layout = currentLang === 'ru' ? layouts.ru : layouts.en;
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) langBtn.textContent = currentLang === 'ru' ? 'RU' : 'EN';
    layout.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        row.forEach(key => {
            const keyDiv = document.createElement('div');
            keyDiv.className = 'key';
            if (key === 'shift') {
                keyDiv.classList.add('special');
                keyDiv.textContent = isCaps ? '⇪' : '⇧';
                if (isCaps) keyDiv.classList.add('caps-active');
                let touchStartTime = 0;
                keyDiv.addEventListener('touchstart', (e) => { e.preventDefault(); touchStartTime = Date.now(); keyDiv.classList.add('pressed'); }, { passive: false });
                keyDiv.addEventListener('touchend', (e) => {
                    e.preventDefault(); keyDiv.classList.remove('pressed');
                    const touchDuration = Date.now() - touchStartTime;
                    if (touchDuration < 200) {
                        clearTimeout(shiftTimeout);
                        if (isCaps) { isCaps = false; isShift = false; } else { isShift = !isShift; shiftTimeout = setTimeout(() => { isShift = false; renderKeyboard(); }, 2000); }
                    } else { isCaps = !isCaps; isShift = false; }
                    renderKeyboard();
                    if (navigator.vibrate) navigator.vibrate(10);
                });
            } else if (key === '123' || key === 'abc') {
                keyDiv.classList.add('special');
                keyDiv.textContent = currentMode === 'letters' ? '123' : (currentLang === 'ru' ? 'RU' : 'EN');
                keyDiv.addEventListener('touchstart', (e) => { e.preventDefault(); keyDiv.classList.add('pressed'); toggleMode(); }, { passive: false });
                keyDiv.addEventListener('touchend', () => keyDiv.classList.remove('pressed'));
            } else if (key === ',') {
                keyDiv.textContent = ',';
                keyDiv.addEventListener('touchstart', (e) => { e.preventDefault(); keyDiv.classList.add('pressed'); insertTextAtCursor(','); }, { passive: false });
                keyDiv.addEventListener('touchend', () => keyDiv.classList.remove('pressed'));
            } else if (key === 'backspace') {
                keyDiv.classList.add('special');
                keyDiv.textContent = '⌫';
                keyDiv.addEventListener('touchstart', (e) => { e.preventDefault(); keyDiv.classList.add('pressed'); deleteCharAtCursor(); }, { passive: false });
                keyDiv.addEventListener('touchend', () => keyDiv.classList.remove('pressed'));
            } else if (key === 'space') {
                keyDiv.classList.add('space');
                keyDiv.addEventListener('touchstart', (e) => { e.preventDefault(); keyDiv.classList.add('pressed'); insertTextAtCursor(' '); }, { passive: false });
                keyDiv.addEventListener('touchend', () => keyDiv.classList.remove('pressed'));
            } else if (key === 'enter') {
                keyDiv.classList.add('enter');
                keyDiv.textContent = '↵';
                keyDiv.addEventListener('touchstart', (e) => { e.preventDefault(); keyDiv.classList.add('pressed'); insertTextAtCursor('\n'); }, { passive: false });
                keyDiv.addEventListener('touchend', () => keyDiv.classList.remove('pressed'));
            } else {
                let displayChar = key;
                if (currentMode === 'letters' && /^[а-яёa-z]$/.test(key)) displayChar = (isShift || isCaps) ? key.toUpperCase() : key;
                keyDiv.textContent = displayChar;
                keyDiv.addEventListener('touchstart', (e) => { e.preventDefault(); keyDiv.classList.add('pressed'); insertTextAtCursor(displayChar); if (isShift && !isCaps) { isShift = false; renderKeyboard(); } }, { passive: false });
                keyDiv.addEventListener('touchend', () => keyDiv.classList.remove('pressed'));
            }
            rowDiv.appendChild(keyDiv);
        });
        customKeyboard.appendChild(rowDiv);
    });
}

function toggleLanguage() {
    currentLang = currentLang === 'ru' ? 'en' : 'ru';
    currentMode = 'letters';
    isShift = false; isCaps = false;
    renderKeyboard();
    if (navigator.vibrate) navigator.vibrate(10);
}

function toggleMode() {
    if (currentMode === 'letters') currentMode = 'numbers';
    else currentMode = 'letters';
    isShift = false; isCaps = false;
    renderKeyboard();
    if (navigator.vibrate) navigator.vibrate(10);
}

window.toggleLanguage = toggleLanguage;

customTextarea.addEventListener('focus', () => {
    customTextarea.style.borderColor = 'rgba(100, 255, 218, 0.6)';
    customTextarea.style.boxShadow = '0 0 10px rgba(100, 255, 218, 0.2)';
});

customTextarea.addEventListener('blur', () => {
    customTextarea.style.borderColor = 'var(--border-color)';
    customTextarea.style.boxShadow = 'none';
});

customTextarea.addEventListener('paste', (e) => {
    e.preventDefault();
    insertTextAtCursor(e.clipboardData.getData('text'));
});

customTextarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); insertTextAtCursor('\n'); }
    else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
});

// ===== НОВЫЙ ДВИЖОК МОДАЛЬНЫХ ОКОН (НА ПРОМИСАХ) =====
function showCustomModal(title, bodyHTML, buttons) {
    const modal = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer');

    if (!modal || !modalTitle || !modalBody || !modalFooter) return;

    modalTitle.textContent = title || 'Сообщение';
    modalBody.innerHTML = bodyHTML || '';
    modalFooter.innerHTML = '';

    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = btn.class || 'hw-btn';
        button.textContent = btn.text;
        if (btn.style) button.style.cssText = btn.style;

        button.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (btn.action) btn.action();
            closeCustomModal();
        };
        modalFooter.appendChild(button);
    });

    modal.style.display = 'flex';
}

function closeCustomModal() {
    const modal = document.getElementById('custom-modal');
    if (modal) {
        modal.style.display = 'none';
        if (currentModalResolve) {
            currentModalResolve(null);
            currentModalResolve = null;
        }
    }
}

document.addEventListener('click', (e) => {
    const modal = document.getElementById('custom-modal');
    if (modal && e.target === modal) {
        closeCustomModal();
    }
});

// === ПРОСТЫЕ ФУНКЦИИ-ПОМОЩНИКИ ===
function askPrompt(title, message, defaultValue = '') {
    return new Promise((resolve) => {
        currentModalResolve = resolve;
        const value = String(defaultValue || '');
        
        showCustomModal(title,
            `<p>${message}</p>
             <input type="text" id="modal-prompt-input" class="modal-input"
                    value="${value}"
                    autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">`,
            [
                { text: 'Отмена', class: 'hw-btn', action: () => resolve(null) },
                { text: 'OK', class: 'hw-btn', style: 'background:rgba(100,255,218,0.3); color:#64ffda;', 
                  action: () => {
                      const input = document.getElementById('modal-prompt-input');
                      resolve(input ? input.value : '');
                  }
                }
            ]
        );

        setTimeout(() => {
            const input = document.getElementById('modal-prompt-input');
            if (input) { input.focus(); input.select(); }
        }, 100);
    });
}

function askConfirm(title, message) {
    return new Promise((resolve) => {
        currentModalResolve = resolve;
        showCustomModal(title, `<p>${message}</p>`, [
            { text: 'Отмена', class: 'hw-btn', action: () => resolve(false) },
            { text: 'Подтвердить', class: 'hw-btn', style: 'background:rgba(255,80,80,0.3); color:#ff6b6b;', action: () => resolve(true) }
        ]);
    });
}

function showAlert(title, message) {
    return new Promise((resolve) => {
        showCustomModal(title, `<p>${message}</p>`, [
            { text: 'OK', class: 'hw-btn', action: () => resolve() }
        ]);
    });
}

// ===== НОВЫЕ ФУНКЦИИ =====
async function isUserBlocked(userName) {
    if (!windowDb) return false;
    try {
        const doc = await windowDb.collection('blocked_users').doc(userName).get();
        return doc.exists && doc.data().blocked === true;
    } catch (error) { return false; }
}

async function blockUserInDb(userName, reason) {
    if (!windowDb) return false;
    try {
        await windowDb.collection('blocked_users').doc(userName).set({
            blocked: true, reason: reason, blockedBy: currentUser.name,
            blockedAt: firebase.firestore.Timestamp.fromDate(new Date())
        }, { merge: true });
        return true;
    } catch (error) { console.error('Ошибка блокировки:', error); return false; }
}

async function unblockUserInDb(userName) {
    if (!windowDb) return false;
    try {
        await windowDb.collection('blocked_users').doc(userName).update({
            blocked: false, unblockedAt: firebase.firestore.Timestamp.fromDate(new Date())
        });
        return true;
    } catch (error) { console.error('Ошибка разблокировки:', error); return false; }
}

async function markLessonAsRead(lessonId) {
    if (!windowDb || !currentUser) return false;
    try {
        await windowDb.collection('lesson_reads').doc(`${currentUser.name}_${lessonId}`).set({
            userId: currentUser.name, lessonId: lessonId,
            readAt: firebase.firestore.Timestamp.fromDate(new Date()), userRank: currentUser.ранг
        }, { merge: true });
        return true;
    } catch (error) { console.error('Ошибка отметки:', error); return false; }
}

async function isLessonRead(lessonId) {
    if (!windowDb || !currentUser) return false;
    try {
        const doc = await windowDb.collection('lesson_reads').doc(`${currentUser.name}_${lessonId}`).get();
        return doc.exists;
    } catch (error) { return false; }
}

async function getAllLessonReads() {
    if (!windowDb) return [];
    try {
        const snapshot = await windowDb.collection('lesson_reads').get();
        const reads = [];
        snapshot.forEach(doc => reads.push({ id: doc.id, ...doc.data() }));
        return reads;
    } catch (error) { return []; }
}

async function getBlockedUsers() {
    if (!windowDb) return [];
    try {
        const snapshot = await windowDb.collection('blocked_users').where('blocked', '==', true).get();
        const blocked = [];
        snapshot.forEach(doc => blocked.push({ id: doc.id, ...doc.data() }));
        return blocked;
    } catch (error) { return []; }
}

async function getUserRegistrationDate(userName) {
    if (!windowDb) return null;
    try {
        const doc = await windowDb.collection('user_registrations').doc(userName).get();
        if (doc.exists && doc.data().registeredAt) {
            return doc.data().registeredAt.toDate();
        } else {
            return null;
        }
    } catch (error) { 
        console.error('Ошибка получения даты регистрации:', error); 
        return null; 
    }
}

async function getUserAdjustments(userName) {
    if (!windowDb) return { adjustedLessons: 0, adjustedHomework: 0, reason: '' };
    try {
        const doc = await windowDb.collection('manual_adjustments').doc(userName).get();
        if (doc.exists) return doc.data();
        return { adjustedLessons: 0, adjustedHomework: 0, reason: '' };
    } catch (error) { return { adjustedLessons: 0, adjustedHomework: 0, reason: '' }; }
}

async function saveManualAdjustment(userName, lessons, homework, reason) {
    if (!windowDb) { console.error('❌ Firestore не доступен'); return false; }
    try {
        await windowDb.collection('manual_adjustments').doc(userName).set({
            userName: userName, adjustedLessons: parseInt(lessons) || 0,
            adjustedHomework: parseInt(homework) || 0, reason: reason,
            adjustedBy: currentUser.name, adjustedAt: firebase.firestore.Timestamp.fromDate(new Date())
        }, { merge: true });
        return true;
    } catch (error) { console.error('❌ Ошибка сохранения корректировки:', error); return false; }
}

function calculateGrade(lessonsRead, homeworkDone, totalLessons, totalHomework, adjLessons, adjHomework) {
    const realScore = lessonsRead + homeworkDone;
    const adjustedScore = realScore + adjLessons + adjHomework;
    const maxScore = totalLessons + totalHomework;
    if (maxScore === 0) return { percent: 0, grade: '—', gradeColor: '#6b5f4a' };
    const percent = Math.min(100, Math.round((adjustedScore / maxScore) * 100));
    let grade, gradeColor;
    if (percent >= 90) { grade = '🏆 Отлично'; gradeColor = '#ffd700'; }
    else if (percent >= 70) { grade = '✨ Хорошо'; gradeColor = '#4caf50'; }
    else if (percent >= 50) { grade = '✅ Удовлетворительно'; gradeColor = '#ff9800'; }
    else { grade = '❌ Плохо'; gradeColor = '#ff6b6b'; }
    return { percent, grade, gradeColor, realScore, adjustedScore, maxScore };
}

function formatTimeInAkasha(regDate) {
    const now = new Date();
    const diff = now - regDate;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days} дн. ${hours} ч.`;
    if (hours > 0) return `${hours} ч.`;
    return 'только что';
}

async function registerUserIfNeeded() {
    if (!currentUser || !windowDb) return;
    try {
        const doc = await windowDb.collection('user_registrations').doc(currentUser.name).get();
        if (!doc.exists) {
            await windowDb.collection('user_registrations').doc(currentUser.name).set({
                userName: currentUser.name, userRank: currentUser.ранг,
                registeredAt: firebase.firestore.Timestamp.fromDate(new Date())
            });
            console.log('✅ Пользователь зарегистрирован:', currentUser.name);
        }
    } catch (error) { console.error('Ошибка регистрации:', error); }
}

// ===== ИСПРАВЛЕННЫЕ ДЕЙСТВИЯ (БЕЗ ВЛОЖЕННОСТИ) =====
window.deleteMySubmission = async function(submissionId, assignmentId) {
    const confirmed = await askConfirm('Подтверждение', '⚠️ Вы уверены? Это действие нельзя отменить!');
    if (!confirmed) return;
    
    try {
        await windowDb.collection('homework_submissions').doc(submissionId).delete();
        showAlert('Успех', 'Ваш ответ удалён!');
        window.showHomeworkBoard();
    } catch (error) { 
        showAlert('Ошибка', `Не удалось удалить: ${error.message}`); 
    }
};

window.gradeSubmission = async function(submissionId, assignmentId, status) {
    const feedback = await askPrompt('Комментарий', 'Введите комментарий (или оставьте пустым):', '');
    if (feedback === null) return;
    
    const success = await updateSubmissionStatus(submissionId, status, feedback);
    if (success) { 
        showAlert('Успех', 'Статус обновлён!'); 
        window.reviewSubmissions(assignmentId); 
    } else { 
        showAlert('Ошибка', 'Ошибка обновления статуса.'); 
    }
};

window.addFeedback = async function(submissionId, assignmentId) {
    const feedback = await askPrompt('Комментарий Мастера', 'Введите комментарий Мастера:', '');
    if (!feedback) return;
    
    const sub = submissionsList.find(s => s.id === submissionId);
    const currentFeedback = sub.masterFeedback || '';
    const newFeedback = currentFeedback ? currentFeedback + '\n\n' + feedback : feedback;
    
    const success = await updateSubmissionStatus(submissionId, sub.status, newFeedback);
    if (success) { 
        showAlert('Успех', 'Комментарий добавлен!'); 
        window.reviewSubmissions(assignmentId); 
    } else { 
        showAlert('Ошибка', 'Ошибка добавления комментария.'); 
    }
};

window.blockUser = async function(userName) {
    if (!windowDb) return showAlert('Ошибка', 'База данных не подключена!');
    if (!currentUser || !isAdmin()) return showAlert('Доступ запрещён', 'Только для Магистров.');

    const reason = await askPrompt('Блокировка', `Причина блокировки ${userName}:`);
    if (!reason) return; 

    try {
        const success = await blockUserInDb(userName, reason);
        if (success) { 
            showAlert('Успех', `Пользователь ${userName} заблокирован.`);
            window.showAdminPanel(); 
        } else { 
            showAlert('Ошибка', 'Не удалось заблокировать пользователя.');
        }
    } catch (error) {
        showAlert('Ошибка', `Не удалось заблокировать: ${error.message}`);
    }
};

window.unblockUser = async function(userName) {
    if (!windowDb) return showAlert('Ошибка', 'База данных не подключена!');
    
    const confirmed = await askConfirm('Разблокировка', `Разблокировать пользователя ${userName}?`);
    if (!confirmed) return;

    try {
        const success = await unblockUserInDb(userName);
        if (success) { 
            showAlert('Успех', `Пользователь ${userName} разблокирован.`);
            window.showAdminPanel();
        } else { 
            showAlert('Ошибка', 'Не удалось разблокировать пользователя.');
        }
    } catch (error) {
        showAlert('Ошибка', `Не удалось разблокировать: ${error.message}`);
    }
};

window.openAdjustmentForm = async function(userName) {
    if (!windowDb) return showAlert('Ошибка', 'База данных не подключена!');

    try {
        const adjustments = await getUserAdjustments(userName);
        const currentLessons = adjustments.adjustedLessons || 0;
        const currentHomework = adjustments.adjustedHomework || 0;
        const currentReason = adjustments.reason || '';

        const lessons = await askPrompt('Корректировка', `Дополнительных уроков для ${userName} (сейчас: ${currentLessons}):`, String(currentLessons));
        if (lessons === null) return;

        const homework = await askPrompt('Корректировка', `Дополнительных ДЗ для ${userName} (сейчас: ${currentHomework}):`, String(currentHomework));
        if (homework === null) return;

        const reason = await askPrompt('Корректировка', `Причина корректировки:`, currentReason);
        if (reason === null) return;

        const success = await saveManualAdjustment(userName, lessons, homework, reason);
        if (success) {
            showAlert('Успех', `Корректировка для ${userName} сохранена!`);
            window.showAdjustmentPanel();
        } else {
            showAlert('Ошибка', 'Не удалось сохранить корректировку.');
        }
    } catch (error) {
        showAlert('Ошибка', `Ошибка: ${error.message}`);
    }
};

// ===== НОВЫЕ ФУНКЦИИ АДМИН-ПАНЕЛИ =====
window.addNewMember = async function() {
    if (!windowDb) return showAlert('Ошибка', 'База данных не подключена!');
    if (!isAdmin()) return showAlert('Доступ запрещён', 'Только для Магистров.');

    const name = await askPrompt('Новый член Ордена', 'Введите полное имя (например: "Иван Иванов"):');
    if (!name) return;

    const rank = await askPrompt('Ранг', 'Введите ранг (адепт, юнлинг, падаван, старший падаван, рыцарь, мастер, магистр, верховный магистр, старейшина):');
    if (!rank) return;

    const teacher = await askPrompt('Учитель', 'Введите имя Учителя (или "нет", "отсутствует"):');
    if (!teacher) return;

    const password = await askPrompt('Пароль', 'Введите пароль (минимум 6 символов):');
    if (!password || password.length < 6) {
        return showAlert('Ошибка', 'Пароль должен быть не менее 6 символов!');
    }

    const specialTitle = await askPrompt('Специальное звание', 'Введите специальное звание (или оставьте пустым):', '');
    const description = await askPrompt('Описание', 'Введите описание/биографию (или оставьте пустым):', '');

    try {
        const normalizedName = name.toLowerCase().trim();
        if (usersDatabase[normalizedName]) {
            return showAlert('Ошибка', `Пользователь "${name}" уже существует!`);
        }

        await windowDb.collection('users').doc(normalizedName).set({
            fullName: name,
            rank: rank.toLowerCase().trim(),
            teacher: teacher.toLowerCase().trim() === 'нет' || teacher.toLowerCase().trim() === 'отсутствует' ? 'отсутствует' : teacher,
            password: password,
            specialTitle: specialTitle || '',
            description: description || '',
            createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
            createdBy: currentUser.name
        });

        usersDatabase[normalizedName] = {
            fullName: name,
            ранг: rank.toLowerCase().trim(),
            учитель: teacher.toLowerCase().trim() === 'нет' || teacher.toLowerCase().trim() === 'отсутствует' ? 'отсутствует' : teacher,
            пароль: password,
            specialTitle: specialTitle || '',
            description: description || ''
        };

        showAlert('Успех', `Пользователь "${name}" успешно добавлен в Орден!`);
        window.showAdminPanel();
    } catch (error) {
        showAlert('Ошибка', `Не удалось добавить пользователя: ${error.message}`);
    }
};

window.excludeJedi = async function(userName) {
    if (!windowDb) return showAlert('Ошибка', 'База данных не подключена!');
    if (!isAdmin()) return showAlert('Доступ запрещён', 'Только для Магистров.');

    const confirmed = await askConfirm(
        '⚠️ ВНИМАНИЕ!', 
        `Вы действительно хотите ИСКЛЮЧИТЬ ${userName} из Ордена?\n\nЭто действие НЕОБРАТИМО! Все данные будут удалены.`
    );
    
    if (!confirmed) return;

    const confirmText = await askPrompt('Подтверждение', 'Напишите "ИСКЛЮЧИТЬ" для подтверждения:');
    if (confirmText !== 'ИСКЛЮЧИТЬ') {
        return showAlert('Отменено', 'Исключение отменено.');
    }

    try {
        const normalizedName = userName.toLowerCase().trim();
        
        await windowDb.collection('users').doc(normalizedName).delete();
        
        // Удаляем связанные данные
        const readsSnap = await windowDb.collection('lesson_reads').where('userId', '==', userName).get();
        if (!readsSnap.empty) {
            const batch1 = windowDb.batch();
            readsSnap.forEach(doc => batch1.delete(doc.ref));
            await batch1.commit();
        }
        
        const subsSnap = await windowDb.collection('homework_submissions').where('studentName', '==', userName).get();
        if (!subsSnap.empty) {
            const batch2 = windowDb.batch();
            subsSnap.forEach(doc => batch2.delete(doc.ref));
            await batch2.commit();
        }
        
        const commentsSnap = await windowDb.collection('comments').where('authorName', '==', userName).get();
        if (!commentsSnap.empty) {
            const batch3 = windowDb.batch();
            commentsSnap.forEach(doc => batch3.delete(doc.ref));
            await batch3.commit();
        }

        delete usersDatabase[normalizedName];

        showAlert('Успех', `${userName} исключён из Ордена Вольных Джедаев.`);
        window.showAdminPanel();
    } catch (error) {
        showAlert('Ошибка', `Не удалось исключить джедая: ${error.message}`);
    }
};

// ===== СОВЕТ МАСТЕРОВ =====
window.showCouncilOfMasters = async function() {
    const container = document.getElementById('chat-container');
    if (container) container.innerHTML = '';
    const blockedUsers = await getBlockedUsers();
    const blockedNames = blockedUsers.map(u => u.id);
    let html = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">`;
    html += `<h3 class="council-title">🏛️ Совет Мастеров</h3>`;
    html += `<p class="council-subtitle">Руководство Ордена Вольных Джедаев</p>`;
    const supremeMaster = Object.values(usersDatabase).find(u => u.ранг === 'верховный магистр' && u.specialTitle);
    if (supremeMaster) {
        const isBlocked = blockedNames.includes(supremeMaster.fullName);
        html += `<div class="council-supreme"><div style="display:flex; align-items:center; gap:15px; margin-bottom:10px;">`;
        html += `<div style="font-size:2em;">🔮</div><div style="flex:1;">`;
        html += `<div style="color:#64ffda; font-family:'Playfair Display',serif; font-size:1.3em; font-weight:700;">${supremeMaster.fullName}</div>`;
        html += `<div style="color:#8bc34a; font-size:1em; font-weight:600; margin-top:3px;">${supremeMaster.specialTitle}</div></div>`;
        html += `<div class="member-status ${isBlocked ? 'status-blocked' : 'status-active'}">${isBlocked ? '🚫 Заблок.' : '✅ Активен'}</div></div>`;
        if (supremeMaster.description) html += `<div style="color:var(--text-color); font-size:0.95em; line-height:1.5; padding-left:50px; font-style:italic;">${supremeMaster.description}</div>`;
        html += `</div>`;
    }
    html += `<h4 class="council-master-header"> 👑 Мастера</h4>`;
    const masters = Object.values(usersDatabase).filter(u => u.ранг === 'мастер' && u.specialTitle);
    masters.forEach(master => {
        const isBlocked = blockedNames.includes(master.fullName);
        html += `<div class="council-master-card"><div style="display:flex; align-items:center; gap:15px; margin-bottom:10px;">`;
        html += `<div style="font-size:2em;">⚔️</div><div style="flex:1;">`;
        html += `<div style="color:#64ffda; font-family:'Playfair Display',serif; font-size:1.3em; font-weight:700;">${master.fullName}</div>`;
        html += `<div style="color:#8bc34a; font-size:1em; font-weight:600; margin-top:3px;">${master.specialTitle}</div></div>`;
        html += `<div class="member-status ${isBlocked ? 'status-blocked' : 'status-active'}">${isBlocked ? '🚫 Заблок.' : '✅ Активен'}</div></div>`;
        if (master.description) html += `<div style="color:var(--text-color); font-size:0.95em; line-height:1.5; padding-left:50px; font-style:italic;">${master.description}</div>`;
        html += `</div>`;
    });
    html += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:20px; padding:12px;">🔙 Вернуться в меню</button></div>`;
    addMessage(html);
};

// ===== СПИСОК ЧЛЕНОВ ОРДЕНА =====
window.showMembersList = async function() {
    const container = document.getElementById('chat-container');
    if (container) container.innerHTML = '';
    const blockedUsers = await getBlockedUsers();
    const blockedNames = blockedUsers.map(u => u.id);
    let html = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">`;
    html += `<h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">👥 Члены Ордена</h3>`;
    html += `<p style="color:var(--text-secondary); text-align:center; margin-bottom:20px; font-style:italic;">От Адепта до Старейшины</p>`;
    const ranks = ['старейшина', 'верховный магистр', 'магистр', 'мастер', 'рыцарь', 'старший падаван', 'падаван', 'юнлинг', 'адепт'];
    for (const rank of ranks) {
        const members = Object.values(usersDatabase).filter(u => u.ранг === rank);
        if (members.length > 0) {
            html += `<div style="margin:20px 0;">`;
            html += `<h4 style="color:var(--accent-color); font-family:'Playfair Display',serif; font-size:1.3em; margin-bottom:10px; border-bottom:2px solid var(--border-color); padding-bottom:8px;">${rank}</h4>`;
            for (const member of members) {
                const isBlocked = blockedNames.includes(member.fullName);
                const teacherName = member.учитель && member.учитель !== 'отсутствует' ? member.учитель : 'нет';
                const regDate = await getUserRegistrationDate(member.fullName);
                const timeInAkasha = regDate ? formatTimeInAkasha(regDate) : '—';
                html += `<div class="member-card"><div style="flex:1;">`;
                html += `<div class="member-name">${member.fullName}</div>`;
                html += `<div style="color:var(--text-secondary); font-size:0.9em; margin-top:3px;">🧙‍♂️ Учитель: ${teacherName}</div>`;
                html += `<div style="color:var(--text-secondary); font-size:0.85em; margin-top:2px;">⏱️ В Акаше: ${timeInAkasha}</div></div>`;
                html += `<div class="member-status ${isBlocked ? 'status-blocked' : 'status-active'}">${isBlocked ? '🚫 Заблок.' : '✅ Активен'}</div></div>`;
            }
            html += `</div>`;
        }
    }
    html += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:15px; padding:12px;">🔙 Вернуться в меню</button></div>`;
    addMessage(html);
};

// ===== ТАБЛИЦА УСПЕВАЕМОСТИ =====
window.showProgressTable = async function() {
    const container = document.getElementById('chat-container');
    if (container) container.innerHTML = '';
    const reads = await getAllLessonReads();
    const isMasterUser = isMaster();
    const totalLessons = Object.keys(lessonsById).length;
    const totalHomework = assignmentsList.length;
    let html = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">`;
    html += `<h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">📊 Таблица успеваемости Ордена</h3>`;
    html += `<p style="color:var(--text-secondary); text-align:center; margin-bottom:20px; font-style:italic;">Всего уроков: ${totalLessons} | Всего ДЗ: ${totalHomework}</p>`;
    html += `<div style="overflow-x:auto;"><table class="progress-table">`;
    html += `<tr><th>Ученик</th><th>Ранг</th><th>Учитель</th><th>Время в Акаше</th><th>Уроки</th><th>ДЗ</th><th>Оценка</th></tr>`;
    for (const user of Object.values(usersDatabase)) {
        if (user.ранг === 'мастер' || user.ранг === 'магистр' || user.ранг === 'верховный магистр' || user.ранг === 'старейшина') continue;
        const userReads = reads.filter(r => r.userId === user.fullName);
        const userSubmissions = submissionsList.filter(s => s.studentName === user.fullName);
        const approvedHomework = userSubmissions.filter(s => s.status === 'approved').length;
        const submittedHomework = userSubmissions.length;
        const regDate = await getUserRegistrationDate(user.fullName);
        const timeInAkasha = regDate ? formatTimeInAkasha(regDate) : '—';
        const adjustments = await getUserAdjustments(user.fullName);
        const gradeData = calculateGrade(userReads.length, approvedHomework, totalLessons, totalHomework, adjustments.adjustedLessons || 0, adjustments.adjustedHomework || 0);
        const teacherName = user.учитель && user.учитель !== 'отсутствует' ? user.учитель : '—';
        html += `<tr><td style="font-weight:600;">${user.fullName}</td><td>${user.ранг}</td>`;
        html += `<td style="font-size:0.9em;">${teacherName}</td><td style="font-size:0.9em;">${timeInAkasha}</td>`;
        html += `<td>${userReads.length}/${totalLessons}</td>`;
        html += `<td>${submittedHomework} сдано<br><small style="color:#a89b7e;">(${approvedHomework} одобрено)</small></td>`;
        html += `<td style="color:${gradeData.gradeColor}; font-weight:700; text-align:center;">${gradeData.grade}<br><small>${gradeData.percent}%</small></td></tr>`;
    }
    html += `</table></div>`;
    if (isMasterUser) {
        html += `<div class="admin-panel"><h3>✏️ Ручная корректировка результатов</h3>`;
        html += `<p style="color:var(--text-secondary); margin:10px 0;">Мастер может добавить баллы ученикам, которые не успели перенести свои результаты в Акашу.</p>`;
        html += `<button class="hw-btn" onclick="window.showAdjustmentPanel()" style="background:rgba(100,255,218,0.2); color:#64ffda; width:100%; margin-top:10px;">⚙️ Открыть панель корректировки</button></div>`;
        html += `<button class="hw-btn" onclick="window.showDetailedProgress()" style="width:100%; margin-top:10px; background:rgba(100,255,218,0.2); color:#64ffda;">🔒 Показать детали (какие материалы сданы)</button>`;
    }
    html += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:15px; padding:12px;">🔙 Вернуться в меню</button></div>`;
    addMessage(html);
};

window.showAdjustmentPanel = async function() {
    const container = document.getElementById('chat-container');
    if (container) container.innerHTML = '';
    if (!isMaster()) { addMessage('<p>❌ Доступ запрещён.</p>'); return; }
    let html = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">`;
    html += `<h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">⚙️ Ручная корректировка</h3>`;
    html += `<p style="color:var(--text-secondary); text-align:center; margin-bottom:20px;">Выбери ученика и добавь баллы за пройденные материалы вне Акаши</p>`;
    for (const user of Object.values(usersDatabase)) {
        if (user.ранг === 'мастер' || user.ранг === 'магистр' || user.ранг === 'верховный магистр' || user.ранг === 'старейшина') continue;
        const adjustments = await getUserAdjustments(user.fullName);
        const hasAdjustment = (adjustments.adjustedLessons || 0) > 0 || (adjustments.adjustedHomework || 0) > 0;
        html += `<div style="background:rgba(0,0,0,0.3); border-radius:10px; padding:15px; margin:10px 0; border-left:3px solid ${hasAdjustment ? '#64ffda' : 'var(--border-color)'};">`;
        html += `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">`;
        html += `<div><div style="color:var(--text-color); font-weight:600;">${user.fullName}</div><div style="color:var(--text-secondary); font-size:0.9em;">${user.ранг}</div></div>`;
        if (hasAdjustment) html += `<div style="color:#64ffda; font-size:0.85em;">+${adjustments.adjustedLessons} уроков, +${adjustments.adjustedHomework} ДЗ</div>`;
        html += `</div>`;
        html += `<button class="hw-btn" onclick="window.openAdjustmentForm('${user.fullName}')" style="width:100%; background:rgba(100,255,218,0.2); color:#64ffda; padding:8px; font-size:0.95em;">✏️ ${hasAdjustment ? 'Изменить' : 'Добавить'} корректировку</button></div>`;
    }
    html += `<button class="hw-btn" onclick="window.showProgressTable()" style="width:100%; margin-top:15px; padding:12px;">🔙 Назад к таблице</button></div>`;
    addMessage(html);
};

window.showDetailedProgress = async function() {
    const container = document.getElementById('chat-container');
    if (container) container.innerHTML = '';
    if (!isMaster()) { addMessage('<p>❌ Доступ запрещён. Только для Мастеров.</p>'); return; }
    const reads = await getAllLessonReads();
    const totalLessons = Object.keys(lessonsById).length;
    const totalHomework = assignmentsList.length;
    let html = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">`;
    html += `<h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">🔒 Детальная успеваемость</h3>`;
    for (const user of Object.values(usersDatabase)) {
        if (user.ранг === 'мастер' || user.ранг === 'магистр' || user.ранг === 'верховный магистр' || user.ранг === 'старейшина') continue;
        const userReads = reads.filter(r => r.userId === user.fullName);
        const userSubmissions = submissionsList.filter(s => s.studentName === user.fullName);
        const adjustments = await getUserAdjustments(user.fullName);
        const gradeData = calculateGrade(userReads.length, userSubmissions.filter(s => s.status === 'approved').length, totalLessons, totalHomework, adjustments.adjustedLessons || 0, adjustments.adjustedHomework || 0);
        html += `<div style="background:rgba(0,0,0,0.3); border-radius:10px; padding:15px; margin:15px 0; border-left:3px solid ${gradeData.gradeColor};">`;
        html += `<h4 style="color:${gradeData.gradeColor}; margin-bottom:10px;">${user.fullName} — ${gradeData.grade} (${gradeData.percent}%)</h4>`;
        html += `<p style="color:#8bc34a; margin:10px 0 5px 0; font-weight:600;">📖 Прочитанные уроки (${userReads.length}/${totalLessons}):</p>`;
        if (userReads.length > 0) {
            html += `<ul style="color:var(--text-color); margin:5px 0; padding-left:20px; font-size:0.95em;">`;
            userReads.forEach(read => {
                const lesson = lessonsById[read.lessonId];
                if (lesson) {
                    const readDate = read.readAt ? new Date(read.readAt.seconds * 1000).toLocaleString('ru-RU', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'}) : '';
                    html += `<li>${lesson.title} <span style="color:#6b5f4a; font-size:0.85em;">— ${readDate}</span></li>`;
                }
            });
            html += `</ul>`;
        } else { html += `<p style="color:#6b5f4a; font-style:italic; margin:5px 0;">Нет прочитанных уроков</p>`; }
        html += `<p style="color:#ffa500; margin:10px 0 5px 0; font-weight:600;">📝 Сданные ДЗ (${userSubmissions.length} всего, ${userSubmissions.filter(s => s.status === 'approved').length} одобрено):</p>`;
        if (userSubmissions.length > 0) {
            html += `<ul style="color:var(--text-color); margin:5px 0; padding-left:20px; font-size:0.95em;">`;
            userSubmissions.forEach(sub => {
                const assignment = assignmentsList.find(a => a.id === sub.assignmentId);
                const statusEmoji = sub.status === 'approved' ? '✅' : (sub.status === 'needs_revision' ? '⚠️' : '');
                const title = assignment ? assignment.title : 'Неизвестное задание';
                html += `<li>${statusEmoji} ${title}</li>`;
            });
            html += `</ul>`;
        } else { html += `<p style="color:#6b5f4a; font-style:italic; margin:5px 0;">Нет сданных ДЗ</p>`; }
        if ((adjustments.adjustedLessons || 0) > 0 || (adjustments.adjustedHomework || 0) > 0) {
            html += `<div style="background:rgba(100,255,218,0.1); border-radius:8px; padding:10px; margin-top:10px;">`;
            html += `<p style="color:#64ffda; margin:0; font-weight:600;">✏️ Ручная корректировка:</p>`;
            html += `<p style="color:var(--text-color); margin:5px 0 0 0; font-size:0.9em;">+${adjustments.adjustedLessons} уроков, +${adjustments.adjustedHomework} ДЗ</p>`;
            if (adjustments.reason) html += `<p style="color:var(--text-secondary); margin:5px 0 0 0; font-size:0.85em; font-style:italic;">Причина: ${adjustments.reason}</p>`;
            if (adjustments.adjustedBy) html += `<p style="color:#6b5f4a; margin:5px 0 0 0; font-size:0.8em;">Внёс: ${adjustments.adjustedBy}</p>`;
            html += `</div>`;
        }
        html += `</div>`;
    }
    html += `<button class="hw-btn" onclick="window.showProgressTable()" style="width:100%; margin-top:15px; padding:12px;"> Назад к таблице</button></div>`;
    addMessage(html);
};

// ===== АДМИН ПАНЕЛЬ =====
window.showAdminPanel = async function() {
    const container = document.getElementById('chat-container');
    if (container) container.innerHTML = '';
    if (!isAdmin()) { addMessage('<p>❌ Доступ запрещён. Только для Магистров.</p>'); return; }
    const blockedUsers = await getBlockedUsers();
    let html = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">`;
    html += `<h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">⚙️ Админ-панель</h3>`;
    html += `<div class="admin-panel"><h3>👥 Управление всеми пользователями (включая Мастеров)</h3>`;
    html += `<button class="hw-btn" onclick="window.addNewMember()" style="background:rgba(76,175,80,0.3); color:#4caf50; margin-bottom:15px;">➕ Добавить нового члена Ордена</button>`;
    Object.values(usersDatabase).forEach(user => {
        const isBlocked = blockedUsers.find(b => b.id === user.fullName);
        const userRank = user.ранг;
        const rankColor = userRank.includes('магистр') || userRank.includes('мастер') ? '#ffd700' : 'var(--accent-color)';
        html += `<div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid var(--border-color); background:rgba(0,0,0,0.2); border-radius:8px; margin:8px 0; flex-wrap:wrap; gap:8px;">`;
        html += `<div style="flex:1; min-width:200px;"><div style="color:var(--text-color); font-weight:600; font-size:1.1em;">${user.fullName}</div>`;
        html += `<div style="color:${rankColor}; font-size:0.9em;">${user.ранг}</div></div><div style="display:flex; gap:5px; flex-wrap:wrap;">`;
        if (isBlocked) { 
            html += `<button class="unblock-btn" onclick="window.unblockUser('${user.fullName}')">✅ Разблокировать</button>`; 
        } else { 
            html += `<button class="block-btn" onclick="window.blockUser('${user.fullName}')">🚫 Заблокировать</button>`; 
        }
        html += `<button class="hw-btn" onclick="window.excludeJedi('${user.fullName}')" style="background:rgba(255,0,0,0.2); color:#ff0000; border:1px solid rgba(255,0,0,0.5); padding:6px 12px; font-size:0.85em; margin:0;">️ Исключить</button>`;
        html += `</div></div>`;
    });
    html += `</div>`;
    html += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:15px; padding:12px;"> Вернуться в меню</button></div>`;
    addMessage(html);
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) return;
    isInitialized = true;
    applySeasonTheme();
    renderKeyboard();
    if (typeof firebase !== 'undefined' && firebaseConfig) {
        try {
            if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
            windowDb = firebase.firestore();
            console.log('✅ Firebase инициализирован');
        } catch (e) { console.error('Ошибка инициализации Firebase:', e); }
    }
    setTimeout(() => {
        if (windowDb) {
            loadUserFromStorage();
            loadHistoryFromStorage();
            const container = document.getElementById('chat-container');
            if (container) container.innerHTML = '';
            if (currentUser) {
                loadLessonsFromFirebase();
                loadAssignments();
                loadSubmissions();
                updateLogoutButton();
                addMessage(getRankGreeting(currentUser));
                showMainMenu();
            } else {
                addMessage(getStrangerGreeting());
            }
        }
    }, 500);
});

window.addEventListener('resize', () => {
    if (window.visualViewport) {
        const keyboardHeight = window.innerHeight - window.visualViewport.height;
        if (keyboardHeight > 150) {
            document.body.style.paddingBottom = '350px';
        } else {
            document.body.style.paddingBottom = '300px';
        }
    }
});

// ===== ТЕКСТОВОЕ ФОРМАТИРОВАНИЕ (УДЕРЖАНИЕ ПАЛЬЦА) =====
function initTextFormatting() {
    document.querySelectorAll('.message-content').forEach(el => {
        el.addEventListener('touchstart', handleLongPressStart);
        el.addEventListener('touchend', handleLongPressEnd);
        el.addEventListener('mousedown', handleLongPressStart);
        el.addEventListener('mouseup', handleLongPressEnd);
        el.addEventListener('mouseleave', handleLongPressEnd);
    });
}

let longPressTimer = null;
let longPressTarget = null;

function handleLongPressStart(e) {
    e.preventDefault(); // 🔥 КРИТИЧЕСКИ ВАЖНО
    clearTimeout(longPressTimer);
    longPressTarget = e.target;
    longPressTimer = setTimeout(() => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX || (rect.left + rect.width / 2);
        const y = e.clientY || (rect.top + rect.height / 2);
        showFormatMenu(x, y);
    }, 600); // 600ms = стандартное удержание
}

function handleLongPressEnd() {
    clearTimeout(longPressTimer);
    hideFormatMenu();
}

function showFormatMenu(x, y) {
    const menu = document.getElementById('format-menu');
    if (!menu) return;
    menu.style.display = 'flex';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
}

function hideFormatMenu() {
    const menu = document.getElementById('format-menu');
    if (menu) menu.style.display = 'none';
}

function handleFormatClick(e) {
    const btn = e.target.closest('.fmt-btn');
    if (!btn) return;
    
    const action = btn.dataset.action;
    if (action === 'cancel') {
        hideFormatMenu();
        return;
    }
    if (action === 'copy') {
        const selection = window.getSelection();
        if (selection.toString()) {
            navigator.clipboard.writeText(selection.toString())
                .then(() => showAlert('Копировано', 'Выделенный текст скопирован!'))
                .catch(() => showAlert('Ошибка', 'Не удалось скопировать.'));
        }
        hideFormatMenu();
        return;
    }

    try {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        // Применяем команду форматирования
        document.execCommand(action, false);

        hideFormatMenu();
    } catch (err) {
        console.error('Ошибка форматирования:', err);
        showAlert('Ошибка', 'Не удалось применить форматирование.');
    }
}

// Привязываем обработчик клика к меню
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.fmt-btn');
    if (btn) handleFormatClick(e);
});

// ===== ЭКСПОРТ ВСЕХ ФУНКЦИЙ =====
window.showLessonContent = showLessonContent;
window.startAddLesson = startAddLesson;
window.editLesson = editLesson;
window.confirmDeleteLesson = confirmDeleteLesson;
window.startAddComment = startAddComment;
window.editComment = editComment;
window.deleteComment = deleteComment;
window.showHomeworkBoard = showHomeworkBoard;
window.startCreateAssignment = startCreateAssignment;
window.submitHomework = submitHomework;
window.deleteMySubmission = deleteMySubmission;
window.deleteAssignment = deleteAssignment;
window.openMasterChat = openMasterChat;
window.closeMasterChat = closeMasterChat;
window.openChatWithStudent = openChatWithStudent;
window.reviewSubmissions = reviewSubmissions;
window.gradeSubmission = gradeSubmission;
window.addFeedback = addFeedback;
window.sendMasterChatMessage = sendMasterChatMessage;
window.showMembersList = showMembersList;
window.showProgressTable = showProgressTable;
window.showAdjustmentPanel = showAdjustmentPanel;
window.openAdjustmentForm = openAdjustmentForm;
window.showDetailedProgress = showDetailedProgress;
window.showAdminPanel = showAdminPanel;
window.blockUser = blockUser;
window.unblockUser = unblockUser;
window.markLessonRead = markLessonRead;
window.showCouncilOfMasters = showCouncilOfMasters;
window.addNewMember = addNewMember;
window.excludeJedi = excludeJedi;
window.initTextFormatting = initTextFormatting;
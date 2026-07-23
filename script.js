let currentModalResolve = null;
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
const usersDatabase = {
'аранэль хальдарон': { ранг: 'верховный магистр', учитель: 'отсутствует', пароль: 'A1H23', fullName: 'Аранэль Хальдарон', specialTitle: 'Верховный Магистр', description: 'Глава Ордена Вольных Джедаев', статусы: ['Член Совета Мастеров', 'Верховный Судья'], звания: [{звание: 'Верховный Магистр', уточнение: 'Глава Ордена'}] },
'дорхат минас тур': { ранг: 'мастер', учитель: 'отсутствует', пароль: 'D1M1T', fullName: 'Дорхат Минас Тур', specialTitle: 'Заместитель Верховного Магистра', description: 'Глава безопасности', статусы: ['Страж', 'Член Малого Совета'], звания: [{звание: 'Мастер', уточнение: 'Боевой Магии'}] },
'нарнэлион эдрад': { ранг: 'мастер', учитель: 'отсутствует', пароль: 'N1E1', fullName: 'Нарнэлион Эдрад', specialTitle: 'Мастер Артефактов', description: 'Мастер Артефактов', статусы: ['Целитель', 'Исследователь'], звания: [{звание: 'Мастер', уточнение: 'Артефактов'}] },
'рондрил лаур': { ранг: 'мастер', учитель: 'отсутствует', пароль: 'R1L1', fullName: 'Рондрил Лаур', specialTitle: 'Мастер-Целитель', description: 'Мастер-Целитель', статусы: ['Целитель'], звания: [{звание: 'Мастер', уточнение: 'Целительства'}] },
'далисса вестуро': { ранг: 'старший падаван', учитель: 'Аранэль Хальдарон', пароль: 'D5i10V3', fullName: 'Далисса Иденааль Вестуро', specialTitle: 'Архивариус Ордена', description: 'Глава Библиотеки', статусы: ['Хранитель Знаний'], звания: [{звание: 'Архивариус', уточнение: 'Глава Библиотеки'}] },
'даниил ионов': { ранг: 'падаван', учитель: 'Нарнэлион Эдрад', пароль: 'D5i10', fullName: 'Даниил Ионов', статусы: [], звания: [] },
'кайренарт ветэрмайтерос': { ранг: 'юнлинг', учитель: 'отсутствует', пароль: 'K12A1V3', fullName: 'Кайренарт Авандалэр Ветэрмайтерос', статусы: [], звания: [] },
'тейраналь лоаннен-тиарастес': { ранг: 'юнлинг', учитель: 'отсутствует', пароль: 'T20A1LT13', fullName: 'Тейраналь Арианарт Лоаннен-Тиарастес', статусы: [], звания: [] },
'асстария ламанш': { ранг: 'юнлинг', учитель: 'отсутствует', пароль: 'A1A1L13', fullName: 'Асстария Авангорн Ламанш', статусы: [], звания: [] },
'наталья кузовцова': { ранг: 'юнлинг', учитель: 'отсутствует', пароль: 'N15K12', fullName: 'Наталья Кузовцова', статусы: [], звания: [] }
};
let currentUser = null, addLessonState = null, windowDb = null, storageRef = null, isInitialized = false, heartbeatTimer = null, isCustomKeyboardActive = false;
const rankHierarchy = ['адепт', 'юнлинг', 'падаван', 'старший падаван', 'рыцарь', 'мастер', 'магистр', 'верховный магистр', 'старейшина'];
const availableStatuses = ['Целитель', 'Воин', 'Страж', 'Исследователь', 'Учёный', 'Рекрутёр', 'Инструктор', 'Библиотекарь', 'Хранитель', 'Провидец', 'Судья', 'Верховный Судья', 'Член Малого Совета', 'Член Совета Мастеров', 'Член Совета', 'Другие'];
const availableTitles = ['Рядовой', 'Капитан', 'Генерал', 'Архивариус', 'Рыцарь', 'Мастер', 'Предвестник', 'Вестник', 'Лорд', 'Леди'];
function getRankLevel(r) { const l = rankHierarchy.indexOf(r.toLowerCase()); return l === -1 ? 0 : l; }
function isHigherRank(a, b) { return getRankLevel(a) > getRankLevel(b); }
function isSameOrHigherRank(a, b) { return getRankLevel(a) >= getRankLevel(b); }
function hasStatus(u, s) { return !!(u.статусы) && u.статусы.some(x => typeof x === 'string' && x.toLowerCase() === s.toLowerCase()); }
function hasTitle(u, t) { return !!(u.звания) && u.звания.some(x => typeof x === 'object' && x.звание.toLowerCase() === t.toLowerCase()); }
function canEditSchedule() { return !!currentUser && getRankLevel(currentUser.ранг) >= getRankLevel('старший падаван'); }
function isArchivist() {
  if (!currentUser) return false;
  const me = Object.values(usersDatabase).find(x => x.fullName === currentUser.name);
  if (me) { if (hasStatus(me, 'Архивариус') || hasTitle(me, 'Архивариус') || me.fullName === 'Далисса Иденааль Вестуро') return true; }
  if (currentUser.fullName === 'Далисса Иденааль Вестуро') return true;
  return false;
}
function isAdmin() { return currentUser && ['магистр', 'верховный магистр', 'старейшина'].includes(currentUser.ранг); }
function isMaster() { return currentUser && ['мастер', 'магистр', 'верховный магистр', 'старейшина'].includes(currentUser.ранг); }
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
return `<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;"><h3 style="color:#64ffda;margin-bottom:15px;font-family:'Playfair Display',serif;text-align:center;font-size:1.8em;"> Приветствую тебя, Странник</h3><p style="color:var(--text-color);line-height:1.8;margin-bottom:15px;">Я — <strong>Акаша</strong>, Хранительница Знаний Ордена Вольных Джедаев.</p><p style="color:var(--text-color);line-height:1.8;margin-bottom:15px;">Орден Вольных Джедаев — это братство тех, кто посвятил себя изучению высших искусств, защите и сохранению целостности и единства Света.</p><h4 style="color:#8bc34a;margin:20px 0 10px 0;font-family:'Playfair Display',serif;"> Как получить доступ:</h4><p style="color:var(--text-color);line-height:1.8;margin-bottom:15px;">Чтобы войти в систему, назови мне своё <strong>Имя</strong>, <strong>Ранг</strong>, имя своего <strong>Учителя</strong> и <strong>Пароль</strong>.<br><br><em>Пример:</em> "Меня зовут Оби-Ван Кеноби, я Магистр, мой Учитель — Квай-Гон Джинн, пароль O2V7K9"</p><p style="color:#a89b7e;font-style:italic;text-align:center;margin-top:20px;">✨ Орден ждёт тебя, Странник. Назови себя.</p></div>`;
}
function getRankGreeting(user) {
const rank = user.ранг, name = user.name;
const isM = ['мастер', 'магистр', 'верховный магистр', 'старейшина'].includes(rank);
if (isM) {
return `<div style="background:rgba(13,31,15,0.5);border:1px solid rgba(255,215,0,0.3);border-radius:15px;padding:25px;margin:15px 0;"><h3 style="color:#ffd700;margin-bottom:15px;font-family:'Playfair Display',serif;text-align:center;font-size:1.8em;"> Приветствую тебя, ${rank} ${name}</h3><p style="color:var(--text-color);line-height:1.8;margin-bottom:15px;">Орден Вольных Джедаев рад видеть тебя среди своих хранителей.</p><h4 style="color:#8bc34a;margin:20px 0 10px 0;font-family:'Playfair Display',serif;">📋 Твои возможности:</h4><ul style="color:var(--text-color);line-height:1.8;padding-left:20px;margin-bottom:15px;"><li>📚 Доступ ко всем разделам знаний Ордена</li><li>📝 Создание и проверка домашних заданий</li><li>✏️ Добавление и редактирование уроков</li><li>💬 Общение с учениками через личный чат</li><li>📊 Просмотр таблицы успеваемости</li><li>📅 Управление расписанием занятий</li>${rank === 'магистр' || rank === 'верховный магистр' || rank === 'старейшина' ? '<li>️ Админ-панель: управление пользователями, назначение Рангов/Статусов/Званий</li>' : ''}</ul><p style="color:#a89b7e;font-style:italic;text-align:center;margin-top:20px;">Используй свои возможности мудро, ${rank}. Орден доверяет тебе.</p></div>`;
}
return `<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;"><h3 style="color:#64ffda;margin-bottom:15px;font-family:'Playfair Display',serif;text-align:center;font-size:1.8em;">🌟 Я рада приветствовать тебя в Ордене Вольных Джедаев, ${rank} ${name}!</h3><p style="color:var(--text-color);line-height:1.8;margin-bottom:15px;">Твой путь только начинается. Впереди тебя ждут знания, испытания и рост.</p><h4 style="color:#8bc34a;margin:20px 0 10px 0;font-family:'Playfair Display',serif;">📜 Как пользоваться Акашей:</h4><ul style="color:var(--text-color);line-height:1.8;padding-left:20px;margin-bottom:15px;"><li>📝 <strong>Домашние задания</strong></li><li>✉️ <strong>Написать Мастеру</strong></li><li>📚 <strong>Оглавление знаний</strong></li><li> <strong>Библиотека</strong></li><li>📅 <strong>Расписание</strong></li><li>🏛️ <strong>Совет Мастеров</strong></li><li>👥 <strong>Члены Ордена</strong></li><li>📊 <strong>Успеваемость</strong></li></ul><p style="color:#a89b7e;font-style:italic;text-align:center;margin-top:20px;">Да пребудет с тобой Сила, ${rank} ${name}.</p></div>`;
}
const chatContainer = document.getElementById('chat-container');
const customTextarea = document.getElementById('custom-textarea');
const customKeyboard = document.getElementById('custom-keyboard');
function isLocalStorageAvailable() { try { localStorage.setItem('test', 'test'); localStorage.removeItem('test'); return true; } catch (e) { return false; } }
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
function clearHistory() { if (!LOCAL_STORAGE_AVAILABLE) return; localStorage.removeItem(STORAGE_KEY); }
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
loadScheduleFromFirebase();
loadSectionsFromFirebase();
loadLibraryFromFirebase();
loadOnlineStatuses();
registerUserIfNeeded();
}
} catch (error) { console.error('Ошибка загрузки пользователя:', error); }
}
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
if (LOCAL_STORAGE_AVAILABLE) {
try {
const saved = localStorage.getItem('akasha_sections');
if (saved) sectionsList = JSON.parse(saved);
} catch (e) {}
}
if (!windowDb) return;
try {
const snapshot = await windowDb.collection('sections').get();
sectionsList = [];
snapshot.forEach((doc) => { sectionsList.push({ id: doc.id, ...doc.data() }); });
if (LOCAL_STORAGE_AVAILABLE) localStorage.setItem('akasha_sections', JSON.stringify(sectionsList));
} catch (error) { console.error('Ошибка загрузки разделов:', error); }
}
async function addSectionToFirebase(year, rank, name, order) {
if (!windowDb) return false;
try {
const docRef = await windowDb.collection('sections').add({
year: year, rank: rank, name: name, order: order,
createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
createdBy: currentUser.name
});
const newSection = { id: docRef.id, year: year, rank: rank, name: name, order: order };
sectionsList.push(newSection);
if (LOCAL_STORAGE_AVAILABLE) localStorage.setItem('akasha_sections', JSON.stringify(sectionsList));
return true;
} catch (error) { console.error('Ошибка добавления раздела:', error); return false; }
}
async function deleteSectionFromFirebase(sectionId) {
if (!windowDb || !sectionId) return false;
try {
await windowDb.collection('sections').doc(sectionId).delete();
sectionsList = sectionsList.filter(s => s.id !== sectionId);
if (LOCAL_STORAGE_AVAILABLE) localStorage.setItem('akasha_sections', JSON.stringify(sectionsList));
return true;
} catch (error) { console.error('Ошибка удаления раздела:', error); return false; }
}
window.editSection = async function(sectionId) {
const section = sectionsList.find(s => s.id === sectionId);
if (!section) { showAlert('Ошибка', 'Раздел не найден!'); return; }
const newName = await askPrompt('Редактирование раздела', `Текущее название: "${section.name}"\n\nВведите новое название:`, section.name);
if (!newName || newName.trim() === '') { showAlert('Отменено', 'Название не может быть пустым.'); return; }
if (!windowDb) { showAlert('Ошибка', 'База данных не подключена!'); return; }
try {
await windowDb.collection('sections').doc(sectionId).update({ name: newName.trim() });
const secIndex = sectionsList.findIndex(s => s.id === sectionId);
if (secIndex !== -1) sectionsList[secIndex].name = newName.trim();
if (LOCAL_STORAGE_AVAILABLE) localStorage.setItem('akasha_sections', JSON.stringify(sectionsList));
showAlert('Успех', `Раздел переименован в "${newName.trim()}"!`);
window.showYearSections(section.year);
} catch (error) {
showAlert('Ошибка', `Не удалось переименовать: ${error.message}`);
}
};
window.deleteSection = async function(sectionId, sectionName) {
const confirmed = await askConfirm('⚠️ ВНИМАНИЕ!', `Вы действительно хотите УДАЛИТЬ раздел "${sectionName}"?\n\nЭто действие НЕОБРАТИМО!`);
if (!confirmed) return;
const success = await deleteSectionFromFirebase(sectionId);
if (success) {
showAlert('Успех', `Раздел "${sectionName}" удалён!`);
const section = sectionsList.find(s => s.id === sectionId);
if (section) window.showYearSections(section.year);
else showTOC();
} else {
showAlert('Ошибка', 'Не удалось удалить раздел.');
}
};
async function loadLibraryFromFirebase() {
libraryDepartments = [];
libraryBooks = [];
if (LOCAL_STORAGE_AVAILABLE) {
try {
const savedD = localStorage.getItem('akasha_library_departments');
const savedB = localStorage.getItem('akasha_library_books');
if (savedD) libraryDepartments = JSON.parse(savedD);
if (savedB) libraryBooks = JSON.parse(savedB);
} catch (e) {}
}
if (!windowDb) return;
try {
const depSnap = await windowDb.collection('library_departments').orderBy('order', 'asc').get();
libraryDepartments = [];
depSnap.forEach((doc) => { libraryDepartments.push({ id: doc.id, ...doc.data() }); });
const bookSnap = await windowDb.collection('library_books').orderBy('number', 'asc').get();
libraryBooks = [];
bookSnap.forEach((doc) => { libraryBooks.push({ id: doc.id, ...doc.data() }); });
if (LOCAL_STORAGE_AVAILABLE) {
localStorage.setItem('akasha_library_departments', JSON.stringify(libraryDepartments));
localStorage.setItem('akasha_library_books', JSON.stringify(libraryBooks));
}
} catch (error) { console.error('Ошибка загрузки библиотеки:', error); }
}
async function addDepartmentToFirebase(name, description) {
if (!windowDb) return false;
try {
const order = libraryDepartments.length + 1;
const docRef = await windowDb.collection('library_departments').add({
name: name, description: description || '', order: order,
createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
createdBy: currentUser.name
});
const newDep = { id: docRef.id, name: name, description: description || '', order: order };
libraryDepartments.push(newDep);
if (LOCAL_STORAGE_AVAILABLE) localStorage.setItem('akasha_library_departments', JSON.stringify(libraryDepartments));
return true;
} catch (error) { console.error('Ошибка добавления отдела:', error); return false; }
}
async function deleteDepartmentFromFirebase(depId) {
if (!windowDb || !depId) return false;
try {
await windowDb.collection('library_departments').doc(depId).delete();
const booksInDep = libraryBooks.filter(b => b.departmentId === depId);
for (const book of booksInDep) {
await windowDb.collection('library_books').doc(book.id).delete();
}
libraryDepartments = libraryDepartments.filter(d => d.id !== depId);
libraryBooks = libraryBooks.filter(b => b.departmentId !== depId);
if (LOCAL_STORAGE_AVAILABLE) {
localStorage.setItem('akasha_library_departments', JSON.stringify(libraryDepartments));
localStorage.setItem('akasha_library_books', JSON.stringify(libraryBooks));
}
return true;
} catch (error) { console.error('Ошибка удаления отдела:', error); return false; }
}
async function addBookToFirebase(departmentId, title, author, description, fileUrl, coverUrl = '') {
if (!windowDb) return false;
try {
const booksInDep = libraryBooks.filter(b => b.departmentId === departmentId);
const number = booksInDep.length + 1;
const docRef = await windowDb.collection('library_books').add({
departmentId: departmentId, title: title || 'Без названия', author: author || 'Неизвестный автор',
description: description || '', fileUrl: fileUrl || '', coverUrl: coverUrl || '',
number: number, createdAt: firebase.firestore.Timestamp.fromDate(new Date()), addedBy: currentUser.name
});
const newBook = { id: docRef.id, departmentId: departmentId, title: title || 'Без названия', author: author || 'Неизвестный автор', description: description || '', fileUrl: fileUrl || '', coverUrl: coverUrl || '', number: number };
libraryBooks.push(newBook);
if (LOCAL_STORAGE_AVAILABLE) localStorage.setItem('akasha_library_books', JSON.stringify(libraryBooks));
return true;
} catch (error) { console.error('Ошибка добавления книги:', error); return false; }
}
async function deleteBookFromFirebase(bookId) {
if (!windowDb || !bookId) return false;
try {
await windowDb.collection('library_books').doc(bookId).delete();
libraryBooks = libraryBooks.filter(b => b.id !== bookId);
if (LOCAL_STORAGE_AVAILABLE) localStorage.setItem('akasha_library_books', JSON.stringify(libraryBooks));
return true;
} catch (error) { console.error('Ошибка удаления книги:', error); return false; }
}
window.uploadBookFile = function(target) {
const fi = document.createElement('input');
fi.type = 'file';
fi.accept = target === 'cover' ? 'image/*' : '.pdf,.epub,.fb2,.txt,.doc,.docx,application/pdf,application/epub+zip,text/plain';
fi.onchange = async (e) => {
const file = e.target.files[0];
if (!file) return;
if (!storageRef) { addMessage('<p> Хранилище не готово. Подождите 5 секунд и попробуйте снова.</p>'); return; }
try {
const path = (target === 'cover' ? 'library/covers/' : 'library/books/') + Date.now() + '_' + file.name;
const ref = storageRef.child(path);
const progressId = 'upload-' + Date.now();
addMessage(`<div id="${progressId}" style="background:rgba(0,0,0,0.4);border-radius:10px;padding:15px;margin:10px 0;border:1px solid var(--border-color);"><p style="color:#64ffda;margin:0 0 10px 0;font-weight:bold;">📥 Загружаю "${file.name}" (${Math.round(file.size/1024)} КБ)...</p><div style="background:rgba(255,255,255,0.1);border-radius:10px;height:25px;overflow:hidden;position:relative;"><div id="bar-${progressId}" style="background:linear-gradient(90deg,#64ffda 0%,#8bc34a 100%);height:100%;width:0%;transition:width 0.5s ease;display:flex;align-items:center;justify-content:center;min-width:30px;"><span id="pct-${progressId}" style="color:#0d1f0f;font-weight:bold;font-size:0.85em;">0%</span></div></div><p id="status-${progressId}" style="color:#a89b7e;margin:8px 0 0 0;font-size:0.9em;">⏳ Начало загрузки...</p></div>`);
console.log('📤 Начало загрузки:', file.name, 'Размер:', file.size);
const uploadTask = ref.put(file);
const timeoutId = setTimeout(() => {
const statusEl = document.getElementById(`status-${progressId}`);
if (statusEl) {
statusEl.innerHTML = '⏳ Загрузка занимает больше времени...<br><small style="color:#6b5f4a;">Это нормально для больших файлов. Не закрывайте страницу.</small>';
}
}, 15000);
uploadTask.on('state_changed',
(snapshot) => {
const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
const bar = document.getElementById(`bar-${progressId}`);
const pct = document.getElementById(`pct-${progressId}`);
const status = document.getElementById(`status-${progressId}`);
if (bar && pct && status) {
const rounded = Math.round(progress);
bar.style.width = rounded + '%';
pct.textContent = rounded + '%';
if (rounded < 25) status.textContent = '📤 Загрузка... (' + rounded + '%)';
else if (rounded < 50) status.textContent = '🔄 Продолжается... (' + rounded + '%)';
else if (rounded < 75) status.textContent = '💪 Больше половины! (' + rounded + '%)';
else if (rounded < 100) status.textContent = '✨ Почти готово! (' + rounded + '%)';
else status.textContent = '✅ Завершено!';
}
console.log('📊 Прогресс:', rounded + '%');
},
(error) => {
clearTimeout(timeoutId);
console.error('❌ Ошибка загрузки:', error);
const container = document.getElementById(progressId);
if (container) {
container.innerHTML = `<p style="color:#ff6b6b;margin:0;">❌ Ошибка: ${error.message}</p><p style="color:#a89b7e;margin:10px 0 0 0;font-size:0.9em;">💡 Попробуйте вставить прямую ссылку (URL) вместо слова "файл".</p>`;
}
},
async () => {
clearTimeout(timeoutId);
console.log('✅ Загрузка завершена!');
try {
const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
console.log('🔗 URL:', downloadURL);
const container = document.getElementById(progressId);
if (container) {
container.innerHTML = `<p style="color:#4caf50;margin:0;font-weight:bold;">✅ Загружено!</p><p style="color:#a89b7e;margin:5px 0 0 0;font-size:0.9em;">Файл сохранён в хранилище Firebase.</p>`;
}
if (target === 'cover') {
addLessonState.coverUrl = downloadURL;
addMessage(`<p>✅ Обложка загружена! Напишите <em>"готово"</em> для продолжения или <em>"отмена"</em>.</p>`);
} else {
addLessonState.fileUrl = downloadURL;
addMessage(`<p>✅ Файл книги загружен! Напишите <em>"готово"</em> для сохранения книги или <em>"отмена"</em>.</p>`);
}
} catch (err) {
console.error('Ошибка получения URL:', err);
const container = document.getElementById(progressId);
if (container) {
container.innerHTML = `<p style="color:#ff6b6b;margin:0;">❌ Ошибка: ${err.message}</p>`;
}
}
}
);
} catch (err) {
console.error('Критическая ошибка:', err);
addMessage(`<p>❌ Ошибка: ${err.message}</p><p>Попробуйте использовать прямую ссылку (URL).</p>`);
}
};
fi.click();
};
window.openArchivistChat = async function() {
const archivistName = 'Далисса Иденааль Вестуро';
chatContainer.classList.add('chat-open');
document.getElementById('main-input-wrapper').style.display = 'none';
document.getElementById('archivist-chat-wrapper').style.display = 'block';
const container = document.getElementById('archivist-chat-container');
if (!container) return;
container.innerHTML = '<p style="color:#6b5f4a;text-align:center;">Загрузка...</p>';
const messages = await loadArchivistChat();
if (messages.length === 0) {
container.innerHTML = '<p style="color:#6b5f4a;text-align:center;font-style:italic;">Пока нет сообщений. Напиши первый вопрос о книге!</p>';
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
if (messages.length > 0) await markArchivistMessagesAsRead();
window.currentChatPartner = archivistName;
};
async function loadArchivistChat() {
if (!windowDb || !currentUser) return [];
try {
const archivistName = 'Далисса Иденааль Вестуро';
const snap1 = await windowDb.collection('archivist_messages').where('from', '==', currentUser.name).where('to', '==', archivistName).get();
const snap2 = await windowDb.collection('archivist_messages').where('from', '==', archivistName).where('to', '==', currentUser.name).get();
const messages = [];
snap1.forEach(doc => messages.push({ id: doc.id, ...doc.data() }));
snap2.forEach(doc => messages.push({ id: doc.id, ...doc.data() }));
messages.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
return messages;
} catch (error) { console.error('Ошибка загрузки чата с Архивариусом:', error); return []; }
}
window.sendArchivistChatMessage = async function() {
const input = document.getElementById('archivist-chat-input');
if (!input) return;
const text = input.value.trim();
if (!text) return;
const archivistName = 'Далисса Иденааль Вестуро';
try {
await windowDb.collection('archivist_messages').add({
from: currentUser.name, to: archivistName, text: text,
timestamp: firebase.firestore.Timestamp.fromDate(new Date()), read: false
});
input.value = '';
await window.openArchivistChat();
} catch (error) { console.error('Ошибка отправки:', error); }
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
const archivistName = 'Далисса Иденааль Вестуро';
const snapshot = await windowDb.collection('archivist_messages')
.where('from', '==', archivistName)
.where('to', '==', currentUser.name)
.where('read', '==', false).get();
const batch = windowDb.batch();
snapshot.forEach(doc => { batch.update(doc.ref, { read: true }); });
await batch.commit();
} catch (error) { console.error('Ошибка отметки:', error); }
}
async function getUnreadArchivistMessages() {
if (!windowDb || !currentUser) return 0;
try {
const archivistName = 'Далисса Иденааль Вестуро';
const snapshot = await windowDb.collection('archivist_messages')
.where('from', '==', archivistName)
.where('to', '==', currentUser.name)
.where('read', '==', false).get();
return snapshot.size;
} catch (error) { return 0; }
}
window.showLibrary = async function() {
const container = document.getElementById('chat-container');
if (container) container.innerHTML = '';
await loadLibraryFromFirebase();
const unreadCount = await getUnreadArchivistMessages();
const unreadBadge = unreadCount > 0 ? `<span style="background:#ff6b6b;color:white;padding:2px 8px;border-radius:10px;font-size:0.8em;margin-left:10px;">${unreadCount}</span>` : '';
let html = `<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;">`;
html += `<h3 style="color:#64ffda;margin-bottom:25px;font-family:'Playfair Display',serif;text-align:center;font-size:1.8em;">📖 Библиотека Ордена</h3>`;
html += `<p style="color:var(--text-secondary);text-align:center;font-style:italic;margin-bottom:20px;">Хранилище знаний и мудрости</p>`;
if (libraryDepartments.length === 0) {
html += `<p style="color:#6b5f4a;text-align:center;font-style:italic;font-size:1.1em;">Библиотека пока пуста. Отделы не созданы.</p>`;
} else {
html += `<div style="margin-bottom:20px;">`;
libraryDepartments.forEach(dep => {
const booksInDep = libraryBooks.filter(b => b.departmentId === dep.id);
html += `<button onclick="window.showLibraryDepartment('${dep.id}')" style="width:100%;margin-bottom:10px;background:rgba(139,195,74,0.2);color:var(--accent-color);font-size:1.1em;padding:15px;border-radius:8px;border:1px solid rgba(139,195,74,0.4);"> ${dep.name} <span style="color:#6b5f4a;font-size:0.9em;">(${booksInDep.length} книг)</span></button>`;
});
html += `</div>`;
}
if (isArchivist() || isAdmin()) {
html += `<button class="hw-btn" onclick="window.startAddDepartment()" style="width:100%;margin-top:20px;background:rgba(76,175,80,0.3);color:#4caf50;font-size:1.1em;">➕ Создать Отдел</button>`;
}
html += `<button class="hw-btn" onclick="window.openArchivistChat()" style="width:100%;margin-top:10px;background:rgba(139,195,74,0.3);color:#8bc34a;font-size:1.1em;"> Чат с Архивариусом ${unreadBadge}</button>`;
html += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%;margin-top:15px;padding:12px;font-size:1.1em;">🔙 Вернуться в меню</button></div>`;
addRawHTML(html);
};
window.showLibraryDepartment = async function(depId) {
const container = document.getElementById('chat-container');
if (container) container.innerHTML = '';
await loadLibraryFromFirebase();
const dep = libraryDepartments.find(d => d.id === depId);
if (!dep) { addMessage('<p>❌ Отдел не найден!</p>'); return; }
const booksInDep = libraryBooks.filter(b => b.departmentId === depId);
await akEnsureBookOrder(booksInDep);  
let html = `<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;">`;
html += `<h3 style="color:#64ffda;margin-bottom:10px;font-family:'Playfair Display',serif;text-align:center;font-size:1.8em;">📚 ${dep.name}</h3>`;
if (dep.description) html += `<p style="color:var(--text-secondary);text-align:center;font-style:italic;margin-bottom:20px;">${dep.description}</p>`;
if (booksInDep.length === 0) {
html += `<p style="color:#6b5f4a;text-align:center;font-style:italic;font-size:1.1em;">В этом отделе пока нет книг.</p>`;
} else {
html += `<div style="margin-bottom:20px;">`;
booksInDep.forEach(book => {
html += `<div style="background:rgba(0,0,0,0.2);border-radius:8px;padding:12px;margin:8px 0;display:flex;gap:10px;align-items:flex-start;">`;
const bookIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="80" viewBox="0 0 60 80"><rect fill="#1a3a1a" width="60" height="80" rx="5"/><rect fill="#2d5a2d" x="5" y="5" width="50" height="70" rx="3"/><path fill="#64ffda" d="M15 20 L45 20 L45 25 L15 25 Z M15 30 L45 30 L45 35 L15 35 Z M15 40 L40 40 L40 45 L15 45 Z" opacity="0.8"/></svg>`;
const coverHtml = book.coverUrl && book.coverUrl.trim() !== '' ? `<img src="${book.coverUrl}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" style="width:60px;height:80px;object-fit:cover;border-radius:5px;border:1px solid var(--border-color);flex-shrink:0;background:#1a3a1a;">` + `<div style="display:none;width:60px;height:80px;border-radius:5px;border:1px solid var(--border-color);flex-shrink:0;">${bookIcon}</div>` : `<div style="width:60px;height:80px;border-radius:5px;border:1px solid var(--border-color);flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#1a3a1a;">${bookIcon}</div>`;
html += coverHtml;
html += `<div style="flex:1;cursor:pointer;" onclick="window.showBookDetails('${book.id}')">`;
html += `<div style="color:var(--accent-color);font-size:1.1em;font-weight:600;"> №${book.number}. ${book.title}</div>`;
html += `<div style="color:#8bc34a;font-size:0.9em;margin-top:3px;">✍️ ${book.author}</div>`;
if (book.description) html += `<div style="color:var(--text-secondary);font-size:0.85em;margin-top:5px;">${book.description.substring(0,100)}${book.description.length > 100 ? '...' : ''}</div>`;
if (book.fileUrl) {
html += `<div style="margin-top:8px;">`;
if (book.fileUrl.startsWith('http')) html += `<a href="${book.fileUrl}" target="_blank" onclick="event.stopPropagation()" style="color:#64ffda;text-decoration:underline;font-size:0.9em;">🔗 Открыть книгу</a>`;
else html += `<span style="color:var(--text-secondary);font-size:0.9em;">📄 Файл загружен</span>`;
html += `</div>`;
}
html += `</div>`;
if (isArchivist() || isAdmin()) {
html += `<button onclick="event.stopPropagation();window.deleteBook('${book.id}','${book.title.replace(/'/g,"\\'")}')" style="background:rgba(255,80,80,0.2);color:#ff6b6b;padding:8px 12px;border-radius:6px;border:1px solid rgba(255,80,80,0.4);font-size:0.9em;min-width:40px;flex-shrink:0;">🗑️</button>`;
}
html += `</div>`;
});
html += `</div>`;
}
if (isArchivist() || isAdmin()) {
html += `<button class="hw-btn" onclick="window.startAddBook('${dep.id}')" style="width:100%;margin-top:20px;background:rgba(76,175,80,0.3);color:#4caf50;font-size:1.1em;">➕ Добавить книгу в этот отдел</button>`;
html += `<button class="hw-btn" onclick="window.deleteDepartment('${dep.id}','${dep.name.replace(/'/g,"\\'")}')" style="width:100%;margin-top:10px;background:rgba(255,80,80,0.2);color:#ff6b6b;font-size:1.1em;">️ Удалить весь отдел</button>`;
}
html += `<button class="hw-btn" onclick="window.showLibrary()" style="width:100%;margin-top:15px;padding:12px;font-size:1.1em;">🔙 Назад к отделам</button></div>`;
addRawHTML(html);
};
window.showBookDetails = function(id) {
const b = libraryBooks.find(x => x.id === id); if (!b) { addMessage('<p>❌ Книга не найдена.</p>'); return; }
const d = libraryDepartments.find(x => x.id === b.departmentId);
let html = `<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;">`;
if (b.coverUrl && b.coverUrl.trim() !== '') {
html += `<div style="text-align:center;margin-bottom:15px;"><img src="${b.coverUrl}" onerror="this.onerror=null;this.style.display='none';" style="max-width:180px;border-radius:10px;border:2px solid var(--border-color);"></div>`;
}
html += `<h3 style="color:#64ffda;font-family:'Playfair Display',serif;text-align:center;">📖 №${b.number}. ${b.title}</h3>`;
html += `<p style="color:#8bc34a;text-align:center;margin:8px 0;">✍️ ${b.author}</p>`;
if (d) html += `<p style="color:var(--text-secondary);text-align:center;font-style:italic;">Отдел: ${d.name}</p>`;
if (b.description) html += `<div style="background:rgba(0,0,0,0.2);border-radius:8px;padding:15px;margin:15px 0;"><p style="color:var(--text-color);line-height:1.6;">${b.description}</p></div>`;
if (b.fileUrl) html += `<div style="margin:15px 0;text-align:center;"><a href="${b.fileUrl}" target="_blank" style="display:inline-block;background:rgba(100,255,218,0.2);color:#64ffda;padding:12px 24px;border-radius:10px;text-decoration:none;border:1px solid rgba(100,255,218,0.4);font-size:1.1em;"> Открыть / скачать книгу</a></div>`;
else html += `<p style="color:#6b5f4a;text-align:center;font-style:italic;">Файл книги не прикреплён.</p>`;
html += `<button class="hw-btn" onclick="window.showLibraryDepartment('${b.departmentId}')" style="width:100%;margin-top:15px;padding:12px;">🔙 Назад к отделу</button></div>`;
addRawHTML(html);
};
window.startAddDepartment = function() {
addMessage(`<p>📚 <strong>Создание нового Отдела Библиотеки</strong></p><p>Введите <strong>название отдела</strong> (или <em>"отмена"</em>):</p>`);
addLessonState = { step: 'add_department_name' };
};
window.startAddBook = function(depId) {
const dep = libraryDepartments.find(d => d.id === depId);
if (!dep) { addMessage('<p>❌ Отдел не найден!</p>'); return; }
addMessage(`<p>📖 <strong>Добавление книги в "${dep.name}"</strong></p><p><strong>Шаг 1/5 — Обложка.</strong> Вставьте прямую ссылку на картинку (должна заканчиваться на .jpg, .png или .webp), ИЛИ напишите <em>"файл"</em> чтобы загрузить с устройства, ИЛИ <em>"нет"</em> если обложки нет, ИЛИ <em>"отмена"</em>:</p>`);
addLessonState = { step: 'add_book_cover', departmentId: depId, coverUrl: '', fileUrl: '' };
};
window.deleteDepartment = async function(depId, depName) {
const confirmed = await askConfirm('️ ВНИМАНИЕ!', `Вы действительно хотите УДАЛИТЬ отдел "${depName}"?\n\nВсе книги в этом отделе будут удалены!`);
if (!confirmed) return;
const success = await deleteDepartmentFromFirebase(depId);
if (success) { showAlert('Успех', `Отдел "${depName}" удалён!`); window.showLibrary(); }
else showAlert('Ошибка', 'Не удалось удалить отдел.');
};
window.deleteBook = async function(bookId, bookTitle) {
const confirmed = await askConfirm('️ ВНИМАНИЕ!', `Вы действительно хотите УДАЛИТЬ книгу "${bookTitle}"?`);
if (!confirmed) return;
const success = await deleteBookFromFirebase(bookId);
if (success) {
showAlert('Успех', `Книга "${bookTitle}" удалена!`);
const book = libraryBooks.find(b => b.id === bookId);
if (book) window.showLibraryDepartment(book.departmentId);
else window.showLibrary();
} else { showAlert('Ошибка', 'Не удалось удалить книгу.'); }
};
async function loadOnlineStatuses() {
if (!windowDb) return;
try {
const snapshot = await windowDb.collection('online_status').get();
onlineStatuses = {};
snapshot.forEach((doc) => { onlineStatuses[doc.id] = doc.data(); });
} catch (error) { console.error('Ошибка загрузки онлайн-статусов:', error); }
}
async function updateOnlineStatus() {
if (!windowDb || !currentUser) return;
try {
const now = firebase.firestore.Timestamp.fromDate(new Date());
await windowDb.collection('online_status').doc(currentUser.name).set({ lastSeen: now, online: true, updatedAt: now }, { merge: true });
onlineStatuses[currentUser.name] = { lastSeen: now, online: true, updatedAt: now };
} catch (error) { console.error('Ошибка обновления статуса:', error); }
}
async function sendOfflineStatus() {
if (!windowDb || !currentUser) return;
try {
const now = firebase.firestore.Timestamp.fromDate(new Date());
await windowDb.collection('online_status').doc(currentUser.name).update({ online: false, updatedAt: now });
} catch (error) { console.error('Ошибка отправки офлайн-статуса:', error); }
}
function formatOnlineStatus(userName) {
const status = onlineStatuses[userName];
if (!status || !status.lastSeen) return '<span style="color:#6b5f4a;font-size:0.85em;">⚫ Не в сети</span>';
const lastSeenDate = status.lastSeen.toDate();
const now = new Date();
const diffMs = now - lastSeenDate;
const diffMins = Math.floor(diffMs / 60000);
if (diffMins < 2) return '<span style="color:#4caf50;font-size:0.85em;">🟢 Онлайн</span>';
else return `<span style="color:#ff9800;font-size:0.85em;">⚪ Был в сети ${diffMins} мин. назад</span>`;
}
async function loadUsersFromFirebase() {
if (!windowDb) return;
try {
const snapshot = await windowDb.collection('users').get();
snapshot.forEach((doc) => {
const data = doc.data(); const key = doc.id;
if (!usersDatabase[key]) {
usersDatabase[key] = {
fullName: data.fullName, ранг: data.rank, учитель: data.teacher, пароль: data.password,
specialTitle: data.specialTitle || '', description: data.description || '',
статусы: data.статусы || [], звания: data.звания || []
};
} else {
usersDatabase[key].ранг = data.rank;
usersDatabase[key].статусы = data.статусы || [];
usersDatabase[key].звания = data.звания || [];
}
});
} catch (error) { console.error('Ошибка загрузки пользователей:', error); }
}
async function loadScheduleFromFirebase() {
if (!windowDb) return;
try {
const snapshot = await windowDb.collection('schedule').orderBy('dateTime', 'asc').get();
scheduleList = [];
snapshot.forEach((doc) => { scheduleList.push({ id: doc.id, ...doc.data() }); });
} catch (error) { console.error('Ошибка загрузки расписания:', error); }
}
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
setTimeout(() => { container.scrollTop = container.scrollHeight; container.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, 100);
}
function addRawHTML(html) {
const container = document.getElementById('chat-container');
if (!container) return;
const messageDiv = document.createElement('div');
messageDiv.className = 'message akasha-message';
messageDiv.innerHTML = html;
container.appendChild(messageDiv);
setTimeout(() => { container.scrollTop = container.scrollHeight; container.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, 100);
}
function parseMarkdown(text) {
text = text.replace(/\n/g, '<br>');
text = text.replace(/<br><br>/g, '</p><p style="text-indent:20px;margin:15px 0;">');
if (!text.startsWith('<p>')) text = '<p style="text-indent:20px;margin:15px 0;">' + text + '</p>';
text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
return text;
}
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
await windowDb.collection('homework_assignments').add({ title: title, description: description, createdBy: currentUser.name, createdAt: new Date() });
return true;
} catch (error) { console.error('Ошибка создания:', error); return false; }
}
async function submitHomeworkToFirebase(assignmentId, content) {
if (!windowDb) return false;
try {
await windowDb.collection('homework_submissions').add({ assignmentId: assignmentId, studentName: currentUser.name, studentRank: currentUser.ранг, content: content, status: 'pending', submittedAt: new Date(), masterFeedback: '', reviewedAt: null });
return true;
} catch (error) { console.error('Ошибка отправки:', error); return false; }
}
async function updateSubmissionStatus(submissionId, status, feedback) {
if (!windowDb) return false;
try {
await windowDb.collection('homework_submissions').doc(submissionId).update({ status: status, masterFeedback: feedback, reviewedAt: new Date() });
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
await windowDb.collection('comments').add({ lessonId: lessonId, text: text, type: type, authorName: currentUser.name, authorRank: currentUser.ранг, createdAt: new Date() });
return true;
} catch (error) { console.error('Ошибка добавления:', error); return false; }
}
async function updateCommentInFirebase(commentId, newText) {
if (!windowDb || !commentId) return false;
try { await windowDb.collection('comments').doc(commentId).update({ text: newText, updatedAt: new Date() }); return true; } catch (error) { return false; }
}
async function deleteCommentFromFirebase(commentId) {
if (!windowDb || !commentId) return false;
try { await windowDb.collection('comments').doc(commentId).delete(); return true; } catch (error) { return false; }
}
async function addLessonToFirebase(category, title, content, mediaUrl = '', year = '', sectionId = '', chapterId = '') {
if (!windowDb) return false;
try {
await windowDb.collection('lessons').add({ category, title, content, mediaUrl, year, sectionId, chapterId: chapterId || '', createdAt: new Date(), addedBy: currentUser.name });
return true;
} catch (error) { return false; }
}
async function updateLessonInFirebase(lessonId, updates) {
if (!windowDb || !lessonId) return false;
try { await windowDb.collection('lessons').doc(lessonId).update(updates); return true; } catch (error) { return false; }
}
async function deleteLesson(lessonId) {
if (!windowDb || !lessonId) return false;
try { await windowDb.collection('lessons').doc(lessonId).delete(); delete lessonsById[lessonId]; return true; } catch (error) { return false; }
}
async function addScheduleToFirebase(dateTime, topic, materials, teacher) {
if (!windowDb) return false;
try {
await windowDb.collection('schedule').add({ dateTime: dateTime, topic: topic, materials: materials, teacher: teacher, createdBy: currentUser.name, createdAt: firebase.firestore.Timestamp.fromDate(new Date()) });
return true;
} catch (error) { console.error('Ошибка добавления в расписание:', error); return false; }
}
async function updateScheduleInFirebase(scheduleId, updates) {
if (!windowDb || !scheduleId) return false;
try { await windowDb.collection('schedule').doc(scheduleId).update(updates); return true; } catch (error) { console.error('Ошибка обновления расписания:', error); return false; }
}
async function deleteScheduleFromFirebase(scheduleId) {
if (!windowDb || !scheduleId) return false;
try { await windowDb.collection('schedule').doc(scheduleId).delete(); return true; } catch (error) { console.error('Ошибка удаления из расписания:', error); return false; }
}
function formatDateTimeMSK(dateTimeStr) {
if (!dateTimeStr) return '—';
const date = new Date(dateTimeStr);
return date.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' (МСК)';
}
window.showSchedule = async function() {
const container = document.getElementById('chat-container');
if (container) container.innerHTML = '';
await loadScheduleFromFirebase();
let html = `<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;">`;
html += `<h3 style="color:#64ffda;margin-bottom:25px;font-family:'Playfair Display',serif;text-align:center;font-size:1.8em;">📅 Расписание занятий Ордена</h3>`;
if (scheduleList.length === 0) {
html += `<p style="color:#6b5f4a;text-align:center;font-style:italic;">Расписание пока пусто.</p>`;
} else {
html += `<div style="overflow-x:auto;"><table class="progress-table">`;
html += `<tr><th>Дата и время (МСК)</th><th>Тема занятия</th><th>Что понадобится</th><th>Учитель</th>`;
if (canEditSchedule()) html += `<th>Действия</th>`;
html += `</tr>`;
scheduleList.forEach(item => {
html += `<tr>`;
html += `<td style="font-size:0.9em;white-space:nowrap;">${formatDateTimeMSK(item.dateTime)}</td>`;
html += `<td>${item.topic || '—'}</td><td>${item.materials || '—'}</td><td>${item.teacher || '—'}</td>`;
if (canEditSchedule()) {
html += `<td style="white-space:nowrap;">`;
html += `<button onclick="window.editScheduleItem('${item.id}')" style="background:rgba(100,255,218,0.2);color:#64ffda;border:1px solid rgba(100,255,218,0.4);padding:4px 8px;border-radius:6px;cursor:pointer;font-size:0.85em;margin-right:5px;">✏️</button>`;
html += `<button onclick="window.deleteScheduleItem('${item.id}')" style="background:rgba(255,80,80,0.2);color:#ff6b6b;border:1px solid rgba(255,80,80,0.4);padding:4px 8px;border-radius:6px;cursor:pointer;font-size:0.85em;">🗑️</button>`;
html += `</td>`;
}
html += `</tr>`;
});
html += `</table></div>`;
}
if (canEditSchedule()) html += `<button class="hw-btn" onclick="window.startAddSchedule()" style="width:100%;margin-top:20px;background:rgba(76,175,80,0.3);color:#4caf50;">➕ Добавить занятие</button>`;
html += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%;margin-top:15px;padding:12px;">🔙 Вернуться в меню</button></div>`;
addRawHTML(html);
};
window.startAddSchedule = function() {
addMessage(`<p>📅 <strong>Добавление занятия в расписание</strong></p><p>Введите <strong>дату и время</strong> в формате: <em>ГГГГ-ММ-ДД ЧЧ:ММ</em><br>Например: <em>2026-07-20 18:00</em><br>(или <em>"отмена"</em>)</p>`);
addLessonState = { step: 'add_schedule_datetime' };
};
window.editScheduleItem = function(scheduleId) {
const item = scheduleList.find(s => s.id === scheduleId);
if (!item) { showAlert('Ошибка', 'Занятие не найдено!'); return; }
addMessage(`<p>✏️ <strong>Редактирование занятия</strong></p><p>Текущие данные:</p><p>📅 Дата: <em>${item.dateTime || '—'}</em></p><p> Тема: <em>${item.topic || '—'}</em></p><p>📦 Что понадобится: <em>${item.materials || '—'}</em></p><p>👤 Учитель: <em>${item.teacher || '—'}</em></p><p>Что изменить? Напиши:</p><p>• <em>"дата"</em>, <em>"тема"</em>, <em>"материалы"</em>, <em>"учитель"</em>, <em>"всё"</em> или <em>"отмена"</em></p>`);
addLessonState = { step: 'edit_schedule_choose', scheduleId: scheduleId, currentData: item };
};
window.deleteScheduleItem = async function(scheduleId) {
const item = scheduleList.find(s => s.id === scheduleId);
if (!item) return;
const confirmed = await askConfirm('⚠️ ВНИМАНИЕ!', `Вы действительно хотите УДАЛИТЬ занятие "${item.topic}"?`);
if (!confirmed) return;
const success = await deleteScheduleFromFirebase(scheduleId);
if (success) { showAlert('Успех', 'Занятие удалено из расписания!'); window.showSchedule(); }
else showAlert('Ошибка', 'Не удалось удалить занятие.');
};
async function sendMessageToMaster(text) {
if (!windowDb || !currentUser) return false;
const masterName = currentUser.учитель;
if (!masterName || masterName === 'отсутствует') { addMessage('<p>❌ У тебя нет назначенного Мастера!</p>'); return false; }
try {
await windowDb.collection('messages').add({ from: currentUser.name, to: masterName, text: text, timestamp: firebase.firestore.Timestamp.fromDate(new Date()), read: false });
return true;
} catch (error) { console.error('Ошибка:', error); addMessage(`<p>❌ Ошибка отправки: ${error.message}</p>`); return false; }
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
} catch (error) { console.error('Ошибка загрузки чата:', error); return []; }
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
if (isMaster()) { await showMasterDashboard(); }
else {
document.getElementById('main-input-wrapper').style.display = 'none';
addMessage(`<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;"><h3 style="color:#64ffda;font-family:'Playfair Display',serif;text-align:center;font-size:1.5em;">✉️ Написать Мастеру</h3><p style="color:var(--text-color);line-height:1.8;text-align:center;margin-top:10px;">У тебя пока <strong>нет назначенного Мастера</strong>, поэтому личный чат закрыт.</p><p style="color:#a89b7e;text-align:center;font-style:italic;margin-top:10px;">Обратись к Верховному Магистру или наставнику, чтобы тебе назначили Мастера — после этого здесь откроется переписка один на один.</p><button class="hw-btn" onclick="document.getElementById('main-input-wrapper').style.display='block';showMainMenu()" style="width:100%;margin-top:15px;">🔙 Вернуться в меню</button></div>`);
}
}
else {
document.getElementById('main-input-wrapper').style.display = 'none';
document.getElementById('master-chat-wrapper').style.display = 'block';
const container = document.getElementById('master-chat-container');
if (!container) return;
container.innerHTML = '<p style="color:#6b5f4a;text-align:center;">Загрузка...</p>';
const masterName = currentUser.учитель;
if (masterName && masterName !== 'отсутствует') {
const messages = await loadChatWith(masterName);
if (messages.length === 0) container.innerHTML = '<p style="color:#6b5f4a;text-align:center;font-style:italic;">Пока нет сообщений. Напиши первым!</p>';
else {
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
const data = doc.data(); const studentName = data.from;
if (!studentsMap.has(studentName)) studentsMap.set(studentName, { name: studentName, lastMessage: data.text, timestamp: data.timestamp, unread: data.read === false });
});
const students = Array.from(studentsMap.values());
let html = `<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;">`;
html += `<h3 style="color:#64ffda;margin-bottom:25px;font-family:'Playfair Display',serif;text-align:center;font-size:1.8em;">📋 Сообщения от учеников</h3>`;
if (students.length === 0) html += `<p style="color:#6b5f4a;text-align:center;font-style:italic;">Пока нет сообщений от учеников.</p>`;
else {
students.forEach(student => {
const time = student.timestamp ? new Date(student.timestamp.seconds * 1000).toLocaleString('ru-RU', {hour: '2-digit', minute: '2-digit'}) : '';
const unreadBadge = student.unread ? '<span style="background:#ff6b6b;color:white;padding:2px 8px;border-radius:10px;font-size:0.8em;margin-left:10px;">NEW</span>' : '';
html += `<div style="background:rgba(100,255,218,0.1);border:1px solid rgba(100,255,218,0.3);border-radius:10px;padding:15px;margin:10px 0;cursor:pointer;" onclick="window.openChatWithStudent('${student.name}')">`;
html += `<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:1.15em;color:#64ffda;font-weight:bold;"> ${student.name} ${unreadBadge}</div><div style="color:#6b5f4a;font-size:0.9em;">${time}</div></div>`;
html += `<div style="color:#a89b7e;margin-top:8px;font-style:italic;">"${student.lastMessage.substring(0,50)}${student.lastMessage.length > 50 ? '...' : ''}"</div></div>`;
});
}
html += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%;margin-top:15px;padding:12px;">🔙 Вернуться в меню</button></div>`;
addMessage(html);
} catch (error) { console.error('Ошибка загрузки панели Мастера:', error); addMessage('<p>❌ Ошибка загрузки сообщений.</p>'); }
}
window.openChatWithStudent = async function(studentName) {
chatContainer.classList.add('chat-open');
document.getElementById('main-input-wrapper').style.display = 'none';
document.getElementById('master-chat-wrapper').style.display = 'block';
const container = document.getElementById('master-chat-container');
if (!container) return;
container.innerHTML = '<p style="color:#6b5f4a;text-align:center;">Загрузка...</p>';
try {
const snap1 = await windowDb.collection('messages').where('from', '==', currentUser.name).where('to', '==', studentName).get();
const snap2 = await windowDb.collection('messages').where('from', '==', studentName).where('to', '==', currentUser.name).get();
const messages = [];
snap1.forEach(doc => messages.push({ id: doc.id, ...doc.data() }));
snap2.forEach(doc => messages.push({ id: doc.id, ...doc.data() }));
messages.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
if (messages.length === 0) container.innerHTML = `<p style="color:#6b5f4a;text-align:center;font-style:italic;">Нет переписки с ${studentName}</p>`;
else {
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
messages.forEach(msg => { if (msg.from === studentName && msg.to === currentUser.name && msg.read === false) batch.update(windowDb.collection('messages').doc(msg.id), { read: true }); });
await batch.commit();
window.currentChatPartner = studentName;
} catch (error) { console.error('Ошибка:', error); container.innerHTML = '<p>❌ Ошибка загрузки переписки.</p>'; }
};
window.sendMasterChatMessage = async function() {
const input = document.getElementById('master-chat-input');
if (!input) return;
const text = input.value.trim();
if (!text) return;
if (window.currentChatPartner) {
try {
await windowDb.collection('messages').add({ from: currentUser.name, to: window.currentChatPartner, text: text, timestamp: firebase.firestore.Timestamp.fromDate(new Date()), read: false });
input.value = '';
await window.openChatWithStudent(window.currentChatPartner);
} catch (error) { console.error('Ошибка отправки:', error); addMessage('<p>❌ Ошибка отправки.</p>'); }
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
function parseUserInput(text) {
const data = { name: '', ранг: '', учитель: '', пароль: '' };
const parts = text.split(',');
if (parts.length > 0) { const namePart = parts[0].trim().toLowerCase(); data.name = namePart.replace(/(?:меня\s+)?(?:зовут|зову)\s+/i, '').trim(); }
if (parts.length > 1) { const rankPart = parts[1].trim().toLowerCase(); const ranks = ['верховный магистр', 'старший падаван', 'старейшина', 'магистр', 'мастер', 'рыцарь', 'падаван', 'юнлинг', 'адепт']; for (let rank of ranks) { if (rankPart.includes(rank)) { data.ранг = rank; break; } } }
const teacherMatch = text.match(/(?:учитель|учителя)\s+([^,]+),/i);
if (teacherMatch) { data.учитель = teacherMatch[1].trim(); if (data.учитель.toLowerCase().includes('нет')) data.учитель = 'отсутствует'; }
const passMatch = text.match(/(?:пароль|пароль:)\s*(.+)$/i);
if (passMatch) { let pass = passMatch[1].trim().replace(/[—–\-]/g, ''); pass = pass.replace(/I/g, 'i'); data.пароль = pass; }
return data;
}
function checkAccess(topic) {
const topicAccess = { 'ганн': ['адепт','юнлинг','падаван','старший падаван','рыцарь','мастер','магистр','верховный магистр','старейшина'], 'берг': ['падаван','старший падаван','рыцарь','мастер','магистр','верховный магистр','старейшина'], 'катарн': ['рыцарь','мастер','магистр','верховный магистр','старейшина'], 'крайт': ['мастер','магистр','верховный магистр','старейшина'] };
return topicAccess[topic].includes(currentUser.ранг);
}
function showMainMenu() {
const container = document.getElementById('chat-container');
if (!container) return;
container.innerHTML = '';
let html = `<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;">`;
html += `<h3 style="color:#64ffda;margin-bottom:25px;font-family:'Playfair Display',serif;text-align:center;font-size:1.8em;">🔮 Главное меню</h3>`;
html += `<button class="menu-btn" onclick="window.showHomeworkBoard()"> Домашние задания</button>`;
html += `<button class="menu-btn chat-btn" onclick="window.openMasterChat()">✉️ Написать Мастеру</button>`;
html += `<button class="menu-btn" onclick="showTOC()">📚 Оглавление знаний</button>`;
html += `<button class="menu-btn" onclick="window.showLibrary()"> Библиотека</button>`;
html += `<button class="menu-btn" onclick="window.showSchedule()">📅 Расписание</button>`;
html += `<button class="menu-btn" onclick="window.showCouncilOfMasters()" style="background:rgba(100,255,218,0.15);border-color:rgba(100,255,218,0.4);color:#64ffda;">🏛️ Совет Мастеров</button>`;
html += `<button class="menu-btn" onclick="window.showMembersList()">👥 Члены Ордена</button>`;
html += `<button class="menu-btn" onclick="window.showProgressTable()">📊 Успеваемость</button>`;
if (isAdmin()) html += `<button class="menu-btn" onclick="window.showAdminPanel()" style="background:rgba(255,80,80,0.2);border-color:rgba(255,80,80,0.5);color:#ff6b6b;">️ Админ-панель</button>`;
html += `<hr style="border-color:var(--border-color);margin:20px 0;"><p style="color:var(--text-secondary);text-align:center;font-style:italic;">Выбери раздел или задай вопрос Акаше</p></div>`;
const menuDiv = document.createElement('div');
menuDiv.className = 'message akasha-message';
menuDiv.innerHTML = html;
container.appendChild(menuDiv);
setTimeout(() => { container.scrollTop = container.scrollHeight; }, 50);
}
window.showTOC = async function() {
const container = document.getElementById('chat-container');
if (container) container.innerHTML = '';
await loadSectionsFromFirebase();
let html = `<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;">`;
html += `<h3 style="color:#64ffda;margin-bottom:25px;font-family:'Playfair Display',serif;text-align:center;font-size:1.8em;">📚 Оглавление знаний Ордена</h3>`;
const years = [...new Set(sectionsList.map(s => s.year))].sort((a, b) => b - a);
if (years.length === 0) {
html += `<p style="color:#6b5f4a;text-align:center;font-style:italic;font-size:1.1em;">Разделы пока не созданы.</p>`;
if (isAdmin()) html += `<button class="hw-btn" onclick="window.startAddYear()" style="width:100%;margin-top:20px;background:rgba(76,175,80,0.3);color:#4caf50;font-size:1.1em;">➕ Добавить новый год</button>`;
} else {
html += `<div style="margin-bottom:20px;">`;
years.forEach(year => { html += `<button class="hw-btn" onclick="window.showYearSections(${year})" style="width:100%;margin-bottom:10px;background:rgba(100,255,218,0.2);color:#64ffda;font-size:1.2em;padding:15px;">📅 ${year} год</button>`; });
html += `</div>`;
if (isAdmin()) html += `<button class="hw-btn" onclick="window.startAddYear()" style="width:100%;margin-top:20px;background:rgba(76,175,80,0.3);color:#4caf50;font-size:1.1em;"> Добавить новый год</button>`;
}
html += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%;margin-top:15px;padding:12px;font-size:1.1em;">🔙 Вернуться в меню</button></div>`;
addRawHTML(html);
};
window.showYearSections = async function(year) {
const container = document.getElementById('chat-container');
if (container) container.innerHTML = '';
await loadSectionsFromFirebase();
const yearSections = sectionsList.filter(s => s.year === year);
const availableRanks = accessLevels[currentUser.ранг];
let html = `<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;">`;
html += `<h3 style="color:#64ffda;margin-bottom:25px;font-family:'Playfair Display',serif;text-align:center;font-size:1.8em;">📅 ${year} год</h3>`;
if (yearSections.length === 0) {
html += `<p style="color:#6b5f4a;text-align:center;font-style:italic;font-size:1.1em;">В этом году разделов пока нет.</p>`;
} else {
html += `<div style="margin-bottom:20px;">`;
yearSections.forEach(section => {
if (availableRanks.includes(section.rank)) {
html += `<div style="display:flex;gap:10px;margin-bottom:10px;align-items:center;">`;
html += `<button onclick="window.showSectionLessons('${section.id}')" style="flex:1;background:rgba(139,195,74,0.2);color:var(--accent-color);font-size:1.1em;padding:12px;border-radius:8px;border:1px solid rgba(139,195,74,0.4);">📖 ${section.name}</button>`;
if (isAdmin()) {
html += `<button onclick="window.editSection('${section.id}')" style="background:rgba(100,255,218,0.2);color:#64ffda;padding:12px;border-radius:8px;border:1px solid rgba(100,255,218,0.4);font-size:1em;min-width:50px;">✏️</button>`;
html += `<button onclick="window.deleteSection('${section.id}','${section.name.replace(/'/g,"\\'")}')" style="background:rgba(255,80,80,0.2);color:#ff6b6b;padding:12px;border-radius:8px;border:1px solid rgba(255,80,80,0.4);font-size:1em;min-width:50px;">🗑️</button>`;
}
html += `</div>`;
}
});
html += `</div>`;
}
if (isAdmin()) {
html += `<button class="hw-btn" onclick="window.startAddSection(${year})" style="width:100%;margin-top:20px;background:rgba(76,175,80,0.3);color:#4caf50;font-size:1.1em;">➕ Добавить раздел в ${year} год</button>`;
}
html += `<button class="hw-btn" onclick="showTOC()" style="width:100%;margin-top:15px;padding:12px;font-size:1.1em;">🔙 Назад к годам</button></div>`;
addRawHTML(html);
};
window.showSectionLessons = async function(sectionId) {
const container = document.getElementById('chat-container');
if (container) container.innerHTML = '';
await loadLessonsFromFirebase();
const section = sectionsList.find(s => s.id === sectionId);
if (!section) { addMessage('<p>❌ Раздел не найден!</p>'); return; }
const sectionLessons = Object.values(lessonsById).filter(l => l.sectionId === sectionId);
let html = `<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;">`;
html += `<h3 style="color:#64ffda;margin-bottom:25px;font-family:'Playfair Display',serif;text-align:center;font-size:1.8em;"> ${section.name} (${section.year})</h3>`;
if (sectionLessons.length === 0) html += `<p style="color:#6b5f4a;text-align:center;font-style:italic;font-size:1.1em;">Уроков в этом разделе пока нет.</p>`;
else {
html += `<div style="margin-bottom:20px;">`;
sectionLessons.forEach(lesson => { html += `<div class="toc-lesson-link" onclick="window.showLessonContent('${lesson.id}')" style="padding:12px;margin:5px 0;background:rgba(0,0,0,0.2);border-radius:8px;font-size:1.1em;cursor:pointer;">📚 ${lesson.title}</div>`; });
html += `</div>`;
}
if (isMaster()) html += `<button class="hw-btn" onclick="window.startAddLessonToSection('${sectionId}')" style="width:100%;margin-top:20px;background:rgba(76,175,80,0.3);color:#4caf50;font-size:1.1em;">➕ Добавить урок в этот раздел</button>`;
html += `<button class="hw-btn" onclick="window.showYearSections(${section.year})" style="width:100%;margin-top:15px;padding:12px;font-size:1.1em;">🔙 Назад к разделам</button></div>`;
addRawHTML(html);
};
window.startAddYear = function() { addMessage(`<p>📅 <strong>Добавление нового года</strong></p><p>Введите год (например: <em>2026</em>) или <em>"отмена"</em>:</p>`); addLessonState = { step: 'add_year' }; };
window.startAddSection = function(year) { addMessage(`<p>📖 <strong>Добавление раздела в ${year} год</strong></p><p>Выберите ранг для раздела:<br><em>адепт, юнлинг, падаван, старший падаван, рыцарь, мастер</em><br>или <em>"отмена"</em></p>`); addLessonState = { step: 'add_section_rank', year: year }; };
window.startAddLessonToSection = function(sectionId) { const section = sectionsList.find(s => s.id === sectionId); if (!section) { addMessage('<p>❌ Раздел не найден!</p>'); return; } addMessage(`<p> <strong>Добавление урока в "${section.name}"</strong></p><p>Введите <strong>название урока</strong> или <em>"отмена"</em>:</p>`); addLessonState = { step: 'add_lesson_title', sectionId: sectionId, section: section }; };
window.showHomeworkBoard = async function() {
const container = document.getElementById('chat-container');
if (container) container.innerHTML = '';
await loadAssignments(); await loadSubmissions();
let html = `<div class="homework-board"><div class="homework-header"> Домашние задания Ордена</div>`;
if (assignmentsList.length === 0) { html += `<p style="color:#6b5f4a;text-align:center;font-style:italic;">Заданий пока нет.</p><p style="color:#8bc34a;text-align:center;margin-top:20px;">💡 Мастер может создать первое задание!</p>`; }
else {
assignmentsList.forEach((hw) => {
if (!hw) return;
const hwTitle = hw.title || 'Без названия'; const hwId = hw.id || '';
if (!hwId) return;
const hwSubmissions = submissionsList.filter(s => s.assignmentId === hwId);
const pendingCount = hwSubmissions.filter(s => s.status === 'pending').length;
const mySubmissions = submissionsList.filter(s => s.assignmentId === hwId && s.studentName === currentUser.name);
const myLastSubmission = mySubmissions.length > 0 ? mySubmissions.sort((a, b) => (a.submittedAt?.seconds || 0) - (b.submittedAt?.seconds || 0))[0] : null;
html += `<div class="hw-card"><div class="hw-title">${hwTitle}</div><div class="hw-desc">${hw.description || ''}</div>`;
const dateStr = hw.createdAt ? new Date(hw.createdAt.seconds * 1000).toLocaleString('ru-RU') : 'дата неизвестна';
html += `<div class="hw-meta">👤 ${hw.createdBy || 'неизвестно'} | 📅 ${dateStr}</div>`;
if (myLastSubmission) {
const statusEmoji = myLastSubmission.status === 'approved' ? '✅' : (myLastSubmission.status === 'needs_revision' ? '⚠️' : '');
const statusText = myLastSubmission.status === 'approved' ? 'Одобрено' : (myLastSubmission.status === 'needs_revision' ? 'На доработку' : 'На проверке');
const statusColor = myLastSubmission.status === 'approved' ? '#4caf50' : (myLastSubmission.status === 'needs_revision' ? '#ff9800' : '#2196f3');
html += `<div style="margin:15px 0;padding:12px;background:rgba(${myLastSubmission.status === 'approved' ? '76,175,80' : (myLastSubmission.status === 'needs_revision' ? '255,152,0' : '33,150,243')},0.1);border-radius:8px;border-left:3px solid ${statusColor};">`;
html += `<p style="color:${statusColor};margin:0 0 8px 0;font-weight:bold;">${statusEmoji} Статус: ${statusText}</p>`;
html += `<p style="color:var(--text-color);margin:0 0 8px 0;font-size:0.95em;"><strong>Мой ответ:</strong> ${myLastSubmission.content}</p>`;
if (myLastSubmission.masterFeedback) html += `<p style="color:#64ffda;margin:0 0 8px 0;font-size:0.95em;"><strong> Комментарий Мастера:</strong> ${myLastSubmission.masterFeedback}</p>`;
const submitDate = myLastSubmission.submittedAt ? new Date(myLastSubmission.submittedAt.seconds * 1000).toLocaleString('ru-RU') : '';
html += `<p style="color:#6b5f4a;margin:8px 0 0 0;font-size:0.85em;font-style:italic;"> Отправлено: ${submitDate}</p>`;
if (myLastSubmission && myLastSubmission.id) html += `<div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;"><button class="hw-btn" onclick="window.deleteMySubmission('${myLastSubmission.id}','${hwId}')" style="background:rgba(255,80,80,0.2);color:#ff6b6b;border:1px solid rgba(255,80,80,0.4);flex:1;min-width:150px;">🗑️ Удалить мой ответ</button></div>`;
html += `</div>`;
}
if (isMaster()) {
html += `<div style="margin:10px 0;padding:10px;background:rgba(255,165,0,0.1);border-radius:8px;border:1px solid rgba(255,165,0,0.3);">`;
html += `<p style="color:#ffa500;margin:0;">📬 Ответов: ${hwSubmissions.length} | ⏳ На проверке: ${pendingCount}</p>`;
html += `<div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;">`;
if (hwSubmissions.length > 0) html += `<button class="hw-btn" onclick="window.reviewSubmissions('${hwId}')" style="flex:1;min-width:150px;background:rgba(255,165,0,0.3);color:#ffa500;">🔍 Проверить ответы</button>`;
html += `<button class="hw-btn" onclick="window.deleteAssignment('${hwId}','${hwTitle.replace(/'/g,"\\'")}')" style="flex:1;min-width:150px;background:rgba(255,80,80,0.2);color:#ff6b6b;border:1px solid rgba(255,80,80,0.4);">🗑️ Удалить задание</button>`;
html += `</div></div>`;
}
if (!isMaster() || hw.createdBy !== currentUser.name) { const escapedTitle = hwTitle.replace(/'/g,"\\'").replace(/"/g,'&quot;'); html += `<div class="hw-actions"><button class="hw-btn submit" onclick="window.submitHomework('${hwId}','${escapedTitle}')">📤 Отправить ответ</button></div>`; }
html += `</div>`;
});
}
if (isMaster()) html += `<button class="hw-btn create" onclick="window.startCreateAssignment()" style="width:100%;margin-top:20px;padding:15px;"> Создать новое задание</button>`;
html += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%;margin-top:10px;padding:12px;">🔙 Вернуться в меню</button></div>`;
addRawHTML(html);
};
window.reviewSubmissions = function(assignmentId) {
const container = document.getElementById('chat-container');
if (container) container.innerHTML = '';
const hw = assignmentsList.find(a => a.id === assignmentId);
if (!hw) return;
const hwSubmissions = submissionsList.filter(s => s.assignmentId === assignmentId);
let html = `<div class="homework-board"><div class="homework-header">🔍 Проверка ответов: ${hw.title}</div>`;
if (hwSubmissions.length === 0) html += `<p style="color:#6b5f4a;text-align:center;">Ответов пока нет.</p>`;
else {
hwSubmissions.forEach(sub => {
const statusEmoji = sub.status === 'approved' ? '✅' : (sub.status === 'needs_revision' ? '⚠️' : '⏳');
const statusText = sub.status === 'approved' ? 'Одобрено' : (sub.status === 'needs_revision' ? 'На доработку' : 'На проверке');
html += `<div class="hw-card" style="border-left-color:${sub.status === 'approved' ? '#4caf50' : (sub.status === 'needs_revision' ? '#ff9800' : '#2196f3')};">`;
html += `<div class="hw-title">${statusEmoji} ${sub.studentName} <span style="font-size:0.8em;color:#a89b7e;">(${sub.studentRank})</span></div><div class="hw-desc">${sub.content}</div>`;
const dateStr = sub.submittedAt ? new Date(sub.submittedAt.seconds * 1000).toLocaleString('ru-RU') : '';
html += `<div class="hw-meta">📅 ${dateStr} | Статус: ${statusText}</div>`;
if (sub.masterFeedback) html += `<div style="margin:10px 0;padding:10px;background:rgba(100,255,218,0.1);border-radius:8px;"><p style="color:#64ffda;margin:0;"><strong>💬 Комментарий Мастера:</strong> ${sub.masterFeedback}</p></div>`;
html += `<div class="hw-actions"><button class="hw-btn" onclick="window.gradeSubmission('${sub.id}','${hw.id}','approved')" style="background:rgba(76,175,80,0.3);color:#4caf50;">✅ Одобрить</button><button class="hw-btn" onclick="window.gradeSubmission('${sub.id}','${hw.id}','needs_revision')" style="background:rgba(255,152,0,0.3);color:#ff9800;">⚠️ На доработку</button><button class="hw-btn" onclick="window.addFeedback('${sub.id}','${hw.id}')" style="background:rgba(100,255,218,0.2);color:#64ffda;"> Комментарий</button></div></div>`;
});
}
html += `<button class="hw-btn" onclick="window.showHomeworkBoard()" style="width:100%;margin-top:10px;padding:12px;">🔙 Назад к заданиям</button></div>`;
addRawHTML(html);
};
window.startCreateAssignment = function() { addMessage(`<p>Создание нового задания.</p><p>Введите <strong>название</strong> задания (или <em>"отмена"</em>):</p>`); addLessonState = { step: 'create_hw_title' }; };
window.submitHomework = function(hwId, hwTitle) { if (!hwId || !hwTitle) { addMessage(`<p>❌ Ошибка: задание не найдено!</p>`); return; } addMessage(`<p>Отправка ответа на задание: <strong>${hwTitle}</strong></p><p>Напишите ваш ответ (или <em>"отмена"</em>):</p>`); addLessonState = { step: 'submit_hw_text', hwId: hwId, hwTitle: hwTitle }; };
window.deleteAssignment = async function(assignmentId, assignmentTitle) {
if (!windowDb) return showAlert('Ошибка', 'База данных не подключена!');
if (!isMaster()) return showAlert('Доступ запрещён', 'Только для Мастеров и Магистров.');
const submissionCount = submissionsList.filter(s => s.assignmentId === assignmentId).length;
const confirmed = await askConfirm('️ ВНИМАНИЕ!', `Вы действительно хотите УДАЛИТЬ задание "${assignmentTitle}"?`);
if (!confirmed) return;
const confirmText = await askPrompt('Подтверждение', 'Напишите "УДАЛИТЬ" для подтверждения:');
if (confirmText !== 'УДАЛИТЬ') { return showAlert('Отменено', 'Удаление отменено.'); }
try {
await windowDb.collection('homework_assignments').doc(assignmentId).delete();
const submissionsSnap = await windowDb.collection('homework_submissions').where('assignmentId', '==', assignmentId).get();
if (!submissionsSnap.empty) { const batch1 = windowDb.batch(); submissionsSnap.forEach(doc => batch1.delete(doc.ref)); await batch1.commit(); }
assignmentsList = assignmentsList.filter(a => a.id !== assignmentId);
submissionsList = submissionsList.filter(s => s.assignmentId !== assignmentId);
showAlert('Успех', `Задание "${assignmentTitle}" и все ответы (${submissionCount} шт.) удалены!`);
window.showHomeworkBoard();
} catch (error) { showAlert('Ошибка', `Не удалось удалить задание: ${error.message}`); }
};
async function showLessonContentWithReadButton(lessonId) {
const container = document.getElementById('chat-container');
if (container) container.innerHTML = '';
if (!lessonId) { addMessage('<p>❌ Ошибка: нет ID урока!</p>'); return; }
const lesson = lessonsById[lessonId];
if (!lesson) { addMessage('<p>❌ Урок не найден.</p>'); return; }
const isRead = await isLessonRead(lessonId);
let html = `<h3 style="color:#64ffda;font-family:'Playfair Display',serif;">📖 ${lesson.title}</h3>`;
html += `<p style="color:#a89b7e;font-size:0.9em;margin-bottom:15px;">Категория: <em>${lesson.category}</em></p>`;
html += `<div style="line-height:1.9;">${formatLessonHTML(lesson.content)}</div>`;
if (lesson.mediaUrl) {
html += `<div style="margin-top:20px;">`;
if (lesson.mediaUrl.includes('youtube.com') || lesson.mediaUrl.includes('rutube.ru')) html += `<iframe width="100%" height="315" src="${lesson.mediaUrl}" frameborder="0" allowfullscreen style="border-radius:10px;"></iframe>`;
else if (lesson.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) html += `<img src="${lesson.mediaUrl}" style="max-width:100%;border-radius:10px;margin-top:10px;">`;
else if (lesson.mediaUrl.match(/\.(mp4|webm|ogg)$/i)) html += `<video controls style="max-width:100%;margin-top:10px;border-radius:10px;"><source src="${lesson.mediaUrl}"></video>`;
else html += `<a href="${lesson.mediaUrl}" target="_blank" rel="noopener noreferrer" style="color:#64ffda;text-decoration:underline;">🔗 Открыть медиа</a>`;
html += `</div>`;
}
if (isRead) html += `<button class="read-btn read" disabled>✅ Прочитано</button>`;
else html += `<button class="read-btn" onclick="window.markLessonRead('${lessonId}')">👁️ Отметить как прочитанное</button>`;
const isAdminUser = isAdmin();
if (isAdminUser) html += `<div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;"><button class="edit-btn" onclick="window.editLesson('${lesson.id}')">✏️ Редактировать</button><button class="delete-btn" onclick="window.confirmDeleteLesson('${lesson.id}')">🗑️ Удалить</button></div>`;
html += `<div class="comments-section"><div class="comments-header"> Комментарии</div>`;
const comments = await loadCommentsForLesson(lessonId);
if (comments.length === 0) html += `<p style="color:#6b5f4a;font-style:italic;">Комментариев пока нет. Будь первым!</p>`;
else {
comments.forEach(comment => {
const isMasterComment = comment.type === 'task';
const isAuthor = comment.authorName === currentUser.name;
const canDelete = isAuthor || isAdminUser;
const canEdit = isAuthor;
html += `<div class="comment-item ${isMasterComment ? 'master-comment' : ''}"><div class="comment-author ${isMasterComment ? 'master' : ''}">${comment.authorName}<span class="comment-type-badge ${isMasterComment ? 'badge-task' : 'badge-question'}">${isMasterComment ? '📝 Задание' : '💬 Комментарий'}</span></div><div class="comment-text">${comment.text}</div><div class="comment-meta">${comment.createdAt ? new Date(comment.createdAt.seconds * 1000).toLocaleString('ru-RU') : ''}</div>`;
if (canEdit || canDelete) {
html += `<div class="comment-actions">`;
if (canEdit) html += `<button class="comment-edit-btn" onclick="window.editComment('${comment.id}','${lesson.id}')">✏️ Изменить</button>`;
if (canDelete) html += `<button class="comment-delete-btn" onclick="window.deleteComment('${comment.id}','${lesson.id}')">🗑️ Удалить</button>`;
html += `</div>`;
}
html += `</div>`;
});
}
html += `<button class="comment-btn" onclick="window.startAddComment('${lesson.id}')"> Добавить комментарий</button></div><button class="hw-btn" onclick="showMainMenu()" style="width:100%;margin-top:10px;padding:12px;">🔙 Вернуться в меню</button>`;
addMessage(html);
}
window.markLessonRead = async function(lessonId) { const success = await markLessonAsRead(lessonId); if (success) { addMessage('<p>✅ Урок отмечен как прочитанный!</p>'); showLessonContentWithReadButton(lessonId); } else { addMessage('<p>❌ Ошибка отметки урока.</p>'); } };
window.showLessonContent = showLessonContentWithReadButton;
window.startAddComment = function(lessonId) { if (!lessonId) { addMessage('<p>❌ Ошибка!</p>'); return; } const isMasterUser = isMaster(); if (isMasterUser) { addMessage(`<p>Какой тип комментария? Напиши:</p><p>• <em>"задание"</em> — задание от Мастера</p><p>• <em>"комментарий"</em> — обычный комментарий</p><p>• <em>"отмена"</em> — отменить</p>`); addLessonState = { step: 'ask_comment_type', lessonId: lessonId }; } else { addMessage(`<p>Напиши свой комментарий (или <em>"отмена"</em>):</p>`); addLessonState = { step: 'add_comment_text', lessonId: lessonId, type: 'question' }; } };
window.editComment = function(commentId, lessonId) { addMessage(`<p>Введите новый текст (или <em>"отмена"</em>):</p>`); addLessonState = { step: 'edit_comment', commentId: commentId, lessonId: lessonId }; };
window.deleteComment = async function(commentId, lessonId) { const success = await deleteCommentFromFirebase(commentId); if (success) { addMessage(`<p>✅ Комментарий удалён!</p>`); showLessonContent(lessonId); } else { addMessage(`<p> Ошибка.</p>`); } };
window.editLesson = function(lessonId) { const lesson = lessonsById[lessonId]; if (!lesson) return; addMessage(`<div style="background:rgba(100,255,218,0.1);border:1px solid rgba(100,255,218,0.3);border-radius:10px;padding:15px;margin:10px 0;"><p style="color:#64ffda;font-weight:bold;margin-bottom:10px;">⚠️ РЕДАКТИРОВАНИЕ УРОКА</p><p><strong>Название:</strong> ${lesson.title}</p><p><strong>Текст:</strong> ${lesson.content.substring(0,100)}${lesson.content.length > 100 ? '...' : ''}</p><p><strong>Медиа:</strong> ${lesson.mediaUrl || 'нет'}</p></div><p>Что изменить? Напиши:</p><p>• <em>"название"</em>, <em>"текст"</em>, <em>"медиа"</em>, <em>"всё"</em> или <em>"отмена"</em></p>`); addLessonState = { step: 'edit_choose', lessonId: lessonId, currentData: lesson }; };
window.confirmDeleteLesson = async function(lessonId) { const lesson = lessonsById[lessonId]; if (!lesson) return; addMessage(`<p>️ Удалить урок "<strong>${lesson.title}</strong>"?<br>Напиши <em>"да, удалить"</em> или <em>"отмена"</em>.</p>`); addLessonState = { step: 'confirm_delete', lessonId: lessonId, lessonTitle: lesson.title }; };
function startAddLesson() { addMessage('<p>📝 <strong>Добавление урока</strong></p><p>Для какого ранга?<br><em>адепт, юнлинг, падаван, рыцарь, мастер, магистр</em></p>'); addLessonState = { step: 'category' }; }
async function findAnswer(question) {
const q = question.toLowerCase().trim();
if (addLessonState && addLessonState.step === 'add_book_cover') {
if (q === 'отмена') { addLessonState = null; return '<p> Отменено.</p>'; }
if (q === 'нет') { addLessonState.coverUrl = ''; addLessonState.step = 'add_book_title'; return '<p><strong>Шаг 2/5 — Название книги</strong> (или <em>"нет"</em> / <em>"отмена"</em>):</p>'; }
if (q === 'файл') { addLessonState.step = 'add_book_cover_upload'; window.uploadBookFile('cover'); return '<p>Выберите файл в открывшемся окне. После загрузки напишите <em>"готово"</em> или <em>"отмена"</em>.</p>'; }
addLessonState.coverUrl = q; addLessonState.step = 'add_book_title'; return '<p><strong>Шаг 2/5 — Название книги</strong> (или <em>"нет"</em> / <em>"отмена"</em>):</p>';
}
if (addLessonState && addLessonState.step === 'add_book_cover_upload') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
if (q === 'готово') {
if (!addLessonState.coverUrl) return '<p>⚠️ Файл ещё не загружен. Напишите <em>"нет"</em>, чтобы пропустить, или <em>"отмена"</em>.</p>';
addLessonState.step = 'add_book_title'; return '<p><strong>Шаг 2/5 — Название книги</strong> (или <em>"нет"</em> / <em>"отмена"</em>):</p>';
}
return '<p>Сначала загрузите файл, затем напишите <em>"готово"</em> (или <em>"нет"</em> / <em>"отмена"</em>).</p>';
}
if (addLessonState && addLessonState.step === 'add_book_title') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
addLessonState.title = q === 'нет' ? 'Без названия' : question; addLessonState.step = 'add_book_author';
return '<p><strong>Шаг 3/5 — Автор</strong> (или <em>"неизвестно"</em> / <em>"отмена"</em>):</p>';
}
if (addLessonState && addLessonState.step === 'add_book_author') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
addLessonState.author = q === 'неизвестно' ? 'Неизвестный автор' : question; addLessonState.step = 'add_book_desc';
return '<p><strong>Шаг 4/5 — Аннотация</strong> (или <em>"нет"</em> / <em>"отмена"</em>):</p>';
}
if (addLessonState && addLessonState.step === 'add_book_desc') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
addLessonState.description = q === 'нет' ? '' : question; addLessonState.step = 'add_book_file';
return '<p><strong>Шаг 5/5 — Сама книга.</strong> Вставьте прямую ссылку (URL), ИЛИ напишите <em>"файл"</em> для загрузки, ИЛИ <em>"нет"</em>, ИЛИ <em>"отмена"</em>:</p>';
}
if (addLessonState && addLessonState.step === 'add_book_file') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
if (q === 'нет') { await finalizeBook(); return ''; }
if (q === 'файл') { addLessonState.step = 'add_book_file_upload'; window.uploadBookFile('book'); return '<p>Выберите файл. После загрузки напишите <em>"готово"</em> или <em>"отмена"</em>.</p>'; }
addLessonState.fileUrl = q; await finalizeBook(); return '';
}
if (addLessonState && addLessonState.step === 'add_book_file_upload') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
if (q === 'готово') {
if (!addLessonState.fileUrl) return '<p>️ Файл ещё не загружен. Напишите <em>"нет"</em>, чтобы сохранить без файла, или <em>"отмена"</em>.</p>';
await finalizeBook(); return '';
}
return '<p>Сначала загрузите файл, затем напишите <em>"готово"</em> (или <em>"нет"</em> / <em>"отмена"</em>).</p>';
}
if (addLessonState && addLessonState.step === 'add_department_name') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
addLessonState = { step: 'add_department_desc', name: question };
return '<p>Введите <strong>описание отдела</strong> (или <em>"нет"</em>, <em>"отмена"</em>):</p>';
}
if (addLessonState && addLessonState.step === 'add_department_desc') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
const desc = q === 'нет' ? '' : question;
const success = await addDepartmentToFirebase(addLessonState.name, desc);
if (success) { addMessage(`<p>✅ Отдел "${addLessonState.name}" создан!</p>`); await loadLibraryFromFirebase(); window.showLibrary(); }
else addMessage('<p>❌ Ошибка создания отдела.</p>');
addLessonState = null; return '';
}
if (addLessonState && addLessonState.step === 'add_year') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
const year = parseInt(q);
if (isNaN(year) || year < 2020 || year > 2100) return '<p>❌ Неверный год! Введите год от 2020 до 2100.</p>';
addLessonState = { step: 'add_section_rank', year: year };
return `<p>Выберите ранг для первого раздела в ${year} году:<br><em>адепт, юнлинг, падаван, старший падаван, рыцарь, мастер</em><br>или <em>"отмена"</em></p>`;
}
if (addLessonState && addLessonState.step === 'add_section_rank') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
const validRanks = ['адепт', 'юнлинг', 'падаван', 'старший падаван', 'рыцарь', 'мастер'];
if (!validRanks.includes(q)) return `<p>❌ Неверный ранг! Выберите: ${validRanks.join(', ')}</p>`;
addLessonState = { step: 'add_section_name', year: addLessonState.year, rank: q };
return `<p>Введите название раздела (например: "Занятия для Адептов") или <em>"отмена"</em>:</p>`;
}
if (addLessonState && addLessonState.step === 'add_section_name') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
const year = addLessonState.year;
const rank = addLessonState.rank || q.toLowerCase();
const name = question;
const order = sectionsList.filter(s => s.year === year).length + 1;
const success = await addSectionToFirebase(year, rank, name, order);
if (success) { addMessage(`<p>✅ Раздел "${name}" добавлен в ${year} год!</p>`); await loadSectionsFromFirebase(); window.showYearSections(year); }
else addMessage('<p>❌ Ошибка добавления раздела.</p>');
addLessonState = null; return '';
}
if (addLessonState && addLessonState.step === 'add_lesson_title') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
addLessonState.lessonTitle = question;
addLessonState.step = 'add_lesson_content';
return '<p>Введите <strong>текст урока</strong> (или <em>"отмена"</em>):</p>';
}
if (addLessonState && addLessonState.step === 'add_lesson_content') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
addLessonState.lessonContent = question;
addLessonState.step = 'add_lesson_media';
return '<p>Введите ссылку на медиа (или <em>нет</em>, <em>отмена</em>):</p>';
}
if (addLessonState && addLessonState.step === 'add_lesson_media') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
const mediaUrl = q === 'нет' ? '' : question;
const section = addLessonState.section;
const success = await addLessonToFirebase(section.rank, addLessonState.lessonTitle, addLessonState.lessonContent, mediaUrl, section.year, addLessonState.sectionId);
if (success) { addMessage(`<p>✅ Урок "${addLessonState.lessonTitle}" добавлен!</p>`); await loadLessonsFromFirebase(); window.showSectionLessons(addLessonState.sectionId); }
else addMessage('<p>❌ Ошибка добавления урока.</p>');
addLessonState = null; return '';
}
if (addLessonState && addLessonState.step === 'add_schedule_datetime') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
const dateRegex = /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}$/;
if (!dateRegex.test(q)) return '<p>❌ Неверный формат! Используй: <em>ГГГГ-ММ-ДД ЧЧ:ММ</em><br>Например: <em>2026-07-20 18:00</em></p>';
addLessonState.dateTime = q; addLessonState.step = 'add_schedule_topic';
return '<p>Введите <strong>тему занятия</strong> (или <em>"отмена"</em>):</p>';
}
if (addLessonState && addLessonState.step === 'add_schedule_topic') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
addLessonState.topic = question; addLessonState.step = 'add_schedule_materials';
return '<p>Что <strong>понадобится</strong> для занятия? (или <em>"нет"</em>, <em>"отмена"</em>):</p>';
}
if (addLessonState && addLessonState.step === 'add_schedule_materials') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
addLessonState.materials = q === 'нет' ? '' : question; addLessonState.step = 'add_schedule_teacher';
return '<p>Кто будет <strong>учителем</strong>? (или <em>"отмена"</em>):</p>';
}
if (addLessonState && addLessonState.step === 'add_schedule_teacher') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
const success = await addScheduleToFirebase(addLessonState.dateTime, addLessonState.topic, addLessonState.materials, question);
if (success) { addMessage(`<p>✅ Занятие добавлено в расписание!</p><p> <strong>${formatDateTimeMSK(addLessonState.dateTime)}</strong></p><p>📚 <strong>${addLessonState.topic}</strong></p><p>📦 Что понадобится: ${addLessonState.materials || '—'}</p><p>👤 Учитель: ${question}</p>`); window.showSchedule(); }
else addMessage('<p>❌ Ошибка добавления занятия.</p>');
addLessonState = null; return '';
}
if (addLessonState && addLessonState.step === 'edit_schedule_choose') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Редактирование отменено.</p>'; }
if (q === 'дата') { addLessonState.step = 'edit_schedule_datetime'; return '<p>Новая дата и время (формат: <em>ГГГГ-ММ-ДД ЧЧ:ММ</em>) или <em>"пропустить"</em>:</p>'; }
if (q === 'тема') { addLessonState.step = 'edit_schedule_topic'; return '<p>Новая тема (или <em>"пропустить"</em>):</p>'; }
if (q === 'материалы') { addLessonState.step = 'edit_schedule_materials'; return '<p>Новые материалы (или <em>"пропустить"</em>):</p>'; }
if (q === 'учитель') { addLessonState.step = 'edit_schedule_teacher'; return '<p>Новый учитель (или <em>"пропустить"</em>):</p>'; }
if (q === 'всё') { addLessonState.step = 'edit_schedule_datetime'; addLessonState.editAll = true; return '<p>Новая дата и время (формат: <em>ГГГГ-ММ-ДД ЧЧ:ММ</em>) или <em>"пропустить"</em>:</p>'; }
return '<p>Напиши: <em>дата</em>, <em>тема</em>, <em>материалы</em>, <em>учитель</em>, <em>"всё"</em> или <em>"отмена"</em>.</p>';
}
if (addLessonState && addLessonState.step === 'edit_schedule_datetime') {
if (q !== 'пропустить') { const dateRegex = /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}$/; if (!dateRegex.test(q)) return '<p>❌ Неверный формат! Используй: <em>ГГГГ-ММ-ДД ЧЧ:ММ</em></p>'; addLessonState.newDateTime = q; }
else addLessonState.newDateTime = addLessonState.currentData.dateTime;
if (addLessonState.editAll) { addLessonState.step = 'edit_schedule_topic'; return '<p>Новая тема (или <em>"пропустить"</em>):</p>'; }
await updateScheduleInFirebase(addLessonState.scheduleId, { dateTime: addLessonState.newDateTime });
addMessage('<p>✅ Дата изменена!</p>'); addLessonState = null; window.showSchedule(); return '';
}
if (addLessonState && addLessonState.step === 'edit_schedule_topic') {
if (q !== 'пропустить') addLessonState.newTopic = question; else addLessonState.newTopic = addLessonState.currentData.topic;
if (addLessonState.editAll) { addLessonState.step = 'edit_schedule_materials'; return '<p>Новые материалы (или <em>"пропустить"</em>):</p>'; }
await updateScheduleInFirebase(addLessonState.scheduleId, { topic: addLessonState.newTopic });
addMessage('<p>✅ Тема изменена!</p>'); addLessonState = null; window.showSchedule(); return '';
}
if (addLessonState && addLessonState.step === 'edit_schedule_materials') {
if (q !== 'пропустить') addLessonState.newMaterials = question; else addLessonState.newMaterials = addLessonState.currentData.materials;
if (addLessonState.editAll) { addLessonState.step = 'edit_schedule_teacher'; return '<p>Новый учитель (или <em>"пропустить"</em>):</p>'; }
await updateScheduleInFirebase(addLessonState.scheduleId, { materials: addLessonState.newMaterials });
addMessage('<p>✅ Материалы изменены!</p>'); addLessonState = null; window.showSchedule(); return '';
}
if (addLessonState && addLessonState.step === 'edit_schedule_teacher') {
const newTeacher = q === 'пропустить' ? addLessonState.currentData.teacher : question;
const updates = {};
if (addLessonState.newDateTime !== undefined) updates.dateTime = addLessonState.newDateTime;
if (addLessonState.newTopic !== undefined) updates.topic = addLessonState.newTopic;
if (addLessonState.newMaterials !== undefined) updates.materials = addLessonState.newMaterials;
updates.teacher = newTeacher;
await updateScheduleInFirebase(addLessonState.scheduleId, updates);
addMessage('<p>✅ Занятие обновлено!</p>'); addLessonState = null; window.showSchedule(); return '';
}
if (addLessonState && addLessonState.step === 'create_hw_title') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Создание отменено.</p>'; }
addLessonState.hwTitle = question; addLessonState.step = 'create_hw_desc'; return '<p>Введите <strong>описание задания</strong> (или <em>"отмена"</em>):</p>';
}
if (addLessonState && addLessonState.step === 'create_hw_desc') {
if (q === 'отмена') { addLessonState = null; return '<p>❌ Создание отменено.</p>'; }
createAssignment(addLessonState.hwTitle, question).then(success => { if (success) { addMessage(`<p>✅ Задание "<strong>${addLessonState.hwTitle}</strong>" создано!</p>`); window.showHomeworkBoard(); } else { addMessage('<p> Ошибка создания.</p>'); } });
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
addCommentToFirebase(addLessonState.lessonId, question, addLessonState.type).then(success => { if (success) { addMessage(`<p>✅ Комментарий добавлен!</p>`); setTimeout(() => { showLessonContent(addLessonState.lessonId); }, 500); } else { addMessage('<p> Ошибка.</p>'); } });
addLessonState = null; return '';
}
if (addLessonState && addLessonState.step === 'edit_comment') {
if (q === 'отмена') { addLessonState = null; return '<p> Отменено.</p>'; }
updateCommentInFirebase(addLessonState.commentId, question).then(success => { if (success) { addMessage(`<p>✅ Обновлён!</p>`); showLessonContent(addLessonState.lessonId); } else { addMessage('<p>❌ Ошибка.</p>'); } });
addLessonState = null; return '';
}
if (addLessonState && addLessonState.step && addLessonState.step.startsWith('edit_') && !addLessonState.step.startsWith('edit_schedule')) {
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
for (let key in usersDatabase) { const user = usersDatabase[key]; if (user.fullName.toLowerCase() === userData.name) { foundUser = user; break; } }
if (!foundUser && windowDb) {
try {
const snapshot = await windowDb.collection('users').get();
snapshot.forEach((doc) => { const data = doc.data(); if (data.fullName.toLowerCase() === userData.name) { foundUser = { fullName: data.fullName, ранг: data.rank, учитель: data.teacher, пароль: data.password, specialTitle: data.specialTitle || '', description: data.description || '', статусы: data.статусы || [], звания: data.звания || [] }; usersDatabase[doc.id] = foundUser; } });
} catch (error) { console.error('Ошибка поиска пользователя в Firebase:', error); }
}
if (foundUser && foundUser.ранг === userData.ранг && foundUser.пароль === userData.пароль) {
currentUser = { name: foundUser.fullName, ранг: foundUser.ранг, учитель: userData.учитель || foundUser.учитель };
saveUserToStorage(); updateLogoutButton();
loadLessonsFromFirebase(); loadAssignments(); loadSubmissions(); loadScheduleFromFirebase(); loadSectionsFromFirebase(); loadLibraryFromFirebase(); loadOnlineStatuses(); registerUserIfNeeded();
addMessage(getRankGreeting(currentUser)); showMainMenu(); return '';
} else { return '<p>❌ Данные не найдены. Проверьте Имя, Ранг и Пароль.</p>'; }
} else { return '<p>📋 Назови Имя, Ранг, Учителя и Пароль через запятую.</p>'; }
}
return '<p> Назови своё Имя, Ранг, Учителя и Пароль.</p>';
}
if (q.includes('выйти') || q.includes('logout')) { handleLogout(); return ''; }
if (q.includes('очистить историю') || q.includes('очистить переписку')) { clearHistory(); chatContainer.innerHTML = ''; addMessage('<p>🧹 Очищено.</p>'); return ''; }
if (q.includes('оглавлен') || q.includes('меню')) { showMainMenu(); return ''; }
if (q.includes('библиотек')) { window.showLibrary(); return ''; }
let knowledge = '';
if (q.includes('ганн')) knowledge = checkAccess('ганн') ? (knowledgeBase['ганн'] ? knowledgeBase['ганн'].map(l => `<p><strong>${l.title}:</strong> ${l.content}</p>`).join('') : '<p>Пусто.</p>') : '<p>Недоступно.</p>';
else if (q.includes('берг')) knowledge = checkAccess('берг') ? (knowledgeBase['берг'] ? knowledgeBase['берг'].map(l => `<p><strong>${l.title}:</strong> ${l.content}</p>`).join('') : '<p>Пусто.</p>') : '<p>Недоступно.</p>';
else if (q.includes('катарн')) knowledge = checkAccess('катарн') ? (knowledgeBase['катарн'] ? knowledgeBase['катарн'].map(l => `<p><strong>${l.title}:</strong> ${l.content}</p>`).join('') : '<p>Пусто.</p>') : '<p>Недоступно.</p>';
else if (q.includes('крайт')) knowledge = checkAccess('крайт') ? (knowledgeBase['крайт'] ? knowledgeBase['крайт'].map(l => `<p><strong>${l.title}:</strong> ${l.content}</p>`).join('') : '<p>Пусто.</p>') : '<p>Недоступно.</p>';
else knowledge = '<p>Спроси о Кланах или напиши "оглавление".</p>';
return knowledge;
}
async function finalizeBook() {
const st = addLessonState;
const ok = await addBookToFirebase(st.departmentId, st.title, st.author, st.description, st.fileUrl || '', st.coverUrl || '');
if (ok) {
addMessage(`<p>✅ Книга "<strong>${st.title}</strong>" добавлена!</p>`);
const did = st.departmentId;
addLessonState = null;
await loadLibraryFromFirebase();
window.showLibraryDepartment(did);
} else {
addMessage('<p>❌ Ошибка добавления книги.</p>');
addLessonState = null;
}
}
async function handleSend() { const text = customTextarea.innerText.trim(); if (!text) return; addMessage(text, true); customTextarea.innerText = ''; const answer = await findAnswer(text); if (answer) addMessage(answer); }
function handleLogout() { sendOfflineStatus(); currentUser = null; saveUserToStorage(); updateLogoutButton(); chatContainer.innerHTML = ''; addMessage('<p>👋 До встречи.</p>'); }
function updateLogoutButton() { const btn = document.querySelector('.logout-btn'); if (btn) btn.style.display = currentUser ? 'block' : 'none'; }
const layouts = {
ru: [['й','ц','у','к','е','н','г','ш','щ','з','х','ъ'], ['ф','ы','в','а','п','р','о','л','д','ж','э'], ['shift','я','ч','с','м','и','т','ь','б','ю','backspace'], ['123', ',', 'enter', 'space']],
en: [['q','w','e','r','t','y','u','i','o','p'], ['a','s','d','f','g','h','j','k','l'], ['shift','z','x','c','v','b','n','m','backspace'], ['123', ',', 'enter', 'space']],
numbers: [['1','2','3','4','5','6','7','8','9','0'], ['-','/',':',';','(',')','$','&','@','"'], ['.','!','?','#','%','*','+','=','№','\\'], ['abc', ',', 'enter', 'space']]
};
let currentLang = 'ru'; let currentMode = 'letters'; let isShift = false; let isCaps = false; let shiftTimeout = null;
function insertTextAtCursor(text) { if(customTextarea) { customTextarea.focus(); document.execCommand('insertText', false, text); } }
function deleteCharAtCursor() { if(customTextarea) { customTextarea.focus(); document.execCommand('delete', false, null); } }
function renderKeyboard() {
if (!customKeyboard) return;
customKeyboard.innerHTML = '';
let layout;
if (currentMode === 'numbers') layout = layouts.numbers;
else layout = currentLang === 'ru' ? layouts.ru : layouts.en;
const langBtn = document.getElementById('lang-toggle-btn');
if (langBtn) langBtn.textContent = currentLang === 'ru' ? 'RU' : 'EN';
layout.forEach(row => {
const rowDiv = document.createElement('div'); rowDiv.className = 'keyboard-row';
row.forEach(key => {
const keyDiv = document.createElement('div'); keyDiv.className = 'key';
if (key === 'shift') {
keyDiv.classList.add('special'); keyDiv.textContent = isCaps ? '⇪' : '⇧';
if (isCaps) keyDiv.classList.add('caps-active');
let touchStartTime = 0;
keyDiv.addEventListener('touchstart', (e) => { e.preventDefault(); touchStartTime = Date.now(); keyDiv.classList.add('pressed'); }, { passive: false });
keyDiv.addEventListener('touchend', (e) => {
e.preventDefault(); keyDiv.classList.remove('pressed');
const touchDuration = Date.now() - touchStartTime;
if (touchDuration < 200) { clearTimeout(shiftTimeout); if (isCaps) { isCaps = false; isShift = false; } else { isShift = !isShift; shiftTimeout = setTimeout(() => { isShift = false; renderKeyboard(); }, 2000); } }
else { isCaps = !isCaps; isShift = false; }
renderKeyboard(); if (navigator.vibrate) navigator.vibrate(10);
});
} else if (key === '123' || key === 'abc') {
keyDiv.classList.add('special'); keyDiv.textContent = currentMode === 'letters' ? '123' : (currentLang === 'ru' ? 'RU' : 'EN');
keyDiv.addEventListener('touchstart', (e) => { e.preventDefault(); keyDiv.classList.add('pressed'); toggleMode(); }, { passive: false });
keyDiv.addEventListener('touchend', () => keyDiv.classList.remove('pressed'));
} else if (key === ',') {
keyDiv.textContent = ',';
keyDiv.addEventListener('touchstart', (e) => { e.preventDefault(); keyDiv.classList.add('pressed'); insertTextAtCursor(','); }, { passive: false });
keyDiv.addEventListener('touchend', () => keyDiv.classList.remove('pressed'));
} else if (key === 'backspace') {
keyDiv.classList.add('special'); keyDiv.textContent = '⌫';
keyDiv.addEventListener('touchstart', (e) => { e.preventDefault(); keyDiv.classList.add('pressed'); deleteCharAtCursor(); }, { passive: false });
keyDiv.addEventListener('touchend', () => keyDiv.classList.remove('pressed'));
} else if (key === 'space') {
keyDiv.classList.add('space');
keyDiv.addEventListener('touchstart', (e) => { e.preventDefault(); keyDiv.classList.add('pressed'); insertTextAtCursor(' '); }, { passive: false });
keyDiv.addEventListener('touchend', () => keyDiv.classList.remove('pressed'));
} else if (key === 'enter') {
keyDiv.classList.add('enter'); keyDiv.textContent = '↵';
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
function toggleLanguage() { currentLang = currentLang === 'ru' ? 'en' : 'ru'; currentMode = 'letters'; isShift = false; isCaps = false; renderKeyboard(); if (navigator.vibrate) navigator.vibrate(10); }
function toggleMode() { if (currentMode === 'letters') currentMode = 'numbers'; else currentMode = 'letters'; isShift = false; isCaps = false; renderKeyboard(); if (navigator.vibrate) navigator.vibrate(10); }
window.toggleLanguage = toggleLanguage;
if (customTextarea) {
customTextarea.addEventListener('focus', () => { customTextarea.style.borderColor = 'rgba(100, 255, 218, 0.6)'; customTextarea.style.boxShadow = '0 0 10px rgba(100, 255, 218, 0.2)'; });
customTextarea.addEventListener('blur', () => { customTextarea.style.borderColor = 'var(--border-color)'; customTextarea.style.boxShadow = 'none'; });
customTextarea.addEventListener('paste', (e) => { e.preventDefault(); insertTextAtCursor(e.clipboardData.getData('text')); });
customTextarea.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); insertTextAtCursor('\n'); } else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } });
}
function toggleKeyboardVisibility() {
const keyboard = document.getElementById('custom-keyboard');
const inputWrapper = document.getElementById('main-input-wrapper');
const ta = document.getElementById('custom-textarea');
if (keyboard.style.display === 'none') {
keyboard.style.display = 'flex';
inputWrapper.classList.remove('keyboard-hidden');
localStorage.setItem('akasha-keyboard-visible', 'true');
isCustomKeyboardActive = true;
if(ta) { ta.setAttribute('readonly', 'true'); ta.setAttribute('inputmode', 'none'); }
} else {
keyboard.style.display = 'none';
inputWrapper.classList.add('keyboard-hidden');
localStorage.setItem('akasha-keyboard-visible', 'false');
isCustomKeyboardActive = false;
if(ta) { ta.removeAttribute('readonly'); ta.removeAttribute('inputmode'); }
}
}
function restoreKeyboardState() { const isVisible = localStorage.getItem('akasha-keyboard-visible'); if (isVisible === 'false') { const keyboard = document.getElementById('custom-keyboard'); const inputWrapper = document.getElementById('main-input-wrapper'); keyboard.style.display = 'none'; inputWrapper.classList.add('keyboard-hidden'); } }
function toggleLargeText() { document.body.classList.toggle('keyboard-large-text'); const isLarge = document.body.classList.contains('keyboard-large-text'); localStorage.setItem('akasha-large-text', isLarge ? 'true' : 'false'); }
function restoreLargeTextPreference() { const saved = localStorage.getItem('akasha-large-text'); if (saved === 'true') document.body.classList.add('keyboard-large-text'); }
function showCustomModal(title, bodyHTML, buttons) {
const modal = document.getElementById('custom-modal'); const modalTitle = document.getElementById('modal-title'); const modalBody = document.getElementById('modal-body'); const modalFooter = document.getElementById('modal-footer');
if (!modal || !modalTitle || !modalBody || !modalFooter) return;
modalTitle.textContent = title || 'Сообщение'; modalBody.innerHTML = bodyHTML || ''; modalFooter.innerHTML = '';
buttons.forEach(btn => { const button = document.createElement('button'); button.className = btn.class || 'hw-btn'; button.textContent = btn.text; if (btn.style) button.style.cssText = btn.style; button.onclick = (e) => { e.preventDefault(); e.stopPropagation(); if (btn.action) btn.action(); closeCustomModal(); }; modalFooter.appendChild(button); });
modal.style.display = 'flex';
}
function closeCustomModal() { const modal = document.getElementById('custom-modal'); if (modal) { modal.style.display = 'none'; if (currentModalResolve) { currentModalResolve(null); currentModalResolve = null; } } }
document.addEventListener('click', (e) => { const modal = document.getElementById('custom-modal'); if (modal && e.target === modal) closeCustomModal(); });
function askPrompt(title, message, defaultValue = '') { return new Promise((resolve) => { currentModalResolve = resolve; const value = String(defaultValue || ''); showCustomModal(title, `<p>${message}</p><input type="text" id="modal-prompt-input" class="modal-input" value="${value}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">`, [{ text: 'Отмена', class: 'hw-btn', action: () => resolve(null) }, { text: 'OK', class: 'hw-btn', style: 'background:rgba(100,255,218,0.3); color:#64ffda;', action: () => { const input = document.getElementById('modal-prompt-input'); resolve(input ? input.value : ''); } }]); setTimeout(() => { const input = document.getElementById('modal-prompt-input'); if (input) { input.focus(); input.select(); } }, 100); }); }
function askConfirm(title, message) { return new Promise((resolve) => { currentModalResolve = resolve; showCustomModal(title, `<p>${message}</p>`, [{ text: 'Отмена', class: 'hw-btn', action: () => resolve(false) }, { text: 'Подтвердить', class: 'hw-btn', style: 'background:rgba(255,80,80,0.3); color:#ff6b6b;', action: () => resolve(true) }]); }); }
function showAlert(title, message) { return new Promise((resolve) => { showCustomModal(title, `<p>${message}</p>`, [{ text: 'OK', class: 'hw-btn', action: () => resolve() }]); }); }
async function isUserBlocked(userName) { if (!windowDb) return false; try { const doc = await windowDb.collection('blocked_users').doc(userName).get(); return doc.exists && doc.data().blocked === true; } catch (error) { return false; } }
async function blockUserInDb(userName, reason) { if (!windowDb) return false; try { await windowDb.collection('blocked_users').doc(userName).set({ blocked: true, reason: reason, blockedBy: currentUser.name, blockedAt: firebase.firestore.Timestamp.fromDate(new Date()) }, { merge: true }); return true; } catch (error) { console.error('Ошибка блокировки:', error); return false; } }
async function unblockUserInDb(userName) { if (!windowDb) return false; try { await windowDb.collection('blocked_users').doc(userName).update({ blocked: false, unblockedAt: firebase.firestore.Timestamp.fromDate(new Date()) }); return true; } catch (error) { console.error('Ошибка разблокировки:', error); return false; } }
async function markLessonAsRead(lessonId) { if (!windowDb || !currentUser) return false; try { await windowDb.collection('lesson_reads').doc(`${currentUser.name}_${lessonId}`).set({ userId: currentUser.name, lessonId: lessonId, readAt: firebase.firestore.Timestamp.fromDate(new Date()), userRank: currentUser.ранг }, { merge: true }); return true; } catch (error) { console.error('Ошибка отметки:', error); return false; } }
async function isLessonRead(lessonId) { if (!windowDb || !currentUser) return false; try { const doc = await windowDb.collection('lesson_reads').doc(`${currentUser.name}_${lessonId}`).get(); return doc.exists; } catch (error) { return false; } }
async function getAllLessonReads() { if (!windowDb) return []; try { const snapshot = await windowDb.collection('lesson_reads').get(); const reads = []; snapshot.forEach(doc => reads.push({ id: doc.id, ...doc.data() })); return reads; } catch (error) { return []; } }
async function getBlockedUsers() { if (!windowDb) return []; try { const snapshot = await windowDb.collection('blocked_users').where('blocked', '==', true).get(); const blocked = []; snapshot.forEach(doc => blocked.push({ id: doc.id, ...doc.data() })); return blocked; } catch (error) { return []; } }
async function getUserRegistrationDate(userName) { if (!windowDb) return null; try { const doc = await windowDb.collection('user_registrations').doc(userName).get(); if (doc.exists && doc.data().registeredAt) return doc.data().registeredAt.toDate(); else return null; } catch (error) { console.error('Ошибка получения даты регистрации:', error); return null; } }
async function getUserAdjustments(userName) { if (!windowDb) return { adjustedLessons: 0, adjustedHomework: 0, reason: '' }; try { const doc = await windowDb.collection('manual_adjustments').doc(userName).get(); if (doc.exists) return doc.data(); return { adjustedLessons: 0, adjustedHomework: 0, reason: '' }; } catch (error) { return { adjustedLessons: 0, adjustedHomework: 0, reason: '' }; } }
async function saveManualAdjustment(userName, lessons, homework, reason) { if (!windowDb) { console.error('❌ Firestore не доступен'); return false; } try { await windowDb.collection('manual_adjustments').doc(userName).set({ userName: userName, adjustedLessons: parseInt(lessons) || 0, adjustedHomework: parseInt(homework) || 0, reason: reason, adjustedBy: currentUser.name, adjustedAt: firebase.firestore.Timestamp.fromDate(new Date()) }, { merge: true }); return true; } catch (error) { console.error('❌ Ошибка сохранения корректировки:', error); return false; } }
function calculateGrade(lessonsRead, homeworkDone, totalLessons, totalHomework, adjLessons, adjHomework) { const realScore = lessonsRead + homeworkDone; const adjustedScore = realScore + adjLessons + adjHomework; const maxScore = totalLessons + totalHomework; if (maxScore === 0) return { percent: 0, grade: '—', gradeColor: '#6b5f4a' }; const percent = Math.min(100, Math.round((adjustedScore / maxScore) * 100)); let grade, gradeColor; if (percent >= 90) { grade = '🏆 Отлично'; gradeColor = '#ffd700'; } else if (percent >= 70) { grade = '✨ Хорошо'; gradeColor = '#4caf50'; } else if (percent >= 50) { grade = '✅ Удовлетворительно'; gradeColor = '#ff9800'; } else { grade = '❌ Плохо'; gradeColor = '#ff6b6b'; } return { percent, grade, gradeColor, realScore, adjustedScore, maxScore }; }
function formatTimeInAkasha(regDate) { const now = new Date(); const diff = now - regDate; const days = Math.floor(diff / (1000 * 60 * 60 * 24)); const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); if (days > 0) return `${days} дн. ${hours} ч.`; if (hours > 0) return `${hours} ч.`; return 'только что'; }
async function registerUserIfNeeded() { if (!currentUser || !windowDb) return; try { const doc = await windowDb.collection('user_registrations').doc(currentUser.name).get(); if (!doc.exists) { await windowDb.collection('user_registrations').doc(currentUser.name).set({ userName: currentUser.name, userRank: currentUser.ранг, registeredAt: firebase.firestore.Timestamp.fromDate(new Date()) }); console.log('✅ Пользователь зарегистрирован:', currentUser.name); } } catch (error) { console.error('Ошибка регистрации:', error); } }
window.deleteMySubmission = async function(submissionId, assignmentId) { const confirmed = await askConfirm('Подтверждение', '⚠️ Вы уверены? Это действие нельзя отменить!'); if (!confirmed) return; try { await windowDb.collection('homework_submissions').doc(submissionId).delete(); showAlert('Успех', 'Ваш ответ удалён!'); window.showHomeworkBoard(); } catch (error) { showAlert('Ошибка', `Не удалось удалить: ${error.message}`); } };
window.gradeSubmission = async function(submissionId, assignmentId, status) { const feedback = await askPrompt('Комментарий', 'Введите комментарий (или оставьте пустым):', ''); if (feedback === null) return; const success = await updateSubmissionStatus(submissionId, status, feedback); if (success) { showAlert('Успех', 'Статус обновлён!'); window.reviewSubmissions(assignmentId); } else { showAlert('Ошибка', 'Ошибка обновления статуса.'); } };
window.addFeedback = async function(submissionId, assignmentId) { const feedback = await askPrompt('Комментарий Мастера', 'Введите комментарий Мастера:', ''); if (!feedback) return; const sub = submissionsList.find(s => s.id === submissionId); const currentFeedback = sub.masterFeedback || ''; const newFeedback = currentFeedback ? currentFeedback + '\n\n' + feedback : feedback; const success = await updateSubmissionStatus(submissionId, sub.status, newFeedback); if (success) { showAlert('Успех', 'Комментарий добавлен!'); window.reviewSubmissions(assignmentId); } else { showAlert('Ошибка', 'Ошибка добавления комментария.'); } };
window.blockUser = async function(userName) { if (!windowDb) return showAlert('Ошибка', 'База данных не подключена!'); if (!currentUser || !isAdmin()) return showAlert('Доступ запрещён', 'Только для Магистров.'); const reason = await askPrompt('Блокировка', `Причина блокировки ${userName}:`); if (!reason) return; try { const success = await blockUserInDb(userName, reason); if (success) { showAlert('Успех', `Пользователь ${userName} заблокирован.`); window.showAdminPanel(); } else { showAlert('Ошибка', 'Не удалось заблокировать пользователя.'); } } catch (error) { showAlert('Ошибка', `Не удалось заблокировать: ${error.message}`); } };
window.unblockUser = async function(userName) { if (!windowDb) return showAlert('Ошибка', 'База данных не подключена!'); const confirmed = await askConfirm('Разблокировка', `Разблокировать пользователя ${userName}?`); if (!confirmed) return; try { const success = await unblockUserInDb(userName); if (success) { showAlert('Успех', `Пользователь ${userName} разблокирован.`); window.showAdminPanel(); } else { showAlert('Ошибка', 'Не удалось разблокировать пользователя.'); } } catch (error) { showAlert('Ошибка', `Не удалось разблокировать: ${error.message}`); } };
window.openAdjustmentForm = async function(userName) { if (!windowDb) return showAlert('Ошибка', 'База данных не подключена!'); try { const adjustments = await getUserAdjustments(userName); const currentLessons = adjustments.adjustedLessons || 0; const currentHomework = adjustments.adjustedHomework || 0; const currentReason = adjustments.reason || ''; const lessons = await askPrompt('Корректировка', `Дополнительных уроков для ${userName} (сейчас: ${currentLessons}):`, String(currentLessons)); if (lessons === null) return; const homework = await askPrompt('Корректировка', `Дополнительных ДЗ для ${userName} (сейчас: ${currentHomework}):`, String(currentHomework)); if (homework === null) return; const reason = await askPrompt('Корректировка', `Причина корректировки:`, currentReason); if (reason === null) return; const success = await saveManualAdjustment(userName, lessons, homework, reason); if (success) { showAlert('Успех', `Корректировка для ${userName} сохранена!`); window.showAdjustmentPanel(); } else { showAlert('Ошибка', 'Не удалось сохранить корректировку.'); } } catch (error) { showAlert('Ошибка', `Ошибка: ${error.message}`); } };
window.addNewMember = async function() { if (!windowDb) return showAlert('Ошибка', 'База данных не подключена!'); if (!isAdmin()) return showAlert('Доступ запрещён', 'Только для Магистров.'); const name = await askPrompt('Новый член Ордена', 'Введите полное имя (например: "Иван Иванов"):'); if (!name) return; const rank = await askPrompt('Ранг', 'Введите ранг (адепт, юнлинг, падаван, старший падаван, рыцарь, мастер, магистр, верховный магистр, старейшина):'); if (!rank) return; const teacher = await askPrompt('Учитель', 'Введите имя Учителя (или "нет", "отсутствует"):', 'нет'); if (!teacher) return; const password = await askPrompt('Пароль', 'Введите пароль (минимум 6 символов):'); if (!password || password.length < 6) { return showAlert('Ошибка', 'Пароль должен быть не менее 6 символов!'); } const specialTitle = await askPrompt('Специальное звание', 'Введите специальное звание (или оставьте пустым):', ''); const description = await askPrompt('Описание', 'Введите описание/биографию (или оставьте пустым):', ''); try { const normalizedName = name.toLowerCase().trim(); if (usersDatabase[normalizedName]) { return showAlert('Ошибка', `Пользователь "${name}" уже существует!`); } await windowDb.collection('users').doc(normalizedName).set({ fullName: name, rank: rank.toLowerCase().trim(), teacher: teacher.toLowerCase().trim() === 'нет' || teacher.toLowerCase().trim() === 'отсутствует' ? 'отсутствует' : teacher, password: password, specialTitle: specialTitle || '', description: description || '', статусы: [], звания: [], createdAt: firebase.firestore.Timestamp.fromDate(new Date()), createdBy: currentUser.name }); usersDatabase[normalizedName] = { fullName: name, ранг: rank.toLowerCase().trim(), учитель: teacher.toLowerCase().trim() === 'нет' || teacher.toLowerCase().trim() === 'отсутствует' ? 'отсутствует' : teacher, пароль: password, specialTitle: specialTitle || '', description: description || '', статусы: [], звания: [] }; showAlert('Успех', `Пользователь "${name}" успешно добавлен в Орден!`); window.showAdminPanel(); } catch (error) { showAlert('Ошибка', `Не удалось добавить пользователя: ${error.message}`); } };
window.excludeJedi = async function(userName) { if (!windowDb) return showAlert('Ошибка', 'База данных не подключена!'); if (!isAdmin()) return showAlert('Доступ запрещён', 'Только для Магистров.'); const confirmed = await askConfirm('️ ВНИМАНИЕ!', `Вы действительно хотите ИСКЛЮЧИТЬ ${userName} из Ордена?\n\nЭто действие НЕОБРАТИМО! Все данные будут удалены.`); if (!confirmed) return; const confirmText = await askPrompt('Подтверждение', 'Напишите "ИСКЛЮЧИТЬ" для подтверждения:'); if (confirmText !== 'ИСКЛЮЧИТЬ') { return showAlert('Отменено', 'Исключение отменено.'); } try { const normalizedName = userName.toLowerCase().trim(); await windowDb.collection('users').doc(normalizedName).delete(); const readsSnap = await windowDb.collection('lesson_reads').where('userId', '==', userName).get(); if (!readsSnap.empty) { const batch1 = windowDb.batch(); readsSnap.forEach(doc => batch1.delete(doc.ref)); await batch1.commit(); } const subsSnap = await windowDb.collection('homework_submissions').where('studentName', '==', userName).get(); if (!subsSnap.empty) { const batch2 = windowDb.batch(); subsSnap.forEach(doc => batch2.delete(doc.ref)); await batch2.commit(); } const commentsSnap = await windowDb.collection('comments').where('authorName', '==', userName).get(); if (!commentsSnap.empty) { const batch3 = windowDb.batch(); commentsSnap.forEach(doc => batch3.delete(doc.ref)); await batch3.commit(); } delete usersDatabase[normalizedName]; showAlert('Успех', `${userName} исключён из Ордена Вольных Джедаев.`); window.showAdminPanel(); } catch (error) { showAlert('Ошибка', `Не удалось исключить джедая: ${error.message}`); } };
window.showCouncilOfMasters = async function() { const container = document.getElementById('chat-container'); if (container) container.innerHTML = ''; const blockedUsers = await getBlockedUsers(); const blockedNames = blockedUsers.map(u => u.id); let html = `<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;">`; html += `<h3 class="council-title">️ Совет Мастеров</h3>`; html += `<p class="council-subtitle">Руководство Ордена Вольных Джедаев</p>`; const supremeMaster = Object.values(usersDatabase).find(u => u.ранг === 'верховный магистр' && u.specialTitle); if (supremeMaster) { const isBlocked = blockedNames.includes(supremeMaster.fullName); html += `<div class="council-supreme"><div style="display:flex;align-items:center;gap:15px;margin-bottom:10px;"><div style="font-size:2em;">🔮</div><div style="flex:1;"><div style="color:#64ffda;font-family:'Playfair Display',serif;font-size:1.3em;font-weight:700;">${supremeMaster.fullName}</div><div style="color:#8bc34a;font-size:1em;font-weight:600;margin-top:3px;">${supremeMaster.specialTitle}</div></div><div class="member-status ${isBlocked ? 'status-blocked' : 'status-active'}">${isBlocked ? '🚫 Заблок.' : '✅ Активен'} ${formatOnlineStatus(supremeMaster.fullName)}</div></div>`; if (supremeMaster.description) html += `<div style="color:var(--text-color);font-size:0.95em;line-height:1.5;padding-left:50px;font-style:italic;">${supremeMaster.description}</div>`; html += `</div>`; } html += `<h4 class="council-master-header">👑 Мастера</h4>`; const masters = Object.values(usersDatabase).filter(u => u.ранг === 'мастер' && u.specialTitle); masters.forEach(master => { const isBlocked = blockedNames.includes(master.fullName); html += `<div class="council-master-card"><div style="display:flex;align-items:center;gap:15px;margin-bottom:10px;"><div style="font-size:2em;">⚔️</div><div style="flex:1;"><div style="color:#64ffda;font-family:'Playfair Display',serif;font-size:1.3em;font-weight:700;">${master.fullName}</div><div style="color:#8bc34a;font-size:1em;font-weight:600;margin-top:3px;">${master.specialTitle}</div></div><div class="member-status ${isBlocked ? 'status-blocked' : 'status-active'}">${isBlocked ? ' Заблок.' : '✅ Активен'} ${formatOnlineStatus(master.fullName)}</div></div>`; if (master.description) html += `<div style="color:var(--text-color);font-size:0.95em;line-height:1.5;padding-left:50px;font-style:italic;">${master.description}</div>`; html += `</div>`; }); html += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%;margin-top:20px;padding:12px;">🔙 Вернуться в меню</button></div>`; addRawHTML(html); };
// 🔥 ИСПРАВЛЕННАЯ ФУНКЦИЯ С ПУБЛИЧНЫМИ СТАТУСАМИ И ЗВАНИЯМИ
window.showMembersList = async function() { const container = document.getElementById('chat-container'); if (container) container.innerHTML = ''; const blockedUsers = await getBlockedUsers(); const blockedNames = blockedUsers.map(u => u.id); let html = `<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;">`; html += `<h3 style="color:#64ffda;margin-bottom:25px;font-family:'Playfair Display',serif;text-align:center;font-size:1.8em;"> Члены Ордена</h3>`; html += `<p style="color:var(--text-secondary);text-align:center;margin-bottom:20px;font-style:italic;">От Адепта до Старейшины</p>`; const ranks = ['старейшина', 'верховный магистр', 'магистр', 'мастер', 'рыцарь', 'старший падаван', 'падаван', 'юнлинг', 'адепт']; for (const rank of ranks) { const members = Object.values(usersDatabase).filter(u => u.ранг === rank); if (members.length > 0) { html += `<div style="margin:20px 0;"><h4 style="color:var(--accent-color);font-family:'Playfair Display',serif;font-size:1.3em;margin-bottom:10px;border-bottom:2px solid var(--border-color);padding-bottom:8px;">${rank}</h4>`; for (const member of members) { const isBlocked = blockedNames.includes(member.fullName); const teacherName = member.учитель && member.учитель !== 'отсутствует' ? member.учитель : 'нет'; const regDate = await getUserRegistrationDate(member.fullName); const timeInAkasha = regDate ? formatTimeInAkasha(regDate) : '—'; let statusesHtml = ''; if (member.статусы && member.статусы.length > 0) { statusesHtml += `<div style="color:#8bc34a;font-size:0.9em;margin-top:3px;">🏷️ ${member.статусы.join(', ')}</div>`; } let titlesHtml = ''; if (member.звания && member.звания.length > 0) { const titlesStr = member.звания.map(t => t.уточнение ? `${t.звание} (${t.уточнение})` : t.звание).join(', '); titlesHtml += `<div style="color:#ffd700;font-size:0.9em;margin-top:3px;">️ ${titlesStr}</div>`; } html += `<div class="member-card"><div style="flex:1;"><div class="member-name">${member.fullName} ${formatOnlineStatus(member.fullName)}</div><div style="color:var(--text-secondary);font-size:0.9em;margin-top:3px;">🧙‍♂️ Учитель: ${teacherName}</div><div style="color:var(--text-secondary);font-size:0.85em;margin-top:2px;">⏱️ В Акаше: ${timeInAkasha}</div>${statusesHtml}${titlesHtml}</div><div class="member-status ${isBlocked ? 'status-blocked' : 'status-active'}">${isBlocked ? '🚫 Заблок.' : '✅ Активен'}</div></div>`; } html += `</div>`; } } html += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%;margin-top:15px;padding:12px;"> Вернуться в меню</button></div>`; addRawHTML(html); };
window.showProgressTable = async function() { const container = document.getElementById('chat-container'); if (container) container.innerHTML = ''; const reads = await getAllLessonReads(); const isMasterUser = isMaster(); const totalLessons = Object.keys(lessonsById).length; const totalHomework = assignmentsList.length; let html = `<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;">`; html += `<h3 style="color:#64ffda;margin-bottom:25px;font-family:'Playfair Display',serif;text-align:center;font-size:1.8em;">📊 Таблица успеваемости Ордена</h3>`; html += `<p style="color:var(--text-secondary);text-align:center;margin-bottom:20px;font-style:italic;">Всего уроков: ${totalLessons} | Всего ДЗ: ${totalHomework}</p>`; html += `<div style="overflow-x:auto;"><table class="progress-table"><tr><th>Ученик</th><th>Ранг</th><th>Учитель</th><th>Время в Акаше</th><th>Уроки</th><th>ДЗ</th><th>Оценка</th></tr>`; for (const user of Object.values(usersDatabase)) { if (user.ранг === 'мастер' || user.ранг === 'магистр' || user.ранг === 'верховный магистр' || user.ранг === 'старейшина') continue; const userReads = reads.filter(r => r.userId === user.fullName); const userSubmissions = submissionsList.filter(s => s.studentName === user.fullName); const approvedHomework = userSubmissions.filter(s => s.status === 'approved').length; const submittedHomework = userSubmissions.length; const regDate = await getUserRegistrationDate(user.fullName); const timeInAkasha = regDate ? formatTimeInAkasha(regDate) : '—'; const adjustments = await getUserAdjustments(user.fullName); const gradeData = calculateGrade(userReads.length, approvedHomework, totalLessons, totalHomework, adjustments.adjustedLessons || 0, adjustments.adjustedHomework || 0); const teacherName = user.учитель && user.учитель !== 'отсутствует' ? user.учитель : '—'; html += `<tr><td style="font-weight:600;">${user.fullName} ${formatOnlineStatus(user.fullName)}</td><td>${user.ранг}</td><td style="font-size:0.9em;">${teacherName}</td><td style="font-size:0.9em;">${timeInAkasha}</td><td>${userReads.length}/${totalLessons}</td><td>${submittedHomework} сдано<br><small style="color:#a89b7e;">(${approvedHomework} одобрено)</small></td><td style="color:${gradeData.gradeColor};font-weight:700;text-align:center;">${gradeData.grade}<br><small>${gradeData.percent}%</small></td></tr>`; } html += `</table></div>`; if (isMasterUser) { html += `<div class="admin-panel"><h3>✏️ Ручная корректировка результатов</h3><p style="color:var(--text-secondary);margin:10px 0;">Мастер может добавить баллы ученикам, которые не успели перенести свои результаты в Акашу.</p><button class="hw-btn" onclick="window.showAdjustmentPanel()" style="background:rgba(100,255,218,0.2);color:#64ffda;width:100%;margin-top:10px;">️ Открыть панель корректировки</button></div><button class="hw-btn" onclick="window.showDetailedProgress()" style="width:100%;margin-top:10px;background:rgba(100,255,218,0.2);color:#64ffda;"> Показать детали (какие материалы сданы)</button>`; } html += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%;margin-top:15px;padding:12px;">🔙 Вернуться в меню</button></div>`; addRawHTML(html); };
window.showAdjustmentPanel = async function() { const container = document.getElementById('chat-container'); if (container) container.innerHTML = ''; if (!isMaster()) { addMessage('<p>❌ Доступ запрещён.</p>'); return; } let html = `<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;">`; html += `<h3 style="color:#64ffda;margin-bottom:25px;font-family:'Playfair Display',serif;text-align:center;font-size:1.8em;">⚙️ Ручная корректировка</h3>`; html += `<p style="color:var(--text-secondary);text-align:center;margin-bottom:20px;">Выбери ученика и добавь баллы за пройденные материалы вне Акаши</p>`; for (const user of Object.values(usersDatabase)) { if (user.ранг === 'мастер' || user.ранг === 'магистр' || user.ранг === 'верховный магистр' || user.ранг === 'старейшина') continue; const adjustments = await getUserAdjustments(user.fullName); const hasAdjustment = (adjustments.adjustedLessons || 0) > 0 || (adjustments.adjustedHomework || 0) > 0; html += `<div style="background:rgba(0,0,0,0.3);border-radius:10px;padding:15px;margin:10px 0;border-left:3px solid ${hasAdjustment ? '#64ffda' : 'var(--border-color)'};"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><div><div style="color:var(--text-color);font-weight:600;">${user.fullName}</div><div style="color:var(--text-secondary);font-size:0.9em;">${user.ранг}</div></div>`; if (hasAdjustment) html += `<div style="color:#64ffda;font-size:0.85em;">+${adjustments.adjustedLessons} уроков, +${adjustments.adjustedHomework} ДЗ</div>`; html += `</div><button class="hw-btn" onclick="window.openAdjustmentForm('${user.fullName}')" style="width:100%;background:rgba(100,255,218,0.2);color:#64ffda;padding:8px;font-size:0.95em;">✏️ ${hasAdjustment ? 'Изменить' : 'Добавить'} корректировку</button></div>`; } html += `<button class="hw-btn" onclick="window.showProgressTable()" style="width:100%;margin-top:15px;padding:12px;">🔙 Назад к таблице</button></div>`; addRawHTML(html); };
window.showDetailedProgress = async function() { const container = document.getElementById('chat-container'); if (container) container.innerHTML = ''; if (!isMaster()) { addMessage('<p>❌ Доступ запрещён. Только для Мастеров.</p>'); return; } const reads = await getAllLessonReads(); const totalLessons = Object.keys(lessonsById).length; const totalHomework = assignmentsList.length; let html = `<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;"><h3 style="color:#64ffda;margin-bottom:25px;font-family:'Playfair Display',serif;text-align:center;font-size:1.8em;">🔒 Детальная успеваемость</h3>`; for (const user of Object.values(usersDatabase)) { if (user.ранг === 'мастер' || user.ранг === 'магистр' || user.ранг === 'верховный магистр' || user.ранг === 'старейшина') continue; const userReads = reads.filter(r => r.userId === user.fullName); const userSubmissions = submissionsList.filter(s => s.studentName === user.fullName); const adjustments = await getUserAdjustments(user.fullName); const gradeData = calculateGrade(userReads.length, userSubmissions.filter(s => s.status === 'approved').length, totalLessons, totalHomework, adjustments.adjustedLessons || 0, adjustments.adjustedHomework || 0); html += `<div style="background:rgba(0,0,0,0.3);border-radius:10px;padding:15px;margin:15px 0;border-left:3px solid ${gradeData.gradeColor};"><h4 style="color:${gradeData.gradeColor};margin-bottom:10px;">${user.fullName} — ${gradeData.grade} (${gradeData.percent}%)</h4><p style="color:#8bc34a;margin:10px 0 5px 0;font-weight:600;"> Прочитанные уроки (${userReads.length}/${totalLessons}):</p>`; if (userReads.length > 0) { html += `<ul style="color:var(--text-color);margin:5px 0;padding-left:20px;font-size:0.95em;">`; userReads.forEach(read => { const lesson = lessonsById[read.lessonId]; if (lesson) { const readDate = read.readAt ? new Date(read.readAt.seconds * 1000).toLocaleString('ru-RU', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'}) : ''; html += `<li>${lesson.title} <span style="color:#6b5f4a;font-size:0.85em;">— ${readDate}</span></li>`; } }); html += `</ul>`; } else { html += `<p style="color:#6b5f4a;font-style:italic;margin:5px 0;">Нет прочитанных уроков</p>`; } html += `<p style="color:#ffa500;margin:10px 0 5px 0;font-weight:600;"> Сданные ДЗ (${userSubmissions.length} всего, ${userSubmissions.filter(s => s.status === 'approved').length} одобрено):</p>`; if (userSubmissions.length > 0) { html += `<ul style="color:var(--text-color);margin:5px 0;padding-left:20px;font-size:0.95em;">`; userSubmissions.forEach(sub => { const assignment = assignmentsList.find(a => a.id === sub.assignmentId); const statusEmoji = sub.status === 'approved' ? '✅' : (sub.status === 'needs_revision' ? '⚠️' : ''); const title = assignment ? assignment.title : 'Неизвестное задание'; html += `<li>${statusEmoji} ${title}</li>`; }); html += `</ul>`; } else { html += `<p style="color:#6b5f4a;font-style:italic;margin:5px 0;">Нет сданных ДЗ</p>`; } if ((adjustments.adjustedLessons || 0) > 0 || (adjustments.adjustedHomework || 0) > 0) { html += `<div style="background:rgba(100,255,218,0.1);border-radius:8px;padding:10px;margin-top:10px;"><p style="color:#64ffda;margin:0;font-weight:600;">✏️ Ручная корректировка:</p><p style="color:var(--text-color);margin:5px 0 0 0;font-size:0.9em;">+${adjustments.adjustedLessons} уроков, +${adjustments.adjustedHomework} ДЗ</p>`; if (adjustments.reason) html += `<p style="color:var(--text-secondary);margin:5px 0 0 0;font-size:0.85em;font-style:italic;">Причина: ${adjustments.reason}</p>`; if (adjustments.adjustedBy) html += `<p style="color:#6b5f4a;margin:5px 0 0 0;font-size:0.8em;">Внёс: ${adjustments.adjustedBy}</p>`; html += `</div>`; } html += `</div>`; } html += `<button class="hw-btn" onclick="window.showProgressTable()" style="width:100%;margin-top:15px;padding:12px;">🔙 Назад к таблице</button></div>`; addRawHTML(html); };
window.showAdminPanel = async function() { const container = document.getElementById('chat-container'); if (container) container.innerHTML = ''; if (!isAdmin()) { addMessage('<p>❌ Доступ запрещён. Только для Магистров.</p>'); return; } const blockedUsers = await getBlockedUsers(); let html = `<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;"><h3 style="color:#64ffda;margin-bottom:25px;font-family:'Playfair Display',serif;text-align:center;font-size:1.8em;">⚙️ Админ-панель</h3><div class="admin-panel"><h3>👥 Управление всеми пользователями (включая Мастеров)</h3><button class="hw-btn" onclick="window.addNewMember()" style="background:rgba(76,175,80,0.3);color:#4caf50;margin-bottom:15px;">➕ Добавить нового члена Ордена</button>`; Object.entries(usersDatabase).forEach(([key, user]) => { const isBlocked = blockedUsers.find(b => b.id === user.fullName); const userRank = user.ранг; const rankColor = userRank.includes('магистр') || userRank.includes('мастер') ? '#ffd700' : 'var(--accent-color)'; html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid var(--border-color);background:rgba(0,0,0,0.2);border-radius:8px;margin:8px 0;flex-wrap:wrap;gap:8px;"><div style="flex:1;min-width:200px;"><div style="color:var(--text-color);font-weight:600;font-size:1.1em;">${user.fullName} ${formatOnlineStatus(user.fullName)}</div><div style="color:${rankColor};font-size:0.9em;">${user.ранг}</div>`; if (user.статусы && user.статусы.length > 0) html += `<div style="color:#8bc34a;font-size:0.85em;margin-top:3px;">🏷️ ${user.статусы.join(', ')}</div>`; if (user.звания && user.звания.length > 0) { const titlesStr = user.звания.map(t => t.уточнение ? `${t.звание} (${t.уточнение})` : t.звание).join(', '); html += `<div style="color:#ffd700;font-size:0.85em;margin-top:3px;">🎖️ ${titlesStr}</div>`; } html += `</div><div style="display:flex;gap:5px;flex-wrap:wrap;">`; if (isBlocked) { html += `<button class="unblock-btn" onclick="window.unblockUser('${user.fullName}')">✅ Разблокировать</button>`; } else { html += `<button class="block-btn" onclick="window.blockUser('${user.fullName}')">🚫 Заблокировать</button>`; } html += `<button class="hw-btn" onclick="window.excludeJedi('${user.fullName}')" style="background:rgba(255,0,0,0.2);color:#ff0000;border:1px solid rgba(255,0,0,0.5);padding:6px 12px;font-size:0.85em;margin:0;">⚠️ Исключить</button>`; if (isAdmin()) html += `<button class="hw-btn" onclick="window.manageUserRanks('${key}')" style="background:rgba(100,255,218,0.2);color:#64ffda;border:1px solid rgba(100,255,218,0.5);padding:6px 12px;font-size:0.85em;margin:0;">🎖️ Ранг/Статус/Звание</button>`; html += `</div></div>`; }); html += `</div><button class="hw-btn" onclick="showMainMenu()" style="width:100%;margin-top:15px;padding:12px;">🔙 Вернуться в меню</button></div>`; addRawHTML(html); };
window.manageUserRanks = async function(userKey) {
const c = document.getElementById('chat-container'); if (c) c.innerHTML = '';
const user = usersDatabase[userKey];
if (!user) { showAlert('Ошибка', `Пользователь не найден!`); return; }
let html = `<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;"><h3 style="color:#64ffda;margin-bottom:20px;font-family:'Playfair Display',serif;text-align:center;font-size:1.8em;">️ Управление кадрами</h3><div style="background:rgba(0,0,0,0.3);border-radius:10px;padding:15px;margin-bottom:20px;"><div style="color:var(--text-color);font-size:1.2em;font-weight:600;margin-bottom:5px;">${user.fullName}</div><div style="color:var(--text-secondary);font-size:0.95em;">Текущий ранг: <strong style="color:var(--accent-color);">${user.ранг}</strong></div><div style="color:var(--text-secondary);font-size:0.95em;margin-top:5px;">🧙‍♂️ Учитель: <strong>${user.учитель || 'отсутствует'}</strong></div>`;
if (user.статусы && user.статусы.length > 0) html += `<div style="color:#8bc34a;font-size:0.9em;margin-top:5px;">🏷️ Статусы: ${user.статусы.join(', ')}</div>`;
if (user.звания && user.звания.length > 0) { const titlesStr = user.звания.map(t => t.уточнение ? `${t.звание} (${t.уточнение})` : t.звание).join(', '); html += `<div style="color:#ffd700;font-size:0.9em;margin-top:5px;">🎖️ Звания: ${titlesStr}</div>`; }
html += `</div><div style="margin-bottom:20px;"><h4 style="color:#64ffda;margin-bottom:10px;font-family:'Playfair Display',serif;">🔹 Изменить Ранг</h4><select id="rank-select" onchange="window.handleRankChange()" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border-color);background:rgba(13,31,15,0.8);color:var(--text-color);font-family:'Cormorant Garamond',serif;font-size:1.1em;margin-bottom:10px;">`;
rankHierarchy.forEach(rank => { const selected = rank === user.ранг ? 'selected' : ''; const rankDisplay = rank.charAt(0).toUpperCase() + rank.slice(1); html += `<option value="${rank}" ${selected}>${rankDisplay}</option>`; });
html += `</select><div id="teacher-input-wrapper" style="display:none;margin-bottom:10px;"><input type="text" id="teacher-input-field" placeholder="Имя Учителя (или 'нет', 'отсутствует')" value="${user.учитель || ''}" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border-color);background:rgba(13,31,15,0.8);color:var(--text-color);font-family:'Cormorant Garamond',serif;font-size:1em;"></div><button class="hw-btn" onclick="window.changeUserRank('${userKey}')" style="width:100%;background:rgba(100,255,218,0.2);color:#64ffda;">💾 Сохранить Ранг</button></div><div style="margin-bottom:20px;"><h4 style="color:#64ffda;margin-bottom:10px;font-family:'Playfair Display',serif;">🔹 Добавить Статус</h4><select id="status-select" onchange="window.handleStatusChange()" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border-color);background:rgba(13,31,15,0.8);color:var(--text-color);font-family:'Cormorant Garamond',serif;font-size:1.1em;margin-bottom:10px;"><option value="">-- Выберите статус --</option>`;
availableStatuses.forEach(status => { html += `<option value="${status}">${status}</option>`; });
html += `</select><div id="council-input-wrapper" style="display:none;margin-bottom:10px;"><input type="text" id="council-name-input" placeholder="Название Совета" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border-color);background:rgba(13,31,15,0.8);color:var(--text-color);font-family:'Cormorant Garamond',serif;font-size:1em;"></div><div id="custom-status-input-wrapper" style="display:none;margin-bottom:10px;"><input type="text" id="custom-status-input" placeholder="Введите свой статус" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border-color);background:rgba(13,31,15,0.8);color:var(--text-color);font-family:'Cormorant Garamond',serif;font-size:1em;"></div><button class="hw-btn" onclick="window.addUserStatus('${userKey}')" style="width:100%;background:rgba(139,195,74,0.3);color:#8bc34a;">➕ Добавить Статус</button></div>`;
if (user.статусы && user.статусы.length > 0) { html += `<div style="margin-bottom:20px;"><h4 style="color:#8bc34a;margin-bottom:10px;font-family:'Playfair Display',serif;"> Текущие Статусы</h4>`; user.статусы.forEach((status, index) => { html += `<div style="display:flex;justify-content:space-between;align-items:center;background:rgba(139,195,74,0.1);border-radius:8px;padding:10px;margin:5px 0;"><span style="color:var(--text-color);">${status}</span><button onclick="window.removeUserStatus('${userKey}', ${index})" style="background:rgba(255,80,80,0.3);color:#ff6b6b;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:0.9em;">🗑️ Удалить</button></div>`; }); html += `</div>`; }
html += `<div style="margin-bottom:20px;"><h4 style="color:#64ffda;margin-bottom:10px;font-family:'Playfair Display',serif;">🔹 Добавить Звание</h4><select id="title-select" onchange="window.handleTitleChange()" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border-color);background:rgba(13,31,15,0.8);color:var(--text-color);font-family:'Cormorant Garamond',serif;font-size:1.1em;margin-bottom:10px;"><option value="">-- Выберите звание --</option>`;
availableTitles.forEach(title => { html += `<option value="${title}">${title}</option>`; });
html += `</select><div id="title-clarification-input-wrapper" style="display:none;margin-bottom:10px;"><input type="text" id="title-clarification-input" placeholder="Какой именно?" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border-color);background:rgba(13,31,15,0.8);color:var(--text-color);font-family:'Cormorant Garamond',serif;font-size:1em;"></div><button class="hw-btn" onclick="window.addUserTitle('${userKey}')" style="width:100%;background:rgba(255,215,0,0.2);color:#ffd700;">🎖️ Добавить Звание</button></div>`;
if (user.звания && user.звания.length > 0) { html += `<div style="margin-bottom:20px;"><h4 style="color:#ffd700;margin-bottom:10px;font-family:'Playfair Display',serif;">📋 Текущие Звания</h4>`; user.звания.forEach((titleObj, index) => { const titleDisplay = titleObj.уточнение ? `${titleObj.звание} (${titleObj.уточнение})` : titleObj.звание; html += `<div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,215,0,0.1);border-radius:8px;padding:10px;margin:5px 0;"><span style="color:var(--text-color);">${titleDisplay}</span><button onclick="window.removeUserTitle('${userKey}', ${index})" style="background:rgba(255,80,80,0.3);color:#ff6b6b;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:0.9em;">️ Удалить</button></div>`; }); html += `</div>`; }
html += `<button class="hw-btn" onclick="window.showAdminPanel()" style="width:100%;margin-top:15px;padding:12px;">🔙 Вернуться в Админ-панель</button></div>`;
addRawHTML(html);
setTimeout(() => { if (user.ранг === 'падаван' || user.ранг === 'старший падаван') { const teacherWrapper = document.getElementById('teacher-input-wrapper'); if (teacherWrapper) teacherWrapper.style.display = 'block'; } }, 100);
};
window.handleRankChange = function() { const select = document.getElementById('rank-select'); const teacherWrapper = document.getElementById('teacher-input-wrapper'); if (!select || !teacherWrapper) return; const selectedRank = select.value; if (selectedRank === 'падаван' || selectedRank === 'старший падаван') teacherWrapper.style.display = 'block'; else teacherWrapper.style.display = 'none'; };
window.handleStatusChange = function() { const select = document.getElementById('status-select'); const councilInput = document.getElementById('council-input-wrapper'); const customInput = document.getElementById('custom-status-input-wrapper'); if (!select) return; if (select.value === 'Член Совета') { councilInput.style.display = 'block'; customInput.style.display = 'none'; } else if (select.value === 'Другие') { councilInput.style.display = 'none'; customInput.style.display = 'block'; } else { councilInput.style.display = 'none'; customInput.style.display = 'none'; } };
window.handleTitleChange = function() { const select = document.getElementById('title-select'); const clarificationInput = document.getElementById('title-clarification-input-wrapper'); if (!select) return; const needsClarification = ['Рыцарь', 'Мастер', 'Предвестник', 'Вестник', 'Лорд', 'Леди']; if (needsClarification.includes(select.value)) clarificationInput.style.display = 'block'; else clarificationInput.style.display = 'none'; };
window.changeUserRank = async function(userKey) {
const select = document.getElementById('rank-select');
const newRank = select.value;
let teacherInput = '';
if (newRank === 'падаван' || newRank === 'старший падаван') {
const teacherField = document.getElementById('teacher-input-field');
if (teacherField) {
teacherInput = teacherField.value.trim();
if (!teacherInput) { showAlert('Ошибка', 'Для ранга Падаван или Старший Падаван необходимо указать Учителя!'); return; }
}
}
try {
const userRef = windowDb.collection('users').doc(userKey);
const userDoc = await userRef.get();
const updates = { rank: newRank };
if (teacherInput) updates.teacher = teacherInput.toLowerCase() === 'нет' || teacherInput.toLowerCase() === 'отсутствует' ? 'отсутствует' : teacherInput;
if (!userDoc.exists) {
const user = usersDatabase[userKey];
await userRef.set({
fullName: user.fullName, rank: newRank,
teacher: teacherInput || (user.учитель || 'отсутствует'),
password: user.пароль || '', specialTitle: user.specialTitle || '',
description: user.description || '',
статусы: user.статусы || [], звания: user.звания || [],
createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
createdBy: currentUser.name
});
} else {
await userRef.update(updates);
}
usersDatabase[userKey].ранг = newRank;
if (teacherInput) usersDatabase[userKey].учитель = teacherInput.toLowerCase() === 'нет' || teacherInput.toLowerCase() === 'отсутствует' ? 'отсутствует' : teacherInput;
showAlert('Успех', `Ранг пользователя изменён на "${newRank}"!`);
window.manageUserRanks(userKey);
} catch (error) {
showAlert('Ошибка', `Не удалось изменить ранг: ${error.message}`);
}
};
window.addUserStatus = async function(userKey) {
const select = document.getElementById('status-select');
if (!select) { showAlert('Ошибка', 'Элемент не найден. Обновите страницу.'); return; }
const councilInput = document.getElementById('council-name-input');
const customInput = document.getElementById('custom-status-input');
let newStatus = select.value;
if (!newStatus || newStatus === '') { showAlert('Ошибка', 'Сначала ВЫБЕРИТЕ статус из списка!'); return; }
if (newStatus === 'Член Совета') {
const councilName = councilInput ? councilInput.value.trim() : '';
if (!councilName) { showAlert('Ошибка', 'Введите название Совета!'); return; }
newStatus = `Член Совета (${councilName})`;
} else if (newStatus === 'Другие') {
const customStatus = customInput ? customInput.value.trim() : '';
if (!customStatus) { showAlert('Ошибка', 'Введите свой статус!'); return; }
newStatus = customStatus;
}
try {
const userRef = windowDb.collection('users').doc(userKey);
const userDoc = await userRef.get();
const currentStatuses = (userDoc.exists && Array.isArray(userDoc.data().статусы)) ? userDoc.data().статусы : (usersDatabase[userKey].статусы || []);
const newStatuses = [...currentStatuses, newStatus];
if (!userDoc.exists) {
const user = usersDatabase[userKey];
await userRef.set({
fullName: user.fullName, rank: user.ранг, teacher: user.учитель,
password: user.пароль || '', specialTitle: user.specialTitle || '',
description: user.description || '',
статусы: newStatuses, звания: user.звания || [],
createdAt: firebase.firestore.Timestamp.fromDate(new Date())
});
} else {
await userRef.update({ статусы: newStatuses });
}
usersDatabase[userKey].статусы = newStatuses;
showAlert('Успех', `Статус "${newStatus}" добавлен!`);
window.manageUserRanks(userKey);
} catch (error) {
showAlert('Ошибка', `Не удалось добавить статус: ${error.message}`);
}
};
window.removeUserStatus = async function(userKey, index) {
try {
const userRef = windowDb.collection('users').doc(userKey);
const userDoc = await userRef.get();
const currentStatuses = (userDoc.exists && Array.isArray(userDoc.data().статусы)) ? userDoc.data().статусы : (usersDatabase[userKey].статусы || []);
const newStatuses = currentStatuses.filter((_, i) => i !== index);
if (userDoc.exists) {
await userRef.update({ статусы: newStatuses });
} else {
const user = usersDatabase[userKey];
await userRef.set({
fullName: user.fullName, rank: user.ранг, teacher: user.учитель,
password: user.пароль || '', specialTitle: user.specialTitle || '',
description: user.description || '',
статусы: newStatuses, звания: user.звания || [],
createdAt: firebase.firestore.Timestamp.fromDate(new Date())
});
}
usersDatabase[userKey].статусы = newStatuses;
showAlert('Успех', 'Статус удалён!');
window.manageUserRanks(userKey);
} catch (error) {
showAlert('Ошибка', `Не удалось удалить статус: ${error.message}`);
}
};
window.addUserTitle = async function(userKey) {
const select = document.getElementById('title-select');
if (!select) { showAlert('Ошибка', 'Элемент не найден. Обновите страницу.'); return; }
const clarificationInput = document.getElementById('title-clarification-input');
let newTitle = select.value;
if (!newTitle || newTitle === '') { showAlert('Ошибка', 'Сначала ВЫБЕРИТЕ звание из списка!'); return; }
const needsClarification = ['Рыцарь', 'Мастер', 'Предвестник', 'Вестник', 'Лорд', 'Леди'];
let уточнение = '';
if (needsClarification.includes(newTitle)) {
уточнение = clarificationInput ? clarificationInput.value.trim() : '';
if (!уточнение) { showAlert('Ошибка', 'Введите уточнение звания!'); return; }
}
try {
const userRef = windowDb.collection('users').doc(userKey);
const userDoc = await userRef.get();
const currentTitles = (userDoc.exists && Array.isArray(userDoc.data().звания)) ? userDoc.data().звания : (usersDatabase[userKey].звания || []);
const newTitles = [...currentTitles, {звание: newTitle, уточнение: уточнение}];
if (!userDoc.exists) {
const user = usersDatabase[userKey];
await userRef.set({
fullName: user.fullName, rank: user.ранг, teacher: user.учитель,
password: user.пароль || '', specialTitle: user.specialTitle || '',
description: user.description || '',
статусы: user.статусы || [], звания: newTitles,
createdAt: firebase.firestore.Timestamp.fromDate(new Date())
});
} else {
await userRef.update({ звания: newTitles });
}
usersDatabase[userKey].звания = newTitles;
const titleDisplay = уточнение ? `${newTitle} (${уточнение})` : newTitle;
showAlert('Успех', `Звание "${titleDisplay}" добавлено!`);
window.manageUserRanks(userKey);
} catch (error) {
showAlert('Ошибка', `Не удалось добавить звание: ${error.message}`);
}
};
window.removeUserTitle = async function(userKey, index) {
try {
const userRef = windowDb.collection('users').doc(userKey);
const userDoc = await userRef.get();
const currentTitles = (userDoc.exists && Array.isArray(userDoc.data().звания)) ? userDoc.data().звания : (usersDatabase[userKey].звания || []);
const newTitles = currentTitles.filter((_, i) => i !== index);
if (userDoc.exists) {
await userRef.update({ звания: newTitles });
} else {
const user = usersDatabase[userKey];
await userRef.set({
fullName: user.fullName, rank: user.ранг, teacher: user.учитель,
password: user.пароль || '', specialTitle: user.specialTitle || '',
description: user.description || '',
статусы: user.статусы || [], звания: newTitles,
createdAt: firebase.firestore.Timestamp.fromDate(new Date())
});
}
usersDatabase[userKey].звания = newTitles;
showAlert('Успех', 'Звание удалено!');
window.manageUserRanks(userKey);
} catch (error) {
showAlert('Ошибка', `Не удалось удалить звание: ${error.message}`);
}
};
document.addEventListener('DOMContentLoaded', async () => {
if (isInitialized) return; isInitialized = true;
applySeasonTheme(); renderKeyboard();
if (typeof firebase !== 'undefined' && firebaseConfig) {
try {
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
windowDb = firebase.firestore();
await initFirebaseStorage();
console.log('✅ Firebase и Storage инициализированы');
} catch (e) { console.error('Ошибка инициализации Firebase:', e); }
}
setTimeout(async () => {
if (windowDb) {
loadUserFromStorage();
await Promise.all([loadUsersFromFirebase(), loadOnlineStatuses(), loadSectionsFromFirebase(), loadLibraryFromFirebase()]);
loadHistoryFromStorage();
const container = document.getElementById('chat-container');
if (container) container.innerHTML = '';
if (currentUser) {
loadLessonsFromFirebase(); loadAssignments(); loadSubmissions(); loadScheduleFromFirebase();
updateLogoutButton();
addMessage(getRankGreeting(currentUser)); showMainMenu();
updateOnlineStatus();
heartbeatTimer = setInterval(updateOnlineStatus, 30000);
} else { addMessage(getStrangerGreeting()); }
restoreKeyboardState(); restoreLargeTextPreference();
}
}, 500);
});
window.addEventListener('beforeunload', () => { sendOfflineStatus(); if (heartbeatTimer) clearInterval(heartbeatTimer); });
window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { sendOfflineStatus(); if (heartbeatTimer) clearInterval(heartbeatTimer); } else if (currentUser) { updateOnlineStatus(); heartbeatTimer = setInterval(updateOnlineStatus, 30000); } });
window.addEventListener('resize', () => { if (window.visualViewport) { const keyboardHeight = window.innerHeight - window.visualViewport.height; if (keyboardHeight > 150) document.body.style.paddingBottom = '350px'; else document.body.style.paddingBottom = '300px'; } });
window.showLessonContent = showLessonContent; window.startAddLesson = startAddLesson; window.editLesson = editLesson; window.confirmDeleteLesson = confirmDeleteLesson; window.startAddComment = startAddComment; window.editComment = editComment; window.deleteComment = deleteComment; window.showHomeworkBoard = window.showHomeworkBoard; window.startCreateAssignment = startCreateAssignment; window.submitHomework = submitHomework; window.deleteMySubmission = deleteMySubmission; window.deleteAssignment = deleteAssignment; window.openMasterChat = openMasterChat; window.closeMasterChat = closeMasterChat; window.openChatWithStudent = openChatWithStudent; window.reviewSubmissions = reviewSubmissions; window.gradeSubmission = gradeSubmission; window.addFeedback = addFeedback; window.sendMasterChatMessage = sendMasterChatMessage; window.showMembersList = showMembersList; window.showProgressTable = showProgressTable; window.showAdjustmentPanel = showAdjustmentPanel; window.openAdjustmentForm = openAdjustmentForm; window.showDetailedProgress = showDetailedProgress; window.showAdminPanel = showAdminPanel; window.blockUser = blockUser; window.unblockUser = unblockUser; window.markLessonRead = markLessonRead; window.showCouncilOfMasters = showCouncilOfMasters; window.addNewMember = addNewMember; window.excludeJedi = excludeJedi; window.toggleKeyboardVisibility = toggleKeyboardVisibility; window.toggleLargeText = toggleLargeText; window.showSchedule = window.showSchedule; window.manageUserRanks = window.manageUserRanks; window.handleStatusChange = window.handleStatusChange; window.handleTitleChange = window.handleTitleChange; window.changeUserRank = window.changeUserRank; window.addUserStatus = window.addUserStatus; window.removeUserStatus = window.removeUserStatus; window.addUserTitle = window.addUserTitle; window.removeUserTitle = window.removeUserTitle; window.editScheduleItem = window.editScheduleItem; window.deleteScheduleItem = window.deleteScheduleItem; window.startAddSchedule = window.startAddSchedule; window.handleRankChange = window.handleRankChange; window.showTOC = window.showTOC; window.showYearSections = window.showYearSections; window.showSectionLessons = window.showSectionLessons; window.startAddYear = window.startAddYear; window.startAddSection = window.startAddSection; window.startAddLessonToSection = window.startAddLessonToSection; window.editSection = window.editSection; window.deleteSection = window.deleteSection; window.showLibrary = window.showLibrary; window.showLibraryDepartment = window.showLibraryDepartment; window.showBookDetails = window.showBookDetails; window.startAddDepartment = window.startAddDepartment; window.startAddBook = window.startAddBook; window.deleteDepartment = window.deleteDepartment; window.deleteBook = window.deleteBook; window.openArchivistChat = window.openArchivistChat; window.sendArchivistChatMessage = window.sendArchivistChatMessage; window.closeArchivistChat = window.closeArchivistChat; window.uploadBookFile = window.uploadBookFile;
// =========================================================
// 🔥 БЛОК МЕДИА (фото / видео / голосовые) — ВСТАВИТЬ В САМЫЙ КОНЕЦ ФАЙЛА
// Ничего выше не трогаем. Блок сам подключается к чатам.
// =========================================================
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

window.openImage = function(url) { window.open(url, '_blank'); };

window.sendMediaMessage = function(type) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = type === 'photo' ? 'image/*' : 'video/*';
  input.multiple = false;
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    showMediaPreview(previewUrl, file, type);
  };
  input.click();
};

function showMediaPreview(url, file, type) {
  const old = document.getElementById('media-preview');
  if (old) old.remove();
  const previewHtml = `
    <div style="background:rgba(0,0,0,0.6);border:1px solid var(--border-color);border-radius:10px;padding:15px;margin:10px 0;">
      <p style="color:#64ffda;margin-bottom:10px;">${type === 'photo' ? '📸 Фото' : '🎥 Видео'}:</p>
      ${type === 'photo'
        ? `<img src="${url}" style="max-width:100%;max-height:300px;border-radius:8px;margin-bottom:10px;">`
        : `<video src="${url}" controls style="max-width:100%;max-height:300px;border-radius:8px;margin-bottom:10px;"></video>`}
      <div style="display:flex;gap:10px;">
        <button id="media-confirm-btn" style="flex:1;background:rgba(76,175,80,0.3);color:#4caf50;padding:10px;border-radius:6px;border:none;cursor:pointer;">✅ Отправить</button>
        <button onclick="window.cancelSendMedia()" style="flex:1;background:rgba(255,80,80,0.3);color:#ff6b6b;padding:10px;border-radius:6px;border:none;cursor:pointer;">❌ Отмена</button>
      </div>
    </div>`;
  const container = document.getElementById('chat-container');
  const previewDiv = document.createElement('div');
  previewDiv.id = 'media-preview';
  previewDiv.innerHTML = previewHtml;
  container.appendChild(previewDiv);
  container.scrollTop = container.scrollHeight;
  // привязываем файл напрямую, чтобы не терять его
  previewDiv._mediaFile = file;
  previewDiv._mediaType = type;
  document.getElementById('media-confirm-btn').onclick = () => window.confirmSendMedia();
}

window.cancelSendMedia = function() {
  const p = document.getElementById('media-preview');
  if (p) p.remove();
};

window.confirmSendMedia = async function() {
  const preview = document.getElementById('media-preview');
  if (!preview) return;
  const file = preview._mediaFile;
  const type = preview._mediaType;
  preview.innerHTML = '<p style="color:#64ffda;text-align:center;">⏳ Загрузка...</p>';
  if (!storageRef) { preview.innerHTML = '<p style="color:#ff6b6b;">❌ Хранилище не готово.</p>'; return; }
  try {
    const fileName = `chat_${Date.now()}_${file.name}`;
    const ref = storageRef.child('chat_media/' + fileName);
    await ref.put(file, { contentType: file.type || 'application/octet-stream' });
    const downloadURL = await ref.getDownloadURL();
    preview.remove();
    await sendMediaToChat(downloadURL, type, file.name);
  } catch (error) {
    console.error('Ошибка загрузки медиа:', error);
    preview.innerHTML = `<p style="color:#ff6b6b;">❌ Ошибка: ${error.message}</p>`;
  }
};

async function sendMediaToChat(mediaUrl, type, fileName) {
  if (!windowDb || !currentUser) return;
  const to = window.currentChatPartner || currentUser.учитель;
  if (!to || to === 'отсутствует') { showAlert('Ошибка', 'Некуда отправить сообщение.'); return; }
  await windowDb.collection('messages').add({
    from: currentUser.name, to: to, text: '',
    mediaUrl: mediaUrl, mediaType: type, fileName: fileName,
    timestamp: firebase.firestore.Timestamp.fromDate(new Date()), read: false
  });
  // перерисуем чат (обёртки ниже подхватят медиа)
  if (window.currentChatPartner) await window.openChatWithStudent(window.currentChatPartner);
  else await window.openMasterChat();
}

window.startVoiceRecording = async function() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    mediaRecorder.ondataavailable = (ev) => { audioChunks.push(ev.data); };
    mediaRecorder.onstop = async () => {
const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
await sendVoiceMessage(audioBlob);
};
    mediaRecorder.start();
    isRecording = true;
    updateVoiceBtn();
    showRecordingIndicator();
  } catch (error) {
    showAlert('Ошибка', 'Не удалось получить доступ к микрофону: ' + error.message);
  }
};

window.stopVoiceRecording = function() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    updateVoiceBtn();
    const ind = document.getElementById('recording-indicator');
    if (ind) ind.remove();
    mediaRecorder.stream.getTracks().forEach(t => t.stop());
  }
};

function updateVoiceBtn() {
  const btn = document.getElementById('voice-record-btn');
  if (!btn) return;
  if (isRecording) { btn.textContent = '🛑 Стоп'; btn.style.background = 'rgba(255,107,107,0.3)'; btn.style.color = '#ff6b6b'; }
  else { btn.textContent = '🎤 Голос'; btn.style.background = 'rgba(100,255,218,0.2)'; btn.style.color = '#64ffda'; }
}

function showRecordingIndicator() {
  const old = document.getElementById('recording-indicator');
  if (old) old.remove();
  const ind = document.createElement('div');
  ind.id = 'recording-indicator';
  ind.innerHTML = `<div style="background:rgba(255,107,107,0.2);border:1px solid rgba(255,107,107,0.5);border-radius:10px;padding:15px;margin:10px 0;text-align:center;">
    <p style="color:#ff6b6b;margin:0;font-size:1.1em;">🔴 Запись...</p>
    <p style="color:#a89b7e;margin:5px 0 0 0;font-size:0.9em;">Нажми 🛑 чтобы остановить</p></div>`;
  const container = document.getElementById('chat-container');
  container.appendChild(ind);
  container.scrollTop = container.scrollHeight;
}

async function sendVoiceMessage(audioBlob) {
  if (!storageRef) { showAlert('Ошибка', 'Хранилище не готово.'); return; }
  try {
    const fileName = `voice_${Date.now()}.webm`;
    if (!audioBlob || audioBlob.size === 0) { showAlert('Ошибка', '🎤 Микрофон ничего не записал. Попробуй ещё раз (говори чуть громче/дольше).'); return; }
    const ref = storageRef.child('voice_messages/' + fileName);
    await ref.put(audioBlob, { contentType: 'audio/webm' });
    const downloadURL = await ref.getDownloadURL();
    await sendMediaToChat(downloadURL, 'voice', fileName);
  } catch (error) {
    console.error('Ошибка отправки голосового:', error);
    showAlert('Ошибка', 'Не удалось отправить голосовое: ' + error.message);
  }
}

function addMediaButtonsToChat() {
  const chatWrapper = document.getElementById('master-chat-wrapper');
  if (!chatWrapper) return;
  if (document.getElementById('media-chat-buttons')) return;
  const mediaBtns = document.createElement('div');
  mediaBtns.id = 'media-chat-buttons';
  mediaBtns.innerHTML = `
    <div style="display:flex;gap:5px;margin-top:10px;padding:10px;border-top:1px solid var(--border-color);">
      <button onclick="window.sendMediaMessage('photo')" style="background:rgba(100,255,218,0.2);color:#64ffda;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;font-size:1.2em;" title="Фото">📸</button>
      <button onclick="window.sendMediaMessage('video')" style="background:rgba(100,255,218,0.2);color:#64ffda;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;font-size:1.2em;" title="Видео">🎥</button>
      <button id="voice-record-btn" onclick="isRecording ? window.stopVoiceRecording() : window.startVoiceRecording()" style="background:rgba(100,255,218,0.2);color:#64ffda;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;font-size:1.2em;" title="Голос">🎤</button>
    </div>`;
  chatWrapper.appendChild(mediaBtns);
}

// ---- рендер пузыря с поддержкой медиа ----
function renderBubbleInner(msg, time) {
  if (msg.mediaUrl) {
    let media = '';
    if (msg.mediaType === 'photo') media = `<img src="${msg.mediaUrl}" style="max-width:100%;border-radius:8px;cursor:pointer;" onclick="window.openImage('${msg.mediaUrl}')">`;
    else if (msg.mediaType === 'video') media = `<video src="${msg.mediaUrl}" controls style="max-width:100%;border-radius:8px;"></video>`;
    else if (msg.mediaType === 'voice') media = `<audio src="${msg.mediaUrl}" controls style="max-width:100%;"></audio>`;
    const fn = msg.fileName ? `<div style="margin-top:5px;font-size:0.85em;color:#a89b7e;">${msg.fileName}</div>` : '';
    return `<div class="bubble-text">${media}${fn}</div><div class="bubble-time">${time}</div>`;
  }
  return `<div class="bubble-text">${msg.text || ''}</div><div class="bubble-time">${time}</div>`;
}

async function rerenderMasterChatWithMedia() {
  const container = document.getElementById('master-chat-container');
  if (!container || !currentUser) return;
  const partner = window.currentChatPartner || currentUser.учитель;
  if (!partner || partner === 'отсутствует') return;
  const messages = await loadChatWith(partner);
  container.innerHTML = '';
  messages.forEach(msg => {
    const isMine = msg.from === currentUser.name;
    const time = msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'}) : '';
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble ' + (isMine ? 'mine' : 'theirs');
    bubble.setAttribute('data-msg-id', msg.id || '');
    bubble.innerHTML = renderBubbleInner(msg, time);
    container.appendChild(bubble);
  });
  container.scrollTop = container.scrollHeight;
}

// ---- обёртки поверх оригинальных функций (оригинал НЕ меняем) ----
const _origOpenMasterChat = window.openMasterChat;
window.openMasterChat = async function() {
  await _origOpenMasterChat.apply(this, arguments);
  await rerenderMasterChatWithMedia();
  addMediaButtonsToChat();
};
const _origOpenChatWithStudent = window.openChatWithStudent;
window.openChatWithStudent = async function(name) {
  await _origOpenChatWithStudent.call(this, name);
  await rerenderMasterChatWithMedia();
  addMediaButtonsToChat();
};
// =========================================================
// 🔥 КОНЕЦ БЛОКА МЕДИА
// =========================================================
// =========================================================
// 🔔 ПУШ-УВЕДОМЛЕНИЯ (работают, пока вкладка Акаши открыта)
// =========================================================
let pushStarted = false;
let pushUnsubs = [];

function playNotificationSound() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.setValueAtTime(660, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.36);
  } catch (e) { console.warn('sound err', e); }
}

function showAkashaNotification(title, body) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    const n = new Notification(title, { body: body || '', tag: 'akasha-' + Date.now() });
    n.onclick = function () { try { window.focus(); } catch (e) {} };
  } catch (e) { console.warn('notif err', e); }
}

function askNotificationPermissionOnce() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted' || Notification.permission === 'denied') return;
  const handler = function () {
    try { Notification.requestPermission(); } catch (e) {}
    document.removeEventListener('click', handler);
    document.removeEventListener('touchstart', handler);
  };
  document.addEventListener('click', handler);
  document.addEventListener('touchstart', handler);
}

function startPushSubscriptions() {
  if (pushStarted) return;
  if (!windowDb || !currentUser) return;
  pushStarted = true;
  askNotificationPermissionOnce();
  const myName = currentUser.name;

  // 1) Новые входящие сообщения
  let firstMsg = true;
  try {
    const u1 = windowDb.collection('messages')
      .where('to', '==', myName)
      .onSnapshot(function (snap) {
        if (!currentUser) return;
        if (firstMsg) { firstMsg = false; return; }
        snap.docChanges().forEach(function (ch) {
          if (ch.type !== 'added') return;
          const d = ch.doc.data();
          if (d.from === myName) return;
          playNotificationSound();
          const preview = d.text ? d.text.slice(0, 60) : (d.mediaType === 'photo' ? '📸 Фото' : d.mediaType === 'video' ? '🎥 Видео' : d.mediaType === 'voice' ? '🎤 Голосовое' : 'Новое сообщение');
          showAkashaNotification('💬 ' + (d.from || 'Сообщение'), preview);
        });
      });
    pushUnsubs.push(u1);
  } catch (e) { console.error('push messages err', e); }

  // 2) Новые домашние задания
  let firstHw = true;
  try {
    const u2 = windowDb.collection('homework_assignments')
      .onSnapshot(function (snap) {
        if (!currentUser) return;
        if (firstHw) { firstHw = false; return; }
        snap.docChanges().forEach(function (ch) {
          if (ch.type !== 'added') return;
          const d = ch.doc.data();
          playNotificationSound();
          showAkashaNotification('📝 Новое задание', d.title || 'Проверь домашние задания');
        });
      });
    pushUnsubs.push(u2);
  } catch (e) { console.error('push hw err', e); }

  // 3) Проверили твою домашку
  let firstSub = true;
  try {
    const u3 = windowDb.collection('homework_submissions')
      .where('studentName', '==', myName)
      .onSnapshot(function (snap) {
        if (!currentUser) return;
        if (firstSub) { firstSub = false; return; }
        snap.docChanges().forEach(function (ch) {
          if (ch.type !== 'modified') return;
          const d = ch.doc.data();
          if (d.status === 'approved') { playNotificationSound(); showAkashaNotification('✅ Задание одобрено!', 'Мастер проверил твою работу'); }
          else if (d.status === 'needs_revision') { playNotificationSound(); showAkashaNotification('⚠️ На доработку', 'Мастер вернул задание с комментарием'); }
        });
      });
    pushUnsubs.push(u3);
  } catch (e) { console.error('push sub err', e); }

  console.log('🔔 Пуш-подписки запущены для', myName);
  // автозапуск пушей после входа (любым путём — авто или ручной логин)
setInterval(function () {
  try { if (windowDb && currentUser && !pushStarted) startPushSubscriptions(); } catch (e) {}
}, 1000);
}
// =========================================================
// =========================================================
// 🔧 РАБОЧИЙ АВТОЗАПУСК ПУШЕЙ (снаружи функции — ловит любой логин)
// =========================================================
setInterval(function () {
  try { if (windowDb && currentUser && !pushStarted) startPushSubscriptions(); } catch (e) {}
}, 1000);

// =========================================================
// 🔔 ЗЕЛЁНЫЙ ТОСТ ВНУТРИ СТРАНИЦЫ (видно на ЛЮБОМ браузере, даже Huawei, без разрешений)
// =========================================================
function showAkashaToast(title, body) {
  try {
    var stack = document.getElementById('akasha-toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'akasha-toast-stack';
      stack.style.cssText = 'position:fixed;top:10px;left:10px;right:10px;z-index:999999;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;';
      document.body.appendChild(stack);
    }
    var t = document.createElement('div');
    t.style.cssText = 'pointer-events:auto;max-width:420px;width:100%;background:rgba(13,31,15,0.97);border:1px solid #64ffda;border-radius:12px;padding:12px 16px;box-shadow:0 6px 24px rgba(0,0,0,0.5),0 0 14px rgba(100,255,218,0.35);color:#e8f5e9;font-family:"Cormorant Garamond",serif;cursor:pointer;transform:translateY(-160%);opacity:0;transition:transform .35s ease,opacity .35s ease;';
    t.innerHTML = '<div style="color:#64ffda;font-weight:700;font-size:1.05em;margin-bottom:3px;">' + (title || '') + '</div>' + (body ? '<div style="color:#cfe8d4;font-size:0.95em;line-height:1.35;">' + body + '</div>' : '');
    stack.appendChild(t);
    requestAnimationFrame(function(){ t.style.transform = 'translateY(0)'; t.style.opacity = '1'; });
    var kill = function(){ t.style.transform = 'translateY(-160%)'; t.style.opacity = '0'; setTimeout(function(){ if (t.parentNode) t.parentNode.removeChild(t); }, 400); };
    t.onclick = kill;
    setTimeout(kill, 5000);
  } catch (e) { console.warn('toast err', e); }
}

// каждый пуш теперь = зелёный тост внутри страницы (+ системный баннер бонусом, если браузер вдруг покажет)
showAkashaNotification = function(title, body) {
  showAkashaToast(title, body);
  try { if (typeof Notification !== 'undefined' && Notification.permission === 'granted') { new Notification(title, { body: body || '' }); } } catch (e) {}
};

// приветственный тост раз в день — доказательство, что уведомления живые
(function(){
  try {
    var today = new Date().toDateString();
    if (localStorage.getItem('akasha_push_hello_day') !== today) {
      var wait = setInterval(function(){
        if (typeof currentUser !== 'undefined' && currentUser) {
          clearInterval(wait);
          localStorage.setItem('akasha_push_hello_day', today);
          setTimeout(function(){ showAkashaToast('🔔 Уведомления Акаши активны', 'События Ордена теперь всплывают прямо здесь — на любом браузере.'); }, 1200);
        }
      }, 800);
      setTimeout(function(){ clearInterval(wait); }, 20000);
    }
  } catch (e) {}
})();
// =========================================================
// =========================================================
// 📚 ЧАТ АРХИВАРИУСА — режим «я архивариус, мне пишут ученики»
// (ученикам ничего не ломает: для них всё работает как раньше)
// =========================================================
function archBubble(msg, myName) {
  const isMine = msg.from === myName;
  const time = msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'}) : '';
  const safe = (msg.text || '').replace(/</g, '&lt;');
  return '<div class="chat-bubble ' + (isMine ? 'mine' : 'theirs') + '"><div class="bubble-text">' + safe + '</div><div class="bubble-time">' + time + '</div></div>';
}

async function showArchivistDashboard() {
  const my = currentUser.name;
  const cont = document.getElementById('chat-container');
  if (cont) cont.innerHTML = '';
  const aw = document.getElementById('archivist-chat-wrapper'); if (aw) aw.style.display = 'none';
  const mw = document.getElementById('main-input-wrapper'); if (mw) mw.style.display = 'block';
  window.currentChatPartner = null;
  const sIn = await windowDb.collection('archivist_messages').where('to', '==', my).get();
  const sOut = await windowDb.collection('archivist_messages').where('from', '==', my).get();
  const map = new Map();
  const addDoc = function (d) {
    const data = d.data();
    const other = (data.from === my) ? data.to : data.from;
    if (!other || other === my) return;
    const ts = data.timestamp ? data.timestamp.seconds : 0;
    const unread = (data.to === my && data.read === false) ? 1 : 0;
    const cur = map.get(other);
    if (!cur) { map.set(other, { name: other, last: data.text || '', ts: ts, unread: unread }); }
    else { if (ts > cur.ts) { cur.last = data.text || ''; cur.ts = ts; } cur.unread += unread; }
  };
  sIn.forEach(addDoc); sOut.forEach(addDoc);
  const list = Array.from(map.values()).sort(function (a, b) { return b.ts - a.ts; });
  let html = '<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;">';
  html += '<h3 style="color:#64ffda;margin-bottom:20px;font-family:\'Playfair Display\',serif;text-align:center;font-size:1.6em;">📚 Вопросы учеников о книгах</h3>';
  if (list.length === 0) {
    html += '<p style="color:#6b5f4a;text-align:center;font-style:italic;">Пока никто не писал тебе о книгах.</p>';
  } else {
    list.forEach(function (s) {
      const time = s.ts ? new Date(s.ts * 1000).toLocaleString('ru-RU', {hour:'2-digit', minute:'2-digit'}) : '';
      const badge = s.unread > 0 ? '<span style="background:#ff6b6b;color:white;padding:2px 8px;border-radius:10px;font-size:0.8em;margin-left:8px;">' + s.unread + '</span>' : '';
      const esc = s.name.replace(/'/g, "\\'");
      const last = (s.last || '');
      html += '<div style="background:rgba(100,255,218,0.1);border:1px solid rgba(100,255,218,0.3);border-radius:10px;padding:15px;margin:10px 0;cursor:pointer;" onclick="window.openArchivistChatWithStudent(\'' + esc + '\')">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:1.1em;color:#64ffda;font-weight:bold;">👤 ' + s.name + badge + '</div><div style="color:#6b5f4a;font-size:0.9em;">' + time + '</div></div>';
      html += '<div style="color:#a89b7e;margin-top:8px;font-style:italic;">"' + last.substring(0, 50) + (last.length > 50 ? '...' : '') + '"</div></div>';
    });
  }
  html += '<button class="hw-btn" onclick="window.showLibrary()" style="width:100%;margin-top:15px;padding:12px;">🔙 Вернуться в Библиотеку</button></div>';
  addRawHTML(html);
}

window.openArchivistChatWithStudent = async function (studentName) {
  const my = currentUser.name;
  chatContainer.classList.add('chat-open');
  const mw = document.getElementById('main-input-wrapper'); if (mw) mw.style.display = 'none';
  const aw = document.getElementById('archivist-chat-wrapper'); if (aw) aw.style.display = 'block';
  const container = document.getElementById('archivist-chat-container');
  if (!container) return;
  container.innerHTML = '<p style="color:#6b5f4a;text-align:center;">Загрузка...</p>';
  try {
    const s1 = await windowDb.collection('archivist_messages').where('from', '==', my).where('to', '==', studentName).get();
    const s2 = await windowDb.collection('archivist_messages').where('from', '==', studentName).where('to', '==', my).get();
    const msgs = [];
    s1.forEach(function (d) { msgs.push(d.data()); });
    s2.forEach(function (d) { msgs.push(d.data()); });
    msgs.sort(function (a, b) { return (a.timestamp ? a.timestamp.seconds : 0) - (b.timestamp ? b.timestamp.seconds : 0); });
    container.innerHTML = '';
    if (msgs.length === 0) {
      container.innerHTML = '<p style="color:#6b5f4a;text-align:center;font-style:italic;">Пока нет переписки с ' + studentName + '</p>';
    } else {
      msgs.forEach(function (m) { container.insertAdjacentHTML('beforeend', archBubble(m, my)); });
      container.scrollTop = container.scrollHeight;
    }
    const sUnread = await windowDb.collection('archivist_messages').where('from', '==', studentName).where('to', '==', my).where('read', '==', false).get();
    if (!sUnread.empty) { const batch = windowDb.batch(); sUnread.forEach(function (d) { batch.update(d.ref, { read: true }); }); await batch.commit(); }
    window.currentChatPartner = studentName;
  } catch (e) { console.error('archivist chat err', e); container.innerHTML = '<p>❌ Ошибка загрузки переписки.</p>'; }
};

// ---- обёртки: для архивариуса — новый путь, для ученика — старый (нетронуто) ----
const _origOpenArchivist = window.openArchivistChat;
window.openArchivistChat = async function () {
  if (isArchivist()) { try { await showArchivistDashboard(); } catch (e) { console.error('archivist dashboard err', e); } return; }
  return _origOpenArchivist.apply(this, arguments);
};

const _origSendArchivist = window.sendArchivistChatMessage;
window.sendArchivistChatMessage = async function () {
  const my = currentUser.name;
  const partner = window.currentChatPartner;
  const archName = 'Далисса Иденааль Вестуро';
  if (isArchivist() && partner && partner !== my && partner !== archName) {
    const input = document.getElementById('archivist-chat-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    try {
      await windowDb.collection('archivist_messages').add({ from: my, to: partner, text: text, timestamp: firebase.firestore.Timestamp.fromDate(new Date()), read: false });
      input.value = '';
      await window.openArchivistChatWithStudent(partner);
    } catch (e) { console.error('archivist send err', e); }
    return;
  }
  return _origSendArchivist.apply(this, arguments);
};

const _origCloseArchivist = window.closeArchivistChat;
window.closeArchivistChat = function () {
  if (isArchivist()) {
    const aw = document.getElementById('archivist-chat-wrapper'); if (aw) aw.style.display = 'none';
    const mw = document.getElementById('main-input-wrapper'); if (mw) mw.style.display = 'block';
    chatContainer.classList.remove('chat-open');
    window.currentChatPartner = null;
    showArchivistDashboard();
    return;
  }
  return _origCloseArchivist.apply(this, arguments);
};
// =========================================================
// =========================================================
// ✉️ ЧАТ С МАСТЕРОМ = общий канал связи с Верховным Магистром
// (доступен ВСЕМ, независимо от ранга/звания/статуса/учителя)
// =========================================================
function getSupremeMasterName() {
  try {
    var sm = Object.values(usersDatabase).find(function (u) { return u && u.ранг === 'верховный магистр'; });
    if (sm && sm.fullName) return sm.fullName;
  } catch (e) {}
  return 'Аранэль Хальдарон';
}

window.openMasterChat = async function () {
  if (!currentUser) return;
  chatContainer.classList.add('chat-open');
  var supreme = getSupremeMasterName();

  // Верховный Магистр видит входящие от всех
  if (currentUser.name === supreme) {
    try { await showMasterDashboard(); } catch (e) { console.error('dashboard err', e); }
    return;
  }

  // Все остальные — личный канал с Верховным Магистром
  var mw = document.getElementById('main-input-wrapper'); if (mw) mw.style.display = 'none';
  var cw = document.getElementById('master-chat-wrapper'); if (cw) cw.style.display = 'block';
  window.currentChatPartner = supreme;
  var container = document.getElementById('master-chat-container');
  if (container) container.innerHTML = '<p style="color:#6b5f4a;text-align:center;">Загрузка...</p>';
  try { if (typeof rerenderMasterChatWithMedia === 'function') { await rerenderMasterChatWithMedia(); } } catch (e) { console.error('rerender err', e); }
  if (container && container.innerHTML.trim() === '') {
    container.innerHTML = '<p style="color:#6b5f4a;text-align:center;font-style:italic;">Пока нет сообщений. Напиши Верховному Магистру первым!</p>';
  }
  try { await markAsRead(supreme); } catch (e) {}
  if (typeof addMediaButtonsToChat === 'function') addMediaButtonsToChat();
};
// =========================================================
// =========================================================
// 🧙‍️ ФИКС: учитель сохраняется у ВСЕХ рангов (не только у падаванов)
// =========================================================
// поле учителя теперь видно всегда (раньше пряталось для юнлингов и др.)
window.handleRankChange = function () {
  var w = document.getElementById('teacher-input-wrapper');
  if (w) w.style.display = 'block';
};

// сохраняем учителя всегда, когда поле заполнено (раньше читалось только для падаван/старший падаван)
window.changeUserRank = async function (userKey) {
  var select = document.getElementById('rank-select');
  if (!select) { showAlert('Ошибка', 'Элемент не найден. Обновите страницу.'); return; }
  var newRank = select.value;
  var teacherField = document.getElementById('teacher-input-field');
  var teacherInput = teacherField ? teacherField.value.trim() : '';
  var needTeacher = (newRank === 'падаван' || newRank === 'старший падаван');
  if (needTeacher && !teacherInput) { showAlert('Ошибка', 'Для ранга Падаван или Старший Падаван необходимо указать Учителя!'); return; }
  try {
    var userRef = windowDb.collection('users').doc(userKey);
    var userDoc = await userRef.get();
    var updates = { rank: newRank };
    if (teacherInput) updates.teacher = (teacherInput.toLowerCase() === 'нет' || teacherInput.toLowerCase() === 'отсутствует') ? 'отсутствует' : teacherInput;
    if (!userDoc.exists) {
      var u = usersDatabase[userKey];
      await userRef.set({
        fullName: u.fullName, rank: newRank,
        teacher: (teacherInput || u.учитель || 'отсутствует'),
        password: u.пароль || '', specialTitle: u.specialTitle || '',
        description: u.description || '',
        статусы: u.статусы || [], звания: u.звания || [],
        createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
        createdBy: currentUser.name
      });
    } else {
      await userRef.update(updates);
    }
    usersDatabase[userKey].ранг = newRank;
    if (teacherInput) usersDatabase[userKey].учитель = (teacherInput.toLowerCase() === 'нет' || teacherInput.toLowerCase() === 'отсутствует') ? 'отсутствует' : teacherInput;
    showAlert('Успех', 'Ранг' + (teacherInput ? ' и Учитель' : '') + ' сохранены!');
    window.manageUserRanks(userKey);
  } catch (error) {
    showAlert('Ошибка', 'Не удалось сохранить: ' + error.message);
  }
};

// после отрисовки формы — принудительно показываем поле учителя (для любого ранга)
var _origManageUserRanks = window.manageUserRanks;
window.manageUserRanks = async function (userKey) {
  await _origManageUserRanks.call(this, userKey);
  setTimeout(function () {
    var w = document.getElementById('teacher-input-wrapper');
    if (w) w.style.display = 'block';
  }, 250);
};
// =========================================================
// =========================================================
// 🔄 ФИКС: ранг/учитель/звания ВСЕГДА тянутся из Firebase поверх прошитого списка
// (читаем с сервера в обход кэша + убираем дубли по имени)
// =========================================================
async function loadUsersFromFirebase() {
  if (!windowDb) return;
  try {
    var snap;
    try { snap = await windowDb.collection('users').get({ source: 'server' }); }
    catch (e) { snap = await windowDb.collection('users').get(); }
    var norm = function (x) { return String(x || '').toLowerCase().trim(); };
    snap.forEach(function (doc) {
      var data = doc.data() || {};
      var fbKey = doc.id;
      var fbName = norm(data.fullName);
      // каноническая запись: сначала ищем по совпадению имени (прошитую), иначе по ключу
      var canonKey = null;
      var keys = Object.keys(usersDatabase);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i] !== fbKey && norm(usersDatabase[keys[i]].fullName) === fbName) { canonKey = keys[i]; break; }
      }
      if (!canonKey) canonKey = usersDatabase[fbKey] ? fbKey : null;
      var rec = canonKey ? usersDatabase[canonKey] : null;
      if (!rec) {
        rec = {
          fullName: data.fullName, ранг: data.rank, учитель: data.teacher, пароль: data.password,
          specialTitle: data.specialTitle || '', description: data.description || '',
          статусы: data.статусы || [], звания: data.звания || []
        };
        usersDatabase[fbKey] = rec;
        canonKey = fbKey;
      } else {
        rec.ранг = data.rank;
        if (data.teacher !== undefined) rec.учитель = data.teacher;
        rec.статусы = data.статусы || rec.статусы || [];
        rec.звания = data.звания || rec.звания || [];
        if (data.specialTitle) rec.specialTitle = data.specialTitle;
        if (data.description) rec.description = data.description;
        if (data.fullName) rec.fullName = data.fullName;
      }
      // если про одного человека лежал дубль под другим ключом — убираем лишний
      if (canonKey !== fbKey && usersDatabase[fbKey]) delete usersDatabase[fbKey];
    });
    console.log('✅ loadUsersFromFirebase (server) обновил ранги/учителей из базы:', Object.keys(usersDatabase).length, 'записей');
  } catch (error) { console.error('Ошибка загрузки пользователей:', error); }
}
// =========================================================
// =========================================================
// 📑 ГЛАВЫ / ТЕМЫ в оглавлении (Год → Раздел → Глава → Уроки)
// =========================================================
let chaptersList = [];

async function loadChaptersFromFirebase(sectionId) {
  if (!windowDb) return [];
  try {
    const snap = await windowDb.collection('chapters').where('sectionId', '==', sectionId).get();
    const arr = [];
    snap.forEach(function (d) { arr.push({ id: d.id, ...d.data() }); });
    arr.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    return arr;
  } catch (e) { console.error('Ошибка загрузки глав:', e); return []; }
}

async function addChapterToFirebase(sectionId, name) {
  if (!windowDb) return false;
  try {
    const cur = await loadChaptersFromFirebase(sectionId);
    const order = cur.length + 1;
    const docRef = await windowDb.collection('chapters').add({
      sectionId: sectionId, name: name, order: order,
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      createdBy: currentUser.name
    });
    return docRef.id;
  } catch (e) { console.error('Ошибка создания главы:', e); return false; }
}

async function renameChapterInFirebase(chapterId, newName) {
  if (!windowDb || !chapterId) return false;
  try { await windowDb.collection('chapters').doc(chapterId).update({ name: newName }); return true; }
  catch (e) { console.error('Ошибка переименования главы:', e); return false; }
}

async function deleteChapterFromFirebase(chapterId, sectionId) {
  if (!windowDb || !chapterId) return false;
  try {
    await windowDb.collection('chapters').doc(chapterId).delete();
    // уроки из удалённой главы возвращаем в "без главы", чтобы не пропали
    const orphans = Object.values(lessonsById).filter(function (l) { return l.chapterId === chapterId; });
    for (const l of orphans) { await updateLessonInFirebase(l.id, { chapterId: '' }); }
    await loadLessonsFromFirebase();
    return true;
  } catch (e) { console.error('Ошибка удаления главы:', e); return false; }
}

// выбор главы для урока (перенос / "без главы")
window.showChapterPicker = async function (lessonId) {
  const lesson = lessonsById[lessonId];
  if (!lesson) { showAlert('Ошибка', 'Урок не найден.'); return; }
  const chapters = await loadChaptersFromFirebase(lesson.sectionId);
  if (chapters.length === 0) { showAlert('Нет глав', 'Сначала создайте хотя бы одну главу/тему в этом разделе.'); return; }
  const safeTitle = (lesson.title || '').replace(/</g, '&lt;');
  const buttons = chapters.map(function (c) {
    return { text: '📑 ' + c.name, class: 'hw-btn', style: 'background:rgba(139,195,74,0.25);color:#8bc34a;width:100%;margin:4px 0;', action: function () { window.moveLessonToChapter(lessonId, c.id, lesson.sectionId); } };
  });
  buttons.push({ text: '📄 Без главы', class: 'hw-btn', style: 'background:rgba(100,255,218,0.2);color:#64ffda;width:100%;margin:4px 0;', action: function () { window.moveLessonToChapter(lessonId, '', lesson.sectionId); } });
  buttons.push({ text: 'Отмена', class: 'hw-btn', action: function () {} });
  showCustomModal('📦 Перенос урока', '<p>Куда перенести урок <strong>«' + safeTitle + '»</strong>?</p>', buttons);
};

window.moveLessonToChapter = async function (lessonId, chapterId, sectionId) {
  const ok = await updateLessonInFirebase(lessonId, { chapterId: chapterId || '' });
  if (ok) { await loadLessonsFromFirebase(); showAlert('Успех', chapterId ? 'Урок перенесён в главу.' : 'Урок возвращён в „Уроки без главы“.'); }
  else { showAlert('Ошибка', 'Не удалось перенести урок.'); }
  window.showSectionLessons(sectionId);
};

window.startAddChapter = function (sectionId) {
  addMessage('<p>📑 <strong>Создание новой Главы/Темы</strong></p><p>Введите <strong>название главы/темы</strong> (или <em>"отмена"</em>):</p>');
  addLessonState = { step: 'add_chapter_name', sectionId: sectionId };
};

window.editChapter = async function (chapterId, sectionId) {
  const ch = chaptersList.find(function (c) { return c.id === chapterId; });
  if (!ch) { showAlert('Ошибка', 'Глава не найдена.'); return; }
  const newName = await askPrompt('Переименование главы', 'Текущее название: "' + ch.name + '"\n\nНовое название:', ch.name);
  if (!newName || newName.trim() === '') return;
  const ok = await renameChapterInFirebase(chapterId, newName.trim());
  if (ok) { showAlert('Успех', 'Глава переименована.'); window.showSectionLessons(sectionId); }
  else { showAlert('Ошибка', 'Не удалось переименовать.'); }
};

window.deleteChapter = async function (chapterId, chapterName, sectionId) {
  const confirmed = await askConfirm('⚠️ ВНИМАНИЕ!', 'Удалить главу «' + chapterName + '»?\n\nУроки из неё НЕ удалятся — они вернутся в „Уроки без главы“.');
  if (!confirmed) return;
  const ok = await deleteChapterFromFirebase(chapterId, sectionId);
  if (ok) { showAlert('Успех', 'Глава удалена.'); window.showSectionLessons(sectionId); }
  else { showAlert('Ошибка', 'Не удалось удалить главу.'); }
};

// экран уроков ВНУТРИ главы
window.showChapterLessons = async function (chapterId, sectionId) {
  const container = document.getElementById('chat-container');
  if (container) container.innerHTML = '';
  await loadLessonsFromFirebase();
  const chapter = chaptersList.find(function (c) { return c.id === chapterId; });
  const section = sectionsList.find(function (s) { return s.id === sectionId; });
  if (!chapter) { addMessage('<p>❌ Глава не найдена.</p>'); return; }
  const chLessons = Object.values(lessonsById).filter(function (l) { return l.chapterId === chapterId; });
  await akEnsureLessonOrder(chLessons);
  let html = '<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;">';
  html += '<h3 style="color:#64ffda;margin-bottom:8px;font-family:\'Playfair Display\',serif;text-align:center;font-size:1.7em;">📑 ' + chapter.name + '</h3>';
  if (section) html += '<p style="color:var(--text-secondary);text-align:center;font-style:italic;margin-bottom:20px;">' + section.name + ' (' + section.year + ')</p>';
  if (chLessons.length === 0) {
    html += '<p style="color:#6b5f4a;text-align:center;font-style:italic;font-size:1.05em;">В этой главе пока нет уроков.</p>';
    html += '<p style="color:#a89b7e;text-align:center;font-size:0.9em;margin-top:8px;">💡 Создайте урок в разделе — он появится в „Уроки без главы“, затем перенесите его сюда кнопкой 📦.</p>';
  } else {
    html += '<div style="margin-bottom:20px;">';
    chLessons.forEach(function (lesson) {
      html += '<div style="display:flex;gap:8px;align-items:center;margin:5px 0;">';
      html += '<div class="toc-lesson-link" onclick="window.showLessonContent(\'' + lesson.id + '\')" style="flex:1;padding:12px;background:rgba(0,0,0,0.2);border-radius:8px;font-size:1.1em;cursor:pointer;">📚 ' + lesson.title + '</div>';
      if (isMaster()) html += '<button onclick="window.showChapterPicker(\'' + lesson.id + '\')" style="background:rgba(100,255,218,0.2);color:#64ffda;border:1px solid rgba(100,255,218,0.4);padding:10px;border-radius:8px;font-size:0.9em;min-width:46px;">📦</button>';
      html += '</div>';
    });
    html += '</div>';
  }
  if (isMaster()) html += '<button class="hw-btn" onclick="window.startAddLessonToSection(\'' + sectionId + '\')" style="width:100%;margin-top:15px;background:rgba(76,175,80,0.3);color:#4caf50;font-size:1.05em;">➕ Создать урок в разделе (потом перенести сюда)</button>';
  html += '<button class="hw-btn" onclick="window.showSectionLessons(\'' + sectionId + '\')" style="width:100%;margin-top:12px;padding:12px;font-size:1.1em;">🔙 Назад к главам</button></div>';
  addRawHTML(html);
};

// ПЕРЕКРЫВАЕМ экран раздела: теперь сначала главы, потом "уроки без главы"
window.showSectionLessons = async function (sectionId) {
  const container = document.getElementById('chat-container');
  if (container) container.innerHTML = '';
  await loadLessonsFromFirebase();
  chaptersList = await loadChaptersFromFirebase(sectionId);
  const section = sectionsList.find(function (s) { return s.id === sectionId; });
  if (!section) { addMessage('<p>❌ Раздел не найден!</p>'); return; }
  const noChapterLessons = Object.values(lessonsById).filter(function (l) { return l.sectionId === sectionId && (!l.chapterId || l.chapterId === ''); });
  let html = '<div style="background:rgba(13,31,15,0.5);border:1px solid var(--border-color);border-radius:15px;padding:25px;margin:15px 0;">';
  html += '<h3 style="color:#64ffda;margin-bottom:25px;font-family:\'Playfair Display\',serif;text-align:center;font-size:1.8em;">📖 ' + section.name + ' (' + section.year + ')</h3>';

  // --- главы ---
  html += '<h4 style="color:#8bc34a;font-family:\'Playfair Display\',serif;margin:0 0 12px 0;">📑 Главы / Темы</h4>';
  if (chaptersList.length === 0) {
    html += '<p style="color:#6b5f4a;font-style:italic;margin:0 0 15px 0;">Глав пока нет. Создайте первую главу/тему.</p>';
  } else {
    html += '<div style="margin-bottom:15px;">';
    chaptersList.forEach(function (ch) {
      const cnt = Object.values(lessonsById).filter(function (l) { return l.chapterId === ch.id; }).length;
      html += '<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">';
      html += '<button onclick="window.showChapterLessons(\'' + ch.id + '\',\'' + sectionId + '\')" style="flex:1;background:rgba(139,195,74,0.2);color:var(--accent-color);font-size:1.1em;padding:12px;border-radius:8px;border:1px solid rgba(139,195,74,0.4);text-align:left;">📑 ' + ch.name + ' <span style="color:#6b5f4a;font-size:0.85em;">(' + cnt + ')</span></button>';
      if (isMaster()) {
        html += '<button onclick="window.editChapter(\'' + ch.id + '\',\'' + sectionId + '\')" style="background:rgba(100,255,218,0.2);color:#64ffda;border:1px solid rgba(100,255,218,0.4);padding:12px;border-radius:8px;min-width:46px;">✏️</button>';
        html += '<button onclick="window.deleteChapter(\'' + ch.id + '\',\'' + ch.name.replace(/'/g, "\\'") + '\',\'' + sectionId + '\')" style="background:rgba(255,80,80,0.2);color:#ff6b6b;border:1px solid rgba(255,80,80,0.4);padding:12px;border-radius:8px;min-width:46px;">🗑️</button>';
      }
      html += '</div>';
    });
    html += '</div>';
  }
  if (isMaster()) html += '<button class="hw-btn" onclick="window.startAddChapter(\'' + sectionId + '\')" style="width:100%;margin-bottom:20px;background:rgba(76,175,80,0.3);color:#4caf50;font-size:1.05em;">➕ Создать новую Главу/Тему</button>';

  // --- уроки без главы (старые + новые неприкреплённые) ---
  html += '<h4 style="color:#a89b7e;font-family:\'Playfair Display\',serif;margin:10px 0 12px 0;border-top:1px solid var(--border-color);padding-top:15px;">📄 Уроки без главы</h4>';
  if (noChapterLessons.length === 0) {
    html += '<p style="color:#6b5f4a;font-style:italic;margin:0 0 15px 0;">Все уроки распределены по главам. ✨</p>';
  } else { await akEnsureLessonOrder(noChapterLessons);
    html += '<div style="margin-bottom:15px;">';
    noChapterLessons.forEach(function (lesson) {
      html += '<div style="display:flex;gap:8px;align-items:center;margin:5px 0;">';
      html += '<div class="toc-lesson-link" onclick="window.showLessonContent(\'' + lesson.id + '\')" style="flex:1;padding:12px;background:rgba(0,0,0,0.2);border-radius:8px;font-size:1.05em;cursor:pointer;">📚 ' + lesson.title + '</div>';
      if (isMaster()) html += '<button onclick="window.showChapterPicker(\'' + lesson.id + '\')" title="Перенести в главу" style="background:rgba(100,255,218,0.2);color:#64ffda;border:1px solid rgba(100,255,218,0.4);padding:10px;border-radius:8px;font-size:0.9em;min-width:46px;">📦</button>';
      html += '</div>';
    });
    html += '</div>';
  }
  if (isMaster()) html += '<button class="hw-btn" onclick="window.startAddLessonToSection(\'' + sectionId + '\')" style="width:100%;margin-top:10px;background:rgba(76,175,80,0.3);color:#4caf50;font-size:1.05em;">➕ Добавить урок в раздел</button>';
  html += '<button class="hw-btn" onclick="window.showYearSections(' + section.year + ')" style="width:100%;margin-top:12px;padding:12px;font-size:1.1em;">🔙 Назад к разделам</button></div>';
  addRawHTML(html);
};

// обработка ввода имени новой главы
const _origFindAnswerChapter = window.findAnswer || findAnswer;
window.findAnswer = async function (question) {
  const q = (question || '').toLowerCase().trim();
  if (addLessonState && addLessonState.step === 'add_chapter_name') {
    if (q === 'отмена') { addLessonState = null; return '<p>❌ Отменено.</p>'; }
    const sid = addLessonState.sectionId;
    addLessonState = null;
    const id = await addChapterToFirebase(sid, question);
    if (id) { addMessage('<p>✅ Глава/тема «<strong>' + question + '</strong>» создана!</p>'); await loadLessonsFromFirebase(); window.showSectionLessons(sid); }
    else { addMessage('<p>❌ Ошибка создания главы.</p>'); }
    return '';
  }
  return _origFindAnswerChapter.call(this, question);
};
// =========================================================
// =========================================================
// 📑 СОЗДАНИЕ УРОКА СРАЗУ В ГЛАВУ (чтобы не разгребать вручную)
// =========================================================
const _prevFindAnswerForChapter = window.findAnswer || findAnswer;
window.findAnswer = async function (question) {
  const q = (question || '').toLowerCase().trim();

  // перехватываем шаг "медиа" — НЕ даём оригиналу записать урок без главы
  if (addLessonState && addLessonState.step === 'add_lesson_media') {
    if (q === 'отмена') { addLessonState = null; return '<p>❌ Создание урока отменено.</p>'; }
    const mediaUrl = (q === 'нет' || q === '') ? '' : question;
    addLessonState.lessonMediaUrl = mediaUrl;
    const sid = addLessonState.sectionId;
    let chapters = [];
    try { if (typeof loadChaptersFromFirebase === 'function') chapters = await loadChaptersFromFirebase(sid); } catch (e) {}
    addLessonState._chapters = chapters;
    addLessonState.step = 'add_lesson_chapter';
    if (chapters.length === 0) {
      return '<p>📑 В этом разделе пока нет глав/тем.</p><p>Урок будет создан <strong>без главы</strong> — введите <em>0</em> (или <em>да</em>), либо <em>отмена</em>, чтобы не создавать.</p><p style="color:#a89b7e;font-size:0.9em;">💡 Совет: сначала создайте главы кнопкой «➕ Создать новую Главу/Тему» — тогда здесь появится нумерованный выбор.</p>';
    }
    let list = '<p>📑 <strong>В какую главу/тему поместить урок?</strong> Введите номер:</p><ul style="color:var(--text-color);line-height:1.7;">';
    chapters.forEach(function (c, i) { list += '<li><strong>' + (i + 1) + '</strong> — ' + c.name + '</li>'; });
    list += '</ul><p>Введите <em>0</em> — создать без главы, <em>отмена</em> — не создавать.</p>';
    return list;
  }

  // новый шаг — выбор главы по номеру и финальная запись
  if (addLessonState && addLessonState.step === 'add_lesson_chapter') {
    if (q === 'отмена') { addLessonState = null; return '<p>❌ Создание урока отменено.</p>'; }
    const chapters = addLessonState._chapters || [];
    let chapterId = '';
    const n = parseInt(q, 10);
    if (!isNaN(n) && n >= 1 && n <= chapters.length) chapterId = chapters[n - 1].id;
    const section = addLessonState.section;
    const sid = addLessonState.sectionId;
    const title = addLessonState.lessonTitle;
    const content = addLessonState.lessonContent;
    const mediaUrl = addLessonState.lessonMediaUrl || '';
    addLessonState = null;
    const ok = await addLessonToFirebase(section.rank, title, content, mediaUrl, section.year, sid, chapterId);
    if (ok) {
      try { await loadLessonsFromFirebase(); } catch (e) {}
      const where = chapterId ? 'в главу' : 'без главы';
      return '<p>✅ Урок «<strong>' + title + '</strong>» создан (' + where + ')!</p>';
    }
    return '<p>❌ Ошибка создания урока.</p>';
  }

  // всё остальное — как раньше
  return _prevFindAnswerForChapter.call(this, question);
};
// =========================================================
// =========================================================
// 📦 РЕГИСТРАЦИЯ SERVICE WORKER + визуальный статус (без консоли)
// =========================================================
(function () {
  if (!('serviceWorker' in navigator)) return;
  var helloKey = 'akasha_sw_ready_day';
  var today = function () { return new Date().toDateString(); };
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').then(function (reg) {
      try { if (typeof showAkashaToast === 'function') showAkashaToast('📦 Приложение обновляется', 'Кэш оболочки ставится на планшет…'); } catch (e) {}
      // новый SW пришёл — скажем, что со следующего открытия оффлайн заработает
      var onNew = function () { try { if (typeof showAkashaToast === 'function') showAkashaToast('✅ Обновление готово', 'Закрой и открой Акашу заново — и она будет работать даже без сети.'); } catch (e) {} };
      if (reg.waiting) { onNew(); return; }
      if (reg.installing) { reg.installing.addEventListener('statechange', function () { if (this.state === 'installed' && navigator.serviceWorker.controller) onNew(); }); }
      reg.addEventListener && reg.addEventListener('updatefound', function () {
        var nw = reg.installing; if (!nw) return;
        nw.addEventListener('statechange', function () { if (this.state === 'installed' && navigator.serviceWorker.controller) onNew(); });
      });
    }).catch(function (err) {
      try { if (typeof showAkashaToast === 'function') showAkashaToast('⚠️ SW не встал', String(err && err.message || err)); } catch (e) {}
      console.error('SW register error', err);
    });
    // когда SW взял контроль — один раз в день покажем «готово оффлайн»
    navigator.serviceWorker.ready.then(function () {
      try {
        if (localStorage.getItem(helloKey) !== today()) {
          localStorage.setItem(helloKey, today());
          if (typeof showAkashaToast === 'function') showAkashaToast('✅ Акаша готова к оффлайну', 'Оболочка в кэше. При обрыве связи интерфейс останется на месте.');
        }
      } catch (e) {}
    }).catch(function () {});
  });
})();
// =========================================================
// =========================================================
// 📚 УМНАЯ ЗАГРУЗКА КНИГ/ОБЛОЖЕК: сжатие обложек + терпеливые повторы + тип файла
// (перекрывает старую window.uploadBookFile — старую не удаляем)
// =========================================================
window.__storageRetrySet = window.__storageRetrySet || false;
function tuneStorageRetries() {
  if (window.__storageRetrySet) return;
  try {
    if (typeof firebase !== 'undefined' && firebase.storage) {
      var st = firebase.storage();
      if (st) { st.maxUploadRetryTime = 15 * 60 * 1000; st.maxOperationRetryTime = 5 * 60 * 1000; }
      window.__storageRetrySet = true;
    }
  } catch (e) {}
}

function compressImageForUpload(file) {
  return new Promise(function (resolve) {
    try {
      if (!file || !file.type || file.type.indexOf('image/') !== 0) { resolve(file); return; }
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        try {
          var MAX = 1200;
          var w = img.width, h = img.height;
          if (w > MAX || h > MAX) { if (w > h) { h = Math.round(h * MAX / w); w = MAX; } else { w = Math.round(w * MAX / h); h = MAX; } }
          var canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob(function (blob) {
            URL.revokeObjectURL(url);
            if (!blob || blob.size >= file.size) { resolve(file); return; } // если сжатие не помогло — шлём оригинал
            resolve(new File([blob], (file.name || 'cover.jpg').replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.82);
        } catch (e) { URL.revokeObjectURL(url); resolve(file); }
      };
      img.onerror = function () { try { URL.revokeObjectURL(url); } catch (e) {} resolve(file); };
      img.src = url;
    } catch (e) { resolve(file); }
  });
}

window.uploadBookFile = function (target) {
  tuneStorageRetries();
  var fi = document.createElement('input');
  fi.type = 'file';
  fi.accept = target === 'cover' ? 'image/*' : '.pdf,.epub,.fb2,.txt,.doc,.docx,application/pdf,application/epub+zip,text/plain';
  fi.onchange = async function (e) {
    var file = e.target.files[0];
    if (!file) return;
    if (!storageRef) { addMessage('<p>❌ Хранилище не готово. Подождите 5 секунд и попробуйте снова.</p>'); return; }
    // обложки жмём на устройстве ДО загрузки (8 МБ с камеры -> ~150 КБ)
    if (target === 'cover') {
      try { addMessage('<p>🖼️ Подготовка обложки…</p>'); file = await compressImageForUpload(file); } catch (e) {}
    }
    try {
      var path = (target === 'cover' ? 'library/covers/' : 'library/books/') + Date.now() + '_' + file.name;
      var ref = storageRef.child(path);
      var progressId = 'upload-' + Date.now();
      var sizeKb = Math.round(file.size / 1024);
      var sizeLabel = sizeKb > 1024 ? (sizeKb / 1024).toFixed(1) + ' МБ' : sizeKb + ' КБ';
      addMessage('<div id="' + progressId + '" style="background:rgba(0,0,0,0.4);border-radius:10px;padding:15px;margin:10px 0;border:1px solid var(--border-color);"><p style="color:#64ffda;margin:0 0 10px 0;font-weight:bold;">📥 Загружаю "' + file.name + '" (' + sizeLabel + ')…</p><div style="background:rgba(255,255,255,0.1);border-radius:10px;height:25px;overflow:hidden;position:relative;"><div id="bar-' + progressId + '" style="background:linear-gradient(90deg,#64ffda 0%,#8bc34a 100%);height:100%;width:0%;transition:width 0.5s ease;display:flex;align-items:center;justify-content:center;min-width:30px;"><span id="pct-' + progressId + '" style="color:#0d1f0f;font-weight:bold;font-size:0.85em;">0%</span></div></div><p id="status-' + progressId + '" style="color:#a89b7e;margin:8px 0 0 0;font-size:0.9em;">⏳ Соединение с хранилищем…</p></div>');
      var uploadTask = ref.put(file, { contentType: file.type || 'application/octet-stream' });
      var t15 = setTimeout(function () {
        var s = document.getElementById('status-' + progressId);
        if (s) s.innerHTML = '⏳ Загрузка идёт, канал медленный…<br><small style="color:#6b5f4a;">Для больших книг на мобильном интернете это нормально (минуту-две). <b>Не закрывайте страницу.</b></small>';
      }, 15000);
      var t45 = setTimeout(function () {
        var s = document.getElementById('status-' + progressId);
        if (s) s.innerHTML = '⏳ Канал очень медленный, но загрузка <b>не остановилась</b>.<br><small style="color:#6b5f4a;">Держим соединение, повторяем попытки. Просто подождите — не закрывайте вкладку.</small>';
      }, 45000);
      uploadTask.on('state_changed',
        function (snapshot) {
          var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          var bar = document.getElementById('bar-' + progressId);
          var pct = document.getElementById('pct-' + progressId);
          var status = document.getElementById('status-' + progressId);
          if (bar && pct && status) {
            var rounded = Math.round(progress);
            bar.style.width = rounded + '%'; pct.textContent = rounded + '%';
            if (rounded < 25) status.textContent = '📤 Загрузка… (' + rounded + '%)';
            else if (rounded < 50) status.textContent = '🔄 Продолжается… (' + rounded + '%)';
            else if (rounded < 75) status.textContent = '💪 Больше половины! (' + rounded + '%)';
            else if (rounded < 100) status.textContent = '✨ Почти готово! (' + rounded + '%)';
            else status.textContent = '✅ Завершено!';
          }
        },
        function (error) {
          clearTimeout(t15); clearTimeout(t45);
          console.error('❌ Ошибка загрузки:', error);
          var c = document.getElementById(progressId);
          if (c) c.innerHTML = '<p style="color:#ff6b6b;margin:0;">❌ Ошибка: ' + error.message + '</p><p style="color:#a89b7e;margin:10px 0 0 0;font-size:0.9em;">💡 Канал оборвался. Напишите <em>"файл"</em> ещё раз — повторим. Для больших книг попробуйте Wi‑Fi.</p>';
        },
        async function () {
          clearTimeout(t15); clearTimeout(t45);
          try {
            var downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
            var c = document.getElementById(progressId);
            if (c) c.innerHTML = '<p style="color:#4caf50;margin:0;font-weight:bold;">✅ Загружено!</p><p style="color:#a89b7e;margin:5px 0 0 0;font-size:0.9em;">Файл сохранён в хранилище Firebase.</p>';
            if (target === 'cover') { addLessonState.coverUrl = downloadURL; addMessage('<p>✅ Обложка загружена! Напишите <em>"готово"</em> для продолжения или <em>"отмена"</em>.</p>'); }
            else { addLessonState.fileUrl = downloadURL; addMessage('<p>✅ Файл книги загружен! Напишите <em>"готово"</em> для сохранения книги или <em>"отмена"</em>.</p>'); }
          } catch (err) {
            var c2 = document.getElementById(progressId);
            if (c2) c2.innerHTML = '<p style="color:#ff6b6b;margin:0;">❌ Ошибка: ' + err.message + '</p>';
          }
        }
      );
    } catch (err) {
      console.error('Критическая ошибка:', err);
      addMessage('<p>❌ Ошибка: ' + err.message + '</p>');
    }
  };
  fi.click();
};
// =========================================================
// =========================================================
// ✍️ ФОРМАТИРОВАНИЕ УРОКОВ: кнопки как в Word (теги руками НЕ пишем)
// =========================================================
function formatLessonHTML(text) {
  if (!text) return '';
  var s = String(text);
  s = s.replace(/\[center\]([\s\S]*?)\[\/center\]/gi, function (_, x) { return '<div class="ak-bl" style="text-align:center;margin:14px 0;">' + x + '</div>'; });
  s = s.replace(/\[right\]([\s\S]*?)\[\/right\]/gi, function (_, x) { return '<div class="ak-bl" style="text-align:right;margin:14px 0;">' + x + '</div>'; });
  s = s.replace(/\[left\]([\s\S]*?)\[\/left\]/gi, function (_, x) { return '<div class="ak-bl" style="text-align:left;margin:14px 0;">' + x + '</div>'; });
  s = s.replace(/\[justify\]([\s\S]*?)\[\/justify\]/gi, function (_, x) { return '<div class="ak-bl" style="text-align:justify;margin:14px 0;">' + x + '</div>'; });
  s = s.replace(/\[indent\]([\s\S]*?)\[\/indent\]/gi, function (_, x) { return '<div class="ak-bl" style="text-indent:1.5em;margin:10px 0;">' + x + '</div>'; });
  s = s.replace(/\[noindent\]([\s\S]*?)\[\/noindent\]/gi, function (_, x) { return '<div class="ak-bl" style="text-indent:0;margin:10px 0;">' + x + '</div>'; });
  s = s.replace(/\[h1\]([\s\S]*?)\[\/h1\]/gi, function (_, x) { return '<h2 class="ak-bl" style="color:#64ffda;font-family:\'Playfair Display\',serif;text-align:center;margin:18px 0 10px 0;">' + x + '</h2>'; });
  s = s.replace(/\[h2\]([\s\S]*?)\[\/h2\]/gi, function (_, x) { return '<h3 class="ak-bl" style="color:#8bc34a;font-family:\'Playfair Display\',serif;text-align:center;margin:16px 0 8px 0;">' + x + '</h3>'; });
  s = s.replace(/\[h3\]([\s\S]*?)\[\/h3\]/gi, function (_, x) { return '<h4 class="ak-bl" style="color:#a89b7e;font-family:\'Playfair Display\',serif;margin:14px 0 6px 0;">' + x + '</h4>'; });
  s = s.replace(/\[title\]([\s\S]*?)\[\/title\]/gi, function (_, x) { return '<h3 class="ak-bl" style="color:#64ffda;font-family:\'Playfair Display\',serif;text-align:center;font-size:1.4em;margin:18px 0 12px 0;">' + x + '</h3>'; });
  s = s.replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, function (_, x) { return '<blockquote class="ak-bl" style="border-left:3px solid #64ffda;margin:14px 0;padding:8px 14px;color:#cfe8d4;font-style:italic;background:rgba(100,255,218,0.06);border-radius:0 8px 8px 0;">' + x + '</blockquote>'; });
  s = s.replace(/\*\*\*([\s\S]+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  s = s.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');
  var blocks = s.split(/\n[ \t]*\n/);
  var isBlock = /^\s*<(div|h\d|blockquote|ul|ol|table|pre|hr|p\b|img|video|iframe|figure)/i;
  var out = [];
  for (var i = 0; i < blocks.length; i++) {
    var b = blocks[i].replace(/^\s+|\s+$/g, '');
    if (!b) continue;
    if (isBlock.test(b)) out.push(b.replace(/\n/g, '<br>'));
    else out.push('<p style="text-indent:1.5em;margin:0 0 14px 0;text-align:justify;line-height:1.85;">' + b.replace(/\n/g, '<br>') + '</p>');
  }
  return out.join('');
}

// вставка пары маркеров вокруг выделения ИЛИ в курсор (выделение НЕ слетает на таче)
function akInsertWrap(openTag, closeTag) {
  var ta = document.getElementById('custom-textarea');
  if (!ta) return;
  var sel = window.getSelection();
  if (!sel) return;
  var range = sel.rangeCount ? sel.getRangeAt(0) : null;
  if (!range || !ta.contains(range.commonAncestorContainer)) {
    range = document.createRange(); range.selectNodeContents(ta); range.collapse(false);
    sel.removeAllRanges(); sel.addRange(range);
  }
  try {
    if (range.toString().length > 0) {
      var txt = range.toString(); range.deleteContents();
      var wrapped = document.createTextNode(openTag + txt + closeTag);
      range.insertNode(wrapped);
      var r2 = document.createRange(); r2.setStartAfter(wrapped); r2.collapse(true);
      sel.removeAllRanges(); sel.addRange(r2);
    } else {
      var node = document.createTextNode(openTag + closeTag);
      range.insertNode(node);
      var r3 = document.createRange(); r3.setStart(node, openTag.length); r3.collapse(true);
      sel.removeAllRanges(); sel.addRange(r3);
    }
  } catch (e) { console.warn('wrap err', e); }
  try { ta.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
}

var AK_FMT_BUTTONS = [
  ['Ж', '**', '**'], ['К', '*', '*'],
  ['Ц', '[center]', '[/center]'], ['←', '[left]', '[/left]'],
  ['→', '[right]', '[/right]'], ['↔', '[justify]', '[/justify]'],
  ['H1', '[h1]', '[/h1]'], ['H2', '[h2]', '[/h2]'],
  ['❝', '[quote]', '[/quote]'], ['¶', '[indent]', '[/indent]']
];

function buildFormatPanel() {
  if (document.getElementById('ak-fmt-toggle')) return;
  var toolbar = document.querySelector('.toolbar');
  if (!toolbar) return;
  var panel = document.createElement('div');
  panel.id = 'ak-fmt-panel';
  panel.style.cssText = 'display:none;flex-wrap:wrap;gap:5px;margin-bottom:6px;';
  AK_FMT_BUTTONS.forEach(function (b) {
    var btn = document.createElement('button');
    btn.type = 'button'; btn.textContent = b[0];
    btn.style.cssText = 'min-width:40px;padding:8px 6px;border-radius:8px;border:1px solid rgba(100,255,218,0.4);background:rgba(100,255,218,0.15);color:#64ffda;font-weight:700;cursor:pointer;font-size:0.95em;';
    var handler = function (ev) { ev.preventDefault(); akInsertWrap(b[1], b[2]); };
    btn.addEventListener('touchstart', handler, { passive: false });
    btn.addEventListener('mousedown', handler);
    panel.appendChild(btn);
  });
  var toggle = document.createElement('button');
  toggle.type = 'button'; toggle.id = 'ak-fmt-toggle'; toggle.className = 'toolbar-btn';
  toggle.textContent = '✍️'; toggle.title = 'Форматирование текста';
  toggle.style.cssText = 'background:rgba(139,195,74,0.2);color:#8bc34a;';
  var flip = function (ev) { if (ev) ev.preventDefault(); panel.style.display = (panel.style.display === 'none' ? 'flex' : 'none'); };
  toggle.addEventListener('touchstart', flip, { passive: false });
  toggle.addEventListener('click', flip);
  toolbar.parentNode.insertBefore(panel, toolbar);
  toolbar.insertBefore(toggle, toolbar.firstChild);
}
(function () {
  var tries = 0;
  var t = setInterval(function () {
    tries++;
    if (document.querySelector('.toolbar')) { clearInterval(t); buildFormatPanel(); }
    else if (tries > 50) clearInterval(t);
  }, 200);
})();
// =========================================================
// =========================================================
// ✍️ СТРАХОВКА ПАНЕЛИ ФОРМАТИРОВАНИЯ (безопасна при дубле, ловит тулбар настойчиво)
// =========================================================
var AK_FMT_BUTTONS = [
  ['Ж', '**', '**'], ['К', '*', '*'],
  ['Ц', '[center]', '[/center]'], ['←', '[left]', '[/left]'],
  ['→', '[right]', '[/right]'], ['↔', '[justify]', '[/justify]'],
  ['H1', '[h1]', '[/h1]'], ['H2', '[h2]', '[/h2]'],
  ['❝', '[quote]', '[/quote]'], ['¶', '[indent]', '[/indent]']
];

function buildFormatPanel() {
  if (document.getElementById('ak-fmt-toggle')) return; // защита от дубля кнопки
  var toolbar = document.querySelector('.toolbar');
  if (!toolbar) return;
  var panel = document.createElement('div');
  panel.id = 'ak-fmt-panel';
  panel.style.cssText = 'display:none;flex-wrap:wrap;gap:5px;margin-bottom:6px;';
  AK_FMT_BUTTONS.forEach(function (b) {
    var btn = document.createElement('button');
    btn.type = 'button'; btn.textContent = b[0];
    btn.style.cssText = 'min-width:40px;padding:8px 6px;border-radius:8px;border:1px solid rgba(100,255,218,0.4);background:rgba(100,255,218,0.15);color:#64ffda;font-weight:700;cursor:pointer;font-size:0.95em;';
    var handler = function (ev) { ev.preventDefault(); if (typeof akInsertWrap === 'function') akInsertWrap(b[1], b[2]); };
    btn.addEventListener('touchstart', handler, { passive: false });
    btn.addEventListener('mousedown', handler);
    panel.appendChild(btn);
  });
  var toggle = document.createElement('button');
  toggle.type = 'button'; toggle.id = 'ak-fmt-toggle'; toggle.className = 'toolbar-btn';
  toggle.textContent = '✍️'; toggle.title = 'Форматирование текста';
  toggle.style.cssText = 'background:rgba(139,195,74,0.2);color:#8bc34a;';
  var flip = function (ev) { if (ev) ev.preventDefault(); panel.style.display = (panel.style.display === 'none' ? 'flex' : 'none'); };
  toggle.addEventListener('touchstart', flip, { passive: false });
  toggle.addEventListener('click', flip);
  toolbar.parentNode.insertBefore(panel, toolbar);
  toolbar.insertBefore(toggle, toolbar.firstChild);
}

// настойчивый запуск: ловим тулбар любым путём (защита от дубля внутри buildFormatPanel)
(function () {
  var go = function () { try { buildFormatPanel(); } catch (e) {} };
  go(); // сразу
  document.addEventListener('DOMContentLoaded', go);
  window.addEventListener('load', go);
  var tries = 0;
  var t = setInterval(function () {
    tries++;
    go();
    if (document.getElementById('ak-fmt-toggle') || tries > 100) clearInterval(t);
  }, 300);
})();
// =========================================================
// === ✍️ КНОПКА ФОРМАТИРОВАНИЯ (шаг А — сначала видимая кнопка) ===
function akFmtWrap(o,c){var ta=document.getElementById('custom-textarea');if(!ta)return;var s=window.getSelection();if(!s)return;var r=s.rangeCount?s.getRangeAt(0):null;if(!r||!ta.contains(r.commonAncestorContainer)){r=document.createRange();r.selectNodeContents(ta);r.collapse(false);s.removeAllRanges();s.addRange(r);}try{if(r.toString().length>0){var t=r.toString();r.deleteContents();var w=document.createTextNode(o+t+c);r.insertNode(w);var r2=document.createRange();r2.setStartAfter(w);r2.collapse(true);s.removeAllRanges();s.addRange(r2);}else{var n=document.createTextNode(o+c);r.insertNode(n);var r3=document.createRange();r3.setStart(n,o.length);r3.collapse(true);s.removeAllRanges();s.addRange(r3);}}catch(e){}try{ta.dispatchEvent(new Event('input',{bubbles:true}));}catch(e){}}
var AK_FMT=[['Ж','**','**'],['К','*','*'],['Ц','[center]','[/center]'],['←','[left]','[/left]'],['→','[right]','[/right]'],['↔','[justify]','[/justify]'],['H1','[h1]','[/h1]'],['H2','[h2]','[/h2]'],['❝','[quote]','[/quote]'],['¶','[indent]','[/indent]']];
function buildFmt(){if(document.getElementById('ak-fmt-toggle'))return;var tb=document.querySelector('.toolbar');if(!tb)return;var p=document.createElement('div');p.id='ak-fmt-panel';p.style.cssText='display:none;flex-wrap:wrap;gap:5px;margin-bottom:6px;';AK_FMT.forEach(function(b){var btn=document.createElement('button');btn.type='button';btn.textContent=b[0];btn.style.cssText='min-width:40px;padding:8px 6px;border-radius:8px;border:1px solid rgba(100,255,218,0.4);background:rgba(100,255,218,0.15);color:#64ffda;font-weight:700;cursor:pointer;';var h=function(ev){ev.preventDefault();akFmtWrap(b[1],b[2]);};btn.addEventListener('touchstart',h,{passive:false});btn.addEventListener('mousedown',h);p.appendChild(btn);});var tg=document.createElement('button');tg.type='button';tg.id='ak-fmt-toggle';tg.className='toolbar-btn';tg.textContent='✍️';tg.style.cssText='background:rgba(139,195,74,0.2);color:#8bc34a;';var f=function(ev){if(ev)ev.preventDefault();p.style.display=(p.style.display==='none'?'flex':'none');};tg.addEventListener('touchstart',f,{passive:false});tg.addEventListener('click',f);tb.parentNode.insertBefore(p,tb);tb.insertBefore(tg,tb.firstChild);}
(function(){var g=function(){try{buildFmt();}catch(e){}};g();document.addEventListener('DOMContentLoaded',g);window.addEventListener('load',g);var n=0,t=setInterval(function(){n++;g();if(document.getElementById('ak-fmt-toggle')||n>100)clearInterval(t);},300);})();
// ak-fmt-A-end
// =========================================================
// ✍️ ПРОСТОЙ ПУТЬ: кнопка в HTML -> окно с инструментами
// =========================================================
window.fmtApply = function (open, close) {
  var ta = document.getElementById('custom-textarea');
  var ov = document.getElementById('fmt-overlay'); if (ov) ov.remove();
  if (!ta) return;
  var sel = window.getSelection();
  var range = (sel && sel.rangeCount) ? sel.getRangeAt(0) : null;
  var inside = range && ta.contains(range.commonAncestorContainer);
  try {
    if (inside && range.toString().length > 0) {
      var txt = range.toString(); range.deleteContents();
      var node = document.createTextNode(open + txt + close); range.insertNode(node);
      var r = document.createRange(); r.setStartAfter(node); r.collapse(true); sel.removeAllRanges(); sel.addRange(r);
    } else if (inside) {
      var n2 = document.createTextNode(open + close); range.insertNode(n2);
      var r2 = document.createRange(); r2.setStart(n2, open.length); r2.collapse(true); sel.removeAllRanges(); sel.addRange(r2);
    } else {
      ta.appendChild(document.createTextNode(open + close));
      var last = ta.lastChild; try { var r3 = document.createRange(); r3.setStart(last, open.length); r3.collapse(true); sel.removeAllRanges(); sel.addRange(r3); } catch (e) {}
    }
  } catch (e) { try { ta.appendChild(document.createTextNode(open + close)); } catch (e2) {} }
  try { ta.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
};

window.openFmtModal = function () {
  var old = document.getElementById('fmt-overlay'); if (old) old.remove();
  var tools = [['Жирный','**','**'],['Курсив','*','*'],['По центру','[center]','[/center]'],['Слева','[left]','[/left]'],['Справа','[right]','[/right]'],['По ширине','[justify]','[/justify]'],['Заголовок 1','[h1]','[/h1]'],['Заголовок 2','[h2]','[/h2]'],['Цитата','[quote]','[/quote]'],['Красная строка','[indent]','[/indent]']];
  var ov = document.createElement('div'); ov.id = 'fmt-overlay';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:999998;display:flex;align-items:center;justify-content:center;padding:15px;';
  var box = document.createElement('div');
  box.style.cssText = 'background:rgba(13,31,15,0.98);border:1px solid #64ffda;border-radius:14px;padding:18px;max-width:420px;width:100%;box-shadow:0 8px 30px rgba(0,0,0,0.6);';
  var h = document.createElement('div'); h.textContent = '✍️ Форматирование'; h.style.cssText = "color:#64ffda;font-family:'Playfair Display',serif;font-size:1.3em;text-align:center;margin-bottom:6px;";
  var hint = document.createElement('div'); hint.innerHTML = 'Выдели текст пальцем — тапни инструмент (обернёт выделение).<br>Не выделял — тапни инструмент, потом печатай <b>между</b> скобок.'; hint.style.cssText = 'color:#a89b7e;font-size:0.85em;text-align:center;margin-bottom:12px;line-height:1.4;';
  var grid = document.createElement('div'); grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;';
  tools.forEach(function (t) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = t[0];
    b.style.cssText = 'padding:12px 8px;border-radius:9px;border:1px solid rgba(100,255,218,0.4);background:rgba(100,255,218,0.15);color:#64ffda;font-weight:700;font-size:0.95em;cursor:pointer;';
    var fire = function (ev) { if (ev) { ev.preventDefault(); ev.stopPropagation(); } window.fmtApply(t[1], t[2]); };
    b.addEventListener('touchstart', fire, { passive: false });
    b.addEventListener('click', function (ev) { ev.preventDefault(); window.fmtApply(t[1], t[2]); });
    grid.appendChild(b);
  });
  var close = document.createElement('button'); close.type = 'button'; close.textContent = '✖ Закрыть';
  close.style.cssText = 'width:100%;margin-top:12px;padding:12px;border-radius:9px;border:1px solid rgba(255,80,80,0.4);background:rgba(255,80,80,0.2);color:#ff6b6b;font-weight:700;cursor:pointer;';
  var closeFire = function (ev) { if (ev) ev.preventDefault(); ov.remove(); };
  close.addEventListener('touchstart', closeFire, { passive: false });
  close.addEventListener('click', function (ev) { ev.preventDefault(); ov.remove(); });
  box.appendChild(h); box.appendChild(hint); box.appendChild(grid); box.appendChild(close); ov.appendChild(box);
  ov.addEventListener('touchstart', function (ev) { if (ev.target === ov) { ev.preventDefault(); ov.remove(); } }, { passive: false });
  ov.addEventListener('click', function (ev) { if (ev.target === ov) ov.remove(); });
  document.body.appendChild(ov);
};
// fmt-simple-end
// =========================================================
// ⏱️ ФИКС ВРЕМЕНИ «был в сети»: минуты → часы → дни (перекрывает старую функцию)
// =========================================================
function formatOnlineStatus(userName) {
  var status = onlineStatuses[userName];
  if (!status || !status.lastSeen) return '<span style="color:#6b5f4a;font-size:0.85em;">⚫ Не в сети</span>';
  var lastSeenDate = status.lastSeen.toDate();
  var now = new Date();
  var diffMins = Math.floor((now - lastSeenDate) / 60000);
  if (diffMins < 2) return '<span style="color:#4caf50;font-size:0.85em;">🟢 Онлайн</span>';
  if (diffMins < 60) return '<span style="color:#ff9800;font-size:0.85em;">⚪ Был в сети ' + diffMins + ' мин. назад</span>';
  var diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) { var m = diffMins % 60; return '<span style="color:#ff9800;font-size:0.85em;">⚪ Был в сети ' + diffHours + ' ч.' + (m ? ' ' + m + ' мин.' : '') + ' назад</span>'; }
  var diffDays = Math.floor(diffHours / 24); var h = diffHours % 24;
  return '<span style="color:#ff9800;font-size:0.85em;">⚪ Был в сети ' + diffDays + ' дн.' + (h ? ' ' + h + ' ч.' : '') + ' назад</span>';
}
// fmt-online-fix-end
// === 🔄 АВТО-ОБНОВЛЕНИЕ ЭКРАНА ПОСЛЕ УДАЛЕНИЯ УРОКА ===
const _prevFindAnswerDelete = window.findAnswer;
window.findAnswer = async function (question) {
  var q = (question || '').toLowerCase().trim();
  if (addLessonState && addLessonState.step === 'confirm_delete') {
    var lid = addLessonState.lessonId;
    var lesson = lessonsById[lid];
    var secId = lesson ? (lesson.sectionId || '') : '';
    var chId = lesson ? (lesson.chapterId || '') : '';
    addLessonState = null;
    if (q === 'да, удалить' || q === 'да' || q === 'удалить') {
      var ok = await deleteLesson(lid);
      if (ok) {
        addMessage('<p>✅ Урок удалён!</p>');
        try { await loadLessonsFromFirebase(); } catch (e) {}
        try {
          if (chId && secId) window.showChapterLessons(chId, secId);
          else if (secId) window.showSectionLessons(secId);
          else showMainMenu();
        } catch (e) {}
      } else { addMessage('<p>❌ Ошибка удаления.</p>'); }
    } else { addMessage('<p>❌ Отменено.</p>'); }
    return '';
  }
  return _prevFindAnswerDelete.call(this, question);
};
// akasha-live-del-end
// =========================================================
// 🧭 НАВИГАЦИЯ «НАЗАД» ВНУТРИ УРОКА (ступеньки: глава → раздел → год → оглавление)
// Дописка в конец. Середину файла НЕ трогаем (там зона будущей чистки).
// После отрисовки урока добавляет кнопки возврата по иерархии ПЕРЕД кнопкой «в меню».
// =========================================================
(function () {
  var _origShowLesson = window.showLessonContent;
  if (typeof _origShowLesson !== 'function') return;
  window.showLessonContent = async function (lessonId) {
    var r;
    try { r = await _origShowLesson.apply(this, arguments); } catch (e) { r = undefined; }
    setTimeout(function () { try { akInjectLessonNav(lessonId); } catch (e) {} }, 150);
    return r;
  };
  window.showLessonContentWithReadButton = window.showLessonContent;
  var _origMark = window.markLessonRead;
  if (typeof _origMark === 'function') {
    window.markLessonRead = async function (lessonId) {
      var r = await _origMark.apply(this, arguments);
      setTimeout(function () { try { akInjectLessonNav(lessonId); } catch (e) {} }, 150);
      return r;
    };
  }
})();

function akInjectLessonNav(lessonId) {
  var lesson = (typeof lessonsById !== 'undefined') ? lessonsById[lessonId] : null;
  if (!lesson) return;
  var container = document.getElementById('chat-container');
  if (!container) return;
  var btns = container.querySelectorAll('button');
  var menuBtn = null;
  for (var i = btns.length - 1; i >= 0; i--) {
    if ((btns[i].textContent || '').indexOf('Вернуться в меню') !== -1) { menuBtn = btns[i]; break; }
  }
  if (!menuBtn || menuBtn.getAttribute('data-ak-nav')) return;
  menuBtn.setAttribute('data-ak-nav', '1');
  var sec = null;
  if (lesson.sectionId && typeof sectionsList !== 'undefined') {
    sec = sectionsList.find(function (s) { return s.id === lesson.sectionId; });
  }
  var nav = '';
  if (lesson.chapterId && lesson.sectionId) {
    nav += '<button class="hw-btn" onclick="window.showChapterLessons(\'' + lesson.chapterId + '\',\'' + lesson.sectionId + '\')" style="width:100%;margin-top:10px;padding:12px;background:rgba(139,195,74,0.25);color:#8bc34a;">↩️ Назад в главу</button>';
  }
  if (lesson.sectionId) {
    nav += '<button class="hw-btn" onclick="window.showSectionLessons(\'' + lesson.sectionId + '\')" style="width:100%;margin-top:10px;padding:12px;background:rgba(139,195,74,0.2);color:#8bc34a;">↩️ Назад в раздел</button>';
  }
  if (sec && sec.year) {
    nav += '<button class="hw-btn" onclick="window.showYearSections(' + sec.year + ')" style="width:100%;margin-top:10px;padding:12px;background:rgba(100,255,218,0.15);color:#64ffda;">📅 Назад к ' + sec.year + ' году</button>';
  }
  nav += '<button class="hw-btn" onclick="showTOC()" style="width:100%;margin-top:10px;padding:12px;background:rgba(100,255,218,0.15);color:#64ffda;">📚 В оглавление</button>';
  menuBtn.insertAdjacentHTML('beforebegin', nav);
}
// lesson-nav-end
// === 🔍 ДИАГНОСТИКА УРОКОВ: напиши в чат слово diag — покажет ВСЕ уроки ПРЯМО с сервера ===
(function () {
  var _prevFA = window.findAnswer;
  if (typeof _prevFA !== 'function') return;
  window.findAnswer = async function (question) {
    var q = (question || '').toLowerCase().trim();
    if (q === 'diag' || q.indexOf('diag ') === 0 || q.indexOf('diag') === 0) {
      try { await loadLessonsFromFirebase(); } catch (e) {}
      var all = Object.values(lessonsById || {});
      var secById = {}; (sectionsList || []).forEach(function (s) { secById[s.id] = s; });
      var rows = '';
      if (all.length === 0) { rows = '<p style="color:#6b5f4a;text-align:center;">В базе 0 уроков.</p>'; }
      else {
        all.forEach(function (l, i) {
          var sec = l.sectionId ? secById[l.sectionId] : null;
          var secLabel = sec ? (sec.name + '  ·  ранг раздела «' + sec.rank + '»  ·  ' + sec.year + ' год') : '⚠️ НЕТ раздела (урок старого формата)';
          rows += '<div style="background:rgba(0,0,0,0.25);border-radius:8px;padding:10px;margin:6px 0;border-left:3px solid #64ffda;">'
            + '<div style="color:#64ffda;font-weight:700;">#' + (i + 1) + '. ' + (l.title || '(без названия)') + '</div>'
            + '<div style="color:#a89b7e;font-size:0.85em;">category (ранг урока): <b style="color:#8bc34a;">' + (l.category || '—') + '</b></div>'
            + '<div style="color:#a89b7e;font-size:0.85em;">раздел: <b style="color:#8bc34a;">' + secLabel + '</b></div>'
            + '<div style="color:#a89b7e;font-size:0.85em;">глава: <b style="color:#8bc34a;">' + (l.chapterId || '—') + '</b> &nbsp;|&nbsp; id: ' + l.id + '</div>'
            + '</div>';
        });
      }
      addRawHTML('<div style="background:rgba(13,31,15,0.6);border:1px solid #64ffda;border-radius:12px;padding:15px;margin:15px 0;"><h3 style="color:#64ffda;text-align:center;font-family:\'Playfair Display\',serif;">🔍 Уроки в базе Firebase (' + all.length + ')</h3><p style="color:#a89b7e;font-size:0.85em;text-align:center;">Читаем ПРЯМО с сервера (не из памяти). Ищи «лишнего» — смотри его ранг и раздел.</p>' + rows + '</div>');
      return '';
    }
    return _prevFA.apply(this, arguments);
  };
})();
// diag-lessons-end
// =========================================================
// 🔍 DIAG v2: карточки уроков + кнопки «Удалить» и «В раздел» прямо из диагностики
// (закрывает дыру: уроки-призраки без раздела теперь можно удалить/привязать без консоли)
// =========================================================
function akDiagSafe(t) { return String(t == null ? '' : t).replace(/</g, '&lt;'); }

async function akDiagRender() {
  try { await loadLessonsFromFirebase(); } catch (e) {}
  var all = Object.values(lessonsById || {});
  var secById = {}; (sectionsList || []).forEach(function (s) { secById[s.id] = s; });
  var rows = '';
  if (all.length === 0) {
    rows = '<p style="color:#6b5f4a;text-align:center;">В базе 0 уроков.</p>';
  } else {
    all.forEach(function (l, i) {
      var sec = l.sectionId ? secById[l.sectionId] : null;
      var visible = !!sec;
      var secLabel = sec ? (akDiagSafe(sec.name) + ' · ранг «' + akDiagSafe(sec.rank) + '» · ' + akDiagSafe(sec.year) + ' год') : '⚠️ НЕТ раздела (урок старого формата — НЕ виден ученикам в оглавлении!)';
      var warn = visible ? '' : '<div style="color:#ff9800;font-size:0.85em;margin:4px 0;">👻 Этот урок — призрак: лежит в базе, но в новом оглавлении его никто не видит.</div>';
      rows += '<div style="background:rgba(0,0,0,0.25);border-radius:8px;padding:10px;margin:8px 0;border-left:3px solid ' + (visible ? '#64ffda' : '#ff9800') + ';">'
        + '<div style="color:#64ffda;font-weight:700;">#' + (i + 1) + '. ' + akDiagSafe(l.title || '(без названия)') + '</div>'
        + '<div style="color:#a89b7e;font-size:0.85em;">category (ранг урока): <b style="color:#8bc34a;">' + akDiagSafe(l.category || '—') + '</b></div>'
        + '<div style="color:#a89b7e;font-size:0.85em;">раздел: <b style="color:#8bc34a;">' + secLabel + '</b></div>'
        + '<div style="color:#a89b7e;font-size:0.85em;">глава: <b style="color:#8bc34a;">' + akDiagSafe(l.chapterId || '—') + '</b> &nbsp;|&nbsp; id: ' + akDiagSafe(l.id) + '</div>'
        + warn
        + '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">'
        + '<button class="hw-btn" onclick="window.akDiagAttach(\'' + l.id + '\')" style="flex:1;min-width:130px;margin:0;padding:8px;background:rgba(139,195,74,0.25);color:#8bc34a;font-size:0.9em;">📦 В раздел</button>'
        + '<button class="hw-btn" onclick="window.akDiagDelete(\'' + l.id + '\',\'' + akDiagSafe(l.title || '').replace(/'/g, '') + '\')" style="flex:1;min-width:130px;margin:0;padding:8px;background:rgba(255,80,80,0.2);color:#ff6b6b;font-size:0.9em;">🗑️ Удалить</button>'
        + '</div></div>';
    });
  }
  var box = '<div id="ak-diag-box" style="background:rgba(13,31,15,0.6);border:1px solid #64ffda;border-radius:12px;padding:15px;margin:15px 0;"><h3 style="color:#64ffda;text-align:center;font-family:\'Playfair Display\',serif;">🔍 Уроки в базе Firebase (' + all.length + ')</h3><p style="color:#a89b7e;font-size:0.85em;text-align:center;">Читаем ПРЯМО с сервера. У каждого урока кнопки: <b>📦 В раздел</b> (привязать) или <b>🗑️ Удалить</b>.</p>' + rows + '</div>';
  var old = document.getElementById('ak-diag-box');
  if (old) { var par = old.parentNode; if (par) par.innerHTML = box; }
  else { addRawHTML(box); }
}

window.akDiagDelete = async function (id, title) {
  var ok = await askConfirm('⚠️ Удалить урок?', 'Урок «' + (title || '') + '» будет удалён ИЗ БАЗЫ навсегда. Это действие нельзя отменить.');
  if (!ok) return;
  var done = await deleteLesson(id);
  if (done) { try { showAlert('Успех', 'Урок удалён из базы.'); } catch (e) {} }
  else { try { showAlert('Ошибка', 'Не удалось удалить.'); } catch (e) {} }
  akDiagRender();
};

window.akDiagAttach = function (id) {
  var secs = sectionsList || [];
  if (secs.length === 0) { try { showAlert('Нет разделов', 'Сначала создайте раздел в оглавлении.'); } catch (e) {} return; }
  var btns = secs.map(function (s) {
    return { text: '📖 ' + s.name + ' (' + s.year + ', ' + s.rank + ')', class: 'hw-btn', style: 'background:rgba(139,195,74,0.2);color:#8bc34a;width:100%;margin:4px 0;', action: function () { window.akDiagDoAttach(id, s.id); } };
  });
  btns.push({ text: 'Отмена', class: 'hw-btn', action: function () {} });
  showCustomModal('📦 Привязать урок к разделу', '<p>Выберите раздел. Урок попадёт туда в «Уроки без главы» — потом кнопкой 📦 в оглавлении закинете его в нужную главу.</p>', btns);
};

window.akDiagDoAttach = async function (id, secId) {
  var done = await updateLessonInFirebase(id, { sectionId: secId, chapterId: '' });
  if (done) { try { showAlert('Успех', 'Урок привязан к разделу! Теперь он виден в оглавлении (в «Уроках без главы» этого раздела).'); } catch (e) {} }
  else { try { showAlert('Ошибка', 'Не удалось привязать.'); } catch (e) {} }
  try { await loadLessonsFromFirebase(); } catch (e) {}
  akDiagRender();
};

// перехват слова diag — рисуем новую диагностику с кнопками (цепочку обёрток не ломаем)
var _prevDiagFA2 = window.findAnswer;
window.findAnswer = async function (question) {
  if ((question || '').trim().toLowerCase() === 'diag') { await akDiagRender(); return ''; }
  return _prevDiagFA2.apply(this, arguments);
};
// diag-v2-end
// =========================================================
// 🔗 КЛИКАБИЛЬНЫЕ ССЫЛКИ + ССЫЛКА-КАК-ФОТО/ВИДЕО в чатах и ответах Акаши
// Наблюдатель ловит пузыри во всех чатах и превращает голые ссылки:
//   .jpg/.png/.webp/.gif -> картинка,  .mp4/.webm/.ogg -> плеер,  остальное -> кликабельная ссылка.
// Оригинальные функции чата НЕ трогаем. Печать в поле не тормозит (поле вне наблюдаемых контейнеров).
// =========================================================
(function () {
  var URL_RE = /(https?:\/\/[^\s<>"']+)/g;
  function nodeForUrl(u) {
    var clean = u.split('?')[0].split('#')[0].toLowerCase();
    if (/\.(jpg|jpeg|png|webp|gif)$/.test(clean)) {
      var im = document.createElement('img');
      im.src = u;
      im.style.cssText = 'max-width:100%;border-radius:8px;cursor:pointer;display:block;margin:4px 0;';
      im.onclick = function () { try { window.open(u, '_blank'); } catch (e) {} };
      return im;
    }
    if (/\.(mp4|webm|ogg)$/.test(clean)) {
      var v = document.createElement('video');
      v.src = u; v.controls = true;
      v.style.cssText = 'max-width:100%;border-radius:8px;display:block;margin:4px 0;';
      return v;
    }
    var a = document.createElement('a');
    a.href = u; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.style.cssText = 'color:#64ffda;text-decoration:underline;word-break:break-all;';
    a.textContent = u;
    return a;
  }
  function linkifyText(node) {
    var val = node.nodeValue;
    if (!val || val.indexOf('http') === -1) return;
    URL_RE.lastIndex = 0;
    var m, idx = 0, frag = document.createDocumentFragment(), found = false;
    while ((m = URL_RE.exec(val)) !== null) {
      found = true;
      if (m.index > idx) frag.appendChild(document.createTextNode(val.slice(idx, m.index)));
      frag.appendChild(nodeForUrl(m[0]));
      idx = m.index + m[0].length;
    }
    if (!found) return;
    if (idx < val.length) frag.appendChild(document.createTextNode(val.slice(idx)));
    node.parentNode.replaceChild(frag, node);
  }
  function linkifyContainer(el) {
    if (!el) return;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        while (p && p !== el) {
          var t = p.nodeName;
          if (t === 'A' || t === 'IMG' || t === 'VIDEO' || t === 'SCRIPT' || t === 'STYLE') return NodeFilter.FILTER_REJECT;
          p = p.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], cur;
    while ((cur = walker.nextNode())) nodes.push(cur);
    nodes.forEach(linkifyText);
  }
  var ids = ['chat-container', 'master-chat-container', 'archivist-chat-container'];
  var targets = [], pending = false;
  function run() { pending = false; targets.forEach(linkifyContainer); }
  var obs = new MutationObserver(function () { if (!pending) { pending = true; requestAnimationFrame(run); } });
  function grab() {
    ids.forEach(function (id) {
      var e = document.getElementById(id);
      if (e && targets.indexOf(e) === -1) { targets.push(e); obs.observe(e, { childList: true, subtree: true }); }
    });
  }
  function start() { grab(); targets.forEach(linkifyContainer); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  setInterval(grab, 1500);
})();
// ak-linkify-end
// =========================================================
// 🔢 НУМЕРАЦИЯ УРОКОВ в оглавлении (поэкранно: внутри главы / в «уроках без главы»)
// Обёртки над showSectionLessons и showChapterLessons — оригиналы НЕ трогаем.
// После отрисовки ставит «№1, №2…» перед каждой карточкой урока (.toc-lesson-link).
// Главы и кнопки НЕ нумеруются (у них нет класса toc-lesson-link).
// =========================================================
(function () {
  function akNumberLessons() {
    var c = document.getElementById('chat-container');
    if (!c) return;
    var cards = c.querySelectorAll('.toc-lesson-link');
    for (var i = 0; i < cards.length; i++) {
      var el = cards[i];
      if (el.getAttribute('data-ak-num')) continue;
      el.setAttribute('data-ak-num', '1');
      var badge = document.createElement('span');
      badge.style.cssText = 'display:inline-block;min-width:2.4em;color:#64ffda;font-weight:700;margin-right:4px;';
      badge.textContent = '№' + (i + 1) + ' ';
      el.insertBefore(badge, el.firstChild);
    }
  }
  function wrapNum(fnName) {
    var orig = window[fnName];
    if (typeof orig !== 'function') return;
    window[fnName] = async function () {
      var r;
      try { r = await orig.apply(this, arguments); } catch (e) { r = undefined; }
      try { akNumberLessons(); } catch (e) {}
      return r;
    };
  }
  wrapNum('showSectionLessons');
  wrapNum('showChapterLessons');
})();
// ak-lesson-num-end
// =========================================================
// ✏️ РЕДАКТИРОВАНИЕ КНИГИ (5 шагов) — только для архивариуса/админа
// Обёртки над showBookDetails (кнопка) и findAnswer (шаги edit_book_*).
// Оригинал НЕ трогаем. Права: isArchivist() || isAdmin().
// =========================================================
(function () {
  function akEscEdit(t) { return String(t == null ? '' : t).replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function akCanEditBook() { try { return (typeof isArchivist === 'function' && isArchivist()) || (typeof isAdmin === 'function' && isAdmin()); } catch (e) { return false; } }
  async function akUpdateBook(id, updates) {
    if (!windowDb || !id) return false;
    try { await windowDb.collection('library_books').doc(id).update(updates); return true; }
    catch (e) { console.error('edit book err', e); return false; }
  }

  window.startEditBook = function (id) {
    if (!akCanEditBook()) { try { showAlert('Доступ запрещён', 'Редактировать книги могут только Архивариус и Магистры.'); } catch (e) {} return; }
    var b = (typeof libraryBooks !== 'undefined' ? libraryBooks : []).find(function (x) { return x.id === id; });
    if (!b) { try { showAlert('Ошибка', 'Книга не найдена.'); } catch (e) {} return; }
    addLessonState = {
      step: 'edit_book_cover', bookId: id,
      orig: { coverUrl: b.coverUrl || '', title: b.title || '', author: b.author || '', description: b.description || '', fileUrl: b.fileUrl || '' }
    };
    addMessage('<p>✏️ <strong>Редактирование книги «' + akEscEdit(b.title) + '»</strong></p>'
      + '<p><strong>Шаг 1/5 — Обложка.</strong> Текущая: <em>' + (b.coverUrl ? akEscEdit(b.coverUrl) : 'нет') + '</em></p>'
      + '<p>Вставьте новую прямую ссылку на картинку, ИЛИ <em>"пропустить"</em>, ИЛИ <em>"нет"</em> (убрать обложку), ИЛИ <em>"отмена"</em>:</p>');
  };

  // ---- кнопка «Редактировать» поверх карточки книги ----
  var _origShowBookDetails = window.showBookDetails;
  if (typeof _origShowBookDetails === 'function') {
    window.showBookDetails = function (id) {
      var r;
      try { r = _origShowBookDetails.apply(this, arguments); } catch (e) { r = undefined; }
      setTimeout(function () {
        try {
          if (!akCanEditBook()) return;
          var c = document.getElementById('chat-container');
          if (!c) return;
          var btns = c.querySelectorAll('button');
          var backBtn = null;
          for (var i = btns.length - 1; i >= 0; i--) {
            if ((btns[i].textContent || '').indexOf('Назад к отделу') !== -1) { backBtn = btns[i]; break; }
          }
          if (!backBtn || backBtn.getAttribute('data-ak-editbook')) return;
          backBtn.setAttribute('data-ak-editbook', '1');
          backBtn.insertAdjacentHTML('beforebegin',
            '<button class="hw-btn" onclick="window.startEditBook(\'' + id + '\')" style="width:100%;margin-top:10px;padding:12px;background:rgba(100,255,218,0.2);color:#64ffda;">✏️ Редактировать книгу</button>');
        } catch (e) {}
      }, 120);
      return r;
    };
  }

  // ---- шаги редактирования поверх цепочки findAnswer ----
  var _prevFindAnswerEditBook = window.findAnswer;
  window.findAnswer = async function (question) {
    var st = addLessonState;
    if (st && st.step && st.step.indexOf('edit_book_') === 0) {
      var q = (question || '').trim();
      var ql = q.toLowerCase();
      var id = st.bookId, o = st.orig;
      if (ql === 'отмена') { addLessonState = null; addMessage('<p>❌ Редактирование отменено.</p>'); try { window.showBookDetails(id); } catch (e) {} return ''; }

      if (st.step === 'edit_book_cover') {
        st.newCover = (ql === 'пропустить') ? o.coverUrl : (ql === 'нет' ? '' : question);
        st.step = 'edit_book_title';
        return '<p><strong>Шаг 2/5 — Название.</strong> Текущее: <em>' + akEscEdit(o.title) + '</em></p><p>Новое название, ИЛИ <em>"пропустить"</em>, ИЛИ <em>"отмена"</em>:</p>';
      }
      if (st.step === 'edit_book_title') {
        st.newTitle = (ql === 'пропустить') ? o.title : question;
        st.step = 'edit_book_author';
        return '<p><strong>Шаг 3/5 — Автор.</strong> Текущий: <em>' + akEscEdit(o.author) + '</em></p><p>Новый автор, ИЛИ <em>"пропустить"</em>, ИЛИ <em>"отмена"</em>:</p>';
      }
      if (st.step === 'edit_book_author') {
        st.newAuthor = (ql === 'пропустить') ? o.author : question;
        st.step = 'edit_book_desc';
        return '<p><strong>Шаг 4/5 — Аннотация.</strong> Текущая: <em>' + (o.description ? akEscEdit(o.description.substring(0, 80)) + (o.description.length > 80 ? '…' : '') : 'нет') + '</em></p><p>Новая аннотация, ИЛИ <em>"пропустить"</em>, ИЛИ <em>"нет"</em> (убрать), ИЛИ <em>"отмена"</em>:</p>';
      }
      if (st.step === 'edit_book_desc') {
        st.newDesc = (ql === 'пропустить') ? o.description : (ql === 'нет' ? '' : question);
        st.step = 'edit_book_file';
        return '<p><strong>Шаг 5/5 — Файл книги.</strong> Текущий: <em>' + (o.fileUrl ? akEscEdit(o.fileUrl) : 'нет') + '</em></p><p>Новая прямая ссылка, ИЛИ <em>"пропустить"</em>, ИЛИ <em>"нет"</em> (убрать файл), ИЛИ <em>"отмена"</em>:</p>';
      }
      if (st.step === 'edit_book_file') {
        var newFile = (ql === 'пропустить') ? o.fileUrl : (ql === 'нет' ? '' : question);
        var updates = { coverUrl: st.newCover, title: st.newTitle, author: st.newAuthor, description: st.newDesc, fileUrl: newFile };
        addLessonState = null;
        var ok = await akUpdateBook(id, updates);
        if (ok) {
          addMessage('<p>✅ Книга обновлена!</p>');
          try { await loadLibraryFromFirebase(); } catch (e) {}
          try { window.showBookDetails(id); } catch (e) {}
        } else {
          addMessage('<p>❌ Не удалось сохранить изменения.</p>');
        }
        return '';
      }
    }
    return _prevFindAnswerEditBook.apply(this, arguments);
  };
})();
// ak-edit-book-end
// =========================================================
// ✏️ РЕДАКТИРОВАНИЕ СВОИХ СООБЩЕНИЙ в чатах (Мастер / ученик / Архивариус)
// Наблюдатель инжектит ✏️ в .chat-bubble.mine (читает id из data-msg-id).
// Тап -> prompt с текущим текстом -> update в Firestore -> правка прямо в пузыре + «· изм.».
// Чужие и медиа-пузыри НЕ трогаем. Оригинал рендеров НЕ меняем.
// =========================================================
(function () {
  function akEditInject(bubble) {
    if (bubble.getAttribute('data-ak-editbtn')) return;
    if (!bubble.classList.contains('mine')) return;
    var id = bubble.getAttribute('data-msg-id');
    if (!id) return;
    if (bubble.querySelector('img,video,audio')) return;
    var bt = bubble.querySelector('.bubble-text');
    var cur = bt ? (bt.textContent || '') : '';
    if (!cur.trim()) return;
    bubble.setAttribute('data-ak-editbtn', '1');
    var btn = document.createElement('button');
    btn.textContent = '✏️';
    btn.setAttribute('data-ak-editbtn', '1');
    btn.style.cssText = 'display:block;margin-left:auto;margin-top:4px;background:rgba(100,255,218,0.15);color:#64ffda;border:none;border-radius:6px;padding:2px 8px;font-size:0.8em;cursor:pointer;';
    btn.onclick = function (ev) {
      ev.stopPropagation();
      var nv = window.prompt('✏️ Редактировать сообщение:', cur);
      if (nv === null) return;
      nv = nv.trim();
      if (!nv || nv === cur) return;
      if (!windowDb) { try { showAlert('Ошибка', 'Хранилище не готово.'); } catch (e) {} return; }
      windowDb.collection('messages').doc(id).update({ text: nv, edited: true }).then(function () {
        if (bt) bt.textContent = nv;
        cur = nv;
        var tm = bubble.querySelector('.bubble-time');
        if (tm && (tm.textContent || '').indexOf('изм.') === -1) tm.textContent = (tm.textContent || '') + ' · изм.';
      }).catch(function (e) { console.error('edit msg err', e); try { showAlert('Ошибка', 'Не удалось сохранить: ' + e.message); } catch (er) {} });
    };
    bubble.appendChild(btn);
  }
  function akEditScan(root) {
    if (!root) return;
    var bs = root.querySelectorAll('.chat-bubble.mine');
    for (var i = 0; i < bs.length; i++) akEditInject(bs[i]);
  }
  var ids = ['chat-container', 'master-chat-container', 'archivist-chat-container'];
  var pending = false;
  function run() { pending = false; ids.forEach(function (id) { akEditScan(document.getElementById(id)); }); }
  var obs = new MutationObserver(function () { if (!pending) { pending = true; requestAnimationFrame(run); } });
  function grab() { ids.forEach(function (id) { var e = document.getElementById(id); if (e && !e.getAttribute('data-ak-editobs')) { e.setAttribute('data-ak-editobs', '1'); obs.observe(e, { childList: true, subtree: true }); } }); }
  function start() { grab(); run(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  setInterval(grab, 1500);
})();
// ak-edit-msg-end
// =========================================================
// 📚 СТРОГИЙ ПОРЯДОК КНИГ: поле order + сортировка + стрелки ⬆️️
// =========================================================
function akBookCmp(a, b) {
  var oa = (typeof a.order === 'number') ? a.order : 1e9;
  var ob = (typeof b.order === 'number') ? b.order : 1e9;
  if (oa !== ob) return oa - ob;
  return String(a.id || '').localeCompare(String(b.id || ''));
}
async function akEnsureBookOrder(arr) {
  if (!arr || !arr.length) return;
  arr.sort(akBookCmp);
  var needFix = arr.some(function (b) { return typeof b.order !== 'number'; });
  if (needFix && windowDb) {
    var ps = [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].order !== i) { arr[i].order = i; ps.push(windowDb.collection('library_books').doc(arr[i].id).update({ order: i }).catch(function () {})); }
    }
    if (ps.length) { try { await Promise.all(ps); } catch (e) {} }
  }
}
window.moveBook = async function (id, dir) {
  var b = (libraryBooks || []).find(function (x) { return x.id === id; });
  if (!b) return;
  var arr = (libraryBooks || []).filter(function (x) { return x.departmentId === b.departmentId; });
  arr.sort(akBookCmp);
  var idx = -1;
  for (var k = 0; k < arr.length; k++) { if (arr[k].id === id) { idx = k; break; } }
  var j = idx + dir;
  if (idx < 0 || j < 0 || j >= arr.length) return;
  var tmp = arr[idx].order; arr[idx].order = arr[j].order; arr[j].order = tmp;
  if (windowDb) {
    try { await windowDb.collection('library_books').doc(arr[idx].id).update({ order: arr[idx].order }); } catch (e) {}
    try { await windowDb.collection('library_books').doc(arr[j].id).update({ order: arr[j].order }); } catch (e) {}
  }
  try { await window.showLibraryDepartment(b.departmentId); } catch (e) {}
};
// ak-book-order-end
// =========================================================
// ⬆️⬇️ СТРЕЛКИ ПОРЯДКА КНИГ — наблюдатель в хвосте (середину НЕ трогаем)
// Ловит кнопку корзины deleteBook у каждой книги, достаёт id из её onclick
// и ставит ⬆️⬇️ ПЕРЕД ней. Стиль — класс .ak-move-btn из style.css.
// moveBook и сортировка уже живут в хвосте (ak-book-order-end) — не дублируем.
// =========================================================
(function () {
  function akInjectMove(btn) {
    var par = btn.parentNode;
    if (!par || par.getAttribute('data-ak-move')) return;
    var oc = btn.getAttribute('onclick') || '';
    var m = oc.match(/deleteBook\('([^']+)'/);
    if (!m) return;
    var id = m[1];
    par.setAttribute('data-ak-move', '1');
    btn.insertAdjacentHTML('beforebegin',
      '<button class="ak-move-btn" onclick="event.stopPropagation();window.moveBook(\'' + id + '\',-1)">⬆️</button>' +
      '<button class="ak-move-btn" onclick="event.stopPropagation();window.moveBook(\'' + id + '\',1)">⬇️</button>');
  }
  function akScan(root) {
    if (!root) return;
    var bs = root.querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) {
      var oc = bs[i].getAttribute('onclick') || '';
      if (oc.indexOf('deleteBook(') !== -1 && oc.indexOf('deleteDepartment(') === -1) akInjectMove(bs[i]);
    }
  }
  var pending = false;
  function run() { pending = false; akScan(document.getElementById('chat-container')); }
  var obs = new MutationObserver(function () { if (!pending) { pending = true; requestAnimationFrame(run); } });
  function grab() {
    var c = document.getElementById('chat-container');
    if (c && !c.getAttribute('data-ak-moveobs')) { c.setAttribute('data-ak-moveobs', '1'); obs.observe(c, { childList: true, subtree: true }); }
  }
  function start() { grab(); run(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  setInterval(grab, 1500);
})();
// ak-book-arrows-end
// =========================================================
// 🔢️⬇️ СТРОГИЙ ПОРЯДОК УРОКОВ (в главах и «без главы») — наблюдатель в хвосте
// akEnsureLessonOrder — сортирует массив по order + миграция старых уроков.
// moveLesson — меняет урок местами с соседом (через updateLessonInFirebase).
// Наблюдатель ставит ⬆️️ у .toc-lesson-link ТОЛЬКО когда в строке есть
//   кнопка showChapterPicker (признак мастера) — ученику стрелок нет.
// Стиль — уже живой класс .ak-move-btn (от книг), css НЕ трогаем.
// =========================================================
function akLessonCmp(a, b) {
  var oa = (typeof a.order === 'number') ? a.order : 1e9;
  var ob = (typeof b.order === 'number') ? b.order : 1e9;
  if (oa !== ob) return oa - ob;
  return String(a.id || '').localeCompare(String(b.id || ''));
}
async function akEnsureLessonOrder(arr) {
  if (!arr || !arr.length) return;
  arr.sort(akLessonCmp);
  var needFix = arr.some(function (l) { return typeof l.order !== 'number'; });
  if (needFix && typeof updateLessonInFirebase === 'function') {
    var ps = [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].order !== i) { arr[i].order = i; ps.push(updateLessonInFirebase(arr[i].id, { order: i }).catch(function () {})); }
    }
    if (ps.length) { try { await Promise.all(ps); } catch (e) {} }
  }
}
window.moveLesson = async function (id, dir) {
  var l = (typeof lessonsById !== 'undefined' ? lessonsById : {})[id];
  if (!l) return;
  var arr;
  if (l.chapterId) {
    arr = Object.values(lessonsById).filter(function (x) { return x.chapterId === l.chapterId; });
  } else {
    arr = Object.values(lessonsById).filter(function (x) { return x.sectionId === l.sectionId && !x.chapterId; });
  }
  arr.sort(akLessonCmp);
  var idx = -1;
  for (var k = 0; k < arr.length; k++) { if (arr[k].id === id) { idx = k; break; } }
  var j = idx + dir;
  if (idx < 0 || j < 0 || j >= arr.length) return;
  var tmp = arr[idx].order; arr[idx].order = arr[j].order; arr[j].order = tmp;
  if (typeof updateLessonInFirebase === 'function') {
    try { await updateLessonInFirebase(arr[idx].id, { order: arr[idx].order }); } catch (e) {}
    try { await updateLessonInFirebase(arr[j].id, { order: arr[j].order }); } catch (e) {}
  }
  var secId = l.sectionId;
  if (!secId && l.chapterId) {
    var ch = (typeof chaptersList !== 'undefined' ? chaptersList : []).find(function (c) { return c.id === l.chapterId; });
    if (ch) secId = ch.sectionId;
  }
  try {
    if (l.chapterId) await window.showChapterLessons(l.chapterId, secId);
    else if (secId) await window.showSectionLessons(secId);
  } catch (e) {}
};
(function () {
  function akInjectLessonMove(link) {
    var wrap = link.parentNode;
    if (!wrap || wrap.getAttribute('data-ak-lmove')) return;
    var btns = wrap.querySelectorAll('button');
    var picker = null;
    for (var i = 0; i < btns.length; i++) {
      if ((btns[i].getAttribute('onclick') || '').indexOf('showChapterPicker') !== -1) { picker = btns[i]; break; }
    }
    if (!picker) return;
    var oc = link.getAttribute('onclick') || '';
    var m = oc.match(/showLessonContent\('([^']+)'\)/);
    if (!m) return;
    var id = m[1];
    wrap.setAttribute('data-ak-lmove', '1');
    picker.insertAdjacentHTML('beforebegin',
      '<button class="ak-move-btn" onclick="event.stopPropagation();window.moveLesson(\'' + id + '\',-1)">⬆️</button>' +
      '<button class="ak-move-btn" onclick="event.stopPropagation();window.moveLesson(\'' + id + '\',1)">⬇️</button>');
  }
  function akScan(root) {
    if (!root) return;
    var ls = root.querySelectorAll('.toc-lesson-link');
    for (var i = 0; i < ls.length; i++) akInjectLessonMove(ls[i]);
  }
  var pending = false;
  function run() { pending = false; akScan(document.getElementById('chat-container')); }
  var obs = new MutationObserver(function () { if (!pending) { pending = true; requestAnimationFrame(run); } });
  function grab() {
    var c = document.getElementById('chat-container');
    if (c && !c.getAttribute('data-ak-lobserver')) { c.setAttribute('data-ak-lobserver', '1'); obs.observe(c, { childList: true, subtree: true }); }
  }
  function start() { grab(); run(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  setInterval(grab, 1500);
})();
// ak-lesson-order-end
// =========================================================
// ✍️ ПОЛНОЭКРАННЫЙ WYSIWYG-РЕДАКТОР ТЕКСТА УРОКА (как в Ворде)
// openLessonFormatter(id) — текст на весь экран + кнопки форматирования
//   через execCommand (Ж/К/Ц/заголовки/цитата) + Сохранить в базу как HTML.
// Наблюдатель ставит кнопку ✍️ у .toc-lesson-link в оглавлении (мастер/архивариус/админ).
// Старые уроки с маркерами [center] при открытии конвертируются в HTML для editing;
//   сохраняем как HTML — при чтении они рисуются напрямую (совместимость сохранена).
// =========================================================
window.openLessonFormatter = function (lessonId) {
  var lesson = (typeof lessonsById !== 'undefined' ? lessonsById : {})[lessonId];
  if (!lesson) { try { showAlert('Ошибка', 'Урок не найден.'); } catch (e) {} return; }
  var old = document.getElementById('ak-fmt-editor'); if (old) old.remove();
  var raw = lesson.content || '';
  var initialHtml = raw;
  if (typeof formatLessonHTML === 'function' && /\[(center|left|right|justify|indent|noindent|h1|h2|h3|title|quote)\]/i.test(raw)) {
    try { initialHtml = formatLessonHTML(raw); } catch (e) {}
  }
  var ov = document.createElement('div'); ov.id = 'ak-fmt-editor';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(10,20,12,0.98);z-index:999999;display:flex;flex-direction:column;padding:10px;';
  var top = document.createElement('div');
  top.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap;';
  var title = document.createElement('div');
  title.textContent = '✍️ ' + (lesson.title || 'Форматирование');
  title.style.cssText = "color:#64ffda;font-family:'Playfair Display',serif;font-size:1.05em;flex:1;min-width:140px;";
  top.appendChild(title);
  var tools = [
    ['Ж', 'bold', null], ['К', 'italic', null],
    ['Ц', 'justifyCenter', null], ['⬅', 'justifyLeft', null], ['➡', 'justifyRight', null], ['↔', 'justifyFull', null],
    ['H1', 'formatBlock', '<h2>'], ['H2', 'formatBlock', '<h3>'], ['❝', 'formatBlock', '<blockquote>'], ['¶', 'indent', null]
  ];
  var ed = document.createElement('div');
  ed.contentEditable = 'true';
  ed.style.cssText = 'flex:1;overflow-y:auto;background:rgba(13,31,15,0.6);border:1px solid #64ffda;border-radius:10px;padding:14px;color:#e8f5e9;font-size:1.15em;line-height:1.7;outline:none;';
  ed.innerHTML = initialHtml;
  tools.forEach(function (t) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = t[0];
    b.style.cssText = 'min-width:38px;padding:8px 6px;border-radius:8px;border:1px solid rgba(100,255,218,0.4);background:rgba(100,255,218,0.15);color:#64ffda;font-weight:700;cursor:pointer;';
    var fire = function (ev) { if (ev) { ev.preventDefault(); ev.stopPropagation(); } ed.focus(); try { document.execCommand(t[1], false, t[2]); } catch (e) {} };
    b.addEventListener('touchstart', fire, { passive: false });
    b.addEventListener('click', function (ev) { ev.preventDefault(); ed.focus(); try { document.execCommand(t[1], false, t[2]); } catch (e) {} });
    top.appendChild(b);
  });
  ov.appendChild(top);
  ov.appendChild(ed);
  var bot = document.createElement('div');
  bot.style.cssText = 'display:flex;gap:8px;margin-top:8px;';
  var save = document.createElement('button'); save.type = 'button'; save.textContent = '💾 Сохранить';
  save.style.cssText = 'flex:1;padding:12px;border-radius:9px;border:1px solid rgba(100,255,218,0.5);background:rgba(100,255,218,0.2);color:#64ffda;font-weight:700;cursor:pointer;';
  var cancel = document.createElement('button'); cancel.type = 'button'; cancel.textContent = '✖ Отмена';
  cancel.style.cssText = 'flex:1;padding:12px;border-radius:9px;border:1px solid rgba(255,80,80,0.4);background:rgba(255,80,80,0.2);color:#ff6b6b;font-weight:700;cursor:pointer;';
  var doSave = async function (ev) {
    if (ev) ev.preventDefault();
    var html = ed.innerHTML;
    try {
      if (typeof updateLessonInFirebase === 'function') await updateLessonInFirebase(lessonId, { content: html });
      else throw new Error('updateLessonInFirebase недоступна');
      ov.remove();
      try { addMessage('<p>✅ Текст урока отформатирован и сохранён!</p>'); } catch (e) {}
      try { if (typeof loadLessonsFromFirebase === 'function') await loadLessonsFromFirebase(); } catch (e) {}
    } catch (e) {
      try { showAlert('Ошибка', 'Не удалось сохранить: ' + e.message); } catch (er) {}
    }
  };
  var doCancel = function (ev) { if (ev) ev.preventDefault(); ov.remove(); };
  save.addEventListener('touchstart', doSave, { passive: false });
  save.addEventListener('click', doSave);
  cancel.addEventListener('touchstart', doCancel, { passive: false });
  cancel.addEventListener('click', doCancel);
  bot.appendChild(save); bot.appendChild(cancel);
  ov.appendChild(bot);
  document.body.appendChild(ov);
};
(function () {
  function akCanFmt() {
    try {
      return (typeof isMaster === 'function' && isMaster()) ||
             (typeof isArchivist === 'function' && isArchivist()) ||
             (typeof isAdmin === 'function' && isAdmin());
    } catch (e) { return false; }
  }
  function akInjectFmtBtn(link) {
    var wrap = link.parentNode;
    if (!wrap || wrap.getAttribute('data-ak-fmtbtn')) return;
    var oc = link.getAttribute('onclick') || '';
    var m = oc.match(/showLessonContent\('([^']+)'\)/);
    if (!m) return;
    var id = m[1];
    wrap.setAttribute('data-ak-fmtbtn', '1');
    var btn = document.createElement('button');
    btn.textContent = '✍️';
    btn.title = 'Форматировать текст урока';
    btn.style.cssText = 'background:rgba(139,195,74,0.2);color:#8bc34a;border:1px solid rgba(139,195,74,0.5);border-radius:6px;padding:4px 8px;cursor:pointer;';
    btn.onclick = function (ev) { ev.stopPropagation(); window.openLessonFormatter(id); };
    wrap.appendChild(btn);
  }
  function akScanFmt(root) {
    if (!root || !akCanFmt()) return;
    var ls = root.querySelectorAll('.toc-lesson-link');
    for (var i = 0; i < ls.length; i++) akInjectFmtBtn(ls[i]);
  }
  var pending = false;
  function run() { pending = false; akScanFmt(document.getElementById('chat-container')); }
  var obs = new MutationObserver(function () { if (!pending) { pending = true; requestAnimationFrame(run); } });
  function grab() {
    var c = document.getElementById('chat-container');
    if (c && !c.getAttribute('data-ak-fmtobs')) { c.setAttribute('data-ak-fmtobs', '1'); obs.observe(c, { childList: true, subtree: true }); }
  }
  function start() { grab(); run(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  setInterval(grab, 1500);
})();
// ak-lesson-fmt-end
// =========================================================
// ❝ ФИКС ЦИТАТЫ в редакторе: рисуем [quote]-стиль прямо в WYSIWYG
// Перехватывает ТОЛЬКО execCommand('formatBlock','<blockquote>') и только
// когда выделение внутри #ak-fmt-editor — оборачивает в стилизованный blockquote
// (зелёная полоска + курсив + фон, как маркер [quote] при чтении).
// Ж/К/Ц/H1/H2 идут нативно без изменений.
// =========================================================
(function () {
  var _origExec = document.execCommand ? document.execCommand.bind(document) : null;
  if (!_origExec) return;
  var QUOTE_STYLE = 'border-left:3px solid #64ffda;margin:14px 0;padding:8px 14px;color:#cfe8d4;font-style:italic;background:rgba(100,255,218,0.06);border-radius:0 8px 8px 0;';
  document.execCommand = function (cmd, ui, val) {
    try {
      if (String(cmd || '').toLowerCase() === 'formatblock' && /blockquote/i.test(String(val || ''))) {
        var ed = document.getElementById('ak-fmt-editor');
        var sel = window.getSelection();
        if (ed && sel && sel.rangeCount) {
          var range = sel.getRangeAt(0);
          var anc = range.commonAncestorContainer;
          if (ed === anc || ed.contains(anc)) {
            var bq = document.createElement('blockquote');
            bq.style.cssText = QUOTE_STYLE;
            if (!range.collapsed) {
              try { range.surroundContents(bq); }
              catch (e) { var f = range.extractContents(); bq.appendChild(f); range.insertNode(bq); }
            } else {
              bq.appendChild(document.createElement('br'));
              range.insertNode(bq);
            }
            try { var r2 = document.createRange(); r2.selectNodeContents(bq); r2.collapse(false); sel.removeAllRanges(); sel.addRange(r2); } catch (e) {}
            return true;
          }
        }
      }
    } catch (e) {}
    return _origExec(cmd, ui, val);
  };
})();
// ak-quote-fix-end
// =========================================================
// 📝 ЧЕРНОВИКИ УРОКОВ: новый урок = черновик, ученики не видят,
//   мастер видит пометку + 🌐 Опубликовать. Середину НЕ трогаем.
// 1) Обёртка addLessonToFirebase дописывает published:false при создании
//    (временно подменяет collection, объект .add дополняется, поля не дублируем).
// 2) Обёртки showSectionLessons/showChapterLessons: не-редакторам черновики
//    удаляются из списка + перенумерация видимых; редакторам — пометка + 🌐.
// Старые уроки без поля published НЕ считаются черновиками (видны всем как раньше).
// =========================================================
(function () {
  function akIsEditor() {
    try { return (typeof isMaster === 'function' && isMaster()) || (typeof isArchivist === 'function' && isArchivist()) || (typeof isAdmin === 'function' && isAdmin()); } catch (e) { return false; }
  }
  var _origAddLesson = window.addLessonToFirebase;
  if (typeof _origAddLesson === 'function') {
    window.addLessonToFirebase = async function () {
      if (!windowDb) return _origAddLesson.apply(this, arguments);
      var realColl = windowDb.collection.bind(windowDb);
      windowDb.collection = function (name) {
        var c = realColl(name);
        try {
          if (name === 'lessons' && c && typeof c.add === 'function' && !c._akDraftPatched) {
            var realAdd = c.add.bind(c);
            c.add = function (obj) { try { if (obj && typeof obj === 'object' && obj.published === undefined) obj.published = false; } catch (e) {} return realAdd(obj); };
            c._akDraftPatched = true;
          }
        } catch (e) {}
        return c;
      };
      try { return await _origAddLesson.apply(this, arguments); }
      finally { try { windowDb.collection = realColl; } catch (e) {} }
    };
  }
  window.publishLesson = async function (id) {
    var l = (typeof lessonsById !== 'undefined' ? lessonsById : {})[id];
    if (!l) return;
    try {
      if (typeof updateLessonInFirebase === 'function') await updateLessonInFirebase(id, { published: true });
      l.published = true;
      try { addMessage('<p>✅ Урок опубликован и теперь виден ученикам!</p>'); } catch (e) {}
      var secId = l.sectionId;
      if (!secId && l.chapterId) { var ch = (typeof chaptersList !== 'undefined' ? chaptersList : []).find(function (c) { return c.id === l.chapterId; }); if (ch) secId = ch.sectionId; }
      try { if (l.chapterId) await window.showChapterLessons(l.chapterId, secId); else if (secId) await window.showSectionLessons(secId); } catch (e) {}
    } catch (e) { try { showAlert('Ошибка', 'Не удалось опубликовать: ' + e.message); } catch (er) {} }
  };
  function akDraftPass() {
    var c = document.getElementById('chat-container');
    if (!c) return;
    var editor = akIsEditor();
    var links = c.querySelectorAll('.toc-lesson-link');
    var visible = [];
    for (var i = 0; i < links.length; i++) {
      var lk = links[i];
      var oc = lk.getAttribute('onclick') || '';
      var m = oc.match(/showLessonContent\('([^']+)'\)/);
      var id = m ? m[1] : null;
      var l = id ? ((typeof lessonsById !== 'undefined' ? lessonsById : {})[id]) : null;
      var isDraft = !!(l && l.published === false);
      var wrap = lk.parentNode;
      if (!editor && isDraft) { if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap); continue; }
      if (editor && isDraft && wrap && !wrap.getAttribute('data-ak-draftmark')) {
        wrap.setAttribute('data-ak-draftmark', '1');
        var badge = document.createElement('span');
        badge.textContent = '📝 черновик';
        badge.style.cssText = 'color:#ffb74d;font-size:0.8em;font-weight:700;margin-left:8px;';
        lk.appendChild(badge);
        var pb = document.createElement('button');
        pb.textContent = '🌐'; pb.title = 'Опубликовать урок';
        pb.style.cssText = 'background:rgba(100,255,218,0.2);color:#64ffda;border:1px solid rgba(100,255,218,0.5);border-radius:6px;padding:4px 8px;margin-left:4px;cursor:pointer;';
        pb.onclick = (function (iid) { return function (ev) { ev.stopPropagation(); window.publishLesson(iid); }; })(id);
        wrap.appendChild(pb);
      }
      visible.push(lk);
    }
    if (!editor) {
      for (var k = 0; k < visible.length; k++) {
        var b = visible[k].firstElementChild;
        if (b && /^№/.test(b.textContent || '')) b.textContent = '№' + (k + 1) + ' ';
      }
    }
  }
  function wrapDraft(fnName) {
    var orig = window[fnName];
    if (typeof orig !== 'function') return;
    window[fnName] = async function () {
      var r;
      try { r = await orig.apply(this, arguments); } catch (e) { r = undefined; }
      try { akDraftPass(); } catch (e) {}
      return r;
    };
  }
  wrapDraft('showSectionLessons');
  wrapDraft('showChapterLessons');
})();
// ak-lesson-draft-end
// =========================================================
// 📏 СНЯТИЕ ВЫДЕЛЕНИЯ после H1/H2/H3 в редакторе (цепочкой поверх ak-quote-fix)
// Для formatBlock h2/h3/h4 после применения ставит курсор в конец заголовка
// без выделения — удобно продолжать. Ж/К/Ц/цитата проходят без изменений.
// =========================================================
(function () {
  var prev = document.execCommand;
  if (typeof prev !== 'function') return;
  document.execCommand = function (cmd, ui, val) {
    var r = prev(cmd, ui, val);
    try {
      if (String(cmd || '').toLowerCase() === 'formatblock' && /h[2-4]/i.test(String(val || ''))) {
        var ed = document.getElementById('ak-fmt-editor');
        var sel = window.getSelection();
        if (ed && sel && sel.rangeCount) {
          var n = sel.getRangeAt(0).startContainer;
          if (n && n.nodeType === 3) n = n.parentNode;
          while (n && n !== ed && !/^H[2-4]$/i.test(n.nodeName || '')) n = n.parentNode;
          if (n && n !== ed) {
            var rr = document.createRange(); rr.selectNodeContents(n); rr.collapse(false);
            sel.removeAllRanges(); sel.addRange(rr);
          }
        }
      }
    } catch (e) {}
    return r;
  };
})();
// ak-head-collapse-end
// =========================================================
// 🎯 СОХРАНЕНИЕ ВЫДЕЛЕНИЯ В РЕДАКТОРЕ на таче (корень проблем H1/H2/Ж/К)
// На мобильном тап по кнопке + ed.focus() сбрасывают выделение в contenteditable,
// поэтому formatBlock/жирный били «не туда» (H1 выглядел как H2, цвета не вставали).
// Запоминаем выделение внутри #ak-fmt-editor на selectionchange и восстанавливаем
// его в обёртке execCommand ПЕРЕД командой. Большой блок и css НЕ трогаем.
// =========================================================
(function () {
  window._akEdRange = null;
  document.addEventListener('selectionchange', function () {
    try {
      var ed = document.getElementById('ak-fmt-editor');
      if (!ed) { window._akEdRange = null; return; }
      var sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      var r = sel.getRangeAt(0);
      if (ed === r.commonAncestorContainer || ed.contains(r.commonAncestorContainer)) {
        window._akEdRange = r.cloneRange();
      }
    } catch (e) {}
  });
  var prev = document.execCommand;
  if (typeof prev !== 'function') return;
  document.execCommand = function (cmd, ui, val) {
    try {
      var ed = document.getElementById('ak-fmt-editor');
      if (ed && window._akEdRange) {
        var sel = window.getSelection();
        var cur = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
        var curInEd = cur && (ed === cur.commonAncestorContainer || ed.contains(cur.commonAncestorContainer));
        var collapsed = cur && cur.collapsed;
        if (!curInEd || (collapsed && !window._akEdRange.collapsed)) {
          try { sel.removeAllRanges(); sel.addRange(window._akEdRange.cloneRange()); } catch (e) {}
        }
      }
    } catch (e) {}
    return prev(cmd, ui, val);
  };
})();
// ak-ed-sel-end
// =========================================================
// 🛠 ПЕРЕВЕС КНОПОК РЕДАКТОРА НА РУЧНЫЕ ОПЕРАЦИИ (обход execCommand на таче)
// execCommand('formatBlock') НЕ создаёт теги на этом устройстве — поэтому H1/H2
//   молчали. Делаем всё руками по сохранённому курсору/выделению (_akEdRange):
//   Ж/К = обёртка strong/em, выравнивание = textAlign блока, H1/H2 = замена блока
//   строки на h2/h3 (выделять НЕ надо — достаточно курсора в строке).
// Кнопки клонируются (cloneNode снимает старые слушатели), вешаем свои.
// ❝ / Сохранить / Отмена НЕ трогаем. Большой блок и css НЕ трогаем.
// =========================================================
(function () {
  function edEl() { return document.getElementById('ak-fmt-editor'); }
  function savedRange(ed) {
    var r = window._akEdRange;
    if (r && ed && (ed === r.commonAncestorContainer || ed.contains(r.commonAncestorContainer))) return r.cloneRange();
    try { var s = window.getSelection(); if (s && s.rangeCount) { var x = s.getRangeAt(0); if (ed === x.commonAncestorContainer || ed.contains(x.commonAncestorContainer)) return x.cloneRange(); } } catch (e) {}
    return null;
  }
  function restore(ed, r) { try { var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {} }
  function blockOf(ed, r) {
    var n = r.startContainer; if (n && n.nodeType === 3) n = n.parentNode;
    while (n && n !== ed && n.parentNode !== ed) n = n.parentNode;
    return (n && n !== ed) ? n : null;
  }
  function wrapInline(tag) {
    var ed = edEl(); if (!ed) return; var r = savedRange(ed); if (!r || r.collapsed) return;
    restore(ed, r); var el = document.createElement(tag);
    try { r.surroundContents(el); } catch (e) { try { var f = r.extractContents(); el.appendChild(f); r.insertNode(el); } catch (e2) {} }
  }
  function setAlign(a) {
    var ed = edEl(); if (!ed) return; var r = savedRange(ed); if (!r) return; var b = blockOf(ed, r); if (!b) return;
    b.style.textAlign = a;
  }
  function makeBlock(tag) {
    var ed = edEl(); if (!ed) return; var r = savedRange(ed); if (!r) return; var b = blockOf(ed, r);
    if (!b) { try { restore(ed, r); document.execCommand('formatBlock', false, tag); } catch (e) {} return; }
    if ((b.nodeName || '').toLowerCase() === tag) return;
    var nb = document.createElement(tag);
    while (b.firstChild) nb.appendChild(b.firstChild);
    b.parentNode.replaceChild(nb, b);
    try { var s = window.getSelection(); var rr = document.createRange(); rr.selectNodeContents(nb); rr.collapse(false); s.removeAllRanges(); s.addRange(rr); window._akEdRange = rr.cloneRange(); } catch (e) {}
  }
  var MAP = { 'Ж': function () { wrapInline('strong'); }, 'К': function () { wrapInline('em'); },
    'Ц': function () { setAlign('center'); }, '⬅': function () { setAlign('left'); }, '➡': function () { setAlign('right'); }, '↔': function () { setAlign('justify'); },
    'H1': function () { makeBlock('h2'); }, 'H2': function () { makeBlock('h3'); } };
  function rewire(ov) {
    if (ov.getAttribute('data-ak-rewired')) return; ov.setAttribute('data-ak-rewired', '1');
    var btns = ov.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      var t = (btns[i].textContent || '').trim(); var fn = MAP[t]; if (!fn) continue;
      var clone = btns[i].cloneNode(true);
      var fire = (function (f) { return function (ev) { if (ev) { ev.preventDefault(); ev.stopPropagation(); } try { f(); } catch (e) {} }; })(fn);
      clone.addEventListener('touchstart', fire, { passive: false });
      clone.addEventListener('click', fire);
      btns[i].parentNode.replaceChild(clone, btns[i]);
    }
  }
  function grab() { var ed = edEl(); if (ed) rewire(ed); }
  var obs = new MutationObserver(grab);
  function start() { obs.observe(document.body, { childList: true, subtree: true }); grab(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  setInterval(grab, 800);
})();
// ak-headfix2-end
// =========================================================
// 🛠 ФИНАЛЬНЫЙ ПЕРЕВЕС КНОПОК РЕДАКТОРА — всё ПО ВЫДЕЛЕНИЮ (как цитата ❝)
// Затрает вредный ak-headfix2 (clone снимает его слушатели). Раздувания быть
//   не может: оборачивается ТОЛЬКО выделение через surroundContents.
// Ж/К = strong/em, выравнивание = textAlign блока курсора (размер не трогает),
//   H1/H2 = обернуть выделение в h2/h3. Выделять текст ЗАГОЛОВКА пальцем.
// ❝ / Сохранить / Отмена НЕ трогаем. Большой блок и css НЕ трогаем.
// =========================================================
(function () {
  function edEl() { return document.getElementById('ak-fmt-editor'); }
  function savedRange(ed) {
    var r = window._akEdRange;
    if (r && ed && (ed === r.commonAncestorContainer || ed.contains(r.commonAncestorContainer))) return r.cloneRange();
    try { var s = window.getSelection(); if (s && s.rangeCount) { var x = s.getRangeAt(0); if (ed === x.commonAncestorContainer || ed.contains(x.commonAncestorContainer)) return x.cloneRange(); } } catch (e) {}
    return null;
  }
  function wrapSel(tag) {
    var ed = edEl(); if (!ed) return; var r = savedRange(ed); if (!r || r.collapsed) return;
    try { var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {}
    var el = document.createElement(tag);
    try { r.surroundContents(el); }
    catch (e) { try { var f = r.extractContents(); el.appendChild(f); r.insertNode(el); } catch (e2) {} }
  }
  function blockOf(ed, r) {
    var n = r.startContainer; if (n && n.nodeType === 3) n = n.parentNode;
    while (n && n !== ed && n.parentNode !== ed) n = n.parentNode;
    return (n && n !== ed) ? n : null;
  }
  function setAlign(a) {
    var ed = edEl(); if (!ed) return; var r = savedRange(ed); if (!r) return; var b = blockOf(ed, r); if (b) b.style.textAlign = a;
  }
  var MAP = { 'Ж': function () { wrapSel('strong'); }, 'К': function () { wrapSel('em'); },
    'Ц': function () { setAlign('center'); }, '⬅': function () { setAlign('left'); }, '➡': function () { setAlign('right'); }, '↔': function () { setAlign('justify'); },
    'H1': function () { wrapSel('h2'); }, 'H2': function () { wrapSel('h3'); } };
  function rewire3(ov) {
    if (ov.getAttribute('data-ak-rewired3')) return; ov.setAttribute('data-ak-rewired3', '1');
    var btns = ov.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      var t = (btns[i].textContent || '').trim(); var fn = MAP[t]; if (!fn) continue;
      var clone = btns[i].cloneNode(true);
      var fire = (function (f) { return function (ev) { if (ev) { ev.preventDefault(); ev.stopPropagation(); } try { f(); } catch (e) {} }; })(fn);
      clone.addEventListener('touchstart', fire, { passive: false });
      clone.addEventListener('click', fire);
      btns[i].parentNode.replaceChild(clone, btns[i]);
    }
  }
  function grab3() { var ed = edEl(); if (ed) rewire3(ed); }
  var obs3 = new MutationObserver(grab3);
  function start3() { obs3.observe(document.body, { childList: true, subtree: true }); grab3(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start3); else start3();
  setInterval(grab3, 800);
})();
// ak-headfix3-end
// =========================================================
// 🛠 ФИНАЛ ЗАГОЛОВКОВ: ПЕРЕКЛЮЧАТЕЛЬ без вложенности (затрает fix2/fix3)
// Корень раздувания был: каждое нажатие вкладывало h2 в h2, а css em умножал
//   размер экспоненциально. Теперь makeHeading = toggle: если выделение/курсор
//   УЖЕ в заголовке того же уровня -> распаковать в обычный текст; другого
//   уровня -> сменить тег БЕЗ вложения; нет заголовка -> обернуть выделение.
//   Вложенность невозможна -> раздувания нет. Ж/К по выделению, выравнивание
//   по строке курсора. ❝/Сохранить/Отмена НЕ трогаем. Большой блок/css НЕ трогаем.
// =========================================================
(function () {
  function edEl() { return document.getElementById('ak-fmt-editor'); }
  function savedRange(ed) {
    var r = window._akEdRange;
    if (r && ed && (ed === r.commonAncestorContainer || ed.contains(r.commonAncestorContainer))) return r.cloneRange();
    try { var s = window.getSelection(); if (s && s.rangeCount) { var x = s.getRangeAt(0); if (ed === x.commonAncestorContainer || ed.contains(x.commonAncestorContainer)) return x.cloneRange(); } } catch (e) {}
    return null;
  }
  function findHeading(ed, node) {
    var n = node; if (n && n.nodeType === 3) n = n.parentNode;
    while (n && n !== ed) { if (/^H[2-4]$/i.test(n.nodeName || '')) return n; n = n.parentNode; }
    return null;
  }
  function wrapSel(tag) {
    var ed = edEl(); if (!ed) return; var r = savedRange(ed); if (!r || r.collapsed) return;
    try { var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {}
    var el = document.createElement(tag);
    try { r.surroundContents(el); } catch (e) { try { var f = r.extractContents(); el.appendChild(f); r.insertNode(el); } catch (e2) {} }
  }
  function blockOf(ed, r) {
    var n = r.startContainer; if (n && n.nodeType === 3) n = n.parentNode;
    while (n && n !== ed && n.parentNode !== ed) n = n.parentNode;
    return (n && n !== ed) ? n : null;
  }
  function setAlign(a) {
    var ed = edEl(); if (!ed) return; var r = savedRange(ed); if (!r) return; var b = blockOf(ed, r); if (b) b.style.textAlign = a;
  }
  function makeHeading(tag) {
    var ed = edEl(); if (!ed) return; var r = savedRange(ed); if (!r) return;
    try { var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {}
    var heading = findHeading(ed, r.startContainer) || findHeading(ed, r.endContainer);
    if (heading) {
      if ((heading.nodeName || '').toLowerCase() === tag) {
        var parent = heading.parentNode;
        while (heading.firstChild) parent.insertBefore(heading.firstChild, heading);
        parent.removeChild(heading);
      } else {
        var nb = document.createElement(tag);
        while (heading.firstChild) nb.appendChild(heading.firstChild);
        heading.parentNode.replaceChild(nb, heading);
      }
      return;
    }
    if (r.collapsed) return;
    var el = document.createElement(tag);
    try { r.surroundContents(el); } catch (e) { try { var f = r.extractContents(); el.appendChild(f); r.insertNode(el); } catch (e2) {} }
  }
  var MAP = { 'Ж': function () { wrapSel('strong'); }, 'К': function () { wrapSel('em'); },
    'Ц': function () { setAlign('center'); }, '⬅': function () { setAlign('left'); }, '➡': function () { setAlign('right'); }, '↔': function () { setAlign('justify'); },
    'H1': function () { makeHeading('h2'); }, 'H2': function () { makeHeading('h3'); } };
  function rewire4(ov) {
    if (ov.getAttribute('data-ak-rewired4')) return; ov.setAttribute('data-ak-rewired4', '1');
    var btns = ov.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      var t = (btns[i].textContent || '').trim(); var fn = MAP[t]; if (!fn) continue;
      var clone = btns[i].cloneNode(true);
      var fire = (function (f) { return function (ev) { if (ev) { ev.preventDefault(); ev.stopPropagation(); } try { f(); } catch (e) {} }; })(fn);
      clone.addEventListener('touchstart', fire, { passive: false });
      clone.addEventListener('click', fire);
      btns[i].parentNode.replaceChild(clone, btns[i]);
    }
  }
  function grab4() { var ed = edEl(); if (ed) rewire4(ed); }
  var obs4 = new MutationObserver(grab4);
  function start4() { obs4.observe(document.body, { childList: true, subtree: true }); grab4(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start4); else start4();
  setInterval(grab4, 800);
})();
// ak-headfix4-end

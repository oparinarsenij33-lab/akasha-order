// ===== SUPABASE CONFIG =====
const SUPABASE_URL = 'https://wvxzkahufgdwzjixzjqy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_tDBDz8GGl-37MDRYqP2zZw_5663uLyC';

// Инициализация Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let knowledgeBase = {};
let lessonsById = {};
let assignmentsList = [];
let submissionsList = [];
window.currentChatPartner = null;

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
    
    if (month >= 3 && month <= 5) {
        season = 'spring'; seasonName = 'Весна'; emoji = '🌸';
    } else if (month >= 6 && month <= 8) {
        season = 'summer'; seasonName = 'Лето'; emoji = '☀️';
    } else if (month >= 9 && month <= 11) {
        season = 'autumn'; seasonName = 'Осень'; emoji = '🍂';
    } else {
        season = 'winter'; seasonName = 'Зима'; emoji = '❄️';
    }
    
    document.body.className = `season-${season}`;
    const indicator = document.getElementById('season-indicator');
    if (indicator) indicator.textContent = `${emoji} ${seasonName}`;
}

// ===== ПРИВЕТСТВИЕ ДЛЯ СТРАННИКА =====
function getStrangerGreeting() {
    return `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">
        <h3 style="color:#64ffda; margin-bottom:15px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">🌟 Приветствую тебя, Странник</h3>
        <p style="color:var(--text-color); line-height:1.8; margin-bottom:15px;">
            Я — <strong>Акаша</strong>, Хранительница Знаний Ордена Вольных Джедаев. 
            В моих архивах хранится мудрость веков, тайны магии и знания, 
            что передавались через Великих Мастеров и Магистров всех времён и эпох.
        </p>
        <p style="color:var(--text-color); line-height:1.8; margin-bottom:15px;">
            Орден Вольных Джедаев — это братство тех, кто посвятил себя изучению 
            высших искусств, защите, сохранению целостности и единства Света. 
            Здесь ты найдёшь уроки, задания и возможность общаться с Наставниками.
        </p>
        <h4 style="color:#8bc34a; margin:20px 0 10px 0; font-family:'Playfair Display',serif;">📜 Как получить доступ:</h4>
        <p style="color:var(--text-color); line-height:1.8; margin-bottom:15px;">
            Чтобы войти в систему, назови мне своё <strong>Имя</strong>, <strong>Ранг</strong>, 
            имя своего <strong>Учителя</strong> и <strong>Пароль</strong>.<br><br>
            <em>Пример:</em> "Меня зовут Оби-Ван Кеноби, я Магистр, мой Учитель — 
            Квай-Гон Джинн, пароль O2V7K9"
        </p>
        <p style="color:#a89b7e; font-style:italic; text-align:center; margin-top:20px;">
            ✨ Орден ждёт тебя, Странник. Назови себя.
        </p>
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
            <p style="color:var(--text-color); line-height:1.8; margin-bottom:15px;">
                Орден Вольных Джедаев рад видеть тебя среди своих хранителей. 
                Твоя мудрость и опыт — бесценный дар для наших учеников.
            </p>
            <h4 style="color:#8bc34a; margin:20px 0 10px 0; font-family:'Playfair Display',serif;">⚙️ Твои возможности:</h4>
            <ul style="color:var(--text-color); line-height:1.8; padding-left:20px; margin-bottom:15px;">
                <li>📚 Доступ ко всем разделам знаний Ордена</li>
                <li>📝 Создание и проверка домашних заданий</li>
                <li>✏️ Добавление и редактирование уроков</li>
                <li>💬 Общение с учениками через личный чат</li>
                <li>📊 Просмотр таблицы успеваемости</li>
                ${rank === 'магистр' || rank === 'верховный магистр' || rank === 'старейшина' ? 
                    '<li>⚙️ Админ-панель: управление пользователями и блокировка</li>' : ''}
            </ul>
            <p style="color:#a89b7e; font-style:italic; text-align:center; margin-top:20px;">
                Используй свои возможности мудро, ${rank}. Орден доверяет тебе.
            </p>
        </div>`;
    } else {
        return `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">
            <h3 style="color:#64ffda; margin-bottom:15px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">🌟 Я рада приветствовать тебя в Ордене Вольных Джедаев, ${rank} ${name}!</h3>
            <p style="color:var(--text-color); line-height:1.8; margin-bottom:15px;">
                Твой путь только начинается. Впереди тебя ждут знания, испытания 
                и рост. Помни — дисциплина и усердие суть ключи к мастерству.
            </p>
            <h4 style="color:#8bc34a; margin:20px 0 10px 0; font-family:'Playfair Display',serif;">📜 Как пользоваться Акашей:</h4>
            <ul style="color:var(--text-color); line-height:1.8; padding-left:20px; margin-bottom:15px;">
                <li>📝 <strong>Домашние задания</strong> — просматривай задания от Мастеров и отправляй свои ответы</li>
                <li>✉️ <strong>Написать Мастеру</strong> — личный чат с твоим Наставником</li>
                <li>📚 <strong>Оглавление знаний</strong> — уроки, доступные твоему Рангу</li>
                <li>🏛️ <strong>Совет Мастеров</strong> — узнай, кто руководит Орденом</li>
                <li>👥 <strong>Члены Ордена</strong> — список всех братьев и сестёр</li>
                <li>📊 <strong>Успеваемость</strong> — следи за своим прогрессом</li>
            </ul>
            <p style="color:#a89b7e; font-style:italic; text-align:center; margin-top:20px;">
                Да пребудет с тобой Сила, ${rank} ${name}. Используй главное меню для навигации.
            </p>
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
        if (user) { currentUser = user; }
    } catch (error) {}
}

// ===== ДОБАВЛЕНИЕ СООБЩЕНИЯ =====
function addMessage(text, isUser = false, saveToStorage = true) {
    const container = document.getElementById('chat-container');
    if (!container) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'akasha-message'}`;
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = text;
    messageDiv.appendChild(contentDiv);
    container.appendChild(messageDiv);
    if (saveToStorage) saveMessageToStorage(text, isUser);
    
    setTimeout(() => { 
        container.scrollTop = container.scrollHeight;
        container.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
}
// ===== SUPABASE CRUD ФУНКЦИИ =====

// Загрузка уроков из Supabase
async function loadLessonsFromFirebase() {
    try {
        const { data, error } = await supabaseClient
            .from('lessons')
            .select('*');
        
        if (error) {
            console.error('Ошибка загрузки уроков:', error);
            return;
        }
        
        knowledgeBase = {};
        lessonsById = {};
        
        data.forEach((lesson) => {
            const id = lesson.id;
            lessonsById[id] = { id, ...lesson };
            if (!knowledgeBase[lesson.category]) knowledgeBase[lesson.category] = [];
            knowledgeBase[lesson.category].push({ id, ...lesson });
        });
    } catch (error) {
        console.error('Ошибка загрузки уроков:', error);
    }
}

// Загрузка домашних заданий
async function loadAssignments() {
    try {
        const { data, error } = await supabaseClient
            .from('homework_assignments')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Ошибка загрузки заданий:', error);
            return;
        }
        
        assignmentsList = data || [];
    } catch (error) {
        console.error('Ошибка загрузки заданий:', error);
    }
}

// Загрузка ответов на ДЗ
async function loadSubmissions() {
    try {
        const { data, error } = await supabaseClient
            .from('homework_submissions')
            .select('*');
        
        if (error) {
            console.error('Ошибка загрузки ответов:', error);
            return;
        }
        
        submissionsList = data || [];
    } catch (error) {
        console.error('Ошибка загрузки ответов:', error);
    }
}

// Создание задания
async function createAssignment(title, description) {
    try {
        const { data, error } = await supabaseClient
            .from('homework_assignments')
            .insert([{
                title: title,
                description: description,
                created_by: currentUser.name,
                created_at: new Date().toISOString()
            }]);
        
        if (error) {
            console.error('Ошибка создания задания:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка создания задания:', error);
        return false;
    }
}

// Отправка ответа на ДЗ
async function submitHomeworkToFirebase(assignmentId, content) {
    try {
        const { data, error } = await supabaseClient
            .from('homework_submissions')
            .insert([{
                assignment_id: assignmentId,
                student_name: currentUser.name,
                student_rank: currentUser.ранг,
                content: content,
                status: 'pending',
                submitted_at: new Date().toISOString(),
                master_feedback: null,
                reviewed_at: null
            }]);
        
        if (error) {
            console.error('Ошибка отправки ответа:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка отправки ответа:', error);
        return false;
    }
}

// Обновление статуса ответа
async function updateSubmissionStatus(submissionId, status, feedback) {
    try {
        const { data, error } = await supabaseClient
            .from('homework_submissions')
            .update({
                status: status,
                master_feedback: feedback,
                reviewed_at: new Date().toISOString()
            })
            .eq('id', submissionId);
        
        if (error) {
            console.error('Ошибка обновления статуса:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка обновления статуса:', error);
        return false;
    }
}

// Удаление ответа
async function deleteMySubmissionFromFirebase(submissionId) {
    try {
        const { error } = await supabaseClient
            .from('homework_submissions')
            .delete()
            .eq('id', submissionId);
        
        if (error) {
            console.error('Ошибка удаления:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка удаления:', error);
        return false;
    }
}

// Загрузка комментариев к уроку
async function loadCommentsForLesson(lessonId) {
    if (!lessonId) return [];
    
    try {
        const { data, error } = await supabaseClient
            .from('comments')
            .select('*')
            .eq('lesson_id', lessonId)
            .order('created_at', { ascending: true });
        
        if (error) {
            console.error('Ошибка загрузки комментариев:', error);
            return [];
        }
        
        return data || [];
    } catch (error) {
        console.error('Ошибка загрузки комментариев:', error);
        return [];
    }
}

// Добавление комментария
async function addCommentToFirebase(lessonId, text, type) {
    if (!lessonId) return false;
    
    try {
        const { data, error } = await supabaseClient
            .from('comments')
            .insert([{
                lesson_id: lessonId,
                text: text,
                type: type,
                author_name: currentUser.name,
                author_rank: currentUser.ранг,
                created_at: new Date().toISOString(),
                updated_at: null
            }]);
        
        if (error) {
            console.error('Ошибка добавления комментария:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка добавления комментария:', error);
        return false;
    }
}

// Обновление комментария
async function updateCommentInFirebase(commentId, newText) {
    if (!commentId) return false;
    
    try {
        const { data, error } = await supabaseClient
            .from('comments')
            .update({
                text: newText,
                updated_at: new Date().toISOString()
            })
            .eq('id', commentId);
        
        if (error) {
            console.error('Ошибка обновления комментария:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка обновления комментария:', error);
        return false;
    }
}

// Удаление комментария
async function deleteCommentFromFirebase(commentId) {
    if (!commentId) return false;
    
    try {
        const { error } = await supabaseClient
            .from('comments')
            .delete()
            .eq('id', commentId);
        
        if (error) {
            console.error('Ошибка удаления комментария:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка удаления комментария:', error);
        return false;
    }
}

// Добавление урока
async function addLessonToFirebase(category, title, content, mediaUrl = '') {
    try {
        const { data, error } = await supabaseClient
            .from('lessons')
            .insert([{
                category: category,
                title: title,
                content: content,
                media_url: mediaUrl,
                created_at: new Date().toISOString(),
                added_by: currentUser.name
            }]);
        
        if (error) {
            console.error('Ошибка добавления урока:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка добавления урока:', error);
        return false;
    }
}

// Обновление урока
async function updateLessonInFirebase(lessonId, updates) {
    if (!lessonId) return false;
    
    try {
        const { data, error } = await supabaseClient
            .from('lessons')
            .update(updates)
            .eq('id', lessonId);
        
        if (error) {
            console.error('Ошибка обновления урока:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка обновления урока:', error);
        return false;
    }
}

// Удаление урока
async function deleteLesson(lessonId) {
    if (!lessonId) return false;
    
    try {
        const { error } = await supabaseClient
            .from('lessons')
            .delete()
            .eq('id', lessonId);
        
        if (error) {
            console.error('Ошибка удаления урока:', error);
            return false;
        }
        
        delete lessonsById[lessonId];
        return true;
    } catch (error) {
        console.error('Ошибка удаления урока:', error);
        return false;
    }
}
// ===== ЧАТ С МАСТЕРОМ =====
async function sendMessageToMaster(text) {
    if (!currentUser) return false;
    const masterName = currentUser.учитель;
    if (!masterName || masterName === 'отсутствует') {
        addMessage('<p>❌ У тебя нет назначенного Мастера!</p>');
        return false;
    }
    try {
        const { data, error } = await supabaseClient
            .from('messages')
            .insert([{
                from_user: currentUser.name,
                to_user: masterName,
                text: text,
                timestamp: new Date().toISOString(),
                read: false
            }]);
        
        if (error) {
            console.error('💥 Ошибка:', error);
            addMessage(`<p>❌ Ошибка отправки: ${error.message}</p>`);
            return false;
        }
        return true;
    } catch (error) {
        console.error('💥 Ошибка:', error);
        addMessage(`<p>❌ Ошибка отправки: ${error.message}</p>`);
        return false;
    }
}

async function loadChatWith(partnerName) {
    if (!currentUser) return [];
    try {
        const { data: messages1, error: error1 } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('from_user', currentUser.name)
            .eq('to_user', partnerName);
        
        const { data: messages2, error: error2 } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('from_user', partnerName)
            .eq('to_user', currentUser.name);
        
        if (error1 || error2) {
            console.error('Ошибка загрузки чата:', error1 || error2);
            return [];
        }
        
        const messages = [...(messages1 || []), ...(messages2 || [])];
        messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        return messages;
    } catch (error) {
        console.error('Ошибка загрузки чата:', error);
        return [];
    }
}

async function markAsRead(fromUser) {
    if (!currentUser) return;
    try {
        const { error } = await supabaseClient
            .from('messages')
            .update({ read: true })
            .eq('from_user', fromUser)
            .eq('to_user', currentUser.name)
            .eq('read', false);
        
        if (error) console.error('Ошибка отметки:', error);
    } catch (error) {
        console.error('Ошибка отметки:', error);
    }
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
                    const isMine = msg.from_user === currentUser.name;
                    const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}) : '';
                    const bubble = document.createElement('div');
                    bubble.className = `chat-bubble ${isMine ? 'mine' : 'theirs'}`;
                    bubble.innerHTML = `<div class="bubble-text">${msg.text}</div><div class="bubble-time">${time}</div>`;
                    container.appendChild(bubble);
                });
                container.scrollTop = container.scrollHeight;
            }
            if (messages.length > 0) await markAsRead(masterName);
        } else {
            container.innerHTML = '<p style="color:#6b5f4a; text-align:center;">У тебя нет назначенного Мастера.</p>';
        }
    }
};

async function showMasterDashboard() {
    try {
        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('to_user', currentUser.name);
        
        if (error) {
            console.error('Ошибка загрузки панели:', error);
            addMessage('<p>❌ Ошибка загрузки сообщений.</p>');
            return;
        }
        
        const studentsMap = new Map();
        (data || []).forEach(msg => {
            const studentName = msg.from_user;
            if (!studentsMap.has(studentName)) {
                studentsMap.set(studentName, {
                    name: studentName,
                    lastMessage: msg.text,
                    timestamp: msg.timestamp,
                    unread: msg.read === false
                });
            }
        });
        
        const students = Array.from(studentsMap.values());
        let html = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">`;
        html += `<h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">📋 Сообщения от учеников</h3>`;
        if (students.length === 0) {
            html += `<p style="color:#6b5f4a; text-align:center; font-style:italic;">Пока нет сообщений от учеников.</p>`;
        } else {
            students.forEach(student => {
                const time = student.timestamp ? new Date(student.timestamp).toLocaleString('ru-RU', {hour: '2-digit', minute: '2-digit'}) : '';
                const unreadBadge = student.unread ? '<span style="background:#ff6b6b; color:white; padding:2px 8px; border-radius:10px; font-size:0.8em; margin-left:10px;">NEW</span>' : '';
                html += `<div style="background:rgba(100,255,218,0.1); border:1px solid rgba(100,255,218,0.3); border-radius:10px; padding:15px; margin:10px 0; cursor:pointer;" onclick="window.openChatWithStudent('${student.name}')">`;
                html += `<div style="display:flex; justify-content:space-between; align-items:center;">`;
                html += `<div style="font-size:1.15em; color:#64ffda; font-weight:bold;">👤 ${student.name} ${unreadBadge}</div>`;
                html += `<div style="color:#6b5f4a; font-size:0.9em;">${time}</div>`;
                html += `</div>`;
                html += `<div style="color:#a89b7e; margin-top:8px; font-style:italic;">"${student.lastMessage.substring(0, 50)}${student.lastMessage.length > 50 ? '...' : ''}"</div>`;
                html += `</div>`;
            });
        }
        html += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:15px; padding:12px;">🔙 Вернуться в меню</button>`;
        html += `</div>`;
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
        const { data: messages1 } = await supabaseClient
            .from('messages').select('*')
            .eq('from_user', currentUser.name).eq('to_user', studentName);
        const { data: messages2 } = await supabaseClient
            .from('messages').select('*')
            .eq('from_user', studentName).eq('to_user', currentUser.name);
        
        const messages = [...(messages1 || []), ...(messages2 || [])];
        messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        if (messages.length === 0) {
            container.innerHTML = `<p style="color:#6b5f4a; text-align:center; font-style:italic;">Нет переписки с ${studentName}</p>`;
        } else {
            container.innerHTML = '';
            messages.forEach(msg => {
                const isMine = msg.from_user === currentUser.name;
                const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}) : '';
                const bubble = document.createElement('div');
                bubble.className = `chat-bubble ${isMine ? 'mine' : 'theirs'}`;
                bubble.innerHTML = `<div class="bubble-text">${msg.text}</div><div class="bubble-time">${time}</div>`;
                container.appendChild(bubble);
            });
            container.scrollTop = container.scrollHeight;
        }
        
        // Отмечаем как прочитанное
        const unreadIds = messages
            .filter(msg => msg.from_user === studentName && msg.to_user === currentUser.name && msg.read === false)
            .map(msg => msg.id);
        
        if (unreadIds.length > 0) {
            for (const id of unreadIds) {
                await supabaseClient.from('messages').update({ read: true }).eq('id', id);
            }
        }
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
            await supabaseClient.from('messages').insert([{
                from_user: currentUser.name,
                to_user: window.currentChatPartner,
                text: text,
                timestamp: new Date().toISOString(),
                read: false
            }]);
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
                    const isMine = msg.from_user === currentUser.name;
                    const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}) : '';
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

// ===== БЛОКИРОВКА ПОЛЬЗОВАТЕЛЕЙ =====
async function isUserBlocked(userName) {
    try {
        const { data, error } = await supabaseClient
            .from('blocked_users')
            .select('*')
            .eq('id', userName)
            .single();
        
        if (error || !data) return false;
        return data.blocked === true;
    } catch (error) { return false; }
}

async function blockUser(userName, reason) {
    try {
        const { error } = await supabaseClient
            .from('blocked_users')
            .upsert([{
                id: userName,
                blocked: true,
                reason: reason,
                blocked_by: currentUser.name,
                blocked_at: new Date().toISOString(),
                unblocked_at: null
            }], { onConflict: 'id' });
        
        if (error) {
            console.error('Ошибка блокировки:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Ошибка блокировки:', error);
        return false;
    }
}

async function unblockUser(userName) {
    try {
        const { error } = await supabaseClient
            .from('blocked_users')
            .update({
                blocked: false,
                unblocked_at: new Date().toISOString()
            })
            .eq('id', userName);
        
        if (error) {
            console.error('Ошибка разблокировки:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Ошибка разблокировки:', error);
        return false;
    }
}

async function getBlockedUsers() {
    try {
        const { data, error } = await supabaseClient
            .from('blocked_users')
            .select('*')
            .eq('blocked', true);
        
        if (error) return [];
        return data || [];
    } catch (error) { return []; }
}

// ===== ПРОЧИТАННЫЕ УРОКИ =====
async function markLessonAsRead(lessonId) {
    if (!currentUser) return false;
    try {
        const readId = `${currentUser.name}_${lessonId}`;
        const { error } = await supabaseClient
            .from('lesson_reads')
            .upsert([{
                id: readId,
                user_id: currentUser.name,
                lesson_id: lessonId,
                read_at: new Date().toISOString(),
                user_rank: currentUser.ранг
            }], { onConflict: 'id' });
        
        if (error) {
            console.error('Ошибка отметки:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Ошибка отметки:', error);
        return false;
    }
}

async function isLessonRead(lessonId) {
    if (!currentUser) return false;
    try {
        const readId = `${currentUser.name}_${lessonId}`;
        const { data, error } = await supabaseClient
            .from('lesson_reads')
            .select('*')
            .eq('id', readId)
            .single();
        
        if (error || !data) return false;
        return true;
    } catch (error) { return false; }
}

async function getAllLessonReads() {
    try {
        const { data, error } = await supabaseClient
            .from('lesson_reads')
            .select('*');
        
        if (error) return [];
        return data || [];
    } catch (error) { return []; }
}

// ===== РЕГИСТРАЦИИ ПОЛЬЗОВАТЕЛЕЙ =====
async function getUserRegistrationDate(userName) {
    try {
        const { data, error } = await supabaseClient
            .from('user_registrations')
            .select('*')
            .eq('id', userName)
            .single();
        
        if (error || !data) {
            // Создаём новую регистрацию
            await supabaseClient.from('user_registrations').upsert([{
                id: userName,
                user_rank: currentUser ? currentUser.ранг : 'unknown',
                registered_at: new Date().toISOString()
            }], { onConflict: 'id' });
            return new Date();
        }
        return new Date(data.registered_at);
    } catch (error) {
        return new Date();
    }
}

async function registerUserIfNeeded() {
    if (!currentUser) return;
    try {
        const { data, error } = await supabaseClient
            .from('user_registrations')
            .select('*')
            .eq('id', currentUser.name)
            .single();
        
        if (error || !data) {
            await supabaseClient.from('user_registrations').upsert([{
                id: currentUser.name,
                user_rank: currentUser.ранг,
                registered_at: new Date().toISOString()
            }], { onConflict: 'id' });
            console.log('✅ Пользователь зарегистрирован:', currentUser.name);
        }
    } catch (error) {
        console.error('Ошибка регистрации:', error);
    }
}

// ===== РУЧНЫЕ КОРРЕКТИРОВКИ =====
async function getUserAdjustments(userName) {
    try {
        const { data, error } = await supabaseClient
            .from('manual_adjustments')
            .select('*')
            .eq('id', userName)
            .single();
        
        if (error || !data) return { adjustedLessons: 0, adjustedHomework: 0, reason: '' };
        return {
            adjustedLessons: data.adjusted_lessons || 0,
            adjustedHomework: data.adjusted_homework || 0,
            reason: data.reason || '',
            adjustedBy: data.adjusted_by || '',
            adjustedAt: data.adjusted_at
        };
    } catch (error) {
        return { adjustedLessons: 0, adjustedHomework: 0, reason: '' };
    }
}

async function saveManualAdjustment(userName, lessons, homework, reason) {
    try {
        const { error } = await supabaseClient
            .from('manual_adjustments')
            .upsert([{
                id: userName,
                adjusted_lessons: parseInt(lessons) || 0,
                adjusted_homework: parseInt(homework) || 0,
                reason: reason,
                adjusted_by: currentUser.name,
                adjusted_at: new Date().toISOString()
            }], { onConflict: 'id' });
        
        if (error) {
            console.error('❌ Ошибка сохранения корректировки:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('❌ Ошибка сохранения корректировки:', error);
        return false;
    }
}

// ===== УТИЛИТЫ =====
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

function isAdmin() { return ['магистр', 'верховный магистр', 'старейшина'].includes(currentUser.ранг); }
function isMaster() { return ['мастер', 'магистр', 'верховный магистр', 'старейшина'].includes(currentUser.ранг); }
// ===== ГЛАВНОЕ МЕНЮ =====
function showMainMenu() {
    const container = document.getElementById('chat-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    let html = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">`;
    html += `<h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">🔮 Главное меню</h3>`;
    html += `<button class="menu-btn" onclick="window.showHomeworkBoard()"> Домашние задания</button>`;
    html += `<button class="menu-btn chat-btn" onclick="window.openMasterChat()">✉️ Написать Мастеру</button>`;
    html += `<button class="menu-btn" onclick="showTOC()">📚 Оглавление знаний</button>`;
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
    html += `<div class="homework-header"> Домашние задания Ордена</div>`;
    if (assignmentsList.length === 0) {
        html += `<p style="color:#6b5f4a; text-align:center; font-style:italic;">Заданий пока нет.</p>`;
        html += `<p style="color:#8bc34a; text-align:center; margin-top:20px;">💡 Мастер может создать первое задание!</p>`;
    } else {
        assignmentsList.forEach((hw) => {
            if (!hw.id || !hw.title) return;
            const hwSubmissions = submissionsList.filter(s => s.assignment_id === hw.id);
            const pendingCount = hwSubmissions.filter(s => s.status === 'pending').length;
            const mySubmissions = submissionsList.filter(s => s.assignment_id === hw.id && s.student_name === currentUser.name);
            const myLastSubmission = mySubmissions.length > 0 ? mySubmissions.sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at))[0] : null;
            
            html += `<div class="hw-card"><div class="hw-title">${hw.title}</div><div class="hw-desc">${hw.description}</div>`;
            const dateStr = hw.created_at ? new Date(hw.created_at).toLocaleString('ru-RU') : 'дата неизвестна';
            html += `<div class="hw-meta">👤 ${hw.created_by || 'неизвестно'} | 📅 ${dateStr}</div>`;
            
            if (myLastSubmission) {
                const statusEmoji = myLastSubmission.status === 'approved' ? '✅' : (myLastSubmission.status === 'needs_revision' ? '⚠️' : '⏳');
                const statusText = myLastSubmission.status === 'approved' ? 'Одобрено' : (myLastSubmission.status === 'needs_revision' ? 'На доработку' : 'На проверке');
                const statusColor = myLastSubmission.status === 'approved' ? '#4caf50' : (myLastSubmission.status === 'needs_revision' ? '#ff9800' : '#2196f3');
                
                html += `<div style="margin:15px 0; padding:12px; background:rgba(${myLastSubmission.status === 'approved' ? '76,175,80' : (myLastSubmission.status === 'needs_revision' ? '255,152,0' : '33,150,243')},0.1); border-radius:8px; border-left:3px solid ${statusColor};">`;
                html += `<p style="color:${statusColor}; margin:0 0 8px 0; font-weight:bold;">${statusEmoji} Статус: ${statusText}</p>`;
                html += `<p style="color:var(--text-color); margin:0 0 8px 0; font-size:0.95em;"><strong>Мой ответ:</strong> ${myLastSubmission.content}</p>`;
                if (myLastSubmission.master_feedback) html += `<p style="color:#64ffda; margin:0 0 8px 0; font-size:0.95em;"><strong>💬 Комментарий Мастера:</strong> ${myLastSubmission.master_feedback}</p>`;
                const submitDate = myLastSubmission.submitted_at ? new Date(myLastSubmission.submitted_at).toLocaleString('ru-RU') : '';
                html += `<p style="color:#6b5f4a; margin:8px 0 0 0; font-size:0.85em; font-style:italic;">📅 Отправлено: ${submitDate}</p>`;
                if (myLastSubmission.status === 'pending' || myLastSubmission.status === 'needs_revision') {
                    html += `<div style="margin-top:10px;"><button class="hw-btn" onclick="window.deleteMySubmission('${myLastSubmission.id}', '${hw.id}')" style="background:rgba(255,80,80,0.2); color:#ff6b6b; border:1px solid rgba(255,80,80,0.4);">🗑️ Удалить ответ</button></div>`;
                }
                html += `</div>`;
            }
            if (isMaster() && hwSubmissions.length > 0) {
                html += `<div style="margin:10px 0; padding:10px; background:rgba(255,165,0,0.1); border-radius:8px;"><p style="color:#ffa500; margin:0;">📬 Ответов: ${hwSubmissions.length} |  На проверке: ${pendingCount}</p><button class="hw-btn" onclick="window.reviewSubmissions('${hw.id}')" style="margin-top:10px; background:rgba(255,165,0,0.3); color:#ffa500;">🔍 Проверить ответы</button></div>`;
            }
            const escapedTitle = hw.title.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            html += `<div class="hw-actions"><button class="hw-btn submit" onclick="window.submitHomework('${hw.id}', '${escapedTitle}')">📤 Отправить ответ</button></div></div>`;
        });
    }
    if (isMaster()) html += `<button class="hw-btn create" onclick="window.startCreateAssignment()" style="width:100%; margin-top:20px; padding:15px;">➕ Создать новое задание</button>`;
    html += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:10px; padding:12px;">🔙 Вернуться в меню</button></div>`;
    addMessage(html);
};

window.deleteMySubmission = async function(submissionId, assignmentId) {
    showCustomConfirm('Подтверждение', '⚠️ Вы уверены? Это действие нельзя отменить!', async (confirmed) => {
        if (!confirmed) return;
        try {
            await supabaseClient.from('homework_submissions').delete().eq('id', submissionId);
            addMessage(`<p>✅ Ваш ответ удалён!</p>`);
            window.showHomeworkBoard();
        } catch (error) { addMessage(`<p>❌ Ошибка при удалении ответа.</p>`); }
    });
};

window.reviewSubmissions = function(assignmentId) {
    const container = document.getElementById('chat-container');
    if (container) container.innerHTML = '';
    const hw = assignmentsList.find(a => a.id === assignmentId);
    if (!hw) return;
    const hwSubmissions = submissionsList.filter(s => s.assignment_id === assignmentId);
    let html = `<div class="homework-board"><div class="homework-header">🔍 Проверка ответов: ${hw.title}</div>`;
    if (hwSubmissions.length === 0) html += `<p style="color:#6b5f4a; text-align:center;">Ответов пока нет.</p>`;
    else {
        hwSubmissions.forEach(sub => {
            const statusEmoji = sub.status === 'approved' ? '✅' : (sub.status === 'needs_revision' ? '⚠️' : '');
            const statusText = sub.status === 'approved' ? 'Одобрено' : (sub.status === 'needs_revision' ? 'На доработку' : 'На проверке');
            html += `<div class="hw-card" style="border-left-color: ${sub.status === 'approved' ? '#4caf50' : (sub.status === 'needs_revision' ? '#ff9800' : '#2196f3')};">`;
            html += `<div class="hw-title">${statusEmoji} ${sub.student_name} <span style="font-size:0.8em; color:#a89b7e;">(${sub.student_rank})</span></div><div class="hw-desc">${sub.content}</div>`;
            const dateStr = sub.submitted_at ? new Date(sub.submitted_at).toLocaleString('ru-RU') : '';
            html += `<div class="hw-meta">📅 ${dateStr} | Статус: ${statusText}</div>`;
            if (sub.master_feedback) html += `<div style="margin:10px 0; padding:10px; background:rgba(100,255,218,0.1); border-radius:8px;"><p style="color:#64ffda; margin:0;"><strong>💬 Комментарий Мастера:</strong> ${sub.master_feedback}</p></div>`;
            html += `<div class="hw-actions"><button class="hw-btn" onclick="window.gradeSubmission('${sub.id}', '${hw.id}', 'approved')" style="background:rgba(76,175,80,0.3); color:#4caf50;">✅ Одобрить</button><button class="hw-btn" onclick="window.gradeSubmission('${sub.id}', '${hw.id}', 'needs_revision')" style="background:rgba(255,152,0,0.3); color:#ff9800;">⚠️ На доработку</button><button class="hw-btn" onclick="window.addFeedback('${sub.id}', '${hw.id}')" style="background:rgba(100,255,218,0.2); color:#64ffda;">💬 Комментарий</button></div></div>`;
        });
    }
    html += `<button class="hw-btn" onclick="window.showHomeworkBoard()" style="width:100%; margin-top:10px; padding:12px;">🔙 Назад к заданиям</button></div>`;
    addMessage(html);
};

window.gradeSubmission = async function(submissionId, assignmentId, status) {
    showCustomPrompt('Комментарий', 'Введите комментарий (или оставьте пустым):', '', async (feedback) => {
        if (feedback === null) return;
        const success = await updateSubmissionStatus(submissionId, status, feedback);
        if (success) { addMessage(`<p>✅ Статус обновлён!</p>`); window.reviewSubmissions(assignmentId); }
        else { addMessage(`<p>❌ Ошибка.</p>`); }
    });
};

window.addFeedback = async function(submissionId, assignmentId) {
    showCustomPrompt('Комментарий Мастера', 'Введите комментарий Мастера:', '', async (feedback) => {
        if (!feedback) return;
        const sub = submissionsList.find(s => s.id === submissionId);
        const currentFeedback = sub.master_feedback || '';
        const newFeedback = currentFeedback ? currentFeedback + '\n\n' + feedback : feedback;
        const success = await updateSubmissionStatus(submissionId, sub.status, newFeedback);
        if (success) { addMessage(`<p>✅ Комментарий добавлен!</p>`); window.reviewSubmissions(assignmentId); }
        else { addMessage(`<p>❌ Ошибка.</p>`); }
    });
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

// ===== УРОКИ И КОММЕНТАРИИ =====
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
    if (lesson.media_url) {
        html += `<div style="margin-top:20px;">`;
        if (lesson.media_url.includes('youtube.com') || lesson.media_url.includes('rutube.ru')) html += `<iframe width="100%" height="315" src="${lesson.media_url}" frameborder="0" allowfullscreen style="border-radius:10px;"></iframe>`;
        else if (lesson.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) html += `<img src="${lesson.media_url}" style="max-width:100%; border-radius:10px; margin-top:10px;">`;
        else if (lesson.media_url.match(/\.(mp4|webm|ogg)$/i)) html += `<video controls style="max-width:100%; margin-top:10px; border-radius:10px;"><source src="${lesson.media_url}"></video>`;
        else html += `<a href="${lesson.media_url}" target="_blank" rel="noopener noreferrer" style="color:#64ffda; text-decoration:underline;">🔗 Открыть медиа</a>`;
        html += `</div>`;
    }
    if (isRead) {
        html += `<button class="read-btn read" disabled>✅ Прочитано</button>`;
    } else {
        html += `<button class="read-btn" onclick="window.markLessonRead('${lessonId}')">📖 Отметить как прочитанное</button>`;
    }
    const isAdminUser = isAdmin();
    if (isAdminUser) html += `<div style="margin-top:20px; display:flex; gap:10px; flex-wrap:wrap;"><button class="edit-btn" onclick="window.editLesson('${lesson.id}')">✏️ Редактировать</button><button class="delete-btn" onclick="window.confirmDeleteLesson('${lesson.id}')">️ Удалить</button></div>`;
    html += `<div class="comments-section"><div class="comments-header">💬 Комментарии</div>`;
    const comments = await loadCommentsForLesson(lessonId);
    if (comments.length === 0) html += `<p style="color:#6b5f4a; font-style:italic;">Комментариев пока нет. Будь первым!</p>`;
    else {
        comments.forEach(comment => {
            const isMasterComment = comment.type === 'task';
            const isAuthor = comment.author_name === currentUser.name;
            const canDelete = isAuthor || isAdminUser;
            const canEdit = isAuthor;
            html += `<div class="comment-item ${isMasterComment ? 'master-comment' : ''}"><div class="comment-author ${isMasterComment ? 'master' : ''}">${comment.author_name}<span class="comment-type-badge ${isMasterComment ? 'badge-task' : 'badge-question'}">${isMasterComment ? '📝 Задание' : '💬 Комментарий'}</span></div><div class="comment-text">${comment.text}</div><div class="comment-meta">${comment.created_at ? new Date(comment.created_at).toLocaleString('ru-RU') : ''}</div>`;
            if (canEdit || canDelete) {
                html += `<div class="comment-actions">`;
                if (canEdit) html += `<button class="comment-edit-btn" onclick="window.editComment('${comment.id}', '${lesson.id}')">️ Изменить</button>`;
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
    addMessage(`<div style="background:rgba(100,255,218,0.1); border:1px solid rgba(100,255,218,0.3); border-radius:10px; padding:15px; margin:10px 0;"><p style="color:#64ffda; font-weight:bold; margin-bottom:10px;">✏️ РЕДАКТИРОВАНИЕ УРОКА</p><p><strong>Название:</strong> ${lesson.title}</p><p><strong>Текст:</strong> ${lesson.content.substring(0, 100)}${lesson.content.length > 100 ? '...' : ''}</p><p><strong>Медиа:</strong> ${lesson.media_url || 'нет'}</p></div><p>Что изменить? Напиши:</p><p>• <em>"название"</em>, <em>"текст"</em>, <em>"медиа"</em>, <em>"всё"</em> или <em>"отмена"</em></p>`);
    addLessonState = { step: 'edit_choose', lessonId: lessonId, currentData: lesson };
};

window.confirmDeleteLesson = async function(lessonId) {
    const lesson = lessonsById[lessonId];
    if (!lesson) return;
    addMessage(`<p>⚠️ Удалить урок "<strong>${lesson.title}</strong>"?<br>Напиши <em>"да, удалить"</em> или <em>"отмена"</em>.</p>`);
    addLessonState = { step: 'confirm_delete', lessonId: lessonId, lessonTitle: lesson.title };
};

function startAddLesson() {
    addMessage('<p> <strong>Добавление урока</strong></p><p>Для какого ранга?<br><em>адепт, юнлинг, падаван, рыцарь, мастер, магистр</em></p>');
    addLessonState = { step: 'category' };
}

// ===== СОВЕТ МАСТЕРОВ И ЧЛЕНЫ ОРДЕНА =====
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
        html += `<div class="council-supreme">`;
        html += `<div style="display:flex; align-items:center; gap:15px; margin-bottom:10px;">`;
        html += `<div style="font-size:2em;">🔮</div>`;
        html += `<div style="flex:1;">`;
        html += `<div style="color:#64ffda; font-family:'Playfair Display',serif; font-size:1.3em; font-weight:700;">${supremeMaster.fullName}</div>`;
        html += `<div style="color:#8bc34a; font-size:1em; font-weight:600; margin-top:3px;">${supremeMaster.specialTitle}</div>`;
        html += `</div>`;
        html += `<div class="member-status ${isBlocked ? 'status-blocked' : 'status-active'}">`;
        html += isBlocked ? '🚫 Заблок.' : '✅ Активен';
        html += `</div>`;
        html += `</div>`;
        if (supremeMaster.description) {
            html += `<div style="color:var(--text-color); font-size:0.95em; line-height:1.5; padding-left:50px; font-style:italic;">${supremeMaster.description}</div>`;
        }
        html += `</div>`;
    }
    
    html += `<h4 class="council-master-header"> Мастера</h4>`;
    
    const masters = Object.values(usersDatabase).filter(u => u.ранг === 'мастер' && u.specialTitle);
    masters.forEach(master => {
        const isBlocked = blockedNames.includes(master.fullName);
        html += `<div class="council-master-card">`;
        html += `<div style="display:flex; align-items:center; gap:15px; margin-bottom:10px;">`;
        html += `<div style="font-size:2em;">🔮</div>`;
        html += `<div style="flex:1;">`;
        html += `<div style="color:#64ffda; font-family:'Playfair Display',serif; font-size:1.3em; font-weight:700;">${master.fullName}</div>`;
        html += `<div style="color:#8bc34a; font-size:1em; font-weight:600; margin-top:3px;">${master.specialTitle}</div>`;
        html += `</div>`;
        html += `<div class="member-status ${isBlocked ? 'status-blocked' : 'status-active'}">`;
        html += isBlocked ? '🚫 Заблок.' : '✅ Активен';
        html += `</div>`;
        html += `</div>`;
        if (master.description) {
            html += `<div style="color:var(--text-color); font-size:0.95em; line-height:1.5; padding-left:50px; font-style:italic;">${master.description}</div>`;
        }
        html += `</div>`;
    });
    
    html += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:20px; padding:12px;">🔙 Вернуться в меню</button>`;
    html += `</div>`;
    addMessage(html);
};

window.showMembersList = async function() {
    const container = document.getElementById('chat-container');
    if (container) container.innerHTML = '';
    const blockedUsers = await getBlockedUsers();
    const blockedNames = blockedUsers.map(u => u.id);
    let html = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">`;
    html += `<h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;"> Члены Ордена</h3>`;
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
                const timeInAkasha = formatTimeInAkasha(regDate);
                html += `<div class="member-card">`;
                html += `<div style="flex:1;">`;
                html += `<div class="member-name">${member.fullName}</div>`;
                html += `<div style="color:var(--text-secondary); font-size:0.9em; margin-top:3px;">🧙‍♂️ Учитель: ${teacherName}</div>`;
                html += `<div style="color:var(--text-secondary); font-size:0.85em; margin-top:2px;">⏱️ В Акаше: ${timeInAkasha}</div>`;
                html += `</div>`;
                html += `<div class="member-status ${isBlocked ? 'status-blocked' : 'status-active'}">`;
                html += isBlocked ? '🚫 Заблок.' : '✅ Активен';
                html += `</div>`;
                html += `</div>`;
            }
            html += `</div>`;
        }
    }
    html += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:15px; padding:12px;">🔙 Вернуться в меню</button>`;
    html += `</div>`;
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
        const userReads = reads.filter(r => r.user_id === user.fullName);
        const userSubmissions = submissionsList.filter(s => s.student_name === user.fullName);
        const approvedHomework = userSubmissions.filter(s => s.status === 'approved').length;
        const submittedHomework = userSubmissions.length;
        const regDate = await getUserRegistrationDate(user.fullName);
        const timeInAkasha = formatTimeInAkasha(regDate);
        const adjustments = await getUserAdjustments(user.fullName);
        const gradeData = calculateGrade(userReads.length, approvedHomework, totalLessons, totalHomework, adjustments.adjustedLessons || 0, adjustments.adjustedHomework || 0);
        const teacherName = user.учитель && user.учитель !== 'отсутствует' ? user.учитель : '—';
        html += `<tr>`;
        html += `<td style="font-weight:600;">${user.fullName}</td>`;
        html += `<td>${user.ранг}</td>`;
        html += `<td style="font-size:0.9em;">${teacherName}</td>`;
        html += `<td style="font-size:0.9em;">${timeInAkasha}</td>`;
        html += `<td>${userReads.length}/${totalLessons}</td>`;
        html += `<td>${submittedHomework} сдано<br><small style="color:#a89b7e;">(${approvedHomework} одобрено)</small></td>`;
        html += `<td style="color:${gradeData.gradeColor}; font-weight:700; text-align:center;">${gradeData.grade}<br><small>${gradeData.percent}%</small></td>`;
        html += `</tr>`;
    }
    html += `</table></div>`;
    if (isMasterUser) {
        html += `<div class="admin-panel">`;
        html += `<h3>✏️ Ручная корректировка результатов</h3>`;
        html += `<p style="color:var(--text-secondary); margin:10px 0;">Мастер может добавить баллы ученикам, которые не успели перенести свои результаты в Акашу. Это сделает таблицу честной.</p>`;
        html += `<button class="hw-btn" onclick="window.showAdjustmentPanel()" style="background:rgba(100,255,218,0.2); color:#64ffda; width:100%; margin-top:10px;">⚙️ Открыть панель корректировки</button>`;
        html += `</div>`;
        html += `<button class="hw-btn" onclick="window.showDetailedProgress()" style="width:100%; margin-top:10px; background:rgba(100,255,218,0.2); color:#64ffda;">🔒 Показать детали (какие материалы сданы)</button>`;
    }
    html += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:15px; padding:12px;">🔙 Вернуться в меню</button>`;
    html += `</div>`;
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
        html += `<button class="hw-btn" onclick="window.openAdjustmentForm('${user.fullName}')" style="width:100%; background:rgba(100,255,218,0.2); color:#64ffda; padding:8px; font-size:0.95em;">✏️ ${hasAdjustment ? 'Изменить' : 'Добавить'} корректировку</button>`;
        html += `</div>`;
    }
    html += `<button class="hw-btn" onclick="window.showProgressTable()" style="width:100%; margin-top:15px; padding:12px;">🔙 Назад к таблице</button>`;
    html += `</div>`;
    addMessage(html);
};

window.openAdjustmentForm = async function(userName) {
    const adjustments = await getUserAdjustments(userName);
    const currentLessons = adjustments.adjustedLessons || 0;
    const currentHomework = adjustments.adjustedHomework || 0;
    const currentReason = adjustments.reason || '';
    
    showCustomPrompt('Корректировка', `Дополнительных уроков для ${userName} (сейчас: ${currentLessons}):`, currentLessons, (lessons) => {
        if (lessons === null) return;
        showCustomPrompt('Корректировка', `Дополнительных ДЗ для ${userName} (сейчас: ${currentHomework}):`, currentHomework, (homework) => {
            if (homework === null) return;
            showCustomPrompt('Корректировка', `Причина корректировки (например: "Сдано в ВК до создания Акаши"):`, currentReason, async (reason) => {
                if (reason === null) return;
                const success = await saveManualAdjustment(userName, lessons, homework, reason);
                if (success) {
                    addMessage(`<p>✅ Корректировка для ${userName} сохранена!</p>`);
                    window.showAdjustmentPanel();
                } else {
                    addMessage('<p>❌ Ошибка сохранения.</p>');
                }
            });
        });
    });
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
        const userReads = reads.filter(r => r.user_id === user.fullName);
        const userSubmissions = submissionsList.filter(s => s.student_name === user.fullName);
        const adjustments = await getUserAdjustments(user.fullName);
        const gradeData = calculateGrade(userReads.length, userSubmissions.filter(s => s.status === 'approved').length, totalLessons, totalHomework, adjustments.adjustedLessons || 0, adjustments.adjustedHomework || 0);
        html += `<div style="background:rgba(0,0,0,0.3); border-radius:10px; padding:15px; margin:15px 0; border-left:3px solid ${gradeData.gradeColor};">`;
        html += `<h4 style="color:${gradeData.gradeColor}; margin-bottom:10px;">${user.fullName} — ${gradeData.grade} (${gradeData.percent}%)</h4>`;
        html += `<p style="color:#8bc34a; margin:10px 0 5px 0; font-weight:600;">📖 Прочитанные уроки (${userReads.length}/${totalLessons}):</p>`;
        if (userReads.length > 0) {
            html += `<ul style="color:var(--text-color); margin:5px 0; padding-left:20px; font-size:0.95em;">`;
            userReads.forEach(read => {
                const lesson = lessonsById[read.lesson_id];
                if (lesson) {
                    const readDate = read.read_at ? new Date(read.read_at).toLocaleString('ru-RU', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'}) : '';
                    html += `<li>${lesson.title} <span style="color:#6b5f4a; font-size:0.85em;">— ${readDate}</span></li>`;
                }
            });
            html += `</ul>`;
        } else { html += `<p style="color:#6b5f4a; font-style:italic; margin:5px 0;">Нет прочитанных уроков</p>`; }
        html += `<p style="color:#ffa500; margin:10px 0 5px 0; font-weight:600;">📝 Сданные ДЗ (${userSubmissions.length} всего, ${userSubmissions.filter(s => s.status === 'approved').length} одобрено):</p>`;
        if (userSubmissions.length > 0) {
            html += `<ul style="color:var(--text-color); margin:5px 0; padding-left:20px; font-size:0.95em;">`;
            userSubmissions.forEach(sub => {
                const assignment = assignmentsList.find(a => a.id === sub.assignment_id);
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
    html += `<button class="hw-btn" onclick="window.showProgressTable()" style="width:100%; margin-top:15px; padding:12px;">🔙 Назад к таблице</button>`;
    html += `</div>`;
    addMessage(html);
};

// ===== АДМИН ПАНЕЛЬ =====
window.showAdminPanel = async function() {
    const container = document.getElementById('chat-container');
    if (container) container.innerHTML = '';
    if (!isAdmin()) { 
        addMessage('<p>❌ Доступ запрещён. Только для Магистров.</p>'); 
        return; 
    }
    
    const blockedUsers = await getBlockedUsers();
    let html = `<div style="background:rgba(13,31,15,0.5); border:1px solid var(--border-color); border-radius:15px; padding:25px; margin:15px 0;">`;
    html += `<h3 style="color:#64ffda; margin-bottom:25px; font-family:'Playfair Display',serif; text-align:center; font-size:1.8em;">⚙️ Админ-панель</h3>`;
    html += `<div class="admin-panel"><h3>👥 Управление всеми пользователями (включая Мастеров)</h3>`;
    
    Object.values(usersDatabase).forEach(user => {
        const isBlocked = blockedUsers.find(b => b.id === user.fullName);
        const userRank = user.ранг;
        const rankColor = userRank.includes('магистр') || userRank.includes('мастер') ? '#ffd700' : 'var(--accent-color)';
        
        html += `<div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid var(--border-color); background:rgba(0,0,0,0.2); border-radius:8px; margin:8px 0;">`;
        html += `<div>`;
        html += `<div style="color:var(--text-color); font-weight:600; font-size:1.1em;">${user.fullName}</div>`;
        html += `<div style="color:${rankColor}; font-size:0.9em;">${user.ранг}</div>`;
        html += `</div>`;
        html += `<div>`;
        if (isBlocked) {
            html += `<button class="unblock-btn" onclick="window.unblockUser('${user.fullName}')">✅ Разблокировать</button>`;
        } else {
            html += `<button class="block-btn" onclick="window.blockUser('${user.fullName}')">🚫 Заблокировать</button>`;
        }
        html += `</div></div>`;
    });
    html += `</div>`;
    html += `<button class="hw-btn" onclick="showMainMenu()" style="width:100%; margin-top:15px; padding:12px;">🔙 Вернуться в меню</button>`;
    html += `</div>`;
    addMessage(html);
};

window.blockUser = async function(userName) {
    showCustomPrompt('Блокировка', `Причина блокировки ${userName}:`, '', async (reason) => {
        if (!reason) return;
        const success = await blockUser(userName, reason);
        if (success) { 
            addMessage(`<p>✅ Пользователь ${userName} заблокирован.</p>`); 
            window.showAdminPanel(); 
        }
        else { addMessage('<p>❌ Ошибка блокировки.</p>'); }
    });
};

window.unblockUser = async function(userName) {
    showCustomConfirm('Разблокировка', `Разблокировать пользователя ${userName}?`, async (confirmed) => {
        if (!confirmed) return;
        const success = await unblockUser(userName);
        if (success) { 
            addMessage(`<p>✅ Пользователь ${userName} разблокирован.</p>`); 
            window.showAdminPanel(); 
        }
        else { addMessage('<p>❌ Ошибка разблокировки.</p>'); }
    });
};
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
                keyDiv.textContent = '';
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

customTextarea.addEventListener('focus', (e) => {
    e.preventDefault();
    customTextarea.style.borderColor = 'rgba(100, 255, 218, 0.6)';
    customTextarea.blur();
    setTimeout(() => customTextarea.focus(), 100);
});

customTextarea.addEventListener('blur', () => {
    customTextarea.style.borderColor = 'rgba(139, 195, 74, 0.4)';
});

customTextarea.addEventListener('paste', (e) => {
    e.preventDefault();
    insertTextAtCursor(e.clipboardData.getData('text'));
});

customTextarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); insertTextAtCursor('\n'); }
    else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
});

customTextarea.addEventListener('click', (e) => {
    e.preventDefault();
    customTextarea.focus();
    setTimeout(() => {
        const pos = customTextarea.selectionStart;
        customTextarea.setSelectionRange(pos, pos);
    }, 50);
});

// ===== МОДАЛЬНЫЕ ОКНА =====
function showCustomModal(title, bodyHTML, buttons) {
    const modal = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHTML;
    modalFooter.innerHTML = '';
    
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = btn.class || 'hw-btn';
        button.textContent = btn.text;
        if (btn.style) button.style.cssText = btn.style;
        button.onclick = () => {
            if (btn.action) btn.action();
            if (btn.close !== false) closeCustomModal();
        };
        modalFooter.appendChild(button);
    });
    
    modal.style.display = 'flex';
}

function closeCustomModal() {
    document.getElementById('custom-modal').style.display = 'none';
}

document.addEventListener('click', (e) => {
    const modal = document.getElementById('custom-modal');
    if (e.target === modal) closeCustomModal();
});

function showCustomPrompt(title, message, defaultValue, callback) {
    showCustomModal(title, `<p>${message}</p><input type="text" id="modal-prompt-input" class="modal-input" value="${defaultValue}" autofocus>`, [
        { text: 'Отмена', class: 'hw-btn', action: () => callback(null) },
        { text: 'OK', class: 'hw-btn', style: 'background:rgba(100,255,218,0.3); color:#64ffda;', action: () => {
            const input = document.getElementById('modal-prompt-input');
            callback(input.value);
        }}
    ]);
    setTimeout(() => {
        const input = document.getElementById('modal-prompt-input');
        if (input) { input.focus(); input.select(); }
    }, 100);
}

function showCustomConfirm(title, message, callback) {
    showCustomModal(title, `<p>${message}</p>`, [
        { text: 'Отмена', class: 'hw-btn', action: () => callback(false) },
        { text: 'Подтвердить', class: 'hw-btn', style: 'background:rgba(255,80,80,0.3); color:#ff6b6b;', action: () => callback(true) }
    ]);
}

function showCustomAlert(title, message) {
    showCustomModal(title, `<p>${message}</p>`, [
        { text: 'OK', class: 'hw-btn', action: () => {} }
    ]);
}

// ===== ГЛАВНАЯ ЛОГИКА АКАШИ (findAnswer) =====
async function findAnswer(question) {
    const q = question.toLowerCase().trim();
    
    // Обработка состояний (создание ДЗ, отправка ответов, комментарии, редактирование)
    if (addLessonState && addLessonState.step === 'create_hw_title') {
        if (q === 'отмена') { addLessonState = null; return '<p>❌ Создание отменено.</p>'; }
        addLessonState.hwTitle = question; addLessonState.step = 'create_hw_desc'; return '<p>Введите <strong>описание задания</strong> (или <em>"отмена"</em>):</p>';
    }
    if (addLessonState && addLessonState.step === 'create_hw_desc') {
        if (q === 'отмена') { addLessonState = null; return '<p>❌ Создание отменено.</p>'; }
        const success = await createAssignment(addLessonState.hwTitle, question);
        if (success) { addMessage(`<p>✅ Задание "<strong>${addLessonState.hwTitle}</strong>" создано!</p>`); window.showHomeworkBoard(); }
        else { addMessage('<p>❌ Ошибка создания.</p>'); }
        addLessonState = null; return '';
    }
    if (addLessonState && addLessonState.step === 'submit_hw_text') {
        if (q === 'отмена') { addLessonState = null; return '<p>❌ Отмена.</p>'; }
        const savedHwId = addLessonState.hwId; const savedHwTitle = addLessonState.hwTitle; addLessonState = null;
        const success = await submitHomeworkToFirebase(savedHwId, question);
        if (success) { addMessage(`<p>✅ Ваш ответ на задание "<strong>${savedHwTitle}</strong>" отправлен Мастеру на проверку!</p>`); showMainMenu(); }
        else { addMessage('<p>❌ Ошибка отправки.</p>'); }
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
        const success = await addCommentToFirebase(addLessonState.lessonId, question, addLessonState.type);
        if (success) { addMessage(`<p>✅ Комментарий добавлен!</p>`); setTimeout(() => { showLessonContent(addLessonState.lessonId); }, 500); }
        else { addMessage('<p> Ошибка.</p>'); }
        addLessonState = null; return '';
    }
    if (addLessonState && addLessonState.step === 'edit_comment') {
        if (q === 'отмена') { addLessonState = null; return '<p> Отменено.</p>'; }
        const success = await updateCommentInFirebase(addLessonState.commentId, question);
        if (success) { addMessage(`<p>✅ Обновлён!</p>`); showLessonContent(addLessonState.lessonId); }
        else { addMessage('<p>❌ Ошибка.</p>'); }
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
            const success = await updateLessonInFirebase(lessonId, { title: addLessonState.newTitle });
            if (success) { addMessage(`<p>✅ Название изменено!</p>`); loadLessonsFromFirebase(); }
            else { addMessage('<p>❌ Ошибка.</p>'); }
            addLessonState = null; return '';
        }
        if (addLessonState.step === 'edit_content') {
            if (q !== 'пропустить') addLessonState.newContent = question; else addLessonState.newContent = lesson.content;
            if (addLessonState.editAll) { addLessonState.step = 'edit_media'; return `<p>Новая ссылка (или <em>"пропустить"</em>, <em>"нет"</em>):</p>`; }
            const success = await updateLessonInFirebase(lessonId, { content: addLessonState.newContent });
            if (success) { addMessage(`<p>✅ Текст обновлён!</p>`); loadLessonsFromFirebase(); }
            else { addMessage('<p>❌ Ошибка.</p>'); }
            addLessonState = null; return '';
        }
        if (addLessonState.step === 'edit_media') {
            let newMedia = q === 'пропустить' ? lesson.media_url : (q === 'нет' ? '' : question);
            const updates = {};
            if (addLessonState.newTitle !== undefined) updates.title = addLessonState.newTitle;
            if (addLessonState.newContent !== undefined) updates.content = addLessonState.newContent;
            updates.media_url = newMedia;
            const success = await updateLessonInFirebase(lessonId, updates);
            if (success) { addMessage(`<p>✅ Урок обновлён!</p>`); loadLessonsFromFirebase(); }
            else { addMessage('<p>❌ Ошибка.</p>'); }
            addLessonState = null; return '';
        }
    }
    if (addLessonState && currentUser && isAdmin()) {
        if (addLessonState.step === 'confirm_delete') {
            if (q === 'да, удалить' || q === 'да' || q === 'удалить') {
                const success = await deleteLesson(addLessonState.lessonId);
                if (success) { addMessage(`<p>✅ Урок удалён!</p>`); loadLessonsFromFirebase(); }
                else { addMessage('<p>❌ Ошибка.</p>'); }
            } else { addMessage('<p>❌ Отменено.</p>'); }
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
            const success = await addLessonToFirebase(addLessonState.category, addLessonState.title, addLessonState.content, mediaUrl);
            if (success) { addMessage(`<p>✅ Урок добавлен!</p>`); loadLessonsFromFirebase(); }
            else { addMessage('<p>❌ Ошибка.</p>'); }
            addLessonState = null; return '';
        }
    }
    
    // Если пользователь не авторизован — обработка входа
    if (!currentUser) {
        if (q.includes('имя') || q.includes('зовут') || q.includes('ранг') || q.includes('пароль') || q.includes('учитель')) {
            const userData = parseUserInput(question);
            if (userData.name && userData.ранг && userData.пароль) {
                let foundUser = null;
                for (let key in usersDatabase) {
                    const user = usersDatabase[key];
                    if (user.fullName.toLowerCase() === userData.name) { foundUser = user; break; }
                }
                if (!foundUser) foundUser = usersDatabase[userData.name];
                if (foundUser && foundUser.ранг === userData.ранг && foundUser.пароль === userData.пароль) {
                    currentUser = { name: foundUser.fullName, ранг: foundUser.ранг, учитель: userData.учитель || foundUser.учитель };
                    saveUserToStorage(); 
                    updateLogoutButton(); 
                    await loadLessonsFromFirebase(); 
                    await loadAssignments(); 
                    await loadSubmissions();
                    await registerUserIfNeeded();
                    addMessage(getRankGreeting(currentUser));
                    showMainMenu();
                    return '';
                } else { return '<p>Данные не найдены. Проверьте Имя, Ранг и Пароль.</p>'; }
            } else { return '<p>Назови Имя, Ранг, Учителя и Пароль.</p>'; }
        }
        return '<p>Назови своё Имя, Ранг, Учителя и Пароль.</p>';
    }
    
    // Команды авторизованного пользователя
    if (q.includes('выйти') || q.includes('logout')) { handleLogout(); return ''; }
    if (q.includes('очистить историю') || q.includes('очистить переписку')) { clearHistory(); chatContainer.innerHTML = ''; addMessage('<p>🧹 Очищено.</p>'); return ''; }
    if (q.includes('оглавлен') || q.includes('меню')) { showMainMenu(); return ''; }
    
    // Поиск по знаниям
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

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) return;
    isInitialized = true;
    
    applySeasonTheme();
    renderKeyboard();
    
    setTimeout(async () => {
        loadUserFromStorage();
        
        const container = document.getElementById('chat-container');
        if (container) container.innerHTML = '';
        
        if (currentUser) { 
            await loadLessonsFromFirebase(); 
            await loadAssignments(); 
            await loadSubmissions(); 
            updateLogoutButton();
            addMessage(getRankGreeting(currentUser));
            showMainMenu();
        } else {
            addMessage(getStrangerGreeting());
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

// ===== ЭКСПОРТ ВСЕХ ФУНКЦИЙ =====
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
window.showCustomAlert = showCustomAlert;
window.showCustomConfirm = showCustomConfirm;
window.showCustomPrompt = showCustomPrompt;

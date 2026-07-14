window.AKASHA_CONFIG = {
    // Основной рекомендуемый режим: PHP 8.1+ и SQLite/JSON в папке data.
    storage: 'php',
    apiUrl: 'api.php',

    // Необязательный Firebase-режим оставлен для миграции старых данных.
    // Для публичного запуска используйте PHP-режим: там есть серверная авторизация и права доступа.
    firebase: {
        enabled: false
    },

    appName: 'Акаша',
    version: '2.5.0',
    sessionRefreshMinutes: 10
};

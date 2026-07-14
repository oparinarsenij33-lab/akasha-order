<?php
declare(strict_types=1);

// Стартовый набор пользователей для первого запуска. После переноса аккаунтами управляет база через админ-панель.
// Пароли хранятся только как password_hash.
return [
    [
        'name' => 'Аранэль Хальдарон',
        'rank' => 'верховный магистр',
        'teacher' => 'отсутствует',
        'password_hash' => '$2y$12$vOPEie0m32XcAw.8RrbkGuoxe/vkulHw09daWYjRpoiD34toMLn3G',
        'aliases' => ['аранэль хальдарон'],
        'specialTitle' => 'Верховный Магистр',
        'description' => 'Глава Ордена Вольных Джедаев',
    ],
    [
        'name' => 'Дорхат Минас Тур',
        'rank' => 'мастер',
        'teacher' => 'отсутствует',
        'password_hash' => '$2y$12$DFVKYL7rWBrVnQfVcTle2etURAS.YGFUiDTQjjsizvINSP.j4PCMW',
        'aliases' => ['дорхат минас тур'],
        'specialTitle' => 'Заместитель Верховного Магистра',
        'description' => 'Глава безопасности Ордена, Мастер Боевой Магии и специалист по защите от тёмных искусств',
    ],
    [
        'name' => 'Нарнэлион Эдрад',
        'rank' => 'мастер',
        'teacher' => 'отсутствует',
        'password_hash' => '$2y$12$Em2oVEgahw7666R9v7aj..3ya7fWJHyq2NIyAnTxLZ1DKQ9n2HAEG',
        'aliases' => ['нарнэлион эдрад'],
        'specialTitle' => 'Мастер Артефактов и Целительства',
        'description' => 'Мастер магических артефактов, потусторонних миров и целительства',
    ],
    [
        'name' => 'Рондрил Лаур',
        'rank' => 'мастер',
        'teacher' => 'отсутствует',
        'password_hash' => '$2y$12$tBzDep7ri2yxlPGzDv4Ufu281RzqgBBHv64F6sJ9rCjWhToayOMX6',
        'aliases' => ['рондрил лаур'],
        'specialTitle' => 'Мастер-Целитель',
        'description' => 'Мастер-Целитель, специалист по травам и физическому целительству',
    ],
    [
        'name' => 'Далисса Иденааль Вестуро',
        'rank' => 'старший падаван',
        'teacher' => 'Аранэль Хальдарон',
        'password_hash' => '$2y$12$rmFy1S1f1EZgUitRZXSVguFRos61pDSisSm2ZqJoRXTvAWFArdJTa',
        'aliases' => ['далисса вестуро', 'далисса иденааль вестуро'],
    ],
    [
        'name' => 'Даниил Ионов',
        'rank' => 'падаван',
        'teacher' => 'Нарнэлион Эдрад',
        'password_hash' => '$2y$12$Hgzuz/bAdytwKhDHNkOlkOGUY/8f/muBl5XDTUYFgTUVY32u4Vus6',
        'aliases' => ['даниил ионов'],
    ],
    [
        'name' => 'Кайренарт Авандалэр Ветэрмайтерос',
        'rank' => 'юнлинг',
        'teacher' => 'отсутствует',
        'password_hash' => '$2y$12$9b38JK//rkAOuxjksPtCwuCM8.RHClFvBJSoPr.VxRkosyf3/J1sy',
        'aliases' => ['кайренарт ветэрмайтерос', 'кайренарт авандалэр ветэрмайтерос'],
    ],
    [
        'name' => 'Тейраналь Арианарт Лоаннен-Тиарастес',
        'rank' => 'юнлинг',
        'teacher' => 'отсутствует',
        'password_hash' => '$2y$12$27YZd1WudXp0hPOI9XSdBuRNC2yvXYB08cgxApDVfDaa4IXCvt/U.',
        'aliases' => ['тейраналь лоаннен-тиарастес', 'тейраналь арианарт лоаннен-тиарастес'],
    ],
    [
        'name' => 'Асстария Авангорн Ламанш',
        'rank' => 'юнлинг',
        'teacher' => 'отсутствует',
        'password_hash' => '$2y$12$p9ydnYWqMrXAtmqcQUC.wewh/mkqNFYSOoiU4uOKCnwjkC31bcfwu',
        'aliases' => ['асстария ламанш', 'асстария авангорн ламанш'],
    ],
    [
        'name' => 'Наталья Кузовцова',
        'rank' => 'юнлинг',
        'teacher' => 'отсутствует',
        'password_hash' => '$2y$12$gNFCG4U0oDXvvtleks/bZ.Vex3fD/BZ5MNzqhvzPtLHlnpwJUVfM.',
        'aliases' => ['наталья кузовцова'],
    ],
];

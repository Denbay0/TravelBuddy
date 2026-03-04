# TravelBuddy

TravelBuddy — fullstack проект на **FastAPI + React/Vite** с cookie-auth (JWT + CSRF), маршрутами, сообществом, поиском, PDF-отчётами, картой (Leaflet) и поддержкой светлой/тёмной темы.

## Актуальная архитектура

- `app/` — backend API (FastAPI, SQLAlchemy, PostgreSQL, Redis).
- `web/` — frontend (React + Vite + Tailwind).
- `docker-compose.local.yml` — локальный режим разработки.
- `docker-compose.server.yml` — серверный режим behind nginx/HTTPS.
- `.env.local.example` / `.env.server.example` — шаблоны env для каждого режима.

## Ключевые возможности

- Авторизация: `register/login/logout`, `GET /auth/me`, `GET /auth/csrf`.
- Профиль: просмотр и редактирование `PATCH /profile/me`, аватар.
- Маршруты: создание/редактирование/сохранение, популярные маршруты.
- Создание маршрута с картой OpenStreetMap + расчетом расстояния на backend (`POST /routes/preview`).
- Сообщество: публикации, лайки, сохранения, комментарии.
- Поиск по маршрутам/постам (`GET /search?q=...`).
- PDF:
  - `GET /reports/example`
  - `GET /reports/example/pdf`
  - `GET /reports/routes/{routeId}/pdf`
- UI: mobile-first адаптация, переключение dark/light theme с сохранением в `localStorage`.

## Быстрый старт (Local)

1. Создайте env:

```bash
cp .env.local.example .env.local
```

2. Запустите:

```bash
docker compose -f docker-compose.local.yml up -d --build
```

3. Откройте:
- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`

Остановка:

```bash
docker compose -f docker-compose.local.yml down
```

## Запуск на сервере (Server)

1. Создайте env:

```bash
cp .env.server.example .env.server
```

2. Запустите:

```bash
docker compose -f docker-compose.server.yml up -d --build
```

Особенности server mode:
- backend и frontend проброшены на loopback (`127.0.0.1`),
- внешний HTTPS/доменный трафик обслуживает nginx,
- `COOKIE_SECURE=true`, `COOKIE_DOMAIN` из `.env.server`.

## Обновление сервера после `git pull`

```bash
git pull
docker compose -f docker-compose.server.yml up -d --build
docker compose -f docker-compose.server.yml ps
```

## HTTPS / nginx-compatible setup

- `docker-compose.server.yml` рассчитан на reverse proxy (nginx) с TLS.
- API и frontend не публикуются наружу напрямую на 0.0.0.0 в прод-режиме.
- Cookie auth работает в доменном режиме при корректных `COOKIE_DOMAIN`, `COOKIE_SECURE`, `APP_BASE_URL`, CORS.

## Проверка основных сценариев

1. **Home**: начать путешествие, смотреть демо, сгенерировать PDF, начать бесплатно, ссылки footer.
2. **Auth**: register/login/logout, проверка обновления шапки после входа.
3. **Профиль**: загрузка профиля, редактирование, аватар.
4. **Маршруты**: обе кнопки «создать маршрут», карта, distance preview, популярные, открытие карточки маршрута.
5. **Сообщество**: создать публикацию, лайки/сохранения, комментарии.
6. **Поиск**: ввод в шапке фильтрует маршруты/посты.
7. **PDF**: скачивание example report и route report.
8. **UI**: мобилка + переключение тем.

## Env-файлы

- Local: `.env.local` (из `.env.local.example`)
- Server: `.env.server` (из `.env.server.example`)

В репозиторий коммитятся только примеры, рабочие env не коммитятся.

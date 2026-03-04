# TravelBuddy (FastAPI + React/Vite + PostgreSQL + Redis)

Проект поддерживает **два отдельных режима запуска**: `local` и `server`.
Один и тот же код запускается разными env/compose файлами — без ручного переписывания конфигов после `git pull`.

## 1) Файлы окружений

В репозитории есть шаблоны:

- `.env.example` — общий базовый шаблон
- `.env.local.example` — настройки для локальной разработки
- `.env.server.example` — настройки для сервера (`https://fishingteam.su`)

### Подготовка local

```bash
cp .env.local.example .env.local
```

### Подготовка server

```bash
cp .env.server.example .env.server
```

> В git не коммитятся рабочие `.env.local` и `.env.server`.

---

## 2) Запуск локально (Local mode)

Используется `docker-compose.local.yml`.

```bash
docker compose -f docker-compose.local.yml up -d --build
```

После запуска:

- frontend: `http://127.0.0.1:5173` (или `http://localhost:5173`)
- backend: `http://127.0.0.1:8000`
- docs: `http://127.0.0.1:8000/docs`

Особенности local:

- `COOKIE_SECURE=false`
- CORS и origins рассчитаны на `localhost`/`127.0.0.1`
- frontend работает через Vite dev server и proxy на backend

Остановка:

```bash
docker compose -f docker-compose.local.yml down
```

---

## 3) Запуск на сервере (Server mode)

Используется `docker-compose.server.yml`.

```bash
docker compose -f docker-compose.server.yml up -d --build
```

Особенности server:

- backend публикуется только на `127.0.0.1:8000`
- frontend preview публикуется только на `127.0.0.1:4173`
- PostgreSQL и Redis **не торчат наружу**
- внешний трафик обслуживает nginx
- `COOKIE_SECURE=true`, `COOKIE_DOMAIN=fishingteam.su`

Остановка:

```bash
docker compose -f docker-compose.server.yml down
```

---

## 4) Быстрое переключение окружений

Локально:

```bash
docker compose -f docker-compose.local.yml up -d --build
```

На сервере:

```bash
docker compose -f docker-compose.server.yml up -d --build
```

Никакого ручного редактирования одного общего `.env` не требуется.

---

## 5) Что важно в env

Ключевые переменные backend:

- `ENV`, `DEBUG`
- `FRONTEND_ORIGINS`
- `CORS_ALLOW_ORIGINS`
- `COOKIE_SECURE`, `COOKIE_DOMAIN`, `COOKIE_SAMESITE`, `COOKIE_PATH`
- `APP_BASE_URL`

Ключевые переменные frontend (Vite):

- `VITE_API_BASE_URL`
- `VITE_MEDIA_BASE_URL`
- `VITE_DEV_PROXY_TARGET`
- `VITE_ALLOWED_HOSTS`

---

## 6) Обновление сервера после git pull

Типичный сценарий:

```bash
git pull
docker compose -f docker-compose.server.yml up -d --build
docker compose -f docker-compose.server.yml ps
```

Если менялись только backend/frontend контейнеры, Compose сам пересоберёт нужные сервисы.

---

## 7) Проверка интеграции frontend ↔ backend

Минимальный smoke-check:

1. Зарегистрироваться: `/register`
2. Войти: `/login`
3. Проверить `GET /auth/me` через открытие `/profile`
4. Проверить маршруты `/routes`
5. Проверить ленту `/community`
6. Проверить logout

Для API-контрактов: `http://127.0.0.1:8000/docs` (в local режиме).

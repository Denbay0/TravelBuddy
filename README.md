# TravelBuddy (FastAPI + React/Vite + PostgreSQL + Redis)

Учебный fullstack-проект с JWT-аутентификацией через cookies, CSRF-защитой и профилем пользователя.

## Структура проекта

```text
.
├── app/
│   ├── api/
│   │   ├── auth.py
│   │   ├── deps.py
│   │   └── profile.py
│   ├── core/
│   │   ├── config.py
│   │   ├── redis.py
│   │   └── security.py
│   ├── db/
│   │   ├── database.py
│   │   └── models.py
│   ├── schemas/
│   │   ├── auth.py
│   │   └── user.py
│   ├── main.py
│   └── utils_profile.py
├── media/
│   └── avatars/
│       └── default.svg
├── tests/
├── web/
├── .dockerignore
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── README.md
└── requirements.txt
```

## Что реализовано

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /auth/csrf`

### Профиль

- `GET /profile/me`
- `PATCH /profile/me`
- `POST /profile/avatar`
- `DELETE /profile/avatar`

## Хранилище данных

- Основная база: **PostgreSQL** (SQLAlchemy URL через `DATABASE_URL`).
- Кэш/инфраструктура: **Redis** (подключение и ping на старте через `REDIS_URL`).
- Медиа-файлы: директория `media/` (в БД хранится только путь аватара).

## Локальный запуск backend (без Docker)

1. Создайте виртуальное окружение:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Установите зависимости:

```bash
pip install -r requirements.txt
```

3. Создайте `.env` на основе примера:

```bash
cp .env.example .env
```

4. Убедитесь, что PostgreSQL и Redis доступны по URL из `.env`.

5. Запустите сервер:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Документация API: `http://127.0.0.1:8000/docs`

## Запуск через Docker Compose

```bash
docker compose up --build
```

Снаружи:

- frontend: `http://127.0.0.1:5173`
- backend docs: `http://127.0.0.1:8000/docs`

Внутри docker-сети:

- backend -> postgres: `postgres:5432`
- backend -> redis: `redis:6379`

## Docker-сервисы

- `backend` — FastAPI
- `frontend` — React/Vite (dev server на `0.0.0.0:5173`)
- `postgres` — PostgreSQL 16
- `redis` — Redis 7

## Переменные окружения

Минимальный набор:

- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_COOKIE_NAME`
- `CSRF_COOKIE_NAME`
- `COOKIE_SECURE`
- `COOKIE_SAMESITE`
- `COOKIE_PATH`
- `FRONTEND_ORIGINS`

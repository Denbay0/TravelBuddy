# TravelBuddy Auth Backend (FastAPI + SQLite)

Учебный backend-проект с JWT-аутентификацией через cookies, CSRF-защитой и базовым профилем пользователя.

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
│   │   └── security.py
│   ├── db/
│   │   ├── database.py
│   │   └── models.py
│   ├── schemas/
│   │   ├── auth.py
│   │   └── user.py
│   ├── main.py
│   └── utils_profile.py
├── data/
├── media/
│   └── avatars/
│       └── default.svg
├── tests/
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

## Особенности

- единая точка входа: `app/main.py`
- запуск сервера: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
- username: 3–32 символа, только латиница, цифры и `_`
- автоматическая генерация уникального handle (`@username`, `@username1`, ...)
- обновление handle при изменении username
- загрузка аватара в `media/avatars/`
- допустимые форматы: `.jpg`, `.jpeg`, `.png`, `.webp`
- ограничение размера аватара: 2MB
- дефолтный аватар: `/media/avatars/default.svg`
- Swagger: `GET /docs`

## Локальный запуск

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

4. Запустите сервер:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Swagger: `http://127.0.0.1:8000/docs`

## Запуск через Docker

```bash
docker compose up --build
```

После запуска:

- frontend: `http://127.0.0.1:5173`
- backend docs (Swagger): `http://127.0.0.1:8000/docs`

### Адреса в dev-среде

- Внутри контейнеров сервисы слушают `0.0.0.0`.
- С хоста открывайте сервисы через `127.0.0.1`, а не `localhost`.
- Для связи контейнеров между собой используйте имена Docker-сервисов.

### Volume'ы в Docker

- `./data:/app/data` — SQLite база
- `./media:/app/media` — пользовательские аватары

## Примечание по SQLite

Если у вас была старая SQLite БД без новых полей пользователя, проще удалить локальный файл БД и пересоздать его:

```bash
rm -f data/travelbuddy.db
```

После следующего запуска таблицы создадутся заново.

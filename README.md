# TravelBuddy Auth Backend (FastAPI + SQLite)

Простой backend-проект с JWT-аутентификацией через cookies и CSRF-защитой.

## Структура проекта

```text
.
├── app/
│   ├── api/
│   │   ├── auth.py
│   │   └── deps.py
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   ├── db/
│   │   ├── database.py
│   │   └── models.py
│   ├── schemas/
│   │   ├── auth.py
│   │   └── user.py
│   └── main.py
├── data/
├── .dockerignore
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── main.py
├── README.md
└── requirements.txt
```

## Что реализовано

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /auth/csrf`
- JWT-аутентификация
- CSRF (double-submit cookie)
- Cookies
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
uvicorn app.main:app --reload
```

Swagger будет доступен по адресу: `http://127.0.0.1:8000/docs`

## Запуск через Docker

1. Соберите образ:

```bash
docker build -t travelbuddy-backend .
```

2. Запустите через Docker Compose:

```bash
docker compose up --build
```

Swagger будет доступен по адресу: `http://127.0.0.1:8000/docs`

## Переменные окружения

Смотрите `.env.example`:

- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `DATABASE_URL`
- `CSRF_COOKIE_NAME`
- `JWT_COOKIE_NAME`

## Примечание по SQLite

- Локально и в Docker база хранится в файле `data/travelbuddy.db`.
- В `docker-compose.yml` папка `data/` примонтирована как volume (`./data:/app/data`), поэтому база не теряется после пересоздания контейнера.

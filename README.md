# TravelBuddy Auth MVP (FastAPI + SQLite)

Минимальный backend-модуль аутентификации на FastAPI.

## Что реализовано

- Регистрация пользователя (`/auth/register`)
- Логин по `username` или `email` + `password` (`/auth/login`)
- JWT access token в **HttpOnly cookie**
- CSRF-защита по схеме **double-submit cookie**
- Текущий пользователь (`/auth/me`)
- Выход (`/auth/logout`)
- Получение/обновление CSRF токена (`/auth/csrf`)
- Заглушка `refresh` (`/auth/refresh`, намеренно без refresh-token логики для MVP)

## Структура проекта

```text
.
├── app
│   ├── auth.py
│   ├── config.py
│   ├── database.py
│   ├── dependencies.py
│   ├── models.py
│   ├── routers
│   │   └── auth.py
│   └── schemas.py
├── main.py
└── requirements.txt
```

## Быстрый запуск

### 1) Создать и активировать виртуальное окружение

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 2) Установить зависимости

```bash
pip install -r requirements.txt
```

### 3) Запустить сервер

```bash
uvicorn main:app --reload
```

Сервис будет доступен на:
- API: `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/docs`

## Как тестировать cookie auth в Swagger

1. Откройте `/docs`.
2. Выполните `POST /auth/register`.
3. Выполните `POST /auth/login`.
   - JWT автоматически установится в HttpOnly cookie.
   - CSRF token вернётся в теле ответа и сохранится в cookie `csrf_token`.
4. Для `POST /auth/logout` нажмите **Try it out** и добавьте заголовок `X-CSRF-Token` со значением токена из login-ответа.
5. `GET /auth/me` должен вернуть текущего пользователя, если JWT cookie валиден.

> Кнопка **Authorize** в Swagger здесь не обязательна, потому что авторизация идет через cookie.

## Примеры запросов

### Регистрация

```bash
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "password": "strongpass123",
    "repeat_password": "strongpass123"
  }'
```

### Логин

```bash
curl -i -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "alice",
    "password": "strongpass123"
  }'
```

### Текущий пользователь

```bash
curl -X GET http://127.0.0.1:8000/auth/me \
  --cookie "access_token=<JWT_FROM_SET_COOKIE>"
```

### Logout (с CSRF)

```bash
curl -X POST http://127.0.0.1:8000/auth/logout \
  -H "X-CSRF-Token: <CSRF_TOKEN>" \
  --cookie "access_token=<JWT_FROM_SET_COOKIE>; csrf_token=<CSRF_TOKEN>"
```

## Безопасность (важно)

- `access_token` cookie: `httponly=True`.
- `samesite="lax"` выбран как практичный баланс для учебного cookie-based auth.
- `secure=False` оставлен только для локальной разработки.
  - В production обязательно переключить на `secure=True` и HTTPS.
- Пароли хранятся только в хешированном виде (`passlib[bcrypt]`).

## Конфигурация

По умолчанию используются значения из `app/config.py`.
Можно переопределять через `.env`:

```env
DATABASE_URL=sqlite:///./travelbuddy.db
JWT_SECRET_KEY=super-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_COOKIE_NAME=access_token
CSRF_COOKIE_NAME=csrf_token
```

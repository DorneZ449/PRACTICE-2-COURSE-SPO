<div align="center">

# PassGen Pro

**Secure password generator: FastAPI + SQLite + vanilla JS, с REST API, историей, оценкой надёжности и 1:1 Figma-прототипом.**

[![CI](https://github.com/DorneZ449/PRACTICE-2-COURSE-SPO/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/DorneZ449/PRACTICE-2-COURSE-SPO/actions/workflows/tests.yml)
![Coverage](https://img.shields.io/badge/coverage-pytest--cov-6f42c1?logo=pytest&logoColor=white)
![Python](https://img.shields.io/badge/python-3.11%2B-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)
![Code style: black](https://img.shields.io/badge/code%20style-black-000000)
![License](https://img.shields.io/badge/license-MIT-yellow)

[Возможности](#-возможности) ·
[Стек](#-стек) ·
[Запуск](#-запуск) ·
[Тесты](#-тесты-и-качество-кода) ·
[REST API](#-rest-api) ·
[Архитектура](#-архитектура) ·
[Figma](#-figma-макет) ·
[Авторы](#-авторы) ·
[Лицензия](#-лицензия)

</div>

---

> Учебная практика, задача № 10 «Разработка программного решения "Генератор паролей"». Каждый участник в своей части совмещает роли аналитика, дизайнера, frontend- и backend-разработчика.

## ✨ Возможности

- **Криптогенерация** паролей длиной от 6 до 32 символов в UI (REST API — до 64), на базе `secrets.SystemRandom`.
- Гибкий выбор классов символов (A–Z / a–z / 0–9 / спецсимволы).
- **Оценка надёжности** — уровни Weak / Medium / Strong / Very Strong и расчёт энтропии в битах.
- **Копирование пароля в буфер обмена** одной кнопкой через Clipboard API + тост-уведомление.
- **История** сгенерированных паролей в локальной SQLite-базе с copy / delete / clear.
- **REST API** (`/api/generate`, `/api/check`, `/api/history`, `/api/health`) с автодокументацией Swagger UI на `/docs`.
- Полностью адаптивный интерфейс (Desktop / Tablet / Mobile), 1:1 повторяющий Figma-макет.
- Интерактивный Figma-прототип со связями GENERATE / COPY / HISTORY / CLEAR / BACK.

> ⚠️ **Область применения.** Учебный проект. Пароли в истории сохраняются в локальную SQLite в **открытом виде**, REST-эндпоинты не защищены аутентификацией. Не использовать как продакшн password manager.

## 🛠 Стек

| Слой | Технологии |
| --- | --- |
| **Backend** | FastAPI · Uvicorn · Pydantic v2 |
| **Хранилище** | SQLite (`sqlite3` stdlib) |
| **Frontend** | Jinja2 SSR · Vanilla JS · Clipboard API |
| **Дизайн** | Figma (макет + интерактивный прототип) |
| **Качество** | pytest · pytest-cov · ruff · black · GitHub Actions · Codecov |

## 🚀 Запуск

### Linux / macOS

```bash
git clone https://github.com/DorneZ449/PRACTICE-2-COURSE-SPO.git passgen-pro
cd passgen-pro
./run.sh
```

### Windows

```bat
run.bat  - файл в корневой папке проекта
```

### Вручную

Рекомендуемая версия Python — **3.11–3.14** (зависимости в `requirements.txt` указаны с верхней границей по мажорной версии, поэтому актуальные релизы устанавливаются без проблем).

```bash
python -m venv .venv
source .venv/bin/activate          # Linux/macOS
# .venv\Scripts\activate           # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

- UI: <http://127.0.0.1:8000>
- Swagger UI: <http://127.0.0.1:8000/docs>

## 🧪 Тесты и качество кода

```bash
pip install -r requirements-dev.txt
pytest -q --cov=app --cov-report=term-missing
ruff check .
black --check .
```

В наборе:

- `tests/test_generator.py` — границы длины, наличие нужных классов символов, уникальность.
- `tests/test_strength.py` — корректность лейблов и энтропии для типичных паролей.
- `tests/test_api.py` — сквозные REST-сценарии (`/api/generate`, `/api/check`, история).

CI ([`.github/workflows/tests.yml`](.github/workflows/tests.yml)) гонит `ruff`, `black --check` и `pytest` на Python 3.11 и 3.12, а покрытие отправляет в Codecov — статус виден в бейджах сверху.

## 🌐 REST API

| Метод   | Путь                        | Описание                               |
|---------|-----------------------------|----------------------------------------|
| `POST`  | `/api/generate`             | Сгенерировать пароль (+ сохранить)     |
| `POST`  | `/api/check`                | Оценить надёжность произвольной строки |
| `GET`   | `/api/history?limit&offset` | История сгенерированных паролей        |
| `DELETE`| `/api/history`              | Полностью очистить историю             |
| `DELETE`| `/api/history/{id}`         | Удалить одну запись                    |
| `GET`   | `/api/health`               | Health-check (`{"status":"ok"}`)       |

Пример:

```bash
curl -X POST http://127.0.0.1:8000/api/generate \
  -H 'Content-Type: application/json' \
  -d '{"length": 20, "use_symbols": true}'
```

```json
{
  "password": "M7K5r;JM!q3X8aB#7Lf",
  "length": 20,
  "type_summary": "A-Z, a-z, 0-9, symbols",
  "strength": {
    "label": "Very Strong",
    "css_class": "very-strong",
    "color": "#22C55E",
    "score": 7,
    "percent": 100,
    "entropy_bits": 130.78,
    "description": "Excellent length and character diversity. Safe to use."
  },
  "saved_id": 42
}
```

## 🏗 Архитектура

```
passgen-pro/
├── app/                       # FastAPI-приложение
│   ├── main.py                # точки входа: SSR + REST API
│   ├── generator.py           # криптогенератор паролей
│   ├── strength.py            # оценка надёжности и энтропии
│   ├── db.py                  # SQLite-слой
│   ├── schemas.py             # Pydantic-модели
│   ├── templates/             # Jinja2-шаблоны (index, history, _lock)
│   └── static/                # css / js / img
├── tests/                     # pytest: генератор, надёжность, REST API
├── docs/                      # описание ролей и этапов
├── .github/workflows/         # GitHub Actions: ruff + black + pytest + Codecov
├── pyproject.toml             # конфиг ruff / black
├── requirements.txt           # рантайм-зависимости
├── requirements-dev.txt       # dev-зависимости (pytest, pytest-cov, ruff, black)
└── run.sh / run.bat           # запуск программы Linux / Windows
```

## 🎨 Figma-макет

Дизайн и интерактивный прототип проекта живут в одном Figma-файле:

**[PassGen Pro · Figma](https://www.figma.com/design/1FdC5Nv738sPnKGK3JFo9J/PassGen-Pro)**

В файле собраны:

- Cover, Design tokens (палитра, типографика, радиусы, отступы) и Components (UI-библиотека).
- Раздел **«Длина пароля и выбор классов символов»** (Скуратов Дмитрий) — desktop-экраны Default 16 / 6 / 64 / Только цифры + mobile-экраны Default и Length 64.
- Раздел **«Копирование в буфер обмена и проверка надёжности»** (Скуратов Алексей) — desktop-экраны Generated, After copy, Strength matrix, History (filled / empty) + mobile-экраны Generated и After copy.
- Прототип-связи между экранами (GENERATE / COPY / HISTORY / CLEAR / BACK).

## 👥 Авторы

| Участник | Основные модули и вклад |
|----------|--------------------------|
| **Скуратов Дмитрий** | Структура проекта, скелет FastAPI-приложения, оценка надёжности (`app/strength.py`), базовые HTML-шаблоны и CSS, адаптивные медиазапросы, набор автотестов и финальная документация. |
| **Скуратов Алексей** | Криптостойкий генератор (`app/generator.py`), слой SQLite (`app/db.py`, `app/schemas.py`), клиентский JavaScript (Clipboard API, тосты, слайдер), страница истории и Figma-прототип. |

Работа велась через GitHub в ветках `Skuratov_Dmitry` и `Skuratov_Alexey`, объединённых в `main`.

Полная карта этапов **Проектирование → Разработка → Тестирование** и совмещённые роли (аналитик, дизайнер, frontend-, backend-разработчик) — в [`docs/process.md`](docs/process.md).

## 🤖 Помощь ИИ-ассистента

При разработке проекта использовалась связка двух ИИ-инструментов:

- **Claude Code Opus 4.7 Max (Anthropic)** — на момент сдачи лидирующая нейросеть в области программирования: модель удерживает первые места в индустриальных бенчмарках по решению реальных инженерных задач и применяется ведущими IT-компаниями для автоматизации разработки. Привлекалась к написанию кода, ревью изменений, подготовке тестов и сборке Figma-прототипа.
- **ChatGPT 5.5 Thinking (OpenAI)** — флагманская reasoning-модель с расширенной цепочкой рассуждений; использовалась для координации процесса, декомпозиции задач на этапы, генерации и доводки промптов для Claude Code и сверки результатов между участниками команды.

Все архитектурные решения и итоговые формулировки принимались авторами проекта; ИИ-ассистенты выступали в роли ускорителей, а не самостоятельных авторов.

Доступ к обоим инструментам был получен на безвозмездной основе нестандартным путём — без оформления подписки и без покупки API-кредитов. Финансовых затрат на использование ИИ-ассистентов проект не нёс.
<img width="1920" height="2560" alt="image" src="https://github.com/user-attachments/assets/b0c0550f-a3b1-49bf-8352-a0ed910ea5b1" />

## 📄 Лицензия

[MIT](LICENSE) © 2026 Скуратов Дмитрий, Скуратов Алексей.

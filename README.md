# PassGen Pro — Secure Password Generator

> Web-приложение для генерации надёжных паролей: **FastAPI + SQLite + HTML/CSS/JS** + **Figma** для дизайн-макета.
>
> Учебная практика: «Разработка программного решения "Генератор паролей"».

![PassGen Pro](docs/cover.png)

## ✨ Возможности

- Генерация паролей длиной от 6 до 64 символов (по ТЗ — слайдер 6–32, REST API — до 64).
- Опции включения букв верхнего/нижнего регистра, цифр, специальных символов.
- Криптографически стойкая случайность (`secrets.SystemRandom`).
- Оценка надёжности с уровнями **Weak / Medium / Strong / Very Strong** + расчёт **энтропии в битах**.
- **Копирование пароля в буфер обмена** одной кнопкой (с тостом-уведомлением).
- **История** сгенерированных паролей в локальной **SQLite**-базе с возможностью копирования, удаления и очистки.
- **REST API** (`/api/generate`, `/api/check`, `/api/history`, `/api/health`) с автодокументацией Swagger UI.
- Полностью адаптивный интерфейс (Desktop / Tablet / Mobile), 1:1 повторяющий Figma-макет.
- Все экраны и состояния заранее собраны в **Figma-плагине** (см. `figma_plugin/`).

## 🏗️ Архитектура

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
├── tests/                     # pytest: генератор, силa, REST API
├── docs/                      # описание ролей и этапов
├── requirements.txt
└── run.sh / run.bat
```

## 🚀 Запуск

### Linux / macOS

```bash
git clone <repo-url> passgen-pro
cd passgen-pro
./run.sh
```

### Windows

```bat
run.bat
```

### Вручную

```bash
python -m venv .venv
source .venv/bin/activate          # Linux/macOS
# .venv\Scripts\activate           # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Открыть: **http://127.0.0.1:8000**.
Swagger UI с REST API: **http://127.0.0.1:8000/docs**.

## 🧪 Тесты

```bash
pip install -r requirements-dev.txt
pytest
```

В наборе:
- `tests/test_generator.py` — границы длины, наличие нужных классов символов, уникальность.
- `tests/test_strength.py` — корректность лейблов и энтропии для типичных паролей.
- `tests/test_api.py` — сквозные REST-сценарии (`/api/generate`, `/api/check`, история).

## 🎨 Figma-макет (плагин)

Дизайн собирается прямо в Figma скриптом-плагином — никаких внешних `.fig`-файлов не требуется.

1. В Figma → **Plugins → Development → Import plugin from manifest…**.
2. Выберите `figma_plugin/manifest.json` (или `figma_plugin_basic/manifest.json` как запасной вариант).
3. Запустите плагин **PassGen Pro – UI Design Kit**. Через несколько секунд на холсте появится:

| № | Экран                                       | Размер        |
|---|---------------------------------------------|---------------|
| 1 | Cover (обложка)                             | 1440 × 720    |
| 2 | Design tokens (палитра, типографика)        | 1440 × 720    |
| 3 | Components (UI library)                     | 1440 × 820    |
| 4 | Desktop · Home (default — Very Strong)      | 1440 × 1024   |
| 5 | Desktop · Strength matrix (Weak…VeryStrong) | 1440 × 1024   |
| 6 | Desktop · History (filled, 5 строк)         | 1440 × 1024   |
| 7 | Desktop · History (empty)                   | 1440 × 1024   |
| 8 | Mobile · Home                               | 420 × 900     |
| 9 | Mobile · History                            | 420 × 900     |
| 10| Tablet · Home                               | 820 × 1180    |

Plugin также прокладывает прототип-связи: **History** (на любой Home) → **Desktop · History**, **Back** (на History) → **Desktop · Home**.

## 🌐 REST API

| Метод   | Путь                        | Описание                             |
|---------|-----------------------------|--------------------------------------|
| `POST`  | `/api/generate`             | Сгенерировать пароль (+ сохранить)   |
| `POST`  | `/api/check`                | Оценить надёжность произвольной строки |
| `GET`   | `/api/history?limit&offset` | История сгенерированных паролей      |
| `DELETE`| `/api/history`              | Полностью очистить историю           |
| `DELETE`| `/api/history/{id}`         | Удалить одну запись                  |
| `GET`   | `/api/health`               | Health-check (`{"status":"ok"}`)     |

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

## 🧭 Этапы разработки и роли

См. [`docs/process.md`](docs/process.md): полная карта этапов **Проектирование → Разработка → Тестирование** и совмещённые роли (аналитик, дизайнер, frontend-, backend-разработчик).

## 📄 Лицензия

MIT — см. [`LICENSE`](LICENSE).

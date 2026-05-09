# PassGen Pro – UI Design Kit (Figma plugin) — v4

Этот плагин одной кнопкой собирает **полный design kit + кликабельный прототип**
PassGen прямо в текущем Figma-файле.

## Установка

1. Открой Figma (десктоп-клиент, **не браузер** — для импорта плагина нужен desktop).
2. Меню `Plugins → Development → Import plugin from manifest…`.
3. Выбери файл `figma_plugin/manifest.json`.
4. На пустом холсте: `Plugins → Development → PassGen Pro – UI Design Kit`.

Через несколько секунд появятся **15 фреймов** и связи прототипа.

## Что генерируется

### Дизайн-система (4 фрейма)

| Frame | Размер | Назначение |
|-------|--------|------------|
| Cover | 1440×720 | Обложка проекта |
| Design tokens | 1440×720 | Палитра, типографика, отступы |
| Components | 1440×820 | Buttons / Inputs / Slider / Checkbox / Badges / Toast |
| Strength matrix | 1440×1024 | 4 состояния силы пароля в 2×2 |

### PC-версия программы — Desktop (5 фреймов)

| Frame | Назначение |
|-------|-----------|
| Desktop · Home · Initial   | Стартовое состояние, пароль `M7K5r;JM!q3X8aB#` (Very Strong) |
| Desktop · Home · Generated | После клика на GENERATE, новый пароль `qP4!xvA9zN_lwJ#a` |
| Desktop · Home · Copied    | После клика на COPY — внизу появляется зелёный тост `Password copied` |
| Desktop · History · Filled | Таблица истории с 5 примерами (Weak…Very Strong) |
| Desktop · History · Empty  | Пустое состояние с CTA `GENERATE PASSWORD` |

### Мобильная версия — Mobile (5 фреймов)

| Frame | Назначение |
|-------|-----------|
| Mobile · Home · Initial   | Стартовый мобильный экран |
| Mobile · Home · Generated | После генерации — новый пароль |
| Mobile · Home · Copied    | После копирования — тост на мобайле |
| Mobile · History · Filled | Список истории, каждый элемент — карточка |
| Mobile · History · Empty  | Пустое состояние на мобайле |

### Tablet (1 фрейм)

| Frame | Назначение |
|-------|-----------|
| Tablet · Home | Адаптивная промежуточная версия 820×1180 |

## Прототип-связи

Плагин автоматически расставляет ~30 prototype-связей. Все кнопки рабочие:

**Desktop home flow**
- `Initial.GENERATE  → Generated`
- `Generated.GENERATE → Initial` (цикл)
- `Copied.GENERATE   → Initial`
- `*.COPY            → Copied` (на любом home)
- `*.HISTORY         → History · Filled`
- `*.RESET           → Initial`

**Desktop history flow**
- `Filled.BACK    → Home · Initial`
- `Filled.CLEAR   → History · Empty`
- `Empty.BACK     → Home · Initial`
- `Empty.CTA      → Home · Initial`

**Mobile** — те же связи, замкнутые на mobile-экраны (`Mobile · Home · Initial / Generated / Copied`, `Mobile · History · Filled / Empty`).

## Как запустить прототип

1. Выдели фрейм `PassGen Pro · Desktop · Home · Initial` (или `Mobile · Home · Initial`).
2. Нажми ▶ **Present** в правом верхнем углу.
3. Кликай по кнопкам **GENERATE / COPY / HISTORY / BACK / CLEAR** — экраны переключаются по prototype-связям.

## Шрифты

Inter (Regular / Medium / Semi Bold / Bold). Если шрифта нет — Figma попросит установить.

## Запасной плагин

Если основной плагин выдаёт ошибку (например, в облачной Figma без `documentAccess: dynamic-page`),
импортируй `figma_plugin_basic/manifest.json` — простой fallback на 2 экрана (Desktop + Mobile)
без prototype-связей.

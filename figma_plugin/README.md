# PassGen Pro — Figma plugin (UI Design Kit)

На этом этапе плагин создаёт **четыре опорных фрейма**:

1. **Cover** — обложка проекта.
2. **Design tokens** — цветовая палитра приложения.
3. **Components** — базовые компоненты (кнопки, чекбокс, поле пароля).
4. **Strength matrix** — четыре уровня надёжности (Weak / Medium / Strong / Very Strong).

Полные экраны (Home / History / Mobile) и рабочие prototype-связи появятся в
следующем коммите (`commit_12_figma_plugin_prototype_links`).

## Как импортировать в Figma
1. В десктоп-клиенте Figma открой меню `Plugins → Development → Import plugin from manifest…`.
2. Выбери файл `figma_plugin/manifest.json`.
3. На пустом холсте запусти `Plugins → Development → PassGen Pro – UI Design Kit`.
4. Через 1–2 секунды появятся 4 фрейма. Нажми **Shift+1**, чтобы вписать всё в экран.

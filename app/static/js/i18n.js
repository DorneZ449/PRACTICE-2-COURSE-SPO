/* PassGen Pro — переключение языка интерфейса (Русский / English).
   Язык сохраняется в localStorage и применяется ко всем страницам. */
(() => {
  'use strict';

  const DICT = {
    en: {
      'nav.api': 'API',
      'nav.history': 'History',
      'field.length': 'Password length',
      'btn.reset': 'RESET',
      'btn.generate': 'GENERATE PASSWORD',
      'opt.uppercase': 'Uppercase',
      'opt.lowercase': 'Lowercase',
      'opt.numbers': 'Numbers',
      'opt.symbols': 'Symbols',
      'meta.length': 'Length',
      'meta.charsets': 'Charsets',
      'meta.score': 'Score',
      'meta.entropy': 'Entropy',
      'unit.bits': 'bits',
      'btn.back': 'BACK',
      'btn.clear': 'CLEAR',
      'history.title': 'History',
      'history.subtitle': 'Saved passwords',
      'th.password': 'Password',
      'th.length': 'Length',
      'th.charsets': 'Charsets',
      'th.strength': 'Strength',
      'th.entropy': 'Entropy',
      'th.date': 'Date',
      'empty.title': 'History is empty',
      'empty.text': 'Generate the first password and it will appear on this page.',
      'empty.btn': 'GENERATE PASSWORD',
      'aria.delete': 'Delete',
      'title.home': 'PassGen Pro — Secure password generator',
      'title.history': 'PassGen Pro — History',
      'cs.symbols': 'symbols',
      'cs.none': 'none',
      'strength.weak': 'Weak',
      'strength.medium': 'Medium',
      'strength.strong': 'Strong',
      'strength.very-strong': 'Very Strong',
      'strength.desc.empty': 'Empty password.',
      'strength.desc.weak': 'Use more characters and add different symbol types.',
      'strength.desc.medium': 'Good start, but a longer password with more types is safer.',
      'strength.desc.strong': 'Several character groups and a safe length.',
      'strength.desc.very-strong': 'Excellent length and character diversity. Safe to use.',
      'toast.generated': 'New password generated',
      'toast.restored': 'Defaults restored',
      'toast.copyFail': 'Could not copy. Press Ctrl+C',
      'toast.selectOne': 'Select at least one character type',
      'toast.genFail': 'Failed to generate password',
      'toast.nothing': 'Nothing to copy — generate a password first',
      'toast.nothingHistory': 'Nothing to copy',
      'toast.removed': 'Removed',
      'toast.deleteFail': 'Failed to delete',
      'confirm.deleteRow': 'Delete this password from history?',
      'confirm.clearAll': 'Clear the entire password history?',
      'lang.switch': 'Switch language',
    },
    ru: {
      'nav.api': 'API',
      'nav.history': 'История',
      'field.length': 'Длина пароля',
      'btn.reset': 'СБРОС',
      'btn.generate': 'СГЕНЕРИРОВАТЬ ПАРОЛЬ',
      'opt.uppercase': 'Заглавные',
      'opt.lowercase': 'Строчные',
      'opt.numbers': 'Цифры',
      'opt.symbols': 'Символы',
      'meta.length': 'Длина',
      'meta.charsets': 'Наборы',
      'meta.score': 'Оценка',
      'meta.entropy': 'Энтропия',
      'unit.bits': 'бит',
      'btn.back': 'НАЗАД',
      'btn.clear': 'ОЧИСТИТЬ',
      'history.title': 'История',
      'history.subtitle': 'Сохранённые пароли',
      'th.password': 'Пароль',
      'th.length': 'Длина',
      'th.charsets': 'Наборы',
      'th.strength': 'Надёжность',
      'th.entropy': 'Энтропия',
      'th.date': 'Дата',
      'empty.title': 'История пуста',
      'empty.text': 'Сгенерируйте первый пароль, и он появится на этой странице.',
      'empty.btn': 'СГЕНЕРИРОВАТЬ ПАРОЛЬ',
      'aria.delete': 'Удалить',
      'title.home': 'PassGen Pro — Генератор надёжных паролей',
      'title.history': 'PassGen Pro — История',
      'cs.symbols': 'символы',
      'cs.none': 'нет',
      'strength.weak': 'Слабый',
      'strength.medium': 'Средний',
      'strength.strong': 'Надёжный',
      'strength.very-strong': 'Очень надёжный',
      'strength.desc.empty': 'Пустой пароль.',
      'strength.desc.weak': 'Используйте больше символов и разные типы знаков.',
      'strength.desc.medium': 'Хорошее начало, но длиннее и с разными типами — безопаснее.',
      'strength.desc.strong': 'Несколько групп символов и безопасная длина.',
      'strength.desc.very-strong': 'Отличная длина и разнообразие символов. Можно использовать.',
      'toast.generated': 'Сгенерирован новый пароль',
      'toast.restored': 'Настройки сброшены',
      'toast.copyFail': 'Не удалось скопировать. Нажмите Ctrl+C',
      'toast.selectOne': 'Выберите хотя бы один тип символов',
      'toast.genFail': 'Не удалось сгенерировать пароль',
      'toast.nothing': 'Нечего копировать — сначала сгенерируйте пароль',
      'toast.nothingHistory': 'Нечего копировать',
      'toast.removed': 'Удалено',
      'toast.deleteFail': 'Не удалось удалить',
      'confirm.deleteRow': 'Удалить этот пароль из истории?',
      'confirm.clearAll': 'Очистить всю историю паролей?',
      'lang.switch': 'Сменить язык',
    },
  };

  const STORAGE_KEY = 'passgen.lang';
  const SUPPORTED = ['en', 'ru'];
  const callbacks = [];

  let lang = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.includes(saved)) return saved;
    } catch (e) { /* localStorage unavailable */ }
    const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return nav === 'ru' ? 'ru' : 'en';
  })();

  const t = (key) => {
    const table = DICT[lang] || DICT.en;
    if (key in table) return table[key];
    if (key in DICT.en) return DICT.en[key];
    return key;
  };

  const strength = (cssClass, percent) => ({
    label: t('strength.' + cssClass),
    description: Number(percent) === 0
      ? t('strength.desc.empty')
      : t('strength.desc.' + cssClass),
  });

  const GLOBE = '<svg viewBox="0 0 24 24" aria-hidden="true" class="lang-globe">'
    + '<circle cx="12" cy="12" r="9"/>'
    + '<path d="M3 12h18"/>'
    + '<path d="M12 3c2.6 2.7 2.6 15.3 0 18"/>'
    + '<path d="M12 3c-2.6 2.7-2.6 15.3 0 18"/>'
    + '</svg>';

  const updateButton = () => {
    const btn = document.getElementById('langToggle');
    if (!btn) return;
    btn.innerHTML = GLOBE + '<span class="lang-code">' + (lang === 'ru' ? 'RU' : 'EN') + '</span>';
    btn.setAttribute('aria-label', t('lang.switch'));
    btn.setAttribute('title', t('lang.switch'));
  };

  const applyStatic = () => {
    try { document.documentElement.lang = lang; } catch (e) { /* noop */ }
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    const body = document.body;
    if (body) {
      document.title = body.classList.contains('history')
        ? t('title.history')
        : t('title.home');
    }
    updateButton();
  };

  const apply = () => {
    applyStatic();
    callbacks.forEach((fn) => { try { fn(lang); } catch (e) { /* ignore */ } });
  };

  const setLang = (next) => {
    if (!SUPPORTED.includes(next)) return;
    lang = next;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* noop */ }
    apply();
  };

  const toggle = () => setLang(lang === 'en' ? 'ru' : 'en');

  window.PassGenI18n = {
    t,
    strength,
    current: () => lang,
    onChange: (fn) => { if (typeof fn === 'function') callbacks.push(fn); },
    apply,
    setLang,
    toggle,
  };

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('langToggle');
    if (btn) btn.addEventListener('click', toggle);
    apply();
  });
})();

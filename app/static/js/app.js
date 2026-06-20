/* PassGen Pro — frontend logic for the home (generator) page. */
(() => {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  const card = $('.app-card');
  const minLen = Number(card?.dataset.min || 6);
  const maxLen = Number(card?.dataset.max || 32);

  const form         = $('#genForm');
  const lengthRange  = $('#lengthRange');
  const lengthBadge  = $('#lengthBadge');
  const passwordEl   = $('#password');
  const copyBtn      = $('#copyBtn');
  const resetBtn     = $('#resetBtn');
  const generateBtn  = $('#generateBtn');
  const strengthLine = $('#strengthLine');
  const strengthLbl  = $('#strengthLabel');
  const strengthDesc = $('#strengthDesc');
  const strengthFill = $('#strengthFill');
  const strengthSc   = $('#strengthScore');
  const strengthEnt  = $('#strengthEntropy');
  const metaLength   = $('#metaLength');
  const metaTypes    = $('#metaTypes');
  const metaScore    = $('#metaScore');
  const metaEntropy  = $('#metaEntropy');
  const toast        = $('#toast');
  const toastMessage = $('#toastMessage');

  const optionInputs = Array.from(document.querySelectorAll('.option input[type="checkbox"]'));

  // Перевод строки (с запасным вариантом, если i18n не загружен)
  const T = (key) => (window.PassGenI18n ? window.PassGenI18n.t(key) : key);
  let lastStrength = null;

  // Щит планеты = надёжность пароля: цвет/мощь поля зависят от css_class
  const planetEl = $('.planet');
  const SHIELD_CLASSES = ['shield-weak', 'shield-medium', 'shield-strong', 'shield-very-strong'];
  const applyPlanetShield = (cssClass) => {
    if (!planetEl) return;
    SHIELD_CLASSES.forEach((c) => planetEl.classList.remove(c));
    if (cssClass) planetEl.classList.add('shield-' + cssClass);
  };

  // Кибер-спутники: индикаторы наборов символов на орбите планеты.
  // Галочки — основное управление; спутник светится, когда набор включён,
  // и шлёт лазерный импульс к планете при включении.
  const SAT_META = {
    uppercase: { a: 50,  color: '34, 211, 238' },
    lowercase: { a: 100, color: '99, 102, 241' },
    digits:    { a: 150, color: '34, 197, 94' },
    symbols:   { a: 200, color: '168, 85, 247' },
  };
  const satByName = {};
  const buildSatellites = () => {
    if (!planetEl || !optionInputs.length) return;
    const orbit = document.createElement('div');
    orbit.className = 'planet-orbit';
    orbit.setAttribute('aria-hidden', 'true');
    optionInputs.forEach((cb) => {
      const meta = SAT_META[cb.name] || { a: 0, color: '125, 150, 255' };
      const sat = document.createElement('button');
      sat.type = 'button';
      sat.className = 'satellite';
      sat.tabIndex = -1;
      sat.setAttribute('aria-hidden', 'true');
      sat.title = cb.name;
      sat.style.setProperty('--a', meta.a + 'deg');
      sat.style.setProperty('--r', '84px');
      sat.style.setProperty('--sat', meta.color);
      sat.innerHTML =
        '<span class="satellite__laser"></span>' +
        '<span class="satellite__halo"></span>' +
        '<span class="satellite__node"></span>';
      sat.addEventListener('click', () => { if (!cb.disabled) cb.click(); });
      orbit.appendChild(sat);
      satByName[cb.name] = sat;
    });
    planetEl.appendChild(orbit);
  };
  const syncSatellites = () => {
    optionInputs.forEach((cb) => {
      const sat = satByName[cb.name];
      if (sat) sat.classList.toggle('is-active', cb.checked);
    });
  };
  const fireSatelliteLaser = (name) => {
    const sat = satByName[name];
    if (!sat) return;
    sat.classList.remove('fire');
    void sat.offsetWidth;
    sat.classList.add('fire');
    clearTimeout(sat._fireT);
    sat._fireT = setTimeout(() => sat.classList.remove('fire'), 750);
  };

  /* ---------- helpers ---------- */
  const showToast = (msg, kind = 'success') => {
    if (!toast) return;
    toastMessage.textContent = msg;
    toast.classList.toggle('toast--error', kind === 'error');
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 2200);
  };

  const updateLengthUI = () => {
    if (!lengthRange) return;
    const val = Number(lengthRange.value);
    const pct = ((val - minLen) / (maxLen - minLen)) * 100;
    lengthRange.style.setProperty('--p', pct.toFixed(2) + '%');
    if (lengthBadge) lengthBadge.textContent = String(val);
    if (metaLength) metaLength.textContent = String(val);
  };

  // Авто-перенос длинного пароля на новые строки (как в Bitwarden)
  const autoGrowPassword = () => {
    if (!passwordEl) return;
    passwordEl.style.height = 'auto';
    passwordEl.style.height = passwordEl.scrollHeight + 'px';
  };

  const charsetSummary = (opts) => {
    const list = [];
    if (opts.uppercase) list.push('A-Z');
    if (opts.lowercase) list.push('a-z');
    if (opts.digits)    list.push('0-9');
    if (opts.symbols)   list.push(T('cs.symbols'));
    return list.length ? list.join(', ') : T('cs.none');
  };

  const collectOptions = () => {
    const obj = { uppercase: false, lowercase: false, digits: false, symbols: false };
    optionInputs.forEach((cb) => { obj[cb.name] = cb.checked; });
    return obj;
  };

  const optionsCount = (opts) =>
    ['uppercase', 'lowercase', 'digits', 'symbols'].filter((k) => opts[k]).length;

  /* ---------- rendering ---------- */
  const applyStrength = (s) => {
    if (!strengthLine) return;
    lastStrength = s;
    applyPlanetShield(s.css_class);
    strengthLine.className = 'strength strength--' + s.css_class;
    strengthLine.dataset.percent = s.percent;
    const tr = window.PassGenI18n
      ? window.PassGenI18n.strength(s.css_class, s.percent)
      : { label: s.label, description: s.description };
    strengthLbl.textContent  = tr.label;
    strengthDesc.textContent = tr.description;
    strengthFill.style.width = s.percent + '%';
    strengthSc.textContent   = s.score;
    strengthEnt.textContent  = (s.entropy_bits ?? 0).toFixed(1);
    if (metaScore)   metaScore.textContent   = s.score + ' / 7';
    if (metaEntropy) metaEntropy.textContent = (s.entropy_bits ?? 0).toFixed(1) + ' ' + T('unit.bits');
  };

  // Перевод надёжности по текущему состоянию DOM (до первой проверки)
  const translateStrengthFromDom = () => {
    if (!strengthLine || !window.PassGenI18n) return;
    const cls = Array.from(strengthLine.classList).find((c) => c.indexOf('strength--') === 0);
    const css = cls ? cls.slice('strength--'.length) : 'weak';
    const tr = window.PassGenI18n.strength(css, Number(strengthLine.dataset.percent || 0));
    if (strengthLbl) strengthLbl.textContent = tr.label;
    if (strengthDesc) strengthDesc.textContent = tr.description;
  };

  /* ---------- API calls ---------- */
  const apiGenerate = async (payload) => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to generate password');
    }
    return res.json();
  };

  const apiCheck = async (password) => {
    const res = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) throw new Error('check failed');
    return res.json();
  };

  /* ---------- main actions ---------- */
  const generate = async (save = true) => {
    const opts = collectOptions();
    if (!optionsCount(opts)) {
      showToast(T('toast.selectOne'), 'error');
      return;
    }
    const length = Number(lengthRange.value);
    try {
      generateBtn?.classList.add('is-loading');
      const data = await apiGenerate({
        length,
        use_lowercase: opts.lowercase,
        use_uppercase: opts.uppercase,
        use_digits: opts.digits,
        use_symbols: opts.symbols,
        save,
      });
      passwordEl.value = data.password;
      autoGrowPassword();
      applyStrength(data.strength);
      if (metaTypes) metaTypes.textContent = charsetSummary(collectOptions());
      if (save) showToast(T('toast.generated'));
    } catch (err) {
      showToast(T('toast.genFail'), 'error');
    } finally {
      generateBtn?.classList.remove('is-loading');
    }
  };

  const refreshStrength = async () => {
    if (!passwordEl?.value) return;
    try {
      const s = await apiCheck(passwordEl.value);
      applyStrength(s);
    } catch (e) { /* network hiccup — keep current state */ }
  };

  // Зелёная галочка на кнопке при успешном копировании пароля
  const CHECK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>';

  const flashCopyButton = () => {
    if (!copyBtn) return;
    if (copyBtn.dataset.originalIcon === undefined) {
      copyBtn.dataset.originalIcon = copyBtn.innerHTML;
    }
    copyBtn.classList.add('is-copied');
    copyBtn.innerHTML = CHECK_SVG;
    clearTimeout(flashCopyButton._t);
    flashCopyButton._t = setTimeout(() => {
      copyBtn.classList.remove('is-copied');
      copyBtn.innerHTML = copyBtn.dataset.originalIcon;
    }, 1400);
  };

  // Fallback copy for non-secure contexts (e.g. http:// over LAN) where
  // navigator.clipboard is unavailable.
  const legacyCopy = (value) => {
    try {
      passwordEl.focus();
      passwordEl.select();
      passwordEl.setSelectionRange(0, value.length);
      const ok = document.execCommand('copy');
      passwordEl.blur();
      return ok;
    } catch (err) {
      return false;
    }
  };

  const copyPassword = async () => {
    const value = passwordEl?.value;
    if (!value) {
      showToast(T('toast.nothing'), 'error');
      return;
    }
    let copied = false;
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(value);
        copied = true;
      } catch (err) {
        copied = false;
      }
    }
    if (!copied) {
      copied = legacyCopy(value);
    }
    if (copied) {
      // Только зелёная галочка, без всплывающего уведомления
      flashCopyButton();
    } else {
      showToast(T('toast.copyFail'), 'error');
    }
  };

  const reset = () => {
    if (lengthRange) lengthRange.value = 16;
    optionInputs.forEach((cb) => { cb.checked = true; });
    enforceAtLeastOne();
    updateLengthUI();
    syncSatellites();
    if (metaTypes) metaTypes.textContent = charsetSummary({
      uppercase: true, lowercase: true, digits: true, symbols: true,
    });
    showToast(T('toast.restored'));
  };

  /* ---------- listeners ---------- */
  if (lengthRange) {
    lengthRange.addEventListener('input', updateLengthUI);
    updateLengthUI();
  }
  // Хотя бы одна галочка всегда включена (иначе генератор ничего не создаёт)
  const enforceAtLeastOne = () => {
    const checked = optionInputs.filter((cb) => cb.checked);
    optionInputs.forEach((cb) => { cb.disabled = false; });
    if (checked.length === 1) {
      checked[0].disabled = true;
    }
  };

  optionInputs.forEach((cb) => cb.addEventListener('change', () => {
    enforceAtLeastOne();
    if (metaTypes) metaTypes.textContent = charsetSummary(collectOptions());
    syncSatellites();
    if (cb.checked) fireSatelliteLaser(cb.name);
  }));
  enforceAtLeastOne();

  copyBtn?.addEventListener('click', copyPassword);
  resetBtn?.addEventListener('click', reset);
  form?.addEventListener('submit', (e) => { e.preventDefault(); generate(true); });

  // Click on the readonly input also copies (a-la 1Password).
  passwordEl?.addEventListener('click', copyPassword);

  // Keyboard shortcut: Ctrl/Cmd + Enter — generate
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      generate(true);
    }
  });

  // Перерисовка динамических надписей при смене языка
  if (window.PassGenI18n) {
    window.PassGenI18n.onChange(() => {
      if (lastStrength) applyStrength(lastStrength);
      else translateStrengthFromDom();
      if (metaTypes) metaTypes.textContent = charsetSummary(collectOptions());
    });
  }

  // Initial: refresh strength once so entropy is freshly computed.
  autoGrowPassword();

  // Кибер-спутники настроек вокруг планеты
  buildSatellites();
  syncSatellites();

  // Начальный щит планеты из server-rendered состояния надёжности
  if (strengthLine) {
    const initCls = Array.from(strengthLine.classList).find((c) => c.indexOf('strength--') === 0);
    if (initCls) applyPlanetShield(initCls.slice('strength--'.length));
  }

  refreshStrength();
})();

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

  /* ---------- helpers ---------- */
  const showToast = (msg, kind = 'success') => {
    if (!toast) return;
    toastMessage.textContent = msg;
    toast.classList.toggle('toast--error', kind === 'error');
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
  };

  const updateLengthUI = () => {
    if (!lengthRange) return;
    const val = Number(lengthRange.value);
    const pct = ((val - minLen) / (maxLen - minLen)) * 100;
    lengthRange.style.setProperty('--p', pct.toFixed(2) + '%');
    if (lengthBadge) lengthBadge.textContent = String(val);
    if (metaLength) metaLength.textContent = String(val);
  };

  const charsetSummary = (opts) => {
    const list = [];
    if (opts.uppercase) list.push('A-Z');
    if (opts.lowercase) list.push('a-z');
    if (opts.digits)    list.push('0-9');
    if (opts.symbols)   list.push('symbols');
    return list.length ? list.join(', ') : 'none';
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
    strengthLine.className = 'strength strength--' + s.css_class;
    strengthLine.dataset.percent = s.percent;
    strengthLbl.textContent  = s.label;
    strengthDesc.textContent = s.description;
    strengthFill.style.width = s.percent + '%';
    strengthSc.textContent   = s.score;
    strengthEnt.textContent  = (s.entropy_bits ?? 0).toFixed(1);
    if (metaScore)   metaScore.textContent   = s.score + ' / 7';
    if (metaEntropy) metaEntropy.textContent = (s.entropy_bits ?? 0).toFixed(1) + ' bits';
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
      showToast('Select at least one character type', 'error');
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
      applyStrength(data.strength);
      if (metaTypes) metaTypes.textContent = data.type_summary;
      if (save) showToast('New password generated');
    } catch (err) {
      showToast(err.message || 'Failed to generate password', 'error');
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

  const copyPassword = async () => {
    if (!passwordEl?.value) return;
    const value = passwordEl.value;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        passwordEl.select();
        document.execCommand('copy');
        passwordEl.blur();
      }
      showToast('Password copied');
    } catch (err) {
      showToast('Could not copy. Press Ctrl+C', 'error');
    }
  };

  const reset = () => {
    if (lengthRange) lengthRange.value = 16;
    optionInputs.forEach((cb) => { cb.checked = true; });
    updateLengthUI();
    if (metaTypes) metaTypes.textContent = charsetSummary({
      uppercase: true, lowercase: true, digits: true, symbols: true,
    });
    showToast('Defaults restored');
  };

  /* ---------- listeners ---------- */
  if (lengthRange) {
    lengthRange.addEventListener('input', updateLengthUI);
    updateLengthUI();
  }
  optionInputs.forEach((cb) => cb.addEventListener('change', () => {
    if (metaTypes) metaTypes.textContent = charsetSummary(collectOptions());
  }));

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

  // Initial: refresh strength once so entropy is freshly computed.
  refreshStrength();
})();

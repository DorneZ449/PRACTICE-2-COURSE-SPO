/* PassGen Pro — frontend logic for the history page. */
(() => {
  'use strict';

  const toast        = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');

  // Перевод строки (с запасным вариантом, если i18n не загружен)
  const T = (key) => (window.PassGenI18n ? window.PassGenI18n.t(key) : key);

  const showToast = (msg, kind = 'success') => {
    if (!toast) return;
    toastMessage.textContent = msg;
    toast.classList.toggle('toast--error', kind === 'error');
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 2200);
  };

  // Fallback copy for non-secure contexts (e.g. http:// over LAN).
  const legacyCopy = (text) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (err) {
      return false;
    }
  };

  const copy = async (text, btn) => {
    if (!text) {
      showToast(T('toast.nothingHistory'), 'error');
      return;
    }
    let copied = false;
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (err) {
        copied = false;
      }
    }
    if (!copied) {
      copied = legacyCopy(text);
    }
    if (copied) {
      if (btn) {
        // Зелёная галочка на кнопке при успешном копировании пароля
        if (btn.dataset.originalIcon === undefined) {
          btn.dataset.originalIcon = btn.innerHTML;
        }
        btn.classList.add('is-copied');
        btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>';
        clearTimeout(btn._copyT);
        btn._copyT = setTimeout(() => {
          btn.classList.remove('is-copied');
          btn.innerHTML = btn.dataset.originalIcon;
        }, 1400);
      }
      // Только зелёная галочка, без всплывающего уведомления
    } else {
      showToast(T('toast.copyFail'), 'error');
    }
  };

  document.querySelectorAll('.copy-cell').forEach((btn) => {
    btn.addEventListener('click', () => copy(btn.dataset.password || '', btn));
  });

  document.querySelectorAll('.row-delete').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (!id) return;
      if (!confirm(T('confirm.deleteRow'))) return;
      try {
        const res = await fetch('/api/history/' + id, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete');
        const row = btn.closest('tr');
        if (row) row.remove();
        showToast(T('toast.removed'));
      } catch (err) {
        showToast(T('toast.deleteFail'), 'error');
      }
    });
  });

  const clearForm = document.getElementById('clearForm');
  clearForm?.addEventListener('submit', (e) => {
    if (!confirm(T('confirm.clearAll'))) {
      e.preventDefault();
    }
  });

  // Перевод динамических ячеек таблицы (надёжность и наборы символов)
  const translateDynamic = () => {
    document.querySelectorAll('[data-strength]').forEach((el) => {
      el.textContent = T('strength.' + el.getAttribute('data-strength'));
    });
    document.querySelectorAll('.charset-cell').forEach((el) => {
      if (el.dataset.cs === undefined) el.dataset.cs = el.textContent.trim();
      el.textContent = el.dataset.cs
        .replace(/\bsymbols\b/g, T('cs.symbols'))
        .replace(/\bnone\b/g, T('cs.none'));
    });
  };
  if (window.PassGenI18n) {
    window.PassGenI18n.onChange(translateDynamic);
  }
})();

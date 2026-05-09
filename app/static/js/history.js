/* PassGen Pro — frontend logic for the history page. */
(() => {
  'use strict';

  const toast        = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');

  const showToast = (msg, kind = 'success') => {
    if (!toast) return;
    toastMessage.textContent = msg;
    toast.classList.toggle('toast--error', kind === 'error');
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
  };

  const copy = async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showToast('Password copied');
    } catch (err) {
      showToast('Could not copy. Press Ctrl+C', 'error');
    }
  };

  document.querySelectorAll('.copy-cell').forEach((btn) => {
    btn.addEventListener('click', () => copy(btn.dataset.password || ''));
  });

  document.querySelectorAll('.row-delete').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (!id) return;
      if (!confirm('Delete this password from history?')) return;
      try {
        const res = await fetch('/api/history/' + id, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete');
        const row = btn.closest('tr');
        if (row) row.remove();
        showToast('Removed');
      } catch (err) {
        showToast(err.message || 'Failed to delete', 'error');
      }
    });
  });

  const clearForm = document.getElementById('clearForm');
  clearForm?.addEventListener('submit', (e) => {
    if (!confirm('Clear the entire password history?')) {
      e.preventDefault();
    }
  });
})();

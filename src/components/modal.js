/* ──────────────────────────────────────────
   Modal Component
   ────────────────────────────────────────── */

export function showModal({ title = '', body = '', onConfirm, confirmText = 'Save', cancelText = 'Cancel' }) {
  // Remove existing modal
  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close" data-action="close">&times;</button>
      </div>
      <div class="modal-body">${typeof body === 'string' ? body : ''}</div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-action="close">${cancelText}</button>
        ${onConfirm ? `<button class="btn btn-primary" data-action="confirm">${confirmText}</button>` : ''}
      </div>
    </div>
  `;

  // If body is a DOM element, append it
  if (typeof body !== 'string' && body instanceof HTMLElement) {
    overlay.querySelector('.modal-body').innerHTML = '';
    overlay.querySelector('.modal-body').appendChild(body);
  }

  document.body.appendChild(overlay);

  // Close handlers
  const close = () => overlay.remove();

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.dataset.action === 'close') {
      close();
    }
    if (e.target.dataset.action === 'confirm' && onConfirm) {
      onConfirm(overlay.querySelector('.modal-body'));
      close();
    }
  });

  // ESC to close
  const onKey = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } };
  document.addEventListener('keydown', onKey);

  return { close, element: overlay };
}

/** Convenience: confirm dialog */
export function confirmDialog(message) {
  return new Promise((resolve) => {
    showModal({
      title: '⚠️ Confirm',
      body: `<p>${message}</p>`,
      confirmText: 'Yes, proceed',
      cancelText: 'Cancel',
      onConfirm: () => resolve(true),
    });
    // If modal closed without confirm, resolve false
    document.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) resolve(false);
    });
  });
}

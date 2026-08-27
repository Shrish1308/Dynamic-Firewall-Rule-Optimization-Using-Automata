import { X } from 'lucide-react';
import { useEffect } from 'react';

export function Modal({ open, title, onClose, children, footer }) {
  // close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', confirmVariant = 'danger', onConfirm, onClose }) {
  return (
    <Modal open={open} title={title} onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className={`btn btn-${confirmVariant}`} onClick={onConfirm}>{confirmLabel}</button>
        </>
      }
    >
      <p style={{ color: 'var(--clr-text-muted)' }}>{message}</p>
    </Modal>
  );
}

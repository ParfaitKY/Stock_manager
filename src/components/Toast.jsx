import React from 'react';

function Toast({ toasts = [], onClose }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`shadow-lg rounded-md px-4 py-3 border flex items-start gap-3 max-w-sm ${
            t.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : t.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-gray-50 border-gray-200 text-gray-800'
          }`}
          role="alert"
        >
          <div className="flex-1 text-sm">{t.message}</div>
          <button
            onClick={() => onClose?.(t.id)}
            className="text-xs opacity-70 hover:opacity-100"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toast;

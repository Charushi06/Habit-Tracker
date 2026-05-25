import React, { useEffect, useState } from 'react';

type ToastItem = {
  id: string;
  type: 'success' | 'error';
  message: string;
  title?: string;
  duration?: number;
};

export default function ToastContainer({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // trigger enter animation
    const id = setTimeout(() => setVisible(true), 10);
    // schedule exit
    const total = (toast.duration ?? 4000);
    const t2 = setTimeout(() => setVisible(false), total);
    // final remove after animation
    const t3 = setTimeout(() => onRemove(toast.id), total + 300);
    return () => { clearTimeout(id); clearTimeout(t2); clearTimeout(t3); };
  }, [toast, onRemove]);

  const base = 'transform transition-all duration-300 shadow-lg rounded-lg overflow-hidden ring-1 ring-black/5';
  const variant = toast.type === 'success'
    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-green-100 dark:border-green-800'
    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-red-100 dark:border-red-800';

  return (
    <div
      className={`${base} ${variant} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} p-3 flex items-start gap-3`}
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">
        {toast.type === 'success' ? (
          <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>
      <div className="flex-1 text-sm">
        {toast.title && <div className="font-semibold mb-0.5">{toast.title}</div>}
        <div>{toast.message}</div>
      </div>
      <div className="ml-2 flex-shrink-0">
        <button
          onClick={() => onRemove(toast.id)}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded"
          aria-label="Dismiss toast"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

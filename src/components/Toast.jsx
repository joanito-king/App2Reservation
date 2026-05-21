import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

let toastFn = null;
export const toast = {
  success: (msg) => toastFn?.('success', msg),
  error: (msg) => toastFn?.('error', msg),
  info: (msg) => toastFn?.('info', msg),
  warning: (msg) => toastFn?.('warning', msg),
};

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => { toastFn = addToast; return () => { toastFn = null; }; }, [addToast]);

  return (
    <div className="toast-container">
      {toasts.map(t => {
        const Icon = ICONS[t.type];
        return (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <Icon size={18} />
            <span>{t.message}</span>
            <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

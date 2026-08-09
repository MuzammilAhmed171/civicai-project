import { createContext, useContext, useState, useCallback } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  X 
} from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toast }}>
      {children}
      {/* Toast Render Overlay */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex flex-col overflow-hidden rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform translate-y-0 animate-slide-in ${
              t.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-300 shadow-emerald-950/40'
                : t.type === 'error'
                ? 'bg-slate-900/95 border-rose-500/50 text-rose-300 shadow-rose-950/40'
                : t.type === 'warning'
                ? 'bg-slate-900/95 border-amber-500/50 text-amber-300 shadow-amber-950/40'
                : 'bg-slate-900/95 border-emerald-500/40 text-emerald-200 shadow-emerald-950/30'
            }`}
          >
            <div className="flex items-start justify-between p-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 shrink-0">
                  {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce-subtle" />}
                  {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 animate-pulse" />}
                  {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                  {t.type === 'info' && <Info className="w-5 h-5 text-emerald-400" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-wider uppercase opacity-75">
                    {t.type === 'success'
                      ? 'CivicAI Notice'
                      : t.type === 'error'
                      ? 'System Alert'
                      : t.type === 'warning'
                      ? 'Warning'
                      : 'Notification'}
                  </h4>
                  <p className="text-sm font-medium text-slate-100 mt-0.5 leading-snug">
                    {t.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Countdown Progress Bar */}
            <div className="w-full bg-slate-800 h-1 overflow-hidden">
              <div
                className={`h-full animate-toast-progress ${
                  t.type === 'success'
                    ? 'bg-emerald-500'
                    : t.type === 'error'
                    ? 'bg-rose-500'
                    : t.type === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-emerald-400'
                }`}
                style={{ animationDuration: `${t.duration || 4000}ms` }}
              />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

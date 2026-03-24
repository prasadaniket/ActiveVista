/*
  Toast.jsx — Animated toast notification system
  Replaces all alert() calls with premium glassmorphism toasts
*/
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, AlertTriangle, Info, Flame } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'success', title, message, duration = 4000 }) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const iconMap = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
  fire: Flame,
  warning: AlertTriangle,
};

const colorMap = {
  success: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]' },
  error: { border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.15)]' },
  info: { border: 'border-primary/30', bg: 'bg-primary/10', text: 'text-primary', glow: 'shadow-[0_0_30px_rgba(18,97,160,0.15)]' },
  fire: { border: 'border-orange-500/30', bg: 'bg-orange-500/10', text: 'text-orange-400', glow: 'shadow-[0_0_30px_rgba(249,115,22,0.15)]' },
  warning: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]' },
};

const ToastItem = ({ toast, onClose }) => {
  const Icon = iconMap[toast.type] || Info;
  const colors = colorMap[toast.type] || colorMap.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`pointer-events-auto glass-panel ${colors.border} ${colors.glow} p-4 flex items-start gap-3 cursor-pointer group`}
      onClick={onClose}
    >
      <div className={`${colors.bg} p-2 rounded-lg shrink-0`}>
        <Icon className={`w-4 h-4 ${colors.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-text">{toast.title}</p>
        )}
        {toast.message && (
          <p className="text-xs text-muted mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button className="text-muted/40 hover:text-muted transition-colors shrink-0 opacity-0 group-hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback for components outside ToastProvider
    return {
      addToast: ({ title, message }) => {
        console.log('Toast:', title, message);
      },
      removeToast: () => {},
    };
  }
  return context;
};

export default ToastProvider;

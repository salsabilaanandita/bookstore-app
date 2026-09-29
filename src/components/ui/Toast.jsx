// src/components/ui/Toast.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../store/useToast';
import { Icon } from './Icon';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const iconMap = {
    info: 'Info',
    success: 'CheckCircle2',
    warning: 'AlertTriangle',
    error: 'AlertCircle'
  };

  const colorMap = {
    info: 'border-border text-accent',
    success: 'border-success/30 text-success',
    warning: 'border-warning/30 text-warning',
    error: 'border-error/30 text-error'
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2 sm:p-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            className={`pointer-events-auto bg-surface/95 backdrop-blur-md border shadow-card rounded-card p-4 flex items-start gap-3 ${
              colorMap[toast.type] || colorMap.info
            }`}
          >
            <Icon name={iconMap[toast.type] || 'Info'} size={20} className="mt-0.5" />
            <div className="flex-1 min-w-0">
              {toast.title && <h4 className="text-sm font-semibold text-text-primary">{toast.title}</h4>}
              {toast.description && (
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-text-tertiary hover:text-text-primary p-1 rounded-full transition-colors"
              aria-label="Dismiss notification"
            >
              <Icon name="X" size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

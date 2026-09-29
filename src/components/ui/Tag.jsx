// src/components/ui/Tag.jsx
import React from 'react';

export function Tag({ children, variant = 'default', size = 'sm', className = '', ...props }) {
  const variants = {
    default: 'bg-surface-subtle text-text-secondary border border-border',
    accent: 'bg-accent-subtle text-accent border border-accent/20',
    success: 'bg-success-subtle text-success border border-success/20',
    warning: 'bg-warning-subtle text-warning border border-warning/20',
    error: 'bg-error-subtle text-error border border-error/20',
  };

  const sizes = {
    xs: 'text-[11px] px-2 py-0.5 font-medium rounded-pill',
    sm: 'text-xs px-2.5 py-1 font-medium rounded-pill',
    md: 'text-sm px-3 py-1.5 font-medium rounded-pill'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 leading-none select-none ${variants[variant] || variants.default} ${sizes[size] || sizes.sm} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

// src/components/ui/Button.jsx
import React from 'react';
import { Icon } from './Icon';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-pill transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover shadow-subtle',
    secondary: 'bg-surface text-text-primary border border-border hover:bg-surface-subtle shadow-subtle',
    subtle: 'bg-accent-subtle text-accent hover:opacity-90',
    danger: 'bg-error text-white hover:opacity-95 shadow-subtle',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle',
    outline: 'border border-border text-text-primary hover:bg-surface-subtle'
  };

  const sizes = {
    sm: 'text-xs h-8 px-3 gap-1.5',
    md: 'text-sm h-10 px-4 gap-2',
    lg: 'text-base h-12 px-6 gap-2.5',
    icon: 'h-9 w-9 p-0 rounded-full'
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Icon name="Loader2" size={size === 'sm' ? 16 : 20} className="animate-spin" />
      ) : (
        <>
          {icon && <Icon name={icon} size={size === 'sm' ? 16 : 20} />}
          {children}
          {iconRight && <Icon name={iconRight} size={size === 'sm' ? 16 : 20} />}
        </>
      )}
    </button>
  );
}

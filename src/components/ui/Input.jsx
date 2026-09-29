// src/components/ui/Input.jsx
import React, { forwardRef } from 'react';
import { Icon } from './Icon';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon,
    endIcon,
    onEndIconClick,
    className = '',
    id,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 pointer-events-none text-text-tertiary flex items-center">
            <Icon name={icon} size={16} />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full bg-surface border text-text-primary text-sm rounded-pill py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent placeholder:text-text-tertiary ${
            icon ? 'pl-10' : 'pl-4'
          } ${endIcon ? 'pr-10' : 'pr-4'} ${
            error ? 'border-error focus:ring-error' : 'border-border'
          } ${className}`}
          {...props}
        />
        {endIcon && (
          <button
            type="button"
            onClick={onEndIconClick}
            tabIndex={-1}
            className="absolute right-3 text-text-tertiary hover:text-text-primary flex items-center p-1"
          >
            <Icon name={endIcon} size={16} />
          </button>
        )}
      </div>
      {error ? (
        <p className="text-xs text-error font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-text-tertiary">{helperText}</p>
      ) : null}
    </div>
  );
});

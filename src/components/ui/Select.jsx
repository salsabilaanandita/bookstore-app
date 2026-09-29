// src/components/ui/Select.jsx
import React from 'react';
import { Icon } from './Icon';

export function Select({
  label,
  options = [],
  error,
  value,
  onChange,
  className = '',
  id,
  placeholder,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          className={`w-full appearance-none bg-surface border border-border text-text-primary text-sm rounded-pill pl-4 pr-10 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent cursor-pointer ${
            error ? 'border-error focus:ring-error' : ''
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 pointer-events-none text-text-tertiary flex items-center">
          <Icon name="ChevronDown" size={16} />
        </div>
      </div>
      {error && <p className="text-xs text-error font-medium">{error}</p>}
    </div>
  );
}

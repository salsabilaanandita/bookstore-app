// src/components/ui/Avatar.jsx
import React from 'react';

export function Avatar({ name = 'User', size = 'md', className = '' }) {
  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return str.slice(0, 2).toUpperCase();
  };

  const sizes = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-12 w-12 text-base font-semibold',
    xl: 'h-16 w-16 text-xl font-bold'
  };

  return (
    <div
      className={`rounded-full bg-accent-subtle text-accent border border-accent/20 flex items-center justify-center font-semibold select-none shrink-0 ${sizes[size] || sizes.md} ${className}`}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}

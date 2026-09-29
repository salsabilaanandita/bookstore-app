// src/components/ui/Skeleton.jsx
import React from 'react';

export function Skeleton({ className = '', variant = 'rect' }) {
  const variants = {
    rect: 'rounded-md',
    card: 'rounded-card',
    cover: 'rounded-cover aspect-[2/3]',
    circle: 'rounded-full',
    text: 'rounded h-4 w-full'
  };

  return (
    <div
      className={`animate-pulse bg-surface-subtle border border-border/40 ${variants[variant] || variants.rect} ${className}`}
    />
  );
}

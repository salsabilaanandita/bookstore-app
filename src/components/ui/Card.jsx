// src/components/ui/Card.jsx
import React from 'react';

export function Card({ children, className = '', hover = false, onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-border rounded-card p-4 transition-all duration-200 shadow-subtle ${
        hover ? 'hover:shadow-card hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// src/components/ui/Icon.jsx
import React from 'react';
import * as Icons from 'lucide-react';

export function Icon({ name, size = 20, className = '', ...props }) {
  const IconComponent = Icons[name] || Icons.HelpCircle;
  
  // size mapping: 16, 20, 24
  const pixelSize = typeof size === 'number' ? size : size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  return (
    <IconComponent
      size={pixelSize}
      strokeWidth={1.75}
      className={`shrink-0 ${className}`}
      {...props}
    />
  );
}

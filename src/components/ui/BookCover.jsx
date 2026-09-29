// src/components/ui/BookCover.jsx
import React, { useState } from 'react';

export function BookCover({
  title = '',
  author = '',
  coverColor,
  color,
  accentColor = '#FF9900',
  coverImage,
  cover,
  image,
  size = 'md', // sm, md, lg, xl
  className = ''
}) {
  const [imgError, setImgError] = useState(false);

  // Resolve cover image from various potential keys
  let rawSrc = coverImage || cover || image || '';
  if (rawSrc && typeof rawSrc === 'string') {
    if (rawSrc.startsWith('/uploads') || rawSrc.startsWith('/covers') || rawSrc.startsWith('/images')) {
      rawSrc = `http://localhost:4000${rawSrc}`;
    }
  }

  const bgColor = coverColor || color || '#2C3E50';

  const sizeClasses = {
    sm: 'w-14 h-20 text-[9px] p-2',
    md: 'w-24 h-36 text-[11px] p-2.5',
    lg: 'w-32 h-48 text-xs p-3.5',
    xl: 'w-44 h-64 text-sm p-4'
  };

  // If valid image provided and hasn't errored
  if (rawSrc && !imgError) {
    return (
      <div
        className={`relative rounded-[10px] shadow-cover overflow-hidden shrink-0 select-none border border-black/10 bg-surface-subtle group ${sizeClasses[size] || sizeClasses.md} ${className}`}
      >
        <img
          src={rawSrc}
          alt={title || 'Book Cover'}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover rounded-[9px]"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
        <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
          <p className="text-[10px] font-bold text-white drop-shadow-md truncate">{title}</p>
        </div>
      </div>
    );
  }

  // Elegant stylized typography vector cover fallback
  return (
    <div
      style={{ backgroundColor: bgColor }}
      className={`relative rounded-[10px] shadow-cover overflow-hidden flex flex-col justify-between shrink-0 select-none border border-white/15 transition-transform duration-200 ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {/* Spine highlight & gradient depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-r from-black/40 via-white/20 to-transparent pointer-events-none" />

      {/* Decorative artwork accent & badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div
          style={{ backgroundColor: accentColor }}
          className="w-4 h-1 rounded-full opacity-80"
        />
        <span className="text-[8px] font-bold uppercase tracking-widest text-white/60">
          PUSTAKA
        </span>
      </div>

      {/* Book title and author */}
      <div className="relative z-10 flex flex-col gap-0.5 my-auto text-center px-1">
        <h3 className="font-extrabold text-white tracking-tight line-clamp-3 leading-snug drop-shadow-md font-sans">
          {title || 'Untitled'}
        </h3>
        <p className="text-[10px] text-white/80 line-clamp-1 font-medium tracking-wide">
          {author || 'Anonymous'}
        </p>
      </div>

      {/* Bottom badge marker */}
      <div className="relative z-10 flex items-center justify-center">
        <div
          style={{ backgroundColor: accentColor }}
          className="h-1 w-6 rounded-full opacity-60"
        />
      </div>
    </div>
  );
}
export default BookCover;

// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { useSession } from '../../store/useSession';
import { useCart } from '../../store/useCart';

export function Header({ title, subtitle, showSearch = true }) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { role } = useSession();
  const cartCount = useCart((s) => s.getTotalCount());

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 px-6 sm:px-10 py-5 flex items-center justify-between gap-6 bg-canvas/80 backdrop-blur-md">
      {/* Brand or Page Title */}
      <div className="flex items-center gap-6">
        <NavLink to="/" className="flex items-center gap-1 text-xl font-extrabold tracking-tight text-text-primary select-none">
          Pustaka<span className="text-accent text-2xl leading-none">.</span>
        </NavLink>

        {title && (
          <div className="hidden lg:flex items-center gap-2 pl-6 border-l border-border text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">{title}</span>
            {subtitle && <span className="text-text-tertiary truncate max-w-xs">• {subtitle}</span>}
          </div>
        )}
      </div>

      {/* Center Search Pill & Navigation */}
      <div className="flex items-center gap-6">
        {showSearch && (
          <form onSubmit={handleSearchSubmit} className="relative w-48 sm:w-64 md:w-80">
            <input
              type="text"
              placeholder="Search your books"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-surface border border-black/5 text-xs rounded-full pl-5 pr-10 py-2.5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/40 shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-3.5 top-2.5 text-text-tertiary hover:text-text-primary"
              aria-label="Search"
            >
              <Icon name="Search" size={16} />
            </button>
          </form>
        )}

        {role === 'user' && (
          <div className="hidden sm:flex items-center gap-5 text-xs font-semibold text-text-secondary">
            <NavLink
              to="/browse"
              className="hover:text-text-primary transition-colors"
            >
              New Release
            </NavLink>
            <NavLink
              to="/browse?featured=true"
              className="hover:text-text-primary transition-colors"
            >
              Featured
            </NavLink>
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 rounded-full hover:bg-black/5 transition-colors text-text-primary"
              title="Bag"
              aria-label="Bag"
            >
              <Icon name="ShoppingBag" size={18} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-accent text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

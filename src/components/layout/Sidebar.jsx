// src/components/layout/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSession } from '../../store/useSession';
import { useCart } from '../../store/useCart';
import { getReports, getWishlist, getLibrary } from 'lib/api';
import { Avatar } from '../ui/Avatar';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';

export function Sidebar() {
  const { user, role, logout } = useSession();
  const cartCount = useCart((state) => state.getTotalCount());
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [libraryCount, setLibraryCount] = useState(0);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const refreshCounts = () => {
      if (role === 'staff' || role === 'admin') {
        getReports().then((data) => {
          setPendingOrdersCount(data?.pendingOrders || 0);
        }).catch(() => {});
      } else {
        getWishlist().then((list) => setWishlistCount(list?.length || 0)).catch(() => {});
        getLibrary().then((list) => setLibraryCount(list?.length || 0)).catch(() => {});
      }
    };

    refreshCounts();

    const handleWishUpdated = (e) => {
      setWishlistCount(e.detail?.length ?? 0);
    };
    const handleLibUpdated = (e) => {
      setLibraryCount(e.detail?.length ?? 0);
    };

    window.addEventListener('pustaka_wishlist_updated', handleWishUpdated);
    window.addEventListener('pustaka_library_updated', handleLibUpdated);

    return () => {
      window.removeEventListener('pustaka_wishlist_updated', handleWishUpdated);
      window.removeEventListener('pustaka_library_updated', handleLibUpdated);
    };
  }, [role, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userGroups = [
    {
      items: [
        { label: 'My Board', path: '/', icon: 'Compass' },
        { label: 'Browse Books', path: '/browse', icon: 'BookOpen' },
        { label: 'Collections', path: '/library', icon: 'FolderHeart', badge: libraryCount > 0 ? libraryCount : null, badgeColor: 'sage' },
        { label: 'Saved', path: '/wishlist', icon: 'Bookmark', badge: wishlistCount > 0 ? wishlistCount : null, badgeColor: 'accent' },
        { label: 'Bag', path: '/cart', icon: 'ShoppingBag', badge: cartCount > 0 ? cartCount : null },
        { label: 'Orders', path: '/orders', icon: 'Package' },
        { label: 'Profile', path: '/profile', icon: 'User' },
      ]
    }
  ];

  const staffGroups = [
    {
      items: [
        { label: 'Dashboard', path: '/staff', icon: 'LayoutDashboard' },
        { label: 'Manage Books', path: '/staff/books', icon: 'BookOpen' },
        { label: 'Orders', path: '/staff/orders', icon: 'ClipboardList', badge: pendingOrdersCount > 0 ? pendingOrdersCount : null, badgeColor: 'warning' },
        { label: 'Inventory', path: '/staff/inventory', icon: 'Boxes' },
        { label: 'Profile', path: '/profile', icon: 'User' },
      ]
    }
  ];

  const adminGroups = [
    {
      items: [
        { label: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
        { label: 'Reports', path: '/admin/reports', icon: 'BarChart3' },
        { label: 'Books', path: '/admin/books', icon: 'BookOpen' },
        { label: 'Categories', path: '/admin/categories', icon: 'Layers' },
        { label: 'Inventory', path: '/admin/inventory', icon: 'Boxes' },
        { label: 'Orders', path: '/admin/orders', icon: 'ShoppingBag', badge: pendingOrdersCount > 0 ? pendingOrdersCount : null },
        { label: 'Users', path: '/admin/users', icon: 'Users' },
        { label: 'Profile', path: '/profile', icon: 'User' },
      ]
    }
  ];

  const currentGroups = role === 'admin' ? adminGroups : role === 'staff' ? staffGroups : userGroups;
  const allItems = currentGroups.flatMap((g) => g.items);
  const bottomNavItems = allItems.slice(0, 4);
  const overflowItems = allItems.slice(4);

  return (
    <>
      {/* Desktop & Tablet Sidebar - 100% Borderless & Blends Seamlessly */}
      <aside className="hidden md:flex flex-col shrink-0 w-60 sticky top-0 h-screen p-5 justify-between select-none z-30 bg-transparent overflow-y-auto scrollbar-none">
        <div className="flex flex-col gap-6">
          
          {/* User Welcome Card */}
          {user && (
            <div className="bg-gradient-to-b from-[#EAE4D6] to-[#E0D9CA] dark:from-[#272421] dark:to-[#1E1C1A] rounded-[24px] p-4 flex flex-col items-center text-center shadow-subtle border border-black/5">
              <div className="relative mb-2">
                <Avatar name={user.name} size="lg" className="ring-2 ring-white/90 shadow-sm" />
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-emerald-500 rounded-full ring-2 ring-[#EAE4D6]" />
              </div>
              <span className="hidden md:block text-[11px] text-text-secondary font-medium">Welcome Back</span>
              <span className="hidden md:block text-sm font-extrabold text-text-primary truncate max-w-[140px] mt-0.5">{user.name}</span>
              
              {/* Member Tier & Streak */}
              <div className="hidden md:flex items-center gap-1.5 mt-2.5 px-2.5 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[10px] font-bold text-accent shadow-xs">
                <span>🔥 5d Streak</span>
                <span>•</span>
                <span>VIP Reader</span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {allItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/' || item.path === '/staff' || item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl transition-all group relative font-semibold text-xs ${
                    isActive
                      ? 'bg-black/5 dark:bg-white/10 text-text-primary font-bold shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-black/[0.03]'
                  }`
                }
                title={item.label}
              >
                {({ isActive }) => (
                  <>
                    <div className="relative flex items-center justify-center">
                      <Icon
                        name={item.icon}
                        size={18}
                        className={isActive ? 'text-accent' : 'text-text-secondary group-hover:text-text-primary transition-colors'}
                      />
                    </div>
                    <span className="hidden md:inline flex-1 truncate">{item.label}</span>
                    {item.badge != null && (
                      <span className="hidden md:inline-flex text-[10px] px-2 py-0.5 rounded-full font-bold bg-accent text-white shadow-xs">
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="hidden md:block w-2 h-2 rounded-full bg-accent ml-auto shadow-xs" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Mini Daily Reading Goal Widget inside Sidebar */}
          {role === 'user' && (
            <div className="hidden md:flex flex-col gap-2 p-3.5 rounded-2xl bg-surface-sand/80 border border-black/5">
              <div className="flex items-center justify-between text-[11px] font-bold text-text-primary">
                <span className="flex items-center gap-1 text-accent">
                  <Icon name="Target" size={13} />
                  Today's Goal
                </span>
                <span className="text-[10px] text-text-secondary">20/30m</span>
              </div>
              <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-accent rounded-full" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom info & logout */}
        <div className="flex flex-col gap-3 pt-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 px-3.5 py-2 text-xs font-semibold text-text-secondary hover:text-error hover:bg-error-subtle/50 rounded-2xl transition-colors"
            title="Logout"
          >
            <Icon name="LogOut" size={17} />
            <span className="hidden md:inline">Logout</span>
          </button>

          <div className="hidden md:flex flex-col pt-3 border-t border-black/5 text-[11px] text-text-tertiary">
            <span>Product of</span>
            <span className="font-extrabold text-text-primary tracking-tight text-xs">
              pustaka<span className="text-accent text-sm">.</span>
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border px-3 py-2 flex items-center justify-around shadow-card">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/' || item.path === '/staff' || item.path === '/admin'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-1.5 rounded-xl text-[11px] relative transition-colors ${
                isActive ? 'text-accent font-bold' : 'text-text-secondary'
              }`
            }
          >
            <Icon name={item.icon} size={18} />
            <span className="truncate max-w-[60px]">{item.label}</span>
            {item.badge != null && (
              <span className="absolute top-0 right-1 h-2 w-2 rounded-full bg-accent" />
            )}
          </NavLink>
        ))}

        <button
          onClick={() => setIsMoreOpen(true)}
          className="flex flex-col items-center gap-1 p-1.5 rounded-xl text-[11px] text-text-secondary hover:text-text-primary"
        >
          <Icon name="Menu" size={18} />
          <span>More</span>
        </button>
      </div>

      <Modal isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} title="Navigation Menu">
        <div className="flex flex-col gap-2">
          {overflowItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMoreOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle text-text-primary text-xs font-semibold"
            >
              <div className="flex items-center gap-3">
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </div>
              {item.badge != null && (
                <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
          <button
            onClick={() => {
              setIsMoreOpen(false);
              handleLogout();
            }}
            className="flex items-center gap-3 p-3 rounded-xl text-error bg-error-subtle text-xs font-semibold mt-2"
          >
            <Icon name="LogOut" size={18} />
            <span>Logout</span>
          </button>
        </div>
      </Modal>
    </>
  );
}



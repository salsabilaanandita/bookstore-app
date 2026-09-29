// src/components/layout/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../ui/Toast';

export function Layout() {
  return (
    <div className="flex min-h-screen bg-canvas text-text-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

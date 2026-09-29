// src/pages/user/Profile.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../store/useSession';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Tag } from '../../components/ui/Tag';
import { Header } from '../../components/layout/Header';

export function Profile() {
  const { user, role, logout } = useSession();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <Header title="Account Profile" subtitle="Manage your preferences and session" showSearch={false} />

      <div className="p-4 sm:p-8 max-w-3xl mx-auto flex flex-col gap-6">
        {/* User Card */}
        <Card className="p-6 flex items-center gap-5">
          <Avatar name={user?.name || 'User'} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-text-primary truncate">{user?.name}</h2>
              <Tag variant={role === 'admin' ? 'accent' : role === 'staff' ? 'warning' : 'default'} size="xs">
                {role}
              </Tag>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">{user?.email}</p>
          </div>
        </Card>

        {/* Backend API Info */}
        <Card className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-text-primary">Backend API Connection</h3>
            <p className="text-xs text-text-secondary mt-1">
              Connected directly to Express Backend server ({import.meta.env?.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}).
            </p>
          </div>
          <Tag variant="success" size="sm">
            Live API
          </Tag>
        </Card>

        {/* Logout */}
        <Card className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-error/20">
          <div>
            <h3 className="text-sm font-bold text-text-primary">Sign Out</h3>
            <p className="text-xs text-text-secondary mt-1">
              End your active session on this device.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={handleLogout} icon="LogOut">
            Sign Out
          </Button>
        </Card>
      </div>
    </div>
  );
}

// src/pages/admin/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import { getUsers, updateUserRole } from 'lib/api';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Tag } from '../../components/ui/Tag';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../store/useToast';
import { Header } from '../../components/layout/Header';

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('user');
  const [isActive, setIsActive] = useState(true);

  const { addToast } = useToast();

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const list = await getUsers();
      setUsers(list);
    } catch (e) {
      addToast({ title: 'Error', description: 'Failed to load users', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setIsActive(user.isActive !== false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updated = await updateUserRole(editingUser.id, selectedRole, isActive);
      setUsers(updated);
      setEditingUser(null);
      addToast({ title: 'Success', description: 'User role & status updated', type: 'success' });
    } catch (e) {
      addToast({ title: 'Error', description: 'Failed to update user', type: 'error' });
    }
  };

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div>
            <p className="font-semibold text-text-primary text-sm">{row.name}</p>
            <p className="text-xs text-text-tertiary">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      sortable: true,
      render: (val) => (
        <Tag
          variant={val === 'admin' ? 'accent' : val === 'staff' ? 'warning' : 'default'}
          size="xs"
          className="capitalize"
        >
          {val}
        </Tag>
      )
    },
    {
      header: 'Status',
      accessor: 'isActive',
      sortable: true,
      render: (val) => (
        <Tag variant={val !== false ? 'success' : 'error'} size="xs">
          {val !== false ? 'Active' : 'Disabled'}
        </Tag>
      )
    },
    {
      header: 'Joined Date',
      accessor: 'joinedDate',
      sortable: true,
      render: (val) => <span className="text-xs text-text-secondary">{val || '2024-01-01'}</span>
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <Button variant="secondary" size="sm" icon="Shield" onClick={() => handleOpenEdit(row)}>
          Manage
        </Button>
      )
    }
  ];

  return (
    <div>
      <Header title="Manage Users" subtitle="Control system roles, permissions, and status" showSearch={false} />

      <div className="p-4 sm:p-8 flex flex-col gap-6 max-w-5xl mx-auto">
        <Table columns={columns} data={users} isLoading={isLoading} />
      </div>

      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Manage User Permissions"
      >
        {editingUser && (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="p-3 bg-surface-subtle rounded-card border border-border flex items-center gap-3">
              <Avatar name={editingUser.name} size="md" />
              <div>
                <p className="font-semibold text-text-primary text-sm">{editingUser.name}</p>
                <p className="text-xs text-text-tertiary">{editingUser.email}</p>
              </div>
            </div>

            <Select
              label="Assigned Role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              options={[
                { value: 'user', label: 'User (Customer)' },
                { value: 'staff', label: 'Staff (Store Employee)' },
                { value: 'admin', label: 'Admin (Full Access)' }
              ]}
            />

            <div className="flex items-center justify-between p-3 border border-border rounded-card">
              <div>
                <p className="text-sm font-semibold text-text-primary">Account Status</p>
                <p className="text-xs text-text-secondary">Allow user to log in and perform actions</p>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-5 w-5 accent-accent cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

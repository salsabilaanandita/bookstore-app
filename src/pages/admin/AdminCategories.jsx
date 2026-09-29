// src/pages/admin/AdminCategories.jsx
import React, { useState, useEffect } from 'react';
import { getCategories, saveCategory, deleteCategory } from 'lib/api';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../store/useToast';
import { Header } from '../../components/layout/Header';

export function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const { addToast } = useToast();

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const list = await getCategories();
      setCategories(list);
    } catch (e) {
      addToast({ title: 'Error', description: 'Failed to load categories', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName('');
    setSlug('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setName(cat.name);
    setSlug(cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'));
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const payload = {
        ...(editingCat ? { id: editingCat.id } : {}),
        name: name.trim(),
        slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, '-')
      };
      const updated = await saveCategory(payload);
      setCategories(updated);
      setIsModalOpen(false);
      addToast({
        title: 'Success',
        description: editingCat ? 'Category updated' : 'Category created',
        type: 'success'
      });
    } catch (err) {
      addToast({ title: 'Error', description: err.message || 'Failed to save category', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      const updated = await deleteCategory(id);
      setCategories(updated);
      addToast({ title: 'Success', description: 'Category deleted', type: 'success' });
    } catch (e) {
      addToast({ title: 'Error', description: e.message || 'Failed to delete category', type: 'error' });
    }
  };

  const columns = [
    {
      header: 'Category Name',
      accessor: 'name',
      sortable: true,
      render: (val) => <span className="font-semibold text-text-primary">{val}</span>
    },
    {
      header: 'Slug',
      accessor: 'slug',
      render: (val) => <code className="text-xs text-text-tertiary bg-surface-subtle px-2 py-0.5 rounded">{val}</code>
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon="Edit2" onClick={() => handleOpenEdit(row)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" icon="Trash2" onClick={() => handleDelete(row.id)}>
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <Header title="Manage Categories" subtitle="Organize your bookstore genres and classification" showSearch={false} />

      <div className="p-4 sm:p-8 flex flex-col gap-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-secondary">Total {categories.length} categories configured</p>
          <Button variant="primary" icon="Plus" onClick={handleOpenAdd}>
            Add Category
          </Button>
        </div>

        <Table columns={columns} data={categories} isLoading={isLoading} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCat ? 'Edit Category' : 'New Category'}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            label="Category Name"
            placeholder="e.g. Science Fiction"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Slug identifier"
            placeholder="e.g. science-fiction"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// src/pages/staff/StaffInventory.jsx
import React, { useState, useEffect } from 'react';
import { getBooks, updateStock } from 'lib/api';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tag } from '../../components/ui/Tag';
import { Modal } from '../../components/ui/Modal';
import { BookCover } from '../../components/ui/BookCover';
import { useToast } from '../../store/useToast';
import { Header } from '../../components/layout/Header';

export function StaffInventory() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [newStock, setNewStock] = useState('');

  const { addToast } = useToast();

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const list = await getBooks();
      setBooks(list);
    } catch (e) {
      addToast({ title: 'Error', description: 'Failed to load books', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleOpenStock = (book) => {
    setEditingBook(book);
    setNewStock(book.stock.toString());
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!editingBook) return;

    try {
      const updated = await updateStock(editingBook.id, newStock);
      setBooks(updated);
      setEditingBook(null);
      addToast({
        title: 'Stock Updated',
        description: `Inventory for "${editingBook.title}" set to ${newStock}`,
        type: 'success'
      });
    } catch (e) {
      addToast({ title: 'Error', description: 'Failed to update stock', type: 'error' });
    }
  };

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterLowStockOnly) {
      return matchesSearch && b.stock < 5;
    }
    return matchesSearch;
  });

  const columns = [
    {
      header: 'Book',
      key: 'book',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <BookCover
            title={row.title}
            author={row.author}
            coverColor={row.coverColor || row.color}
            accentColor={row.accentColor}
            coverImage={row.coverImage || row.cover}
            size="sm"
          />
          <div>
            <p className="font-semibold text-text-primary text-sm line-clamp-1">{row.title}</p>
            <p className="text-xs text-text-secondary line-clamp-1">{row.author}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      sortable: true,
      render: (val) => <Tag size="xs">{val}</Tag>
    },
    {
      header: 'Current Stock',
      accessor: 'stock',
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-text-primary">{val}</span>
          {val < 5 && (
            <Tag variant="error" size="xs">
              Low Stock (&lt;5)
            </Tag>
          )}
        </div>
      )
    },
    {
      header: 'Unit Price',
      accessor: 'price',
      sortable: true,
      render: (val) => `Rp ${Number(val).toLocaleString('id-ID')}`
    },
    {
      header: 'Quick Action',
      key: 'action',
      render: (_, row) => (
        <Button variant="secondary" size="sm" icon="Boxes" onClick={() => handleOpenStock(row)}>
          Adjust Stock
        </Button>
      )
    }
  ];

  return (
    <div>
      <Header title="Inventory Management" subtitle="Monitor and adjust warehouse book stock levels" showSearch={false} />

      <div className="p-4 sm:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="Search"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
              className={`px-3.5 py-2 rounded-pill text-xs font-semibold transition-all border ${
                filterLowStockOnly
                  ? 'bg-error-subtle border-error/30 text-error'
                  : 'bg-surface border-border text-text-secondary hover:bg-surface-subtle'
              }`}
            >
              {filterLowStockOnly ? 'Showing Low Stock (<5)' : 'Show Low Stock Only'}
            </button>
          </div>
        </div>

        <Table columns={columns} data={filteredBooks} isLoading={isLoading} />
      </div>

      <Modal
        isOpen={!!editingBook}
        onClose={() => setEditingBook(null)}
        title={`Adjust Stock: ${editingBook?.title}`}
      >
        {editingBook && (
          <form onSubmit={handleSaveStock} className="flex flex-col gap-4">
            <div className="p-3 bg-surface-subtle rounded-card border border-border flex items-center gap-3">
              <BookCover
                title={editingBook.title}
                author={editingBook.author}
                coverColor={editingBook.coverColor || editingBook.color}
                accentColor={editingBook.accentColor}
                coverImage={editingBook.coverImage || editingBook.cover}
                size="sm"
              />
              <div>
                <p className="text-sm font-semibold text-text-primary">{editingBook.title}</p>
                <p className="text-xs text-text-secondary">{editingBook.author}</p>
                <p className="text-xs text-text-tertiary mt-1">Current Stock: {editingBook.stock} units</p>
              </div>
            </div>

            <Input
              label="New Quantity in Stock"
              type="number"
              min="0"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              required
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setEditingBook(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Quantity
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

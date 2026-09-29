// src/pages/admin/AdminBooks.jsx
import React, { useState, useEffect } from 'react';
import { getBooks, getCategories, saveBook, deleteBook } from 'lib/api';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Tag } from '../../components/ui/Tag';
import { BookCover } from '../../components/ui/BookCover';
import { useToast } from '../../store/useToast';
import { Header } from '../../components/layout/Header';
import { Icon } from '../../components/ui/Icon';

export function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    categoryId: '',
    price: '',
    stock: '',
    pages: '',
    publishedYear: new Date().getFullYear(),
    coverColor: '#1E293B',
    accentColor: '#FF9900',
    coverImage: '',
    description: '',
    content: ''
  });

  const { addToast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bList, cList] = await Promise.all([getBooks(), getCategories()]);
      setBooks(bList);
      setCategories(cList);
    } catch (e) {
      addToast({ title: 'Error', description: 'Failed to load books', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      categoryId: categories[0]?.id || '',
      price: '',
      stock: '',
      pages: '',
      publishedYear: new Date().getFullYear(),
      coverColor: '#1E293B',
      accentColor: '#FF9900',
      coverImage: '',
      description: '',
      content: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      categoryId: book.categoryId || categories.find(c => c.name === book.category)?.id || '',
      price: book.price.toString(),
      stock: book.stock.toString(),
      pages: (book.pages || 200).toString(),
      publishedYear: book.publishedYear || new Date().getFullYear(),
      coverColor: book.coverColor || '#1E293B',
      accentColor: book.accentColor || '#FF9900',
      coverImage: book.coverImage || '',
      description: book.description || '',
      content: book.content || ''
    });
    setIsModalOpen(true);
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, coverImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author) {
      addToast({ title: 'Validation', description: 'Title and Author are required', type: 'warning' });
      return;
    }

    const selectedCat = categories.find(c => c.id === formData.categoryId);
    const payload = {
      ...(editingBook ? { id: editingBook.id } : {}),
      title: formData.title,
      author: formData.author,
      categoryId: formData.categoryId,
      category: selectedCat ? selectedCat.name : 'General',
      price: Number(formData.price) || 0,
      stock: Number(formData.stock) || 0,
      pages: Number(formData.pages) || 100,
      publishedYear: Number(formData.publishedYear) || new Date().getFullYear(),
      coverColor: formData.coverColor,
      accentColor: formData.accentColor,
      coverImage: formData.coverImage,
      description: formData.description,
      content: formData.content
    };

    try {
      const updated = await saveBook(payload);
      setBooks(updated);
      setIsModalOpen(false);
      addToast({
        title: 'Success',
        description: editingBook ? 'Book updated successfully' : 'New book added to store',
        type: 'success'
      });
    } catch (err) {
      addToast({ title: 'Error', description: 'Failed to save book', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      const updated = await deleteBook(id);
      setBooks(updated);
      setDeleteConfirmId(null);
      addToast({ title: 'Deleted', description: 'Book removed from catalog', type: 'success' });
    } catch (e) {
      addToast({ title: 'Error', description: 'Failed to delete book', type: 'error' });
    }
  };

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Book',
      key: 'title',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <BookCover
            title={row.title}
            author={row.author}
            coverColor={row.coverColor}
            accentColor={row.accentColor}
            coverImage={row.coverImage}
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
      render: (val) => <Tag size="xs">{val || 'General'}</Tag>
    },
    {
      header: 'Price',
      accessor: 'price',
      sortable: true,
      render: (val) => `Rp ${Number(val).toLocaleString('id-ID')}`
    },
    {
      header: 'Stock',
      accessor: 'stock',
      sortable: true,
      render: (val) => (
        <Tag variant={val < 5 ? 'error' : 'default'} size="xs">
          {val} in stock
        </Tag>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon="Edit2" onClick={() => handleOpenEdit(row)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" icon="Trash2" onClick={() => setDeleteConfirmId(row.id)}>
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <Header title="Manage Books" subtitle="Add new books with cover, full text, and synopsis" showSearch={false} />

      <div className="p-4 sm:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by title, author, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="Search"
            />
          </div>
          <Button variant="primary" icon="Plus" onClick={handleOpenAdd}>
            Add New Book
          </Button>
        </div>

        <Table
          columns={columns}
          data={filteredBooks}
          isLoading={isLoading}
          emptyMessage="No books in database yet"
          emptySubMessage="Click 'Add New Book' above to create your first book entry."
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBook ? 'Edit Book' : 'Add New Book'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Book Title"
              placeholder="e.g. Harry Potter and the Sorcerer's Stone"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
              label="Author Name"
              placeholder="e.g. J.K. Rowling"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              options={categories.map(c => ({ value: c.id, label: c.name }))}
            />
            <Input
              label="Price (IDR)"
              type="number"
              placeholder="95000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
            <Input
              label="Stock Quantity"
              type="number"
              placeholder="10"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
          </div>

          {/* Cover Image Upload / URL */}
          <div className="p-4 bg-surface-subtle border border-border rounded-xl flex flex-col gap-3">
            <label className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Book Cover Image
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Image URL (Optional)"
                placeholder="https://example.com/cover.jpg"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">Or Upload Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="text-xs file:mr-3 file:py-2 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent file:text-white hover:file:bg-accent-hover cursor-pointer"
                />
              </div>
            </div>
            {formData.coverImage && (
              <div className="flex items-center gap-3 mt-1">
                <img src={formData.coverImage} alt="Cover preview" className="h-16 w-12 object-cover rounded-md shadow" />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                  className="text-xs text-error hover:underline"
                >
                  Remove custom image
                </button>
              </div>
            )}
          </div>

          {/* Synopsis */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Synopsis & Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-surface border border-border text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Write an enticing book summary..."
            />
          </div>

          {/* Book Content for Reader */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Book Reading Content (Full text / Chapters)</label>
            <textarea
              rows={5}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-surface border border-border text-sm rounded-xl p-3 font-serif focus:outline-none focus:ring-2 focus:ring-accent leading-relaxed"
              placeholder="Write or paste the book reading text here for the e-reader..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingBook ? 'Save Changes' : 'Publish Book'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Deletion"
        maxWidth="max-w-md"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete this book? This will remove it from the catalog, library, and readers.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => handleDelete(deleteConfirmId)}>
              Delete Book
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

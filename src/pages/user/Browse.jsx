// src/pages/user/Browse.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getBooks, getCategories, getWishlist, toggleWishlist } from 'lib/api';
import { BookCover } from '../../components/ui/BookCover';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Tag } from '../../components/ui/Tag';
import { Icon } from '../../components/ui/Icon';
import { Skeleton } from '../../components/ui/Skeleton';
import { Header } from '../../components/layout/Header';
import { Pagination } from '../../components/ui/Pagination';
import { useCart } from '../../store/useCart';
import { useToast } from '../../store/useToast';

const PAGE_SIZE = 20;

export function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search, filter, sort, and pagination state
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addToast } = useToast();

  // Debounce search input (250ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (searchTerm) {
        setSearchParams({ search: searchTerm });
      } else {
        setSearchParams({});
      }
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm, setSearchParams]);

  // Reset to page 1 on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, sortBy]);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const [bks, cats, wish] = await Promise.all([getBooks(), getCategories(), getWishlist()]);
      setBooks(bks);
      setCategories(cats);
      setWishlist(wish);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleToggleWish = async (e, bookId) => {
    e.stopPropagation();
    const updated = await toggleWishlist(bookId);
    setWishlist(updated);
    addToast({
      title: updated.some(id => String(id) === String(bookId)) ? 'Saved to Wishlist' : 'Removed from Wishlist',
      type: 'info'
    });
  };

  const handleAddToCart = (e, book) => {
    e.stopPropagation();
    addItem(book, 1);
    addToast({
      title: 'Added to Bag',
      description: `"${book.title}" added to your bag.`,
      type: 'success'
    });
  };

  // Filter and sort logic
  const filteredAndSortedBooks = useMemo(() => {
    return books
      .filter((b) => {
        const matchesCategory =
          selectedCategory === 'All' ||
          (b.category && b.category.toLowerCase() === selectedCategory.toLowerCase());
        const q = debouncedSearch.toLowerCase();
        const matchesSearch =
          !debouncedSearch ||
          (b.title && b.title.toLowerCase().includes(q)) ||
          (b.author && b.author.toLowerCase().includes(q)) ||
          (b.category && b.category.toLowerCase().includes(q));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [books, selectedCategory, debouncedSearch, sortBy]);

  // Paginated books slice (20 items per page)
  const totalPages = Math.ceil(filteredAndSortedBooks.length / PAGE_SIZE);
  const displayedBooks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedBooks.slice(start, start + PAGE_SIZE);
  }, [filteredAndSortedBooks, currentPage]);

  return (
    <div>
      <Header title="Browse Catalog" subtitle="Find books across Indonesian literature, science, and history" />

      <div className="p-4 sm:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
        {/* Controls: Search, Category pills, Sorting */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="w-full sm:w-80">
              <Input
                placeholder="Search by title, author, or genre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="Search"
                endIcon={searchTerm ? 'X' : undefined}
                onEndIconClick={() => setSearchTerm('')}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider shrink-0">
                Sort:
              </span>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-44 text-xs py-2"
                options={[
                  { value: 'featured', label: 'Featured' },
                  { value: 'rating', label: 'Top Rated' },
                  { value: 'price-asc', label: 'Price: Low to High' },
                  { value: 'price-desc', label: 'Price: High to Low' },
                  { value: 'title', label: 'Title: A to Z' }
                ]}
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-1.5 rounded-pill text-xs font-medium transition-all shrink-0 ${
                selectedCategory === 'All'
                  ? 'bg-accent text-white shadow-subtle'
                  : 'bg-surface border border-border text-text-secondary hover:bg-surface-subtle'
              }`}
            >
              All Genres ({books.length})
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-1.5 rounded-pill text-xs font-medium transition-all shrink-0 ${
                    isSelected
                      ? 'bg-accent text-white shadow-subtle'
                      : 'bg-surface border border-border text-text-secondary hover:bg-surface-subtle'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Catalog Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-card" />
            ))}
          </div>
        ) : displayedBooks.length > 0 ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {displayedBooks.map((book) => {
                const isWish = Array.isArray(wishlist) && wishlist.some(id => String(id) === String(book.id));
                return (
                  <Card
                    key={book.id}
                    hover
                    onClick={() => navigate(`/books/${book.id}`)}
                    className="flex flex-col justify-between p-3.5 group relative"
                  >
                    {/* Wishlist button */}
                    <button
                      onClick={(e) => handleToggleWish(e, book.id)}
                      className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-surface/80 backdrop-blur-sm border border-border/50 text-text-tertiary hover:text-error transition-colors"
                      aria-label="Toggle Wishlist"
                    >
                      <Icon
                        name="Heart"
                        size={15}
                        className={isWish ? 'fill-error text-error' : ''}
                      />
                    </button>

                    <div className="flex flex-col items-center">
                      <div className="transform group-hover:scale-105 transition-transform duration-200">
                        <BookCover
                          title={book.title}
                          author={book.author}
                          coverColor={book.coverColor}
                          accentColor={book.accentColor}
                          coverImage={book.coverImage}
                          size="md"
                        />
                      </div>
                      <div className="w-full mt-3 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <Tag size="xs">{book.category}</Tag>
                          <span className="text-[11px] text-text-tertiary font-medium flex items-center gap-0.5">
                            <Icon name="Star" size={12} className="text-warning fill-warning" />
                            {book.rating || 5.0}
                          </span>
                        </div>
                        <h4 className="font-semibold text-text-primary text-sm line-clamp-1 group-hover:text-accent transition-colors">
                          {book.title}
                        </h4>
                        <p className="text-xs text-text-secondary line-clamp-1">{book.author}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-text-primary">
                        Rp {Number(book.price || 0).toLocaleString('id-ID')}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon="Plus"
                        onClick={(e) => handleAddToCart(e, book)}
                        className="h-7 px-2"
                        aria-label="Add to cart"
                      />
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="border-t border-border pt-4 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredAndSortedBooks.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="p-4 bg-surface rounded-full border border-border text-text-tertiary">
              <Icon name="SearchX" size={28} />
            </div>
            <h3 className="text-base font-bold text-text-primary">No books found</h3>
            <p className="text-xs text-text-secondary max-w-sm">
              We couldn't find any books matching your criteria. Try adjusting your search keyword or genre filter.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="mt-2"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
export default Browse;

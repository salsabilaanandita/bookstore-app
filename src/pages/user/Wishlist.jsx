// src/pages/user/Wishlist.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooks, getWishlist, toggleWishlist } from 'lib/api';
import { BookCover } from '../../components/ui/BookCover';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tag } from '../../components/ui/Tag';
import { Icon } from '../../components/ui/Icon';
import { Header } from '../../components/layout/Header';
import { useCart } from '../../store/useCart';
import { useToast } from '../../store/useToast';
import { Skeleton } from '../../components/ui/Skeleton';
import { Pagination } from '../../components/ui/Pagination';

const PAGE_SIZE = 20;

export function Wishlist() {
  const [wishlistBooks, setWishlistBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addToast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    const [allBooks, wishIds] = await Promise.all([getBooks(), getWishlist()]);
    const wishArr = Array.isArray(wishIds) ? wishIds : [];
    setWishlistBooks(allBooks.filter(b => wishArr.some(id => String(id) === String(b.id))));
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemove = async (bookId) => {
    await toggleWishlist(bookId);
    setWishlistBooks(prev => prev.filter(b => b.id !== bookId));
    addToast({ title: 'Removed from Wishlist', type: 'info' });
  };

  const handleAddToCart = (book) => {
    addItem(book, 1);
    addToast({
      title: 'Added to Bag',
      description: `"${book.title}" added to your bag.`,
      type: 'success'
    });
  };

  const paginatedWishlist = wishlistBooks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <Header title="Saved Wishlist" subtitle="Your favorite titles saved for later" />

      <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col gap-6">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-card" />
            ))}
          </div>
        ) : wishlistBooks.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {paginatedWishlist.map((book) => (
              <Card
                key={book.id}
                hover
                onClick={() => navigate(`/books/${book.id}`)}
                className="flex flex-col justify-between p-3.5 group relative"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(book.id);
                  }}
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-surface/80 border border-border text-error hover:scale-110 transition-all"
                  title="Remove from wishlist"
                >
                  <Icon name="Trash2" size={14} />
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
                    <Tag size="xs">{book.category}</Tag>
                    <h4 className="font-semibold text-text-primary text-sm line-clamp-1 group-hover:text-accent transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-xs text-text-secondary line-clamp-1">{book.author}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-text-primary">
                    Rp {book.price.toLocaleString('id-ID')}
                  </span>
                  <Button
                    size="sm"
                    variant="primary"
                    icon="ShoppingBag"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(book);
                    }}
                    className="h-7 px-2"
                  />
                </div>
              </Card>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={wishlistBooks.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="p-4 bg-surface rounded-full border border-border text-text-tertiary">
              <Icon name="Heart" size={32} />
            </div>
            <h3 className="text-base font-bold text-text-primary">Wishlist is empty</h3>
            <p className="text-xs text-text-secondary max-w-sm">
              Save books here while browsing to keep track of titles you want to read next.
            </p>
            <Button variant="primary" onClick={() => navigate('/browse')} className="mt-2">
              Explore Catalog
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

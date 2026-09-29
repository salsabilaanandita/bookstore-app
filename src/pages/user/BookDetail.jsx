// src/pages/user/BookDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBook, getAuthors, getWishlist, toggleWishlist, getLibrary, addToLibrary } from 'lib/api';
import { BookCover } from '../../components/ui/BookCover';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tag } from '../../components/ui/Tag';
import { Icon } from '../../components/ui/Icon';
import { Skeleton } from '../../components/ui/Skeleton';
import { Header } from '../../components/layout/Header';
import { useCart } from '../../store/useCart';
import { useToast } from '../../store/useToast';

export function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [authorInfo, setAuthorInfo] = useState(null);
  const [isWish, setIsWish] = useState(false);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { addItem } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const [b, auths, wish, lib] = await Promise.all([
        getBook(id),
        getAuthors(),
        getWishlist(),
        getLibrary()
      ]);
      if (!b) {
        navigate('/browse', { replace: true });
        return;
      }
      setBook(b);
      const auth = auths.find(a => a.id === b.authorId || a.name === b.author);
      setAuthorInfo(auth || null);
      setIsWish(Array.isArray(wish) && wish.some(item => String(item) === String(b.id)));
      setIsInLibrary(Array.isArray(lib) && lib.some(item => String(item) === String(b.id)));
      setIsLoading(false);
    }
    load();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!book) return;
    addItem(book, 1);
    addToast({
      title: 'Added to Cart',
      description: `"${book.title}" is in your cart.`,
      type: 'success'
    });
  };

  const handleBuyNow = () => {
    if (!book) return;
    addItem(book, 1);
    navigate('/cart');
  };

  const handleToggleWish = async () => {
    if (!book) return;
    const updated = await toggleWishlist(book.id);
    const saved = updated.some(item => String(item) === String(book.id));
    setIsWish(saved);
    addToast({
      title: saved ? 'Saved to Wishlist' : 'Removed from Wishlist',
      type: saved ? 'success' : 'info'
    });
  };

  const handleAddToCollection = async () => {
    if (!book) return;
    await addToLibrary(book.id);
    setIsInLibrary(true);
    addToast({
      title: 'Added to Collections',
      description: `"${book.title}" is now available in your personal library.`,
      type: 'success'
    });
  };

  if (isLoading) {
    return (
      <div>
        <Header showSearch={false} />
        <div className="p-8 max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
          <Skeleton className="w-56 h-80 rounded-cover" />
          <div className="flex-1 flex flex-col gap-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="" subtitle="" showSearch={false} />

      <div className="p-4 sm:p-8 max-w-5xl mx-auto flex flex-col gap-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="self-start flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
        >
          <Icon name="ArrowLeft" size={16} />
          <span>Back to Catalog</span>
        </button>

        {/* Main Showcase */}
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          {/* Book Cover Showcase */}
          <div className="w-full md:w-auto flex justify-center shrink-0">
            <div className="p-6 bg-surface border border-border rounded-panel shadow-card flex items-center justify-center">
              <BookCover
                title={book.title}
                author={book.author}
                coverColor={book.coverColor}
                accentColor={book.accentColor}
                coverImage={book.coverImage}
                size="xl"
              />
            </div>
          </div>

          {/* Book Info */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Tag size="sm" variant="accent">{book.category}</Tag>
                {book.isFeatured && <Tag size="sm">Featured Edition</Tag>}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                {book.title}
              </h1>

              <p className="text-base text-text-secondary font-medium">
                by <span className="text-text-primary font-semibold">{book.author}</span>
              </p>

              <div className="flex items-center gap-4 mt-2 text-xs text-text-tertiary">
                <span className="flex items-center gap-1 text-text-primary font-bold">
                  <Icon name="Star" size={16} className="text-warning fill-warning" />
                  {book.rating} / 5.0
                </span>
                <span>•</span>
                <span>{book.pages || 350} pages</span>
                <span>•</span>
                <span>Published {book.publishedYear || 2018}</span>
              </div>
            </div>

            {/* Price & Purchase Actions */}
            <div className="p-5 bg-surface border border-border rounded-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-text-tertiary font-medium">Digital Edition Price</span>
                <p className="text-2xl font-bold text-text-primary">
                  Rp {book.price.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-success font-medium mt-0.5">
                  {book.stock > 0 ? `In Stock (${book.stock} copies available)` : 'Out of stock'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleToggleWish}
                  icon="Heart"
                  className={isWish ? 'text-error border-error/30 bg-error/10' : ''}
                  aria-label="Wishlist"
                  title={isWish ? 'In Wishlist' : 'Add to Wishlist'}
                />

                {isInLibrary ? (
                  <Button
                    variant="primary"
                    size="md"
                    icon="BookOpen"
                    onClick={() => navigate(`/library/${book.id}/read`)}
                    className="bg-accent hover:bg-accent-hover text-white shadow-sm"
                  >
                    In Collections • Read Now
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      size="md"
                      icon="FolderPlus"
                      onClick={handleAddToCollection}
                      title="Add to personal reading collection"
                    >
                      Collect
                    </Button>
                    <Button
                      variant="secondary"
                      size="md"
                      icon="ShoppingBag"
                      onClick={handleAddToCart}
                      disabled={book.stock <= 0}
                    >
                      Add to Cart
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleBuyNow}
                      disabled={book.stock <= 0}
                    >
                      Buy Now
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Synopsis */}
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Synopsis</h2>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {book.description ||
                  'An unforgettable literary masterpiece weaving profound philosophical insights, memorable human drama, and cultural depth.'}
              </p>
            </div>

            {/* Author Card */}
            {authorInfo && (
              <Card className="p-4 flex flex-col gap-2 bg-surface-subtle border-border">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  About the Author
                </span>
                <p className="text-sm font-bold text-text-primary">{authorInfo.name}</p>
                <p className="text-xs text-text-secondary leading-relaxed">{authorInfo.bio}</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

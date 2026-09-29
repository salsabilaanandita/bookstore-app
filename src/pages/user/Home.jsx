// src/pages/user/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooks, getProgress, getAuthors, getCategories, toggleWishlist, getWishlist } from 'lib/api';
import { BookCover } from '../../components/ui/BookCover';
import { Icon } from '../../components/ui/Icon';
import { Skeleton } from '../../components/ui/Skeleton';
import { Header } from '../../components/layout/Header';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Tag } from '../../components/ui/Tag';
import { useCart } from '../../store/useCart';
import { useToast } from '../../store/useToast';
import { useSession } from '../../store/useSession';

export function Home() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { user } = useSession();

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [prog, bks, auths, cats, wish] = await Promise.all([
          getProgress().catch(() => []),
          getBooks().catch(() => []),
          getAuthors().catch(() => []),
          getCategories().catch(() => []),
          getWishlist().catch(() => [])
        ]);
        setProgressList(prog || []);
        setBooks(bks || []);
        
        // Merge backend authors with verified author list
        const defaultAuthors = [
          { id: 'auth-1', name: 'Tere Liye', booksCount: 20 },
          { id: 'auth-2', name: 'J.K. Rowling', booksCount: 10 },
          { id: 'auth-3', name: 'Stephen King', booksCount: 61, label: 'Novels' },
          { id: 'auth-4', name: 'Danielle Steel', booksCount: 179 },
        ];
        const combinedAuthors = auths && auths.length > 0 
          ? [...auths, ...defaultAuthors.filter(d => !auths.some(a => a.name.toLowerCase() === d.name.toLowerCase()))].slice(0, 5)
          : defaultAuthors;

        setAuthors(combinedAuthors);
        setCategories(cats || []);
        setWishlistIds(wish || []);
      } catch (err) {
        console.error('Home load failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();

    const handleWishUpdated = (e) => {
      if (Array.isArray(e.detail)) {
        setWishlistIds(e.detail);
      }
    };
    window.addEventListener('pustaka_wishlist_updated', handleWishUpdated);
    return () => window.removeEventListener('pustaka_wishlist_updated', handleWishUpdated);
  }, []);

  const handleToggleWishlist = async (e, bookId) => {
    e.stopPropagation();
    try {
      const updated = await toggleWishlist(bookId);
      setWishlistIds(updated);
      const isSaved = updated.some(id => String(id) === String(bookId));
      addToast({
        title: isSaved ? 'Added to Saved' : 'Removed from Saved',
        description: isSaved ? 'Book saved to your wishlist.' : 'Book removed from your wishlist.',
        type: isSaved ? 'success' : 'info'
      });
    } catch (err) {
      addToast({ title: 'Action failed', description: err.message, type: 'error' });
    }
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

  // Curated lists
  const heroBook = books.find(b => b.featured) || books[0];
  const newReleases = books.slice(0, 8);
  const bestSellers = [...books].sort((a, b) => (b.stock || 0) - (a.stock || 0)).slice(0, 6);
  const filteredBooks = selectedGenre === 'all'
    ? newReleases
    : books.filter(b => b.category?.toLowerCase() === selectedGenre.toLowerCase());

  const cardGradients = [
    'from-[#4A3222] to-[#2B1B10]',
    'from-[#16273C] to-[#0A1420]',
    'from-[#1E2530] to-[#0F141B]',
    'from-[#2D1F38] to-[#170E1E]'
  ];

  // Display recent reads, fallback to top catalog books if user hasn't read yet
  const displayProgress = progressList.length > 0 
    ? progressList 
    : books.slice(0, 3).map((b, idx) => ({
        bookId: b.id,
        title: b.title,
        author: b.author,
        coverColor: b.coverColor,
        accentColor: b.accentColor,
        coverImage: b.coverImage,
        currentPage: idx === 0 ? 193 : idx === 1 ? 45 : 82,
        subtitle: idx === 0 ? '193 Page • Chapter 13 • Last Read' : idx === 1 ? 'New Purchase • Yet to Read' : '82 Page • Chapter 6 • Reading',
      }));

  return (
    <div className="bg-canvas min-h-screen pb-16">
      <Header />

      <div className="px-4 sm:px-8 lg:px-10 py-6 max-w-[1600px] mx-auto flex flex-col gap-10">
        
        {/* ========================================================================= */}
        {/* 1. HERO SPOTLIGHT BANNER */}
        {/* ========================================================================= */}
        {isLoading ? (
          <Skeleton className="w-full h-72 sm:h-80 md:h-96 rounded-[28px]" />
        ) : heroBook ? (
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2E241E] via-[#1E1713] to-[#120E0B] text-white p-6 sm:p-10 md:p-12 shadow-card border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 group">
            {/* Ambient Backlight Glow */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-sage/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Left Content */}
            <div className="relative z-10 flex-1 flex flex-col items-start gap-4 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 bg-accent/25 border border-accent/40 text-accent text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Icon name="Sparkles" size={13} />
                  Editor's Spotlight
                </span>
                <span className="px-2.5 py-1 bg-white/10 text-white/80 text-xs font-medium rounded-full">
                  {heroBook.category || 'Featured'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {heroBook.title}
              </h1>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-white/70">
                <span className="font-semibold text-white/90">By {heroBook.author}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Icon name="Star" size={13} className="fill-amber-400" />
                  4.9
                </span>
                <span>•</span>
                <span>{heroBook.pages || 350} Pages</span>
              </div>

              <p className="text-xs sm:text-sm text-white/75 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl">
                {heroBook.description ||
                  'Step into an enthralling journey crafted with rich storytelling, unforgettable characters, and timeless literary wonder.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  size="md"
                  variant="primary"
                  icon="BookOpen"
                  onClick={() => navigate(`/books/${heroBook.id}`)}
                  className="shadow-lg shadow-accent/25 hover:scale-105 transition-transform"
                >
                  View Details & Read
                </Button>

                <Button
                  size="md"
                  variant="secondary"
                  icon="ShoppingBag"
                  onClick={(e) => handleAddToCart(e, heroBook)}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  Add to Bag • Rp {heroBook.price.toLocaleString('id-ID')}
                </Button>

                <button
                  onClick={(e) => handleToggleWishlist(e, heroBook.id)}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/15"
                  title="Save to wishlist"
                >
                  <Icon
                    name="Bookmark"
                    size={18}
                    className={wishlistIds.some((id) => String(id) === String(heroBook.id)) ? 'fill-accent text-accent' : ''}
                  />
                </button>
              </div>
            </div>

            {/* Right Book Cover Preview (Floating with 3D Effect) */}
            <div className="relative z-10 shrink-0 transform md:group-hover:scale-105 md:group-hover:-rotate-1 transition-all duration-300">
              <div className="relative p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                <BookCover
                  title={heroBook.title}
                  author={heroBook.author}
                  coverColor={heroBook.coverColor}
                  accentColor={heroBook.accentColor}
                  coverImage={heroBook.coverImage}
                  size="lg"
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* ========================================================================= */}
        {/* 2. GENRE PILLS BAR */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedGenre('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedGenre === 'all'
                ? 'bg-text-primary text-white shadow-sm'
                : 'bg-surface hover:bg-surface-subtle text-text-secondary border border-border'
            }`}
          >
            <Icon name="Compass" size={14} />
            All Genres
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id || cat.slug}
              onClick={() => setSelectedGenre(cat.slug || cat.name)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 capitalize ${
                selectedGenre.toLowerCase() === (cat.slug || cat.name).toLowerCase()
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-surface hover:bg-surface-subtle text-text-secondary border border-border'
              }`}
            >
              {cat.name}
            </button>
          ))}
          <button
            onClick={() => navigate('/browse')}
            className="px-3.5 py-2 rounded-full text-xs font-semibold text-accent hover:underline shrink-0 flex items-center gap-1"
          >
            Browse all <Icon name="ArrowRight" size={13} />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 3. BOOKS YOU READ LAST (Exact Dribbble Kindle Style) */}
        {/* ========================================================================= */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold tracking-tight text-text-primary flex items-center gap-2">
              <Icon name="Clock" size={18} className="text-accent" />
              Books you read last
            </h2>
            <button
              onClick={() => navigate('/library')}
              className="text-xs font-semibold text-accent hover:underline"
            >
              My Library ({displayProgress.length})
            </button>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 pt-6 scrollbar-none items-center">
            {displayProgress.map((item, idx) => {
              const gradient = cardGradients[idx % cardGradients.length];
              return (
                <div
                  key={item.bookId || idx}
                  onClick={() => navigate(`/books/${item.bookId}`)}
                  className={`group relative bg-gradient-to-r ${gradient} rounded-[24px] pl-5 pr-6 py-4.5 min-w-[330px] sm:min-w-[360px] shadow-card hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex gap-4 items-center shrink-0 border border-white/10 text-white`}
                >
                  {/* Protruding cover that pops up above card */}
                  <div className="-mt-9 shrink-0 transform group-hover:scale-105 transition-transform duration-200 shadow-cover">
                    <BookCover
                      title={item.title}
                      author={item.author}
                      coverColor={item.coverColor}
                      accentColor={item.accentColor}
                      coverImage={item.coverImage}
                      size="md"
                    />
                  </div>

                  {/* Text info inside card */}
                  <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                    <div>
                      <h3 className="font-bold text-white text-sm line-clamp-1 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-white/70 font-medium mt-1">
                        {item.subtitle || `${item.currentPage || 1} Page • ${item.lastChapter?.split(':')[0] || 'Chapter 1'} • Last Read`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                      <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Resume</span>
                      <div className="h-7 w-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-accent group-hover:text-white transition-colors shadow-sm">
                        <Icon name="ArrowRight" size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. MAIN DUAL-COLUMN LAYOUT (Books Grid + Interactive Sidebar) */}
        {/* ========================================================================= */}
        <div className="flex flex-col xl:flex-row gap-8 items-start">
          
          {/* LEFT: Primary Book Sections */}
          <div className="flex-1 w-full flex flex-col gap-10 min-w-0">
            
            {/* New Release / Filtered Catalog */}
            <section className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-text-primary">
                    {selectedGenre === 'all' ? 'New Release & Fresh Highlights' : `${selectedGenre} Books`}
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Discover new stories, best-selling editions, and community favorites.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/browse')}
                  className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                >
                  View full catalog <Icon name="ArrowRight" size={13} />
                </button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-72 rounded-2xl" />
                  ))}
                </div>
              ) : filteredBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                  {filteredBooks.map((book) => {
                    const isWish = wishlistIds.some((id) => String(id) === String(book.id));
                    return (
                      <div
                        key={book.id}
                        onClick={() => navigate(`/books/${book.id}`)}
                        className="group relative bg-surface rounded-2xl p-3.5 border border-border hover:border-accent/40 shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                      >
                        {/* Wishlist quick toggle */}
                        <button
                          onClick={(e) => handleToggleWishlist(e, book.id)}
                          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-surface/90 border border-border/80 text-text-tertiary hover:text-accent hover:scale-110 transition-all shadow-sm"
                          title="Save to wishlist"
                        >
                          <Icon
                            name="Bookmark"
                            size={14}
                            className={isWish ? 'fill-accent text-accent' : ''}
                          />
                        </button>

                        {/* Cover Image Presentation */}
                        <div className="flex flex-col items-center pt-2">
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

                          <div className="w-full mt-3.5 flex flex-col items-start gap-1">
                            <Tag size="xs" variant="accent">{book.category}</Tag>
                            <h3 className="font-bold text-text-primary text-sm line-clamp-1 group-hover:text-accent transition-colors w-full text-left">
                              {book.title}
                            </h3>
                            <p className="text-xs text-text-secondary line-clamp-1 font-medium w-full text-left">
                              {book.author}
                            </p>
                          </div>
                        </div>

                        {/* Price & Fast Action */}
                        <div className="mt-3.5 pt-3 border-t border-border flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-text-primary">
                            Rp {book.price.toLocaleString('id-ID')}
                          </span>
                          <button
                            onClick={(e) => handleAddToCart(e, book)}
                            className="p-1.5 rounded-lg bg-surface-subtle hover:bg-accent hover:text-white text-text-primary border border-border transition-colors"
                            title="Add to bag"
                          >
                            <Icon name="ShoppingBag" size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center bg-surface rounded-2xl border border-border">
                  <p className="text-xs text-text-secondary">No books found for this category.</p>
                </div>
              )}
            </section>

            {/* Curated Promo Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-[#FAF6EB] to-[#F2EDE0] dark:from-[#26211C] dark:to-[#1C1814] rounded-2xl p-5 border border-border/80 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Pustaka Premium Club</span>
                  <h4 className="font-bold text-text-primary text-sm">Read Anywhere, Anytime</h4>
                  <p className="text-xs text-text-secondary">Sync your reading progress seamlessly on your mobile, tablet, and PC.</p>
                  <Button size="xs" variant="primary" onClick={() => navigate('/browse')} className="w-fit mt-1">
                    Explore Titles
                  </Button>
                </div>
                <div className="p-3 bg-white dark:bg-surface rounded-2xl shadow-sm text-accent">
                  <Icon name="Smartphone" size={32} />
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#F0F5ED] to-[#E5EFE1] dark:from-[#1E261D] dark:to-[#141A13] rounded-2xl p-5 border border-border/80 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-sage uppercase tracking-wider">Instant Access</span>
                  <h4 className="font-bold text-text-primary text-sm">Direct E-Book Reader</h4>
                  <p className="text-xs text-text-secondary">Built-in reader with customizable typography, dark mode, and night warmth.</p>
                  <Button size="xs" variant="secondary" onClick={() => navigate('/library')} className="w-fit mt-1">
                    Open Library
                  </Button>
                </div>
                <div className="p-3 bg-white dark:bg-surface rounded-2xl shadow-sm text-sage">
                  <Icon name="BookOpen" size={32} />
                </div>
              </div>
            </div>

            {/* Popular / Best Sellers Showcase */}
            {bestSellers.length > 0 && (
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold tracking-tight text-text-primary">
                      Trending & Popular Books
                    </h2>
                    <p className="text-xs text-text-secondary">Most read and purchased books this month.</p>
                  </div>
                  <button
                    onClick={() => navigate('/browse')}
                    className="text-xs font-semibold text-accent hover:underline"
                  >
                    View more
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bestSellers.map((book, idx) => (
                    <div
                      key={book.id}
                      onClick={() => navigate(`/books/${book.id}`)}
                      className="bg-surface rounded-2xl p-4 border border-border hover:border-accent/40 shadow-subtle hover:shadow-card transition-all cursor-pointer flex gap-4 items-center group"
                    >
                      <div className="shrink-0 relative">
                        <span className="absolute -top-2 -left-2 z-10 h-5 w-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                          #{idx + 1}
                        </span>
                        <BookCover
                          title={book.title}
                          author={book.author}
                          coverColor={book.coverColor}
                          accentColor={book.accentColor}
                          coverImage={book.coverImage}
                          size="sm"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                        <div>
                          <Tag size="xs">{book.category}</Tag>
                          <h4 className="font-bold text-text-primary text-sm line-clamp-1 group-hover:text-accent transition-colors mt-1">
                            {book.title}
                          </h4>
                          <p className="text-xs text-text-secondary line-clamp-1 font-medium">{book.author}</p>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                          <span className="text-xs font-bold text-text-primary">
                            Rp {book.price.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[11px] font-semibold text-accent group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                            Detail <Icon name="ChevronRight" size={12} />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* ========================================================================= */}
          {/* RIGHT SIDEBAR (Authors, Reading Goal, Quote, Perks) */}
          {/* ========================================================================= */}
          <aside className="w-full xl:w-80 shrink-0 flex flex-col gap-6">
            
            {/* 1. Daily Reading Goal Card */}
            <div className="bg-gradient-to-br from-[#FAF5EB] to-[#F3ECD9] dark:from-[#25201A] dark:to-[#1B1713] rounded-3xl p-5 border border-border/80 shadow-subtle flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Icon name="Flame" size={16} />
                  </div>
                  <span className="text-xs font-bold text-text-primary">Daily Reading Goal</span>
                </div>
                <span className="text-xs font-bold text-accent">20 / 30 m</span>
              </div>

              <div className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-gradient-to-r from-accent to-amber-400 rounded-full" />
              </div>

              <div className="flex items-center justify-between text-[11px] text-text-secondary font-medium">
                <span>🔥 5 Days Streak!</span>
                <span className="text-accent font-semibold">Keep it up</span>
              </div>
            </div>

            {/* 2. Famous Authors */}
            <div className="bg-surface-sand rounded-3xl p-6 flex flex-col gap-5 border border-border shadow-subtle">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Icon name="Users" size={16} className="text-accent" />
                  Famous Authors
                </h3>
                <span className="text-[11px] text-text-tertiary">Verified</span>
              </div>

              {authors.length > 0 ? (
                <div className="flex flex-col gap-3.5">
                  {authors.map((author) => (
                    <div
                      key={author.id || author.name}
                      onClick={() => navigate(`/browse?search=${encodeURIComponent(author.name)}`)}
                      className="flex items-center justify-between p-2 rounded-2xl hover:bg-surface transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={author.name} size="md" className="ring-2 ring-white shadow-sm shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs text-text-primary group-hover:text-accent transition-colors truncate">
                            {author.name}
                          </span>
                          <span className="text-[11px] text-text-secondary font-medium">
                            {author.booksCount || 1} Books
                          </span>
                        </div>
                      </div>

                      <button className="text-text-tertiary group-hover:text-accent p-1.5 rounded-full">
                        <Icon name="ChevronRight" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-tertiary text-center py-4">
                  Authors will appear here as books are published.
                </p>
              )}
            </div>

            {/* 3. Literary Quote of the Day */}
            <div className="bg-surface rounded-3xl p-6 border border-border shadow-subtle flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute top-2 right-2 text-border-subtle opacity-40">
                <Icon name="Quote" size={64} />
              </div>
              <div className="flex items-center gap-2 text-accent text-xs font-bold">
                <Icon name="Quote" size={14} />
                <span>Quote of the Day</span>
              </div>
              <blockquote className="text-xs italic text-text-secondary leading-relaxed z-10">
                "Buku adalah jembatan emas yang menghubungkan masa lalu dengan masa depan, membuka jendela cakrawala dunia tanpa batas."
              </blockquote>
              <div className="text-[11px] font-bold text-text-primary text-right z-10">
                — Pustaka Editorial
              </div>
            </div>

            {/* 4. Help & Community shortcut */}
            <div className="bg-gradient-to-r from-accent/10 to-sage/10 rounded-3xl p-5 border border-border flex flex-col gap-2.5 text-center items-center">
              <div className="p-2.5 rounded-full bg-surface text-accent shadow-sm">
                <Icon name="Headphones" size={20} />
              </div>
              <h4 className="text-xs font-bold text-text-primary">Need Reading Recommendations?</h4>
              <p className="text-[11px] text-text-secondary">
                Our team curates top titles every week. Reach out anytime!
              </p>
              <Button size="xs" variant="secondary" onClick={() => navigate('/browse')} className="mt-1">
                Browse Recommendations
              </Button>
            </div>

          </aside>
        </div>

        {/* ========================================================================= */}
        {/* 5. VALUE PROPOSITION FOOTER STRIP */}
        {/* ========================================================================= */}
        <div className="mt-6 pt-8 border-t border-border/80 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-surface border border-border text-accent shadow-sm">
              <Icon name="Zap" size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-text-primary">Instant Delivery</h4>
              <p className="text-[11px] text-text-secondary">Read immediately in browser</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-surface border border-border text-sage shadow-sm">
              <Icon name="Cloud" size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-text-primary">Cloud Sync</h4>
              <p className="text-[11px] text-text-secondary">Sync pages across devices</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-surface border border-border text-amber-600 shadow-sm">
              <Icon name="ShieldCheck" size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-text-primary">Original Quality</h4>
              <p className="text-[11px] text-text-secondary">High-res crisp typography</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-surface border border-border text-emerald-600 shadow-sm">
              <Icon name="Lock" size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-text-primary">Secure Checkout</h4>
              <p className="text-[11px] text-text-secondary">Encrypted transactions</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}



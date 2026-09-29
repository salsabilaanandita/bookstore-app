// src/pages/user/MyLibrary.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooks, getLibrary, getProgress } from 'lib/api';
import { BookCover } from '../../components/ui/BookCover';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tag } from '../../components/ui/Tag';
import { Header } from '../../components/layout/Header';
import { Skeleton } from '../../components/ui/Skeleton';
import { Pagination } from '../../components/ui/Pagination';

const PAGE_SIZE = 20;

export function MyLibrary() {
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const [allBooks, libIds, prog] = await Promise.all([getBooks(), getLibrary(), getProgress()]);
      const owned = allBooks.filter(b => libIds.includes(b.id));
      setLibraryBooks(owned);

      const pMap = {};
      prog.forEach(p => {
        pMap[p.bookId] = p;
      });
      setProgressMap(pMap);
      setIsLoading(false);
    }
    load();
  }, []);

  const paginatedBooks = libraryBooks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <Header title="My Library" subtitle="Your purchased digital titles ready for reading" />

      <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col gap-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-card" />
            ))}
          </div>
        ) : libraryBooks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedBooks.map((book) => {
                const prog = progressMap[book.id];
                const percent = prog ? Math.round((prog.currentPage / (book.pages || 350)) * 100) : 0;

                return (
                  <Card key={book.id} className="flex gap-4 p-4 items-center">
                    <BookCover
                      title={book.title}
                      author={book.author}
                      coverColor={book.coverColor}
                      accentColor={book.accentColor}
                      coverImage={book.coverImage}
                      size="sm"
                    />

                    <div className="flex-1 flex flex-col justify-between min-w-0 h-full">
                      <div>
                        <Tag size="xs" variant="accent">{book.category}</Tag>
                        <h3 className="font-semibold text-text-primary text-sm line-clamp-1 mt-1">
                          {book.title}
                        </h3>
                        <p className="text-xs text-text-secondary line-clamp-1">{book.author}</p>
                      </div>

                      <div className="flex flex-col gap-2 mt-3">
                        {prog && (
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[11px] text-text-tertiary">
                              <span>{percent}% done</span>
                              <span>{prog.currentPage} of {book.pages || 350} p.</span>
                            </div>
                            <div className="w-full h-1 bg-surface-subtle border border-border/40 rounded-full overflow-hidden">
                              <div style={{ width: `${percent}%` }} className="h-full bg-accent rounded-full" />
                            </div>
                          </div>
                        )}

                        <Button
                          size="sm"
                          variant="primary"
                          icon="BookOpen"
                          onClick={() => navigate(`/library/${book.id}/read`)}
                          className="w-full mt-1"
                        >
                          {prog ? 'Continue Reading' : 'Start Reading'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={libraryBooks.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <h3 className="text-base font-bold text-text-primary">No books in your library</h3>
            <p className="text-xs text-text-secondary max-w-sm">
              You have not purchased any books yet. Explore the catalog to start building your personal collection.
            </p>
            <Button variant="primary" onClick={() => navigate('/browse')} className="mt-2">
              Browse Books
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

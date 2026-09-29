// src/pages/user/Reader.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBook, getProgress, saveProgress } from 'lib/api';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Skeleton } from '../../components/ui/Skeleton';

export function Reader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [fontSize, setFontSize] = useState('text-base'); // sm, base, lg, xl
  const [readerTheme, setReaderTheme] = useState('light'); // light, sepia, dark
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const [b, prog] = await Promise.all([getBook(id), getProgress()]);
      if (!b) {
        navigate('/library', { replace: true });
        return;
      }
      setBook(b);
      const existing = prog.find(p => p.bookId === id);
      if (existing) {
        setCurrentPage(existing.currentPage || 1);
      }
      setIsLoading(false);
    }
    load();
  }, [id, navigate]);

  const totalPages = book?.pages || 350;

  const handlePageChange = async (newPage) => {
    const clamped = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(clamped);
    if (book) {
      await saveProgress({
        bookId: book.id,
        title: book.title,
        author: book.author,
        currentPage: clamped,
        totalPages,
        lastChapter: `Chapter ${Math.ceil(clamped / 25)}: The Journey`,
        coverColor: book.coverColor,
        accentColor: book.accentColor
      });
    }
  };

  const themeStyles = {
    light: 'bg-white text-gray-900',
    sepia: 'bg-[#FBF0D9] text-[#5F4B32]',
    dark: 'bg-[#1C1C1E] text-[#E5E5E7]'
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center p-6">
        <Skeleton className="h-96 w-full max-w-2xl rounded-panel" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${themeStyles[readerTheme]}`}>
      {/* Top Reader Navigation Bar */}
      <header className="sticky top-0 z-20 px-6 py-3 border-b border-black/10 flex items-center justify-between backdrop-blur-md bg-opacity-80">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon="ArrowLeft" onClick={() => navigate('/library')}>
            Library
          </Button>
          <div className="hidden sm:flex flex-col">
            <h1 className="text-xs font-bold truncate max-w-xs">{book?.title}</h1>
            <p className="text-[11px] opacity-70 truncate">{book?.author}</p>
          </div>
        </div>

        {/* Reader Controls */}
        <div className="flex items-center gap-3">
          {/* Font size toggle */}
          <div className="flex items-center border border-black/10 rounded-pill px-2 py-0.5 gap-1">
            <button
              onClick={() => setFontSize('text-sm')}
              className={`text-xs px-2 py-1 font-semibold rounded ${fontSize === 'text-sm' ? 'bg-black/10' : ''}`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('text-base')}
              className={`text-sm px-2 py-1 font-semibold rounded ${fontSize === 'text-base' ? 'bg-black/10' : ''}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('text-lg')}
              className={`text-base px-2 py-1 font-semibold rounded ${fontSize === 'text-lg' ? 'bg-black/10' : ''}`}
            >
              A+
            </button>
          </div>

          {/* Theme toggles */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setReaderTheme('light')}
              className={`h-6 w-6 rounded-full bg-white border border-gray-300 shadow-sm ${readerTheme === 'light' ? 'ring-2 ring-accent' : ''}`}
              title="Light Theme"
            />
            <button
              onClick={() => setReaderTheme('sepia')}
              className={`h-6 w-6 rounded-full bg-[#FBF0D9] border border-[#d6c4a5] shadow-sm ${readerTheme === 'sepia' ? 'ring-2 ring-accent' : ''}`}
              title="Sepia Theme"
            />
            <button
              onClick={() => setReaderTheme('dark')}
              className={`h-6 w-6 rounded-full bg-[#1C1C1E] border border-gray-700 shadow-sm ${readerTheme === 'dark' ? 'ring-2 ring-accent' : ''}`}
              title="Dark Theme"
            />
          </div>
        </div>
      </header>

      {/* Main Reading Canvas */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10 flex flex-col justify-between">
        <div className={`leading-relaxed tracking-normal font-serif ${fontSize} space-y-6 select-text`}>
          <div className="text-center font-sans uppercase text-xs tracking-widest opacity-60 mb-8">
            {book?.title} — Page {currentPage}
          </div>

          {book?.content ? (
            book.content.split('\n\n').map((para, pIdx) => (
              <p key={pIdx} className="indent-8 text-justify leading-loose">
                {para}
              </p>
            ))
          ) : (
            <>
              <p className="indent-8 text-justify">
                Matahari mulai meninggi di atas cakrawala ketika deru kehidupan kota pelabuhan kembali berdenyut. 
                Dalam setiap hela napas dan langkah kaki yang bergesekan dengan batu-batu jalanan, tersimpan riwayat 
                panjang tentang harapan, cita-cita, serta perjuangan manusia yang tak kunjung padam oleh zaman.
              </p>
              <p className="indent-8 text-justify">
                "Seseorang yang terdidik harus berlaku adil sejak dalam pikiran, apalagi dalam perbuatan," 
                bisikan kalimat bijak itu terus bergema, menuntun setiap keputusan yang harus diambil di tengah 
                persimpangan jalan yang penuh dengan teka-teki tak terduga.
              </p>
            </>
          )}
        </div>

        {/* Bottom Page Navigation */}
        <div className="pt-10 border-t border-black/10 flex items-center justify-between text-xs font-sans select-none">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            icon="ChevronLeft"
          >
            Previous
          </Button>

          <div className="flex flex-col items-center gap-1">
            <span className="font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <span className="text-[10px] opacity-60">
              {Math.round((currentPage / totalPages) * 100)}% complete
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            iconRight="ChevronRight"
          >
            Next
          </Button>
        </div>
      </main>
    </div>
  );
}

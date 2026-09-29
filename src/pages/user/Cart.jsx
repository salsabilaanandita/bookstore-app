// src/pages/user/Cart.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../store/useCart';
import { BookCover } from '../../components/ui/BookCover';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Header } from '../../components/layout/Header';

export function Cart() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const subtotal = getTotalPrice();
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax;

  if (items.length === 0) {
    return (
      <div>
        <Header title="Shopping Bag" subtitle="Review your selected items" showSearch={false} />
        <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="p-4 bg-surface rounded-full border border-border text-text-tertiary">
            <Icon name="ShoppingBag" size={36} />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Your bag is empty</h2>
          <p className="text-xs text-text-secondary max-w-xs">
            Explore our curated catalog and discover your next great read.
          </p>
          <Button variant="primary" size="md" onClick={() => navigate('/browse')} className="mt-2">
            Explore Books
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Shopping Bag" subtitle={`${items.length} titles in your bag`} showSearch={false} />

      <div className="p-4 sm:p-8 max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        {/* Cart items */}
        <div className="flex-1 w-full flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Items
            </span>
            <button
              onClick={clearCart}
              className="text-xs text-error hover:underline font-medium"
            >
              Clear all
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {items.map(({ bookId, book, quantity, price }) => (
              <Card key={bookId} className="flex items-center justify-between p-4 gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <BookCover
                    title={book.title}
                    author={book.author}
                    coverColor={book.coverColor}
                    accentColor={book.accentColor}
                    coverImage={book.coverImage}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-text-primary text-sm line-clamp-1">{book.title}</h3>
                    <p className="text-xs text-text-secondary line-clamp-1">{book.author}</p>
                    <p className="text-xs font-bold text-text-primary mt-1">
                      Rp {price.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {/* Quantity modifier */}
                  <div className="flex items-center border border-border rounded-pill bg-surface-subtle p-1 gap-1">
                    <button
                      onClick={() => updateQuantity(bookId, quantity - 1)}
                      className="p-1 hover:bg-border/40 rounded-full text-text-secondary transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Icon name="Minus" size={14} />
                    </button>
                    <span className="text-xs font-semibold px-2 min-w-[20px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(bookId, quantity + 1)}
                      className="p-1 hover:bg-border/40 rounded-full text-text-secondary transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Icon name="Plus" size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(bookId)}
                    className="text-text-tertiary hover:text-error p-2 transition-colors"
                    aria-label="Remove item"
                  >
                    <Icon name="Trash2" size={16} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-80 shrink-0">
          <Card className="p-6 flex flex-col gap-4 bg-surface border border-border sticky top-20">
            <h3 className="text-base font-bold text-text-primary">Order Summary</h3>

            <div className="flex flex-col gap-2.5 text-xs text-text-secondary border-b border-border pb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-text-primary font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>PPN (11%)</span>
                <span className="text-text-primary font-medium">Rp {tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Digital Delivery</span>
                <span className="text-success font-medium">Instant (Free)</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-bold text-text-primary">Total</span>
              <span className="text-xl font-bold text-text-primary">Rp {total.toLocaleString('id-ID')}</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/checkout')}
              className="w-full mt-2"
            >
              Proceed to Checkout
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

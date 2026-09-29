// src/pages/user/Checkout.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../store/useCart';
import { useSession } from '../../store/useSession';
import { useToast } from '../../store/useToast';
import { createOrder } from 'lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Header } from '../../components/layout/Header';

export function Checkout() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useSession();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getTotalPrice();
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsProcessing(true);
    try {
      const orderPayload = {
        userId: user?.id,
        customerName: user?.name,
        items: items.map(i => ({
          bookId: i.bookId,
          title: i.book.title,
          price: i.price,
          quantity: i.quantity
        })),
        total
      };

      const newOrder = await createOrder(orderPayload);
      clearCart();
      addToast({
        title: 'Order Placed Successfully',
        description: `Order #${newOrder.id} has been created and books added to your library.`,
        type: 'success'
      });
      navigate('/library');
    } catch (e) {
      addToast({ title: 'Error', description: 'Failed to process order', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-text-secondary">No items to checkout.</p>
        <Button onClick={() => navigate('/browse')} className="mt-4">
          Browse Books
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Header title="Checkout" subtitle="Complete your digital purchase" showSearch={false} />

      <div className="p-4 sm:p-8 max-w-4xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        {/* Form */}
        <form onSubmit={handlePlaceOrder} className="flex-1 w-full flex flex-col gap-6">
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" defaultValue={user?.name || 'Budi Pratama'} readOnly />
              <Input label="Email Address" defaultValue={user?.email || 'user@pustaka.id'} readOnly />
            </div>
          </Card>

          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Payment Method (Simulated)
            </h3>
            <div className="flex flex-col gap-2.5">
              {[
                { id: 'qris', name: 'QRIS Instant Pay', desc: 'Scan with GoPay, OVO, BCA, or Dana' },
                { id: 'va', name: 'Virtual Account Transfer', desc: 'BCA, Mandiri, BNI, BRI' },
                { id: 'wallet', name: 'Pustaka Balance', desc: 'Instant deduction from store wallet' }
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-start gap-3 p-3.5 rounded-card border cursor-pointer transition-all ${
                    paymentMethod === m.id
                      ? 'bg-accent-subtle/50 border-accent text-text-primary'
                      : 'border-border bg-surface hover:bg-surface-subtle text-text-secondary'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.id}
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                    className="mt-1 accent-accent"
                  />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{m.name}</p>
                    <p className="text-xs text-text-tertiary mt-0.5">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <Button type="submit" variant="primary" size="lg" isLoading={isProcessing} className="w-full">
            Confirm &amp; Pay Rp {total.toLocaleString('id-ID')}
          </Button>
        </form>

        {/* Order review */}
        <div className="w-full lg:w-80 shrink-0">
          <Card className="p-6 flex flex-col gap-4 bg-surface border border-border">
            <h3 className="text-base font-bold text-text-primary">Order Summary</h3>

            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto divide-y divide-border/60">
              {items.map(item => (
                <div key={item.bookId} className="pt-2 first:pt-0 flex justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-text-primary truncate">{item.book.title}</p>
                    <p className="text-text-tertiary">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium text-text-primary shrink-0">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3 flex flex-col gap-2 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Tax (11%)</span>
                <span>Rp {tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-text-primary pt-2 border-t border-border">
                <span>Total Due</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

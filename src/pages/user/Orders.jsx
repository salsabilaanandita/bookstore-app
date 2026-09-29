// src/pages/user/Orders.jsx
import React, { useState, useEffect } from 'react';
import { getOrders } from 'lib/api';
import { useSession } from '../../store/useSession';
import { Card } from '../../components/ui/Card';
import { Tag } from '../../components/ui/Tag';
import { Header } from '../../components/layout/Header';
import { Skeleton } from '../../components/ui/Skeleton';
import { Pagination } from '../../components/ui/Pagination';

const PAGE_SIZE = 20;

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useSession();

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const list = await getOrders(user?.id);
      setOrders(list);
      setIsLoading(false);
    }
    load();
  }, [user]);

  const paginatedOrders = orders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <Header title="My Orders" subtitle="Purchase history and fulfillment records" showSearch={false} />

      <div className="p-4 sm:p-8 max-w-5xl mx-auto flex flex-col gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-card" />
          ))
        ) : orders.length > 0 ? (
          <>
            {paginatedOrders.map((order) => (
              <Card key={order.id} className="p-5 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
                  <div>
                    <span className="text-xs text-text-tertiary">Order ID</span>
                    <p className="text-sm font-bold text-text-primary">{order.id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary">{order.date}</span>
                    <Tag
                      variant={
                        order.status === 'Completed'
                          ? 'success'
                          : order.status === 'Pending'
                          ? 'warning'
                          : order.status === 'Processing'
                          ? 'accent'
                          : 'error'
                      }
                    >
                      {order.status}
                    </Tag>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 py-1">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-text-secondary">
                      <span>
                        {item.title} <span className="text-text-tertiary">(x{item.quantity})</span>
                      </span>
                      <span className="font-medium text-text-primary">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="text-xs font-semibold text-text-tertiary uppercase">Total Paid</span>
                  <span className="text-base font-bold text-text-primary">
                    Rp {order.total.toLocaleString('id-ID')}
                  </span>
                </div>
              </Card>
            ))}

            <Pagination
              currentPage={currentPage}
              totalItems={orders.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="py-20 text-center text-text-secondary">
            <p>You have no order history yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

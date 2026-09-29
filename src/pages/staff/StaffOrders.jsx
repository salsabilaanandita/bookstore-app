// src/pages/staff/StaffOrders.jsx
import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from 'lib/api';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Tag } from '../../components/ui/Tag';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../store/useToast';
import { Header } from '../../components/layout/Header';

export function StaffOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const { addToast } = useToast();

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const list = await getOrders();
      setOrders(list);
    } catch (e) {
      addToast({ title: 'Error', description: 'Failed to load orders', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenStatus = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const updated = await updateOrderStatus(selectedOrder.id, newStatus);
      setOrders(updated);
      setSelectedOrder(null);
      addToast({
        title: 'Status Updated',
        description: `Order ${selectedOrder.id} is now ${newStatus}`,
        type: 'success'
      });
    } catch (e) {
      addToast({ title: 'Error', description: 'Failed to update order status', type: 'error' });
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'All') return true;
    return o.status === statusFilter;
  });

  const columns = [
    {
      header: 'Order ID',
      accessor: 'id',
      sortable: true,
      render: (val) => <span className="font-semibold text-text-primary">{val}</span>
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      sortable: true
    },
    {
      header: 'Items',
      key: 'items',
      render: (_, row) => (
        <span className="text-xs text-text-secondary">
          {row.items?.map(i => `${i.title} (x${i.quantity})`).join(', ')}
        </span>
      )
    },
    {
      header: 'Date',
      accessor: 'date',
      sortable: true,
      render: (val) => <span className="text-xs text-text-tertiary">{val}</span>
    },
    {
      header: 'Total',
      accessor: 'total',
      sortable: true,
      render: (val) => `Rp ${Number(val).toLocaleString('id-ID')}`
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (val) => (
        <Tag
          variant={
            val === 'Completed'
              ? 'success'
              : val === 'Pending'
              ? 'warning'
              : val === 'Processing'
              ? 'accent'
              : 'error'
          }
          size="xs"
        >
          {val}
        </Tag>
      )
    },
    {
      header: 'Action',
      key: 'action',
      render: (_, row) => (
        <Button variant="secondary" size="sm" onClick={() => handleOpenStatus(row)}>
          Change Status
        </Button>
      )
    }
  ];

  return (
    <div>
      <Header title="Orders Management" subtitle="Review and update customer order fulfillment statuses" showSearch={false} />

      <div className="p-4 sm:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Filter:</span>
          <div className="flex gap-2 flex-wrap">
            {['All', 'Pending', 'Processing', 'Completed', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-accent text-white shadow-subtle'
                    : 'bg-surface border border-border text-text-secondary hover:bg-surface-subtle'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <Table columns={columns} data={filteredOrders} isLoading={isLoading} />
      </div>

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Update Order #${selectedOrder?.id}`}
      >
        {selectedOrder && (
          <form onSubmit={handleUpdateStatus} className="flex flex-col gap-4">
            <div className="p-3 bg-surface-subtle rounded-card border border-border flex flex-col gap-1">
              <span className="text-xs text-text-tertiary">Customer: {selectedOrder.customerName}</span>
              <span className="text-sm font-semibold text-text-primary">
                Total: Rp {selectedOrder.total?.toLocaleString('id-ID')}
              </span>
            </div>

            <Select
              label="Fulfillment Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={[
                { value: 'Pending', label: 'Pending' },
                { value: 'Processing', label: 'Processing' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Cancelled', label: 'Cancelled' }
              ]}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Update Status
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

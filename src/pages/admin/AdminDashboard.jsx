// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReports, getOrders, getBooks } from 'lib/api';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Tag } from '../../components/ui/Tag';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Header } from '../../components/layout/Header';

export function AdminDashboard() {
  const [reports, setReports] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockBooks, setLowStockBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const [rep, ords, bks] = await Promise.all([getReports(), getOrders(), getBooks()]);
      setReports(rep);
      setRecentOrders(ords.slice(0, 5));
      setLowStockBooks(bks.filter(b => b.stock < 5));
      setIsLoading(false);
    }
    load();
  }, []);

  const orderColumns = [
    { header: 'Order ID', accessor: 'id', render: (val) => <span className="font-semibold text-text-primary">{val}</span> },
    { header: 'Customer', accessor: 'customerName' },
    { header: 'Date', accessor: 'date' },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => (
        <Tag
          variant={val === 'Completed' ? 'success' : val === 'Pending' ? 'warning' : val === 'Processing' ? 'accent' : 'error'}
          size="xs"
        >
          {val}
        </Tag>
      )
    },
    {
      header: 'Total',
      accessor: 'total',
      render: (val) => `Rp ${Number(val).toLocaleString('id-ID')}`
    }
  ];

  return (
    <div>
      <Header title="Admin Overview" subtitle="System metrics, inventory status, and sales overview" showSearch={false} />

      <div className="p-4 sm:p-8 flex flex-col gap-8 max-w-7xl mx-auto">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-text-tertiary">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
              <Icon name="DollarSign" size={18} className="text-success" />
            </div>
            <p className="text-2xl font-bold text-text-primary">
              Rp {(reports?.totalRevenue || 0).toLocaleString('id-ID')}
            </p>
            <span className="text-xs text-success font-medium flex items-center gap-1">
              <Icon name="TrendingUp" size={14} /> +14.2% from last week
            </span>
          </Card>

          <Card className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-text-tertiary">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
              <Icon name="ShoppingBag" size={18} className="text-accent" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{reports?.totalOrders || 0}</p>
            <span className="text-xs text-text-secondary">{reports?.pendingOrders || 0} pending fulfillment</span>
          </Card>

          <Card className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-text-tertiary">
              <span className="text-xs font-semibold uppercase tracking-wider">Low Stock Alerts</span>
              <Icon name="AlertTriangle" size={18} className="text-warning" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{reports?.lowStockCount || 0}</p>
            <span className="text-xs text-warning font-medium">Action required</span>
          </Card>

          <Card className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-text-tertiary">
              <span className="text-xs font-semibold uppercase tracking-wider">Quick Actions</span>
              <Icon name="Zap" size={18} className="text-accent" />
            </div>
            <div className="flex gap-2 mt-1">
              <Button size="sm" variant="primary" onClick={() => navigate('/admin/books')} className="w-full">
                Add Book
              </Button>
              <Button size="sm" variant="secondary" onClick={() => navigate('/admin/reports')} className="w-full">
                Reports
              </Button>
            </div>
          </Card>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-text-primary">Recent Orders</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/orders')}>
                View All Orders
              </Button>
            </div>
            <Table columns={orderColumns} data={recentOrders} isLoading={isLoading} />
          </div>

          {/* Low Stock Items */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-text-primary">Low Stock Notice</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/inventory')}>
                Manage
              </Button>
            </div>
            <Card className="flex flex-col gap-3 divide-y divide-border">
              {lowStockBooks.length === 0 ? (
                <p className="text-xs text-text-tertiary py-4 text-center">All stocks healthy</p>
              ) : (
                lowStockBooks.map(book => (
                  <div key={book.id} className="pt-3 first:pt-0 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-text-primary line-clamp-1">{book.title}</p>
                      <p className="text-[11px] text-text-tertiary">{book.author}</p>
                    </div>
                    <Tag variant="error" size="xs">
                      {book.stock} left
                    </Tag>
                  </div>
                ))
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

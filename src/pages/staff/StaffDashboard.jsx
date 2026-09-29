// src/pages/staff/StaffDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReports, getOrders } from 'lib/api';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Tag } from '../../components/ui/Tag';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Header } from '../../components/layout/Header';

export function StaffDashboard() {
  const [reports, setReports] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const [rep, ords] = await Promise.all([getReports(), getOrders()]);
      setReports(rep);
      setPendingOrders(ords.filter(o => o.status === 'Pending').slice(0, 6));
      setIsLoading(false);
    }
    load();
  }, []);

  const orderColumns = [
    { header: 'Order ID', accessor: 'id', render: (val) => <span className="font-semibold">{val}</span> },
    { header: 'Customer', accessor: 'customerName' },
    { header: 'Date', accessor: 'date' },
    {
      header: 'Total',
      accessor: 'total',
      render: (val) => `Rp ${Number(val).toLocaleString('id-ID')}`
    },
    {
      header: 'Action',
      key: 'action',
      render: () => (
        <Button variant="secondary" size="sm" onClick={() => navigate('/staff/orders')}>
          Process
        </Button>
      )
    }
  ];

  return (
    <div>
      <Header title="Staff Dashboard" subtitle="Order queue and inventory alerts" showSearch={false} />

      <div className="p-4 sm:p-8 flex flex-col gap-8 max-w-7xl mx-auto">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="flex flex-col gap-2 p-5">
            <div className="flex items-center justify-between text-text-tertiary">
              <span className="text-xs font-semibold uppercase tracking-wider">Pending Orders</span>
              <Icon name="Clock" size={20} className="text-warning" />
            </div>
            <p className="text-3xl font-bold text-text-primary">{reports?.pendingOrders || 0}</p>
            <span className="text-xs text-warning font-medium">Needs packaging & verification</span>
          </Card>

          <Card className="flex flex-col gap-2 p-5">
            <div className="flex items-center justify-between text-text-tertiary">
              <span className="text-xs font-semibold uppercase tracking-wider">Low Stock Titles</span>
              <Icon name="AlertTriangle" size={20} className="text-error" />
            </div>
            <p className="text-3xl font-bold text-text-primary">{reports?.lowStockCount || 0}</p>
            <span className="text-xs text-error font-medium">Restock suggested (&lt;5 units)</span>
          </Card>

          <Card className="flex flex-col gap-2 p-5">
            <div className="flex items-center justify-between text-text-tertiary">
              <span className="text-xs font-semibold uppercase tracking-wider">Quick Jump</span>
              <Icon name="ArrowRightCircle" size={20} className="text-accent" />
            </div>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="primary" onClick={() => navigate('/staff/orders')} className="w-full">
                Process Orders
              </Button>
              <Button size="sm" variant="secondary" onClick={() => navigate('/staff/inventory')} className="w-full">
                Inventory
              </Button>
            </div>
          </Card>
        </div>

        {/* Pending Orders Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">Orders Awaiting Action</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/staff/orders')}>
              All Orders
            </Button>
          </div>
          <Table columns={orderColumns} data={pendingOrders} isLoading={isLoading} emptyMessage="No pending orders in queue" />
        </div>
      </div>
    </div>
  );
}

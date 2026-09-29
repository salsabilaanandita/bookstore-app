// src/pages/admin/AdminReports.jsx
import React, { useState, useEffect } from 'react';
import { getReports } from 'lib/api';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/layout/Header';
import { Skeleton } from '../../components/ui/Skeleton';
import { Icon } from '../../components/ui/Icon';

export function AdminReports() {
  const [reports, setReports] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getReports().then((data) => {
      setReports(data);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !reports) {
    return (
      <div>
        <Header title="Sales & Analytics Reports" subtitle="Performance metrics" showSearch={false} />
        <div className="p-8 max-w-6xl mx-auto flex flex-col gap-6">
          <Skeleton className="h-64 rounded-panel" />
          <Skeleton className="h-64 rounded-panel" />
        </div>
      </div>
    );
  }

  const defaultDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyOrders = reports.dailyOrders && reports.dailyOrders.length > 0
    ? reports.dailyOrders.map(d => ({
        day: d.day || d.date || 'Day',
        revenue: Number(d.revenue ?? d.total ?? d.amount ?? 0),
        count: Number(d.count ?? d.orders ?? 0)
      }))
    : defaultDays.map(day => ({ day, revenue: 0, count: 0 }));

  const categorySales = (reports.categorySales || []).map(c => ({
    category: c.category || c.name || 'General',
    revenue: Number(c.revenue ?? c.total ?? c.amount ?? 0)
  }));

  const maxDailyRevenue = Math.max(...dailyOrders.map(d => d.revenue), 1);
  const maxCatRevenue = Math.max(...categorySales.map(c => c.revenue), 1);

  return (
    <div>
      <Header
        title="Sales & Analytics Reports"
        subtitle="Revenue breakdown, order volume, and category distribution"
        showSearch={false}
      />

      <div className="p-4 sm:p-8 flex flex-col gap-8 max-w-6xl mx-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 flex flex-col gap-1">
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Total Revenue</span>
            <p className="text-2xl font-black text-text-primary tracking-tight">
              Rp {Number(reports.totalRevenue || 0).toLocaleString('id-ID')}
            </p>
          </Card>
          <Card className="p-5 flex flex-col gap-1">
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Total Orders</span>
            <p className="text-2xl font-black text-text-primary tracking-tight">
              {Number(reports.totalOrders || 0)}
            </p>
          </Card>
          <Card className="p-5 flex flex-col gap-1">
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Pending Orders</span>
            <p className="text-2xl font-black text-warning tracking-tight">
              {Number(reports.pendingOrders || 0)}
            </p>
          </Card>
        </div>

        {/* Daily Orders Bar Chart */}
        <Card className="flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Weekly Revenue & Volume</h2>
              <p className="text-xs text-text-secondary">Daily performance over the last 7 days</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-surface-subtle border border-border rounded-pill text-text-secondary">
              Past 7 Days
            </span>
          </div>

          <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 pt-8 pb-2 px-2 border-b border-border">
            {dailyOrders.map((item, idx) => {
              const heightPercent = maxDailyRevenue > 0 && item.revenue > 0
                ? Math.round((item.revenue / maxDailyRevenue) * 100)
                : 4;

              return (
                <div key={item.day || idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[11px] text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                    Rp {item.revenue > 0 ? (item.revenue / 1000).toFixed(0) + 'k' : '0'}
                  </div>
                  <div className="w-full max-w-[48px] bg-surface-subtle rounded-t-lg h-full flex items-end overflow-hidden">
                    <div
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        item.revenue > 0 ? 'bg-accent group-hover:bg-accent-hover' : 'bg-border/40'
                      }`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-text-secondary mt-1">{item.day}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Category Sales Distribution */}
        <Card className="flex flex-col gap-6 p-6">
          <div>
            <h2 className="text-base font-bold text-text-primary">Sales by Category</h2>
            <p className="text-xs text-text-secondary">Total revenue generated per literary genre</p>
          </div>

          {categorySales.length > 0 ? (
            <div className="flex flex-col gap-4">
              {categorySales.map((cat, idx) => {
                const pct = maxCatRevenue > 0 && cat.revenue > 0
                  ? Math.round((cat.revenue / maxCatRevenue) * 100)
                  : 4;

                return (
                  <div key={cat.category || idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-text-primary">{cat.category}</span>
                      <span className="text-text-secondary">Rp {Number(cat.revenue || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="w-full h-2.5 bg-surface-subtle rounded-full overflow-hidden border border-border/40">
                      <div
                        style={{ width: `${Math.max(pct, 2)}%` }}
                        className="h-full bg-accent rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center flex flex-col items-center gap-2 text-text-secondary">
              <Icon name="BarChart3" size={32} className="text-text-tertiary" />
              <p className="text-xs font-medium">No category sales recorded yet.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
export default AdminReports;

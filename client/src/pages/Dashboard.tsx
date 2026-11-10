import { useEffect, useState } from 'react';
import { TrendingUp, AlertCircle, Package, Loader } from 'lucide-react';
import { MainLayout } from '../layout/MainLayout';
import { StatCard, Card, Badge } from '../components/UI';
import { getAnalytics, getLowStockProducts } from '../services/api';

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalProfit: number;
    totalSales: number;
    averageTransactionValue: number;
  };
  topProducts: Array<{
    product: { id: string; name: string };
    totalQuantitySold: number;
  }>;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  costPrice: number;
  sellingPrice: number;
}

export const Dashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [lowStockItems, setLowStockItems] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [analyticsData, lowStockData] = await Promise.all([
          getAnalytics(30),
          getLowStockProducts(10),
        ]);
        setAnalytics(analyticsData);
        setLowStockItems(lowStockData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
        setError(errorMessage);
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader className="animate-spin mx-auto text-accent mb-4" size={40} />
            <p className="text-textSecondary">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-500/10 border-red-500/30">
            <div className="flex items-center space-x-3">
              <AlertCircle className="text-red-400" size={24} />
              <div>
                <p className="font-semibold text-text">Error Loading Dashboard</p>
                <p className="text-sm text-textSecondary">{error}</p>
              </div>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const stats = {
    totalRevenue: `₦${analytics?.summary.totalRevenue.toLocaleString() || '0'}`,
    totalProfit: `₦${analytics?.summary.totalProfit.toLocaleString() || '0'}`,
    totalSales: analytics?.summary.totalSales || 0,
    lowStock: lowStockItems.length,
  };

  const topProducts = (analytics?.topProducts || []).slice(0, 5).map((item, idx) => ({
    id: idx,
    name: item.product.name,
    sales: item.totalQuantitySold,
    revenue: `₦${(item.totalQuantitySold * 45000).toLocaleString()}`, // Approximation
  }));

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-text">Welcome to Dashboard</h1>
          <p className="text-textSecondary mt-2">
            BENOVERTECH GADGETS - Premium POS System
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Revenue"
            value={stats.totalRevenue}
            icon={<TrendingUp />}
            trend={12.5}
          />
          <StatCard
            label="Total Profit"
            value={stats.totalProfit}
            icon={<TrendingUp />}
            trend={8.2}
          />
          <StatCard
            label="Total Sales"
            value={stats.totalSales}
            trend={15.3}
          />
          <StatCard
            label="Low Stock Items"
            value={stats.lowStock}
            icon={<AlertCircle />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Selling Products */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-text">Top Selling Products</h2>
                  <p className="text-sm text-textSecondary mt-1">Last 30 days</p>
                </div>
                <Package className="text-accent" size={24} />
              </div>

              <div className="space-y-3">
                {topProducts.map((product, idx) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 bg-primary rounded-lg border border-surfaceLight hover:border-accent/30 transition-all"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-text">{product.name}</p>
                        <p className="text-xs text-textSecondary">{product.sales} units sold</p>
                      </div>
                    </div>
                    <p className="font-bold text-accent">{product.revenue}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Low Stock Alerts */}
          <Card>
            <div className="flex items-center space-x-2 mb-6">
              <AlertCircle className="text-red-400" size={24} />
              <div>
                <h2 className="text-lg font-bold text-text">Low Stock Alerts</h2>
                <p className="text-xs text-textSecondary">Action required</p>
              </div>
            </div>

            <div className="space-y-3">
              {lowStockItems.map((product) => (
                <div
                  key={product.id}
                  className="p-4 bg-primary rounded-lg border border-red-500/30 hover:border-red-500/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-text text-sm">{product.name}</p>
                      <p className="text-xs text-textSecondary mt-1">
                        Stock: <span className="text-red-400 font-semibold">{product.stock}</span>/10
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-surfaceLight rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${(product.stock / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {lowStockItems.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-textSecondary text-sm">All products have healthy stock levels</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <p className="text-textSecondary text-sm font-semibold uppercase">Avg Transaction</p>
            <p className="text-3xl font-bold text-accent mt-2">
              ₦{analytics?.summary.averageTransactionValue.toLocaleString() || '0'}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-textSecondary text-sm font-semibold uppercase">Profit Margin</p>
            <p className="text-3xl font-bold text-secondary mt-2">
              {analytics
                ? (
                    ((analytics.summary.totalProfit / analytics.summary.totalRevenue) * 100) ||
                    0
                  ).toFixed(1)
                : '0'}
              %
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-textSecondary text-sm font-semibold uppercase">Active Products</p>
            <p className="text-3xl font-bold text-green-400 mt-2">{topProducts.length}</p>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

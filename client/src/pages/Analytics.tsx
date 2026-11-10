import { useEffect, useState } from 'react';
import { MainLayout } from '../layout/MainLayout';
import { Card, StatCard, Badge } from '../components/UI';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Calendar, Loader, AlertCircle } from 'lucide-react';
import { getAnalytics } from '../services/api';

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
  dailyData: Array<{
    date: string;
    revenue: number;
    profit: number;
    sales: number;
  }>;
}

const COLORS = ['#D4A574', '#9333EA', '#F5A623', '#00C49F', '#FFBB28'];

export const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAnalytics(30);
        setAnalyticsData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
        setError(errorMessage);
        console.error('Analytics error:', err);
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
            <p className="text-textSecondary">Loading analytics...</p>
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
                <p className="font-semibold text-text">Error Loading Analytics</p>
                <p className="text-sm text-textSecondary">{error}</p>
              </div>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const summary = analyticsData?.summary || {
    totalRevenue: 0,
    totalProfit: 0,
    totalSales: 0,
    averageTransactionValue: 0,
  };

  const dailyData = analyticsData?.dailyData || [];
  const topProducts = (analyticsData?.topProducts || []).slice(0, 5);
  const profitMargin = summary.totalRevenue > 0 ? ((summary.totalProfit / summary.totalRevenue) * 100).toFixed(1) : '0';

  // Payment methods distribution (mock - can be added to API later)
  const paymentMethods = [
    { name: 'Cash', value: 35, color: '#D4A574' },
    { name: 'Transfer', value: 45, color: '#9333EA' },
    { name: 'Card', value: 20, color: '#F5A623' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text">Analytics & Reports</h1>
            <p className="text-textSecondary mt-1">Business performance insights</p>
          </div>
          <div className="flex items-center space-x-2 bg-surface rounded-lg px-4 py-2 border border-surfaceLight">
            <Calendar className="text-accent" size={20} />
            <span className="text-text font-semibold">Last 30 Days</span>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Revenue"
            value={`₦${summary.totalRevenue.toLocaleString()}`}
            trend={12.5}
          />
          <StatCard
            label="Total Profit"
            value={`₦${summary.totalProfit.toLocaleString()}`}
            trend={8.2}
          />
          <StatCard label="Total Sales" value={summary.totalSales} trend={15.3} />
          <StatCard
            label="Profit Margin"
            value={`${profitMargin}%`}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue & Profit Trend */}
          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-text">Revenue & Profit Trend</h2>
              <p className="text-sm text-textSecondary mt-1">Last 30 days</p>
            </div>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                  <XAxis dataKey="date" stroke="#A0A0A0" />
                  <YAxis stroke="#A0A0A0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      border: '1px solid #2D2D2D',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#FFFFFF' }}
                  />
                  <Legend wrapperStyle={{ color: '#A0A0A0' }} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#D4A574"
                    strokeWidth={2}
                    dot={{ fill: '#D4A574', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#9333EA"
                    strokeWidth={2}
                    dot={{ fill: '#9333EA', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Profit"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-textSecondary">No data available</p>
              </div>
            )}
          </Card>

          {/* Daily Sales Volume */}
          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-text">Daily Sales Volume</h2>
              <p className="text-sm text-textSecondary mt-1">Revenue by day</p>
            </div>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                  <XAxis dataKey="date" stroke="#A0A0A0" />
                  <YAxis stroke="#A0A0A0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      border: '1px solid #2D2D2D',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#FFFFFF' }}
                  />
                  <Bar dataKey="revenue" fill="#D4A574" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-textSecondary">No data available</p>
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Products */}
          <Card className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-text">Top Selling Products</h2>
              <p className="text-sm text-textSecondary mt-1">By quantity sold</p>
            </div>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((item, idx) => {
                  const percentage = summary.totalSales > 0 
                    ? ((item.totalQuantitySold / summary.totalSales) * 100).toFixed(1)
                    : '0';
                  return (
                    <div key={idx} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-text text-sm">{item.product.name}</p>
                          <p className="text-accent font-bold">{item.totalQuantitySold} units</p>
                        </div>
                        <div className="w-full bg-surfaceLight rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-accent to-accentLight h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <Badge variant="accent" className="text-xs">
                        {percentage}%
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-textSecondary">No sales data available</p>
              </div>
            )}
          </Card>

          {/* Payment Methods */}
          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-text">Payment Methods</h2>
              <p className="text-sm text-textSecondary mt-1">Distribution</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {paymentMethods.map((method, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[idx] }}
                  />
                  <span className="text-sm text-textSecondary">{method.name}</span>
                  <span className="text-sm text-text font-semibold ml-auto">{method.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card>
          <h2 className="text-lg font-bold text-text mb-6">Performance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-primary rounded-lg border border-surfaceLight">
              <p className="text-textSecondary text-sm font-semibold uppercase">Total Transactions</p>
              <p className="text-3xl font-bold text-accent mt-2">{summary.totalSales}</p>
              <p className="text-xs text-green-400 mt-2">↑ 15% from last month</p>
            </div>
            <div className="p-4 bg-primary rounded-lg border border-surfaceLight">
              <p className="text-textSecondary text-sm font-semibold uppercase">Avg Transaction Value</p>
              <p className="text-3xl font-bold text-secondary mt-2">
                ₦{summary.averageTransactionValue.toLocaleString()}
              </p>
              <p className="text-xs text-green-400 mt-2">↑ 8% from last month</p>
            </div>
            <div className="p-4 bg-primary rounded-lg border border-surfaceLight">
              <p className="text-textSecondary text-sm font-semibold uppercase">Total Revenue</p>
              <p className="text-3xl font-bold text-accent mt-2">
                ₦{(summary.totalRevenue / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-green-400 mt-2">↑ 12% from last month</p>
            </div>
            <div className="p-4 bg-primary rounded-lg border border-surfaceLight">
              <p className="text-textSecondary text-sm font-semibold uppercase">Profit Margin</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{profitMargin}%</p>
              <p className="text-xs text-green-400 mt-2">↑ 2% from last month</p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text">Analytics & Reports</h1>
            <p className="text-textSecondary mt-1">Business performance insights</p>
          </div>
          <div className="flex items-center space-x-2 bg-surface rounded-lg px-4 py-2 border border-surfaceLight">
            <Calendar className="text-accent" size={20} />
            <span className="text-text font-semibold">Last 30 Days</span>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Revenue" value={stats.totalRevenue} trend={12.5} />
          <StatCard label="Average Daily" value={stats.avgDaily} trend={8.2} />
          <StatCard label="Best Selling Day" value={stats.bestDay} />
          <StatCard label="Profit Margin" value={stats.profitMargin} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue & Profit Trend */}
          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-text">Revenue & Profit Trend</h2>
              <p className="text-sm text-textSecondary mt-1">Last 7 days</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                <XAxis dataKey="date" stroke="#A0A0A0" />
                <YAxis stroke="#A0A0A0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #2D2D2D',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#FFFFFF' }}
                />
                <Legend wrapperStyle={{ color: '#A0A0A0' }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D4A574"
                  strokeWidth={2}
                  dot={{ fill: '#D4A574', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#9333EA"
                  strokeWidth={2}
                  dot={{ fill: '#9333EA', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Daily Sales Volume */}
          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-text">Daily Sales Volume</h2>
              <p className="text-sm text-textSecondary mt-1">Revenue by day</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                <XAxis dataKey="date" stroke="#A0A0A0" />
                <YAxis stroke="#A0A0A0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #2D2D2D',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#FFFFFF' }}
                />
                <Bar dataKey="revenue" fill="#D4A574" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Products */}
          <Card className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-text">Top Selling Products</h2>
              <p className="text-sm text-textSecondary mt-1">By revenue</p>
            </div>
            <div className="space-y-3">
              {topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-text text-sm">{product.name}</p>
                      <p className="text-accent font-bold">₦{product.value.toLocaleString()}</p>
                    </div>
                    <div className="w-full bg-surfaceLight rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-accent to-accentLight h-2 rounded-full"
                        style={{ width: `${product.percentage}%` }}
                      />
                    </div>
                  </div>
                  <Badge variant="accent" className="text-xs">
                    {product.percentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment Methods */}
          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-text">Payment Methods</h2>
              <p className="text-sm text-textSecondary mt-1">Distribution</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {paymentMethods.map((method, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[idx] }}
                  />
                  <span className="text-sm text-textSecondary">{method.name}</span>
                  <span className="text-sm text-text font-semibold ml-auto">{method.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card>
          <h2 className="text-lg font-bold text-text mb-6">Performance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-primary rounded-lg border border-surfaceLight">
              <p className="text-textSecondary text-sm font-semibold uppercase">Total Transactions</p>
              <p className="text-3xl font-bold text-accent mt-2">127</p>
              <p className="text-xs text-green-400 mt-2">↑ 15% from last month</p>
            </div>
            <div className="p-4 bg-primary rounded-lg border border-surfaceLight">
              <p className="text-textSecondary text-sm font-semibold uppercase">Avg Transaction Value</p>
              <p className="text-3xl font-bold text-secondary mt-2">₦19,291</p>
              <p className="text-xs text-green-400 mt-2">↑ 8% from last month</p>
            </div>
            <div className="p-4 bg-primary rounded-lg border border-surfaceLight">
              <p className="text-textSecondary text-sm font-semibold uppercase">Conversion Rate</p>
              <p className="text-3xl font-bold text-accent mt-2">68%</p>
              <p className="text-xs text-yellow-400 mt-2">→ No change</p>
            </div>
            <div className="p-4 bg-primary rounded-lg border border-surfaceLight">
              <p className="text-textSecondary text-sm font-semibold uppercase">Customer Satisfaction</p>
              <p className="text-3xl font-bold text-green-400 mt-2">4.8/5</p>
              <p className="text-xs text-green-400 mt-2">↑ 2% from last month</p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

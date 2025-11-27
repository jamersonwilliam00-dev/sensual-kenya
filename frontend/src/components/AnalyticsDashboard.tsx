import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { 
  TrendingUp, DollarSign, ShoppingCart, Users, Eye, Package,
  Download, Calendar, ArrowUp, ArrowDown, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../utils/supabase/info';

interface AnalyticsDashboardProps {
  accessToken: string;
}

interface DashboardStats {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalPageViews: number;
    totalProductViews: number;
    totalSignups: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  today: {
    pageViews: number;
    productViews: number;
    orders: number;
    revenue: number;
    signups: number;
  };
  chartData: Array<{
    date: string;
    revenue: number;
    orders: number;
    pageViews: number;
  }>;
  productCount: number;
  pendingOrders: number;
  completedOrders: number;
}

export function AnalyticsDashboard({ accessToken }: AnalyticsDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesReport, setSalesReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState('30');

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (reportPeriod) {
      loadSalesReport();
    }
  }, [reportPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/analytics/dashboard`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      
      if (!res.ok) {
        throw new Error('Failed to load analytics');
      }
      
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const loadSalesReport = async () => {
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/analytics/sales-report?period=${reportPeriod}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      
      if (!res.ok) {
        throw new Error('Failed to load sales report');
      }
      
      const data = await res.json();
      setSalesReport(data);
    } catch (error) {
      console.error('Error loading sales report:', error);
      toast.error('Failed to load sales report');
    }
  };

  const exportData = async (type: string) => {
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/export/${type}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      
      if (!res.ok) {
        throw new Error('Failed to export data');
      }
      
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sensual-kenya-${type}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`${type} data exported successfully`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No analytics data available</p>
        <Button onClick={loadAnalytics} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `KSh ${stats.summary.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: '+12%',
      positive: true,
      description: 'Last 30 days'
    },
    {
      title: 'Total Orders',
      value: stats.summary.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      change: '+8%',
      positive: true,
      description: `${stats.pendingOrders} pending`
    },
    {
      title: 'Page Views',
      value: stats.summary.totalPageViews.toLocaleString(),
      icon: Eye,
      change: '+23%',
      positive: true,
      description: 'Last 30 days'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.summary.conversionRate.toFixed(2)}%`,
      icon: TrendingUp,
      change: stats.summary.conversionRate > 2 ? '+5%' : '-2%',
      positive: stats.summary.conversionRate > 2,
      description: 'Visitors to customers'
    }
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time insights and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportData('analytics')}>
            <Download className="h-4 w-4 mr-2" />
            Export Analytics
          </Button>
          <Button variant="outline" onClick={() => exportData('all')}>
            <Download className="h-4 w-4 mr-2" />
            Full Backup
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl mb-1">{stat.value}</div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant={stat.positive ? 'default' : 'destructive'} className="px-1 py-0">
                    {stat.positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {stat.change}
                  </Badge>
                  <span className="text-muted-foreground">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Order Value</span>
                  <span className="font-semibold">KSh {stats.summary.averageOrderValue.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Products</span>
                  <span className="font-semibold">{stats.productCount}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Product Views</span>
                  <span className="font-semibold">{stats.summary.totalProductViews.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">New Signups</span>
                  <span className="font-semibold">{stats.summary.totalSignups}</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span className="text-sm">Pending Orders</span>
                  </div>
                  <Badge variant="secondary">{stats.pendingOrders}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm">Completed Orders</span>
                  </div>
                  <Badge>{stats.completedOrders}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Orders</span>
                  <span className="font-semibold">{stats.summary.totalOrders}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview (Last 30 Days)</CardTitle>
              <CardDescription>Daily revenue and order trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chart visualization</p>
                  <p className="text-sm">Peak: KSh {Math.max(...stats.chartData.map(d => d.revenue)).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Report Tab */}
        <TabsContent value="sales" className="space-y-4">
          <div className="flex items-center gap-4">
            <Label>Period:</Label>
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadSalesReport}>
              Refresh
            </Button>
            <Button variant="outline" onClick={() => exportData('orders')}>
              <Download className="h-4 w-4 mr-2" />
              Export Orders
            </Button>
          </div>

          {salesReport && (
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">KSh {salesReport.totalSales.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{salesReport.period}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{salesReport.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">{salesReport.period}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Avg Order Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">KSh {salesReport.averageOrderValue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{salesReport.period}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {salesReport?.topProducts && salesReport.topProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salesReport.topProducts.map((product: any, index: number) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.quantity} sold</p>
                        </div>
                      </div>
                      <span className="font-semibold">KSh {product.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Today Tab */}
        <TabsContent value="today" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Today's Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">KSh {stats.today.revenue.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Today's Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stats.today.orders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Today's Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stats.today.pageViews}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Today's Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Product Views</span>
                <span className="font-semibold">{stats.today.productViews}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">New Signups</span>
                <span className="font-semibold">{stats.today.signups}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Conversion Rate</span>
                <span className="font-semibold">
                  {stats.today.pageViews > 0 
                    ? ((stats.today.orders / stats.today.pageViews) * 100).toFixed(2)
                    : 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

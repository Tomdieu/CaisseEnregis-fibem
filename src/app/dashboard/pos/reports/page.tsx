'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { usePOSStore } from '@/stores/posStore';

// Calculate sales data from the store transactions
const calculateSalesData = (transactions) => {
  // Group transactions by date and calculate revenue and orders
  const groupedData = {};

  transactions.forEach(transaction => {
    const date = transaction.date;
    if (!groupedData[date]) {
      groupedData[date] = { revenue: 0, orders: 0 };
    }
    groupedData[date].revenue += transaction.total;
    groupedData[date].orders += 1;
  });

  // Convert to array and sort by date
  return Object.entries(groupedData)
    .map(([date, data]) => ({ date, revenue: data.revenue, orders: data.orders }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // Limit to last 7 days for demo
    .slice(-7);
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

const POSReportsPage = () => {
  const { transactions, products, customers } = usePOSStore();
  const [dateRange, setDateRange] = useState('week');

  // Calculate sales data from transactions
  const salesData = calculateSalesData(transactions);

  // Calculate derived data from the store
  const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const totalOrders = transactions.length;
  const uniqueCustomers = [...new Set(transactions.map(t => t.customer))].length;

  // Calculate top selling products from transactions
  const productSalesMap = new Map();
  transactions.forEach(transaction => {
    transaction.items.forEach(item => {
      if (productSalesMap.has(item.name)) {
        productSalesMap.set(item.name, productSalesMap.get(item.name) + item.qty);
      } else {
        productSalesMap.set(item.name, item.qty);
      }
    });
  });

  const topProducts = Array.from(productSalesMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, sales]) => ({ name, sales }));

  // Calculate payment methods distribution
  const paymentMethodMap = new Map();
  transactions.forEach(transaction => {
    if (paymentMethodMap.has(transaction.paymentMethod)) {
      paymentMethodMap.set(transaction.paymentMethod, paymentMethodMap.get(transaction.paymentMethod) + 1);
    } else {
      paymentMethodMap.set(transaction.paymentMethod, 1);
    }
  });

  const paymentMethods = Array.from(paymentMethodMap.entries())
    .map(([name, value]) => ({ name, value }));
  
  const stats = [
    { title: 'Revenu total', value: `€${totalRevenue.toFixed(2)}`, change: '+12%', icon: DollarSign, color: 'text-green-500' },
    { title: 'Transactions', value: `${totalOrders}`, change: '+8%', icon: ShoppingCart, color: 'text-blue-500' },
    { title: 'Clients uniques', value: `${uniqueCustomers}`, change: '+5%', icon: Users, color: 'text-purple-500' },
    { title: 'Taux de conversion', value: '68%', change: '+3%', icon: TrendingUp, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapports et analyses</h1>
          <p className="text-muted-foreground">
            Suivez les performances de votre commerce en temps réel
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex space-x-2">
        {['today', 'week', 'month', 'quarter', 'year'].map((range) => (
          <Button
            key={range}
            variant={dateRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange(range)}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </Button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change} depuis la période précédente</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution du revenu</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#dbeafe" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Nombre de commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produits les plus vendus</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Moyens de paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Indicateurs de performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Ticket moyen</span>
                <span className="font-bold">€{transactions.length > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span>Fréquence d'achat</span>
                <span className="font-bold">{transactions.length > 0 ? (totalOrders / uniqueCustomers).toFixed(1) : '0'}/mois</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span>Valeur vie client</span>
                <span className="font-bold">€{customers.length > 0 ? (totalRevenue / customers.length).toFixed(2) : '0.00'}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span>Taux de satisfaction</span>
                <span className="font-bold">92%</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span>Coût acquisition</span>
                <span className="font-bold">€12.50</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span>Marge bénéficiaire</span>
                <span className="font-bold">34%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Report */}
        <Card>
          <CardHeader>
            <CardTitle>Rapport des ventes journalières</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-right py-2">Ventes</th>
                    <th className="text-right py-2">Revenu</th>
                    <th className="text-right py-2">Moyenne</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.slice(0, 5).map((day, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-2">{day.date}</td>
                      <td className="py-2 text-right">{day.orders}</td>
                      <td className="py-2 text-right">€{day.revenue.toFixed(2)}</td>
                      <td className="py-2 text-right">€{(day.revenue / day.orders).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Product Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance des produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-muted rounded-full p-2 mr-3">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sales} vendus</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">€{(product.sales * 2.5).toFixed(2)}</p>
                    <Badge variant="secondary">Tendance ↑</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default POSReportsPage;
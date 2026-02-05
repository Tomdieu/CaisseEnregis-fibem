'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  Package,
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  Receipt,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { usePOSStore } from '@/stores/posStore';

const POSDashboard = () => {
  const { transactions, products, customers } = usePOSStore();
  const [activeTab, setActiveTab] = useState('sales');

  // Calculate stats from store data
  const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const totalTransactions = transactions.length;
  const loyalCustomers = customers.filter(customer => customer.points > 1000).length;
  const conversionRate = transactions.length > 0 ? Math.round((transactions.filter(t => t.total > 0).length / transactions.length) * 100) : 0;

  const stats = [
    { title: 'Ventes aujourd\'hui', value: `€${totalRevenue.toFixed(2)}`, change: '+12%', icon: DollarSign },
    { title: 'Transactions', value: `${totalTransactions}`, change: '+8%', icon: ShoppingCart },
    { title: 'Clients fidèles', value: `${loyalCustomers}`, change: '+5%', icon: Users },
    { title: 'Taux de conversion', value: `${conversionRate}%`, change: '+3%', icon: TrendingUp },
  ];

  const quickActions = [
    { title: 'Nouvelle vente', icon: ShoppingCart, link: '/dashboard/pos/sales' },
    { title: 'Gestion des produits', icon: Package, link: '/dashboard/pos/products' },
    { title: 'Rapports', icon: BarChart3, link: '/dashboard/pos/reports' },
    { title: 'Clients', icon: Users, link: '/dashboard/pos/customers' },
    { title: 'Reçus', icon: Receipt, link: '/dashboard/pos/receipts' },
    { title: 'Paramètres', icon: Settings, link: '/dashboard/pos/settings' },
  ];

  // Calculate popular products from transactions
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

  const popularProducts = Array.from(productSalesMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, sold]) => {
      // Find the product to get its revenue
      const product = products.find(p => p.name === name);
      const revenue = product ? (sold * product.price).toFixed(2) : (sold * 10).toFixed(2); // fallback price
      return { name, sold, revenue };
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord Caisse</h1>
          <p className="text-muted-foreground">
            Gérez vos ventes, stock et clients en temps réel
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/pos/sales">Nouvelle vente</Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change} depuis hier</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.link} className="block">
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center justify-center space-y-2">
                    <action.icon className="h-8 w-8" />
                    <span className="text-center font-medium">{action.title}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventes récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-muted rounded-full p-2">
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Transaction #{transaction.id}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}, {transaction.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">€{transaction.total.toFixed(2)}</p>
                    <Badge variant="secondary">Payé</Badge>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Aucune transaction récente
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produits populaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularProducts.length > 0 ? (
                popularProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sold} vendus</p>
                    </div>
                    <p className="font-medium">€{product.revenue}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Aucun produit vendu récemment
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default POSDashboard;
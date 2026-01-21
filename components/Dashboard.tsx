import React, { useMemo } from 'react';
import { BusinessData, DebtStatus } from '../types';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle,
  Package,
  HandCoins
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Props {
  data: BusinessData;
}

const Dashboard: React.FC<Props> = ({ data }) => {
  const stats = useMemo(() => {
    const grossSales = data.sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const cogs = data.sales.reduce((sum, s) => sum + (s.costPrice * s.quantity), 0);
    const grossProfit = grossSales - cogs;
    const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossProfit - totalExpenses;
    const totalDebts = data.debts.filter(d => d.status === DebtStatus.PENDING).reduce((sum, d) => sum + d.amount, 0);
    const inventoryValue = data.stock.reduce((sum, i) => sum + (i.costPrice * i.quantity), 0);

    return {
      grossSales,
      grossProfit,
      netProfit,
      totalExpenses,
      totalDebts,
      inventoryValue,
      isLoss: netProfit < 0
    };
  }, [data]);

  // Chart data aggregation (Last 7 days)
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    });

    return last7Days.map(day => {
      // Dummy data for visual - in a real app, filter data.sales by date
      return {
        name: day,
        sales: Math.floor(Math.random() * 5000) + 1000,
        profit: Math.floor(Math.random() * 2000) + 500
      };
    });
  }, []);

  const statCards = [
    { label: 'Gross Sales', value: stats.grossSales, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Gross Profit', value: stats.grossProfit, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Net Profit', value: stats.netProfit, icon: stats.isLoss ? ArrowDownRight : ArrowUpRight, color: stats.isLoss ? 'text-red-600' : 'text-indigo-600', bg: stats.isLoss ? 'bg-red-50' : 'bg-indigo-50' },
    { label: 'Total Expenses', value: stats.totalExpenses, icon: HandCoins, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Debts', value: stats.totalDebts, icon: HandCoins, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Inventory Value', value: stats.inventoryValue, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div> {/* Dashboard component rendering here... */} </div>
  );
};

export default Dashboard;
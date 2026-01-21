import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  HandCoins, 
  ReceiptIndianRupee, 
  BarChart3,
  Settings,
  Plus,
  Menu,
  X,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { BusinessData, TimeRange } from './types';
import { loadData, saveData } from './utils/storage';
import Dashboard from './components/Dashboard';
import StockManager from './components/StockManager';
import SalesTracker from './components/SalesTracker';
import DebtManager from './components/DebtManager';
import ExpenseTracker from './components/ExpenseTracker';
import Reporting from './components/Reporting';

const App: React.FC = () => {
  const [data, setData] = useState<BusinessData>(loadData());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stock' | 'sales' | 'debts' | 'expenses' | 'reports'>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const updateData = (newData: Partial<BusinessData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stock', label: 'Inventory', icon: Package },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'debts', label: 'Debts', icon: HandCoins },
    { id: 'expenses', label: 'Expenses', icon: ReceiptIndianRupee },
    { id: 'reports', label: 'Analysis', icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-slate-900 text-white z-50 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-blue-600 p-2 rounded-lg">
              <TrendingUp size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Orion Mkt</h1>
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3 px-4 py-3 text-slate-400">
              <Settings size={20} />
              <span className="font-medium text-sm">v1.2.0 Stable</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button 
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1 px-4 lg:px-0">
            <h2 className="text-lg font-semibold text-slate-800 capitalize">
              {activeTab}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right mr-2">
              <p className="text-xs text-slate-500 font-medium">Business Mode</p>
              <p className="text-sm text-slate-900 font-bold">Standard Account</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
              <Settings size={20} />
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <Dashboard data={data} />}
          {activeTab === 'stock' && <StockManager stock={data.stock} onUpdate={(s) => updateData({ stock: s })} />}
          {activeTab === 'sales' && <SalesTracker data={data} onUpdate={(s, st) => updateData({ sales: s, stock: st })} />}
          {activeTab === 'debts' && <DebtManager debts={data.debts} onUpdate={(d) => updateData({ debts: d })} />}
          {activeTab === 'expenses' && <ExpenseTracker expenses={data.expenses} onUpdate={(e) => updateData({ expenses: e })} />}
          {activeTab === 'reports' && <Reporting data={data} />}
        </div>
      </main>
    </div>
  );
};

export default App;
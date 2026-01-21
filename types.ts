export enum DebtStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  BAD_DEBT = 'BAD_DEBT'
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  lastUpdated: number;
}

export interface SaleRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  totalAmount: number;
  date: number;
}

export interface DebtRecord {
  id: string;
  customerName: string;
  amount: number;
  date: number;
  status: DebtStatus;
  description: string;
}

export interface ExpenseRecord {
  id: string;
  category: string;
  amount: number;
  date: number;
  description: string;
}

export interface BusinessData {
  stock: StockItem[];
  sales: SaleRecord[];
  debts: DebtRecord[];
  expenses: ExpenseRecord[];
}

export type TimeRange = 'daily' | 'weekly' | 'monthly' | 'annual';
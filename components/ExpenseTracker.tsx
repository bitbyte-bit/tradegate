import React, { useState } from 'react';
import { ExpenseRecord } from '../types';
import { ReceiptIndianRupee, Plus, Calendar, Tag, Trash2 } from 'lucide-react';

interface Props {
  expenses: ExpenseRecord[];
  onUpdate: (expenses: ExpenseRecord[]) => void;
}

const ExpenseTracker: React.FC<Props> = ({ expenses, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newExp, setNewExp] = useState<Partial<ExpenseRecord>>({
    category: '',
    amount: 0,
    description: ''
  });

  const categories = ['Rent', 'Utilities', 'Salaries', 'Supplies', 'Transport', 'Marketing', 'Maintenance', 'Other'];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const exp: ExpenseRecord = {
      id: crypto.randomUUID(),
      category: newExp.category || 'Other',
      amount: newExp.amount || 0,
      description: newExp.description || '',
      date: Date.now()
    };
    onUpdate([...expenses, exp]);
    setIsAdding(false);
    setNewExp({ category: '', amount: 0, description: '' });
  };

  const handleDelete = (id: string) => {
    onUpdate(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-8"> {/* Expense Tracker rendering here... */} </div>
  );
};

export default ExpenseTracker;
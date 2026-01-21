import React, { useState } from 'react';
import { BusinessData, SaleRecord, StockItem } from '../types';
import { ShoppingCart, Package, DollarSign, Plus, History } from 'lucide-react';

interface Props {
  data: BusinessData;
  onUpdate: (sales: SaleRecord[], stock: StockItem[]) => void;
}

const SalesTracker: React.FC<Props> = ({ data, onUpdate }) => {
  const [selectedId, setSelectedId] = useState('');
  const [qty, setQty] = useState(1);
  const [isRecording, setIsRecording] = useState(false);

  const handleSale = (e: React.FormEvent) => {
    e.preventDefault();
    const item = data.stock.find(s => s.id === selectedId);
    if (!item) return;
    if (item.quantity < qty) {
      alert('Insufficient stock!');
      return;
    }

    const sale: SaleRecord = {
      id: crypto.randomUUID(),
      itemId: item.id,
      itemName: item.name,
      quantity: qty,
      unitPrice: item.sellingPrice,
      costPrice: item.costPrice,
      totalAmount: item.sellingPrice * qty,
      date: Date.now()
    };

    const newStock = data.stock.map(s => 
      s.id === item.id ? { ...s, quantity: s.quantity - qty } : s
    );

    onUpdate([...data.sales, sale], newStock);
    setSelectedId('');
    setQty(1);
    setIsRecording(false);
  };

  return (
    <div className="space-y-8"> {/* Sales Tracker rendering here... */} </div>
  );
};

export default SalesTracker;
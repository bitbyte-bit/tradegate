import { BusinessData } from '../types';

const STORAGE_KEY = 'orion_mkt_data';

const DEFAULT_DATA: BusinessData = {
  stock: [],
  sales: [],
  debts: [],
  expenses: []
};

export const saveData = (data: BusinessData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadData = (): BusinessData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_DATA;
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse stored data", e);
    return DEFAULT_DATA;
  }
};
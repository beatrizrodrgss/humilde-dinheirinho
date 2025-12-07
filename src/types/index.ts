export interface User {
  id: string;
  email?: string;
}

export interface Month {
  id: string;
  user_id: string;
  year: number;
  month: number;
  name?: string; // Custom name for the month
  income_start: number;
  income_middle: number;
  extra_incomes?: {
    id: string;
    name: string;
    amount: number;
  }[];
  created_at: string;
}

export type BillType = 'start' | 'middle';
export type BillStatus = 'pending' | 'paid';

export interface Bill {
  id: string;
  user_id: string;
  month_id: string;
  name: string;
  amount: number;
  type: BillType;
  status: BillStatus;
  due_date?: string;
  created_at: string;
}

export interface MonthSummary {
  total_income: number;
  total_expenses: number;
  balance: number;
  income_start: number;
  income_middle: number;
  expenses_start: number;
  expenses_middle: number;
}
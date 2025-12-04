import { MonthSummary } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from './ui/card';
import { ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react';

interface FinancialSummaryProps {
  summary: MonthSummary;
}

export default function FinancialSummary({ summary }: FinancialSummaryProps) {
  const isPositive = summary.balance >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-green-50 border-green-100">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <ArrowUpCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Receitas</p>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(summary.total_income)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-red-50 border-red-100">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-full text-red-600">
            <ArrowDownCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Despesas</p>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(summary.total_expenses)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className={isPositive ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100"}>
        <CardContent className="p-4 flex items-center gap-4">
          <div className={isPositive ? "p-3 bg-blue-100 rounded-full text-blue-600" : "p-3 bg-orange-100 rounded-full text-orange-600"}>
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Saldo</p>
            <p className={`text-2xl font-bold ${isPositive ? 'text-blue-700' : 'text-orange-700'}`}>
              {formatCurrency(summary.balance)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
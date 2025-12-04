import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Month } from '@/types';
import { formatCurrency, getMonthName } from '@/lib/utils';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MonthCardProps {
  month: Month;
  summary?: {
    total_income: number;
    total_expenses: number;
    balance: number;
  };
}

export default function MonthCard({ month, summary }: MonthCardProps) {
  const monthName = getMonthName(month.month);
  const balance = summary?.balance ?? 0;
  const isPositive = balance >= 0;

  return (
    <Link to={`/month/${month.year}/${month.month}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-l-4" 
            style={{ borderLeftColor: isPositive ? '#22c55e' : '#ef4444' }}>
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center text-lg capitalize">
            <span className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-muted-foreground" />
              {monthName} {month.year}
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Receitas:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(summary?.total_income ?? 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Despesas:</span>
              <span className="font-medium text-red-600">
                {formatCurrency(summary?.total_expenses ?? 0)}
              </span>
            </div>
            <div className="pt-2 mt-2 border-t flex justify-between font-bold">
              <span>Saldo:</span>
              <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(balance)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Month } from '@/types';
import { formatCurrency, getMonthName } from '@/lib/utils';
import { ArrowRight, CalendarDays, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface MonthCardProps {
  month: Month;
  summary?: {
    total_income: number;
    total_expenses: number;
    balance: number;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export default function MonthCard({ month, summary, onEdit, onDelete }: MonthCardProps) {
  const monthName = getMonthName(month.month);
  const balance = summary?.balance ?? 0;
  const isPositive = balance >= 0;

  return (
    <Card className="hover:shadow-md transition-shadow h-full border-l-4 group relative"
      style={{ borderLeftColor: isPositive ? '#22c55e' : '#ef4444' }}>
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link to={`/month/${month.year}/${month.month}`} className="block h-full" >
        <CardHeader className="pb-2 pr-12">
          <CardTitle className="flex flex-col gap-1">
            <span className="text-lg font-bold truncate">
              {month.name || `${monthName} ${month.year}`}
            </span>
            {month.name && (
              <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                {monthName} {month.year}
              </span>
            )}
            {!month.name && (
              <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                Mês de referência
              </span>
            )}
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
      </Link >
    </Card >
  );
}

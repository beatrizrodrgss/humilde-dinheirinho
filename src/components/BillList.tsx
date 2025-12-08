import { Bill } from '@/types';
import BillItem from './BillItem';
import { Button } from './ui/button';
import { Plus, ArrowUpDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useState, useMemo } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { sortBillsByDueDate } from '@/lib/due-date';

interface BillListProps {
  title: string;
  bills: Bill[];
  total: number;
  onAdd: () => void;
  onToggleStatus: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onEdit: (bill: Bill) => void;
}

type SortOption = 'due_date' | 'amount' | 'name';

export default function BillList({ title, bills, total, onAdd, onToggleStatus, onDelete, onEdit }: BillListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('due_date');

  const sortedBills = useMemo(() => {
    const billsCopy = [...bills];
    switch (sortBy) {
      case 'due_date':
        return sortBillsByDueDate(billsCopy) as Bill[];
      case 'amount':
        return billsCopy.sort((a, b) => b.amount - a.amount);
      case 'name':
        return billsCopy.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return billsCopy;
    }
  }, [bills, sortBy]);

  const sortLabels = {
    due_date: 'Vencimento',
    amount: 'Valor',
    name: 'Nome'
  };

  return (
    <div className="bg-white dark:bg-card rounded-xl border shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-medium text-foreground">{formatCurrency(total)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {bills.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="gap-1">
                  <ArrowUpDown className="w-4 h-4" />
                  {sortLabels[sortBy]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('due_date')}>
                  Ordenar por Vencimento
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('amount')}>
                  Ordenar por Valor
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('name')}>
                  Ordenar por Nome
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button size="sm" onClick={onAdd} variant="outline" className="gap-1">
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        {sortedBills.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhuma conta cadastrada.
          </div>
        ) : (
          sortedBills.map(bill => (
            <BillItem
              key={bill.id}
              bill={bill}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}
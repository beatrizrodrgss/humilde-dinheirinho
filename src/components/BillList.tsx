import { Bill } from '@/types';
import BillItem from './BillItem';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface BillListProps {
  title: string;
  bills: Bill[];
  total: number;
  onAdd: () => void;
  onToggleStatus: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onEdit: (bill: Bill) => void;
}

export default function BillList({ title, bills, total, onAdd, onToggleStatus, onDelete, onEdit }: BillListProps) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-medium text-foreground">{formatCurrency(total)}</span>
          </p>
        </div>
        <Button size="sm" onClick={onAdd} variant="outline" className="gap-1">
          <Plus className="w-4 h-4" />
          Adicionar
        </Button>
      </div>

      <div className="space-y-1">
        {bills.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhuma conta cadastrada.
          </div>
        ) : (
          bills.map(bill => (
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
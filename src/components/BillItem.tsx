import { Bill } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';
import { Button } from './ui/button';
import { CheckCircle2, Circle, Trash2, Pencil } from 'lucide-react';

interface BillItemProps {
  bill: Bill;
  onToggleStatus: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onEdit: (bill: Bill) => void;
}

export default function BillItem({ bill, onToggleStatus, onDelete, onEdit }: BillItemProps) {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border mb-2 transition-colors",
      bill.status === 'paid' ? "bg-green-50 border-green-100" : "bg-white border-gray-100 hover:border-gray-200"
    )}>
      <div className="flex items-center gap-3 overflow-hidden">
        <button 
          onClick={() => onToggleStatus(bill)}
          className={cn(
            "transition-colors",
            bill.status === 'paid' ? "text-green-600" : "text-gray-300 hover:text-gray-400"
          )}
        >
          {bill.status === 'paid' ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
        </button>
        
        <div className="min-w-0">
          <p className={cn(
            "font-medium truncate",
            bill.status === 'paid' && "text-gray-500 line-through"
          )}>
            {bill.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(bill.amount)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(bill)} className="h-8 w-8 text-gray-500 hover:text-blue-600">
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(bill.id)} className="h-8 w-8 text-gray-500 hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
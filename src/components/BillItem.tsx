import { Bill } from '@/types';
import { Button } from './ui/button';
import { CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { triggerConfetti } from '@/lib/confetti';
import { motion } from 'framer-motion';
import { getCategory } from '@/lib/categories';
import DueDateBadge from '@/components/DueDateBadge';

interface BillItemProps {
  bill: Bill;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (bill: Bill) => void;
}

export default function BillItem({ bill, onEdit, onDelete, onToggleStatus }: BillItemProps) {
  const handleToggle = () => {
    if (bill.status === 'pending') {
      triggerConfetti();
    }
    onToggleStatus(bill);
  };

  const CategoryIcon = getCategory(bill.category).icon;

  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border mb-2 transition-colors",
      bill.status === 'paid' ? "bg-green-50 border-green-100" : "bg-card border-border hover:border-muted-foreground/30"
    )}>
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={cn(
          "p-2 rounded-full shrink-0",
          bill.status === 'paid' ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
        )}>
          <CategoryIcon className="w-4 h-4" />
        </div>

        <motion.button
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          onClick={handleToggle}
          className={cn(
            "transition-colors",
            bill.status === 'paid' ? "text-green-600" : "text-muted-foreground/50 hover:text-muted-foreground"
          )}
        >
          {bill.status === 'paid' ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
        </motion.button>

        <div className="min-w-0">
          <p className={cn(
            "font-medium truncate",
            bill.status === 'paid' && "text-muted-foreground line-through"
          )}>
            {bill.name}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {formatCurrency(bill.amount)}
            </p>
            {bill.due_day && <DueDateBadge dueDay={bill.due_day} />}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(bill)} className="h-8 w-8 text-muted-foreground hover:text-blue-600">
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(bill.id)} className="h-8 w-8 text-muted-foreground hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
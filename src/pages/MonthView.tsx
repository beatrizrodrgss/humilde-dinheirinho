import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMonths } from '@/hooks/useMonths';
import { useBills } from '@/hooks/useBills';
import { Button } from '@/components/ui/button';
import BillList from '@/components/BillList';
import FinancialSummary from '@/components/FinancialSummary';
import IncomeInput from '@/components/IncomeInput';
import BillDialog from '@/components/BillDialog';
import IncomeDetailsDialog from '@/components/IncomeDetailsDialog';
import SavingsGoalCard from '@/components/SavingsGoalCard';
import FinancialCharts from '@/components/FinancialCharts';
import MonthHeader from './month-view/MonthHeader';
import MonthContent from './month-view/MonthContent';
import DueDateSummaryBanner from '@/components/DueDateSummaryBanner';
import CategoryStatsCard from '@/components/CategoryStatsCard';
import KeyboardShortcutsHelp from '@/components/KeyboardShortcutsHelp';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Loader2 } from 'lucide-react';
import { getMonthName, formatCurrency } from '@/lib/utils';
import { Bill, BillType } from '@/types';
import { toast } from 'sonner';

export default function MonthView() {
  const { year, month } = useParams();
  const navigate = useNavigate();
  const { months, updateIncome, updateMonth, loading: loadingMonths } = useMonths();

  const currentMonth = months.find(
    m => m.year === Number(year) && m.month === Number(month)
  );

  const { bills, loading: loadingBills, addBill, updateBill, deleteBill, toggleStatus } = useBills(currentMonth?.id || '');

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [dialogType, setDialogType] = useState<BillType>('start');
  const [billToDelete, setBillToDelete] = useState<string | null>(null);
  const [showOnlyUnpaid, setShowOnlyUnpaid] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  const handleSaveIncome = async (start: number, middle: number) => {
    // Legacy handler, kept for backward compatibility if needed, but primary update is via dialog now
    if (!currentMonth) return;
    await updateIncome(currentMonth.id, start, middle);
    toast.success('Renda atualizada!');
  };



  const handleOpenAdd = (type: BillType) => {
    setEditingBill(null);
    setDialogType(type);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (bill: Bill) => {
    setEditingBill(bill);
    setDialogType(bill.type);
    setIsDialogOpen(true);
  };

  const handleSaveBill = async (billData: Partial<Bill>) => {
    if (editingBill) {
      await updateBill(editingBill.id, billData);
      toast.success('Conta atualizada!');
    } else {
      const newBill: any = {
        name: billData.name!,
        amount: billData.amount!,
        type: billData.type!,
        category: billData.category!,
        status: 'pending'
      };

      // Only include due_day if it exists
      if (billData.due_day) {
        newBill.due_day = billData.due_day;
      }

      await addBill(newBill);
      toast.success('Conta adicionada!');
    }
  };

  const handleDeleteClick = (id: string) => {
    setBillToDelete(id);
  };

  const confirmDelete = async () => {
    if (!billToDelete) return;

    try {
      await deleteBill(billToDelete);
      toast.success('Conta excluída');
    } catch (error) {
      toast.error('Erro ao excluir');
    } finally {
      setBillToDelete(null);
    }
  };

  // Keyboard Shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      action: () => {
        setEditingBill(null);
        setDialogType('start');
        setIsDialogOpen(true);
      },
      description: 'Nova conta'
    },
    {
      key: 'e',
      ctrl: true,
      action: () => {
        // Trigger export (will be handled by MonthHeader)
        const exportBtn = document.querySelector('[data-export-trigger]');
        if (exportBtn) (exportBtn as HTMLElement).click();
      },
      description: 'Exportar'
    },
    {
      key: 'f',
      ctrl: true,
      action: () => setShowOnlyUnpaid(!showOnlyUnpaid),
      description: 'Toggle filtro'
    },
    {
      key: '?',
      action: () => setShowShortcutsHelp(true),
      description: 'Ajuda'
    },
    {
      key: 'Escape',
      action: () => {
        setIsDialogOpen(false);
        setIsIncomeDialogOpen(false);
        setShowShortcutsHelp(false);
      },
      description: 'Fechar'
    }
  ], !loadingMonths);

  // Computed lists
  const startBills = useMemo(() => {
    const filtered = bills.filter(b => b.type === 'start');
    return showOnlyUnpaid ? filtered.filter(b => b.status === 'pending') : filtered;
  }, [bills, showOnlyUnpaid]);

  const middleBills = useMemo(() => {
    const filtered = bills.filter(b => b.type === 'middle');
    return showOnlyUnpaid ? filtered.filter(b => b.status === 'pending') : filtered;
  }, [bills, showOnlyUnpaid]);

  const totalStart = useMemo(() => startBills.reduce((acc, b) => acc + b.amount, 0), [startBills]);
  const totalMiddle = useMemo(() => middleBills.reduce((acc, b) => acc + b.amount, 0), [middleBills]);

  // Recalculate summary locally for instant feedback
  // Note: We use the values from currentMonth directly, which are updated via real-time listener
  const summary = useMemo(() => {
    if (!currentMonth) return null;

    const incStart = Number(currentMonth.income_start) || 0;
    const incMiddle = Number(currentMonth.income_middle) || 0;
    const extraIncomes = currentMonth.extra_incomes || [];
    const totalExtra = extraIncomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalInc = incStart + incMiddle + totalExtra;
    const totalExp = totalStart + totalMiddle;

    return {
      total_income: totalInc,
      total_expenses: totalExp,
      balance: totalInc - totalExp,
      income_start: incStart,
      income_middle: incMiddle,
      expenses_start: totalStart,
      expenses_middle: totalMiddle
    };
  }, [currentMonth, totalStart, totalMiddle]);

  if (loadingMonths || !currentMonth) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div id="month-export-container" className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <MonthHeader
        year={currentMonth.year}
        month={currentMonth.month}
        showOnlyUnpaid={showOnlyUnpaid}
        onToggleFilter={setShowOnlyUnpaid}
      />

      {/* Due Date Alerts */}
      <DueDateSummaryBanner
        bills={bills}
        onFilterOverdue={() => setShowOnlyUnpaid(true)}
      />

      {/* Summary Cards */}
      {summary && (
        <FinancialSummary
          summary={summary}
          onIncomeClick={() => setIsIncomeDialogOpen(true)}
        />
      )}

      {currentMonth && summary && (
        <SavingsGoalCard
          currentSavings={currentMonth.current_savings || 0}
          goalAmount={currentMonth.savings_goal}
          goalName={currentMonth.savings_goal_name}
          onUpdateGoal={async (name, amount) => {
            await updateMonth(currentMonth.id, {
              savings_goal_name: name,
              savings_goal: amount
            });
            toast.success('Meta atualizada! Vamos lá! 🚀');
          }}
          onAddToSavings={async (amount) => {
            const newTotal = (currentMonth.current_savings || 0) + amount;
            await updateMonth(currentMonth.id, {
              current_savings: newTotal
            });
            toast.success(`Guardado! Você já tem ${formatCurrency(newTotal)} 💰`);
          }}
        />
      )}

      {/* Category Statistics */}
      {bills.length > 0 && <CategoryStatsCard bills={bills} />}

      {/* Charts */}
      {currentMonth && summary && (
        <FinancialCharts
          month={currentMonth}
          bills={bills}
          summary={summary}
        />
      )}

      <MonthContent
        currentMonth={currentMonth}
        startBills={startBills}
        middleBills={middleBills}
        totalStart={totalStart}
        totalMiddle={totalMiddle}
        onSaveIncome={handleSaveIncome}
        onAddBill={handleOpenAdd}
        onToggleStatus={toggleStatus}
        onDeleteBill={handleDeleteClick}
        onEditBill={handleOpenEdit}
      />

      <BillDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        bill={editingBill}
        initialType={dialogType}
        onSave={handleSaveBill}
      />

      {currentMonth && (
        <IncomeDetailsDialog
          open={isIncomeDialogOpen}
          onOpenChange={setIsIncomeDialogOpen}
          month={currentMonth}
          onSave={async (data) => {
            await updateMonth(currentMonth.id, data);
          }}
        />
      )}

      <KeyboardShortcutsHelp
        open={showShortcutsHelp}
        onOpenChange={setShowShortcutsHelp}
      />

      <AlertDialog open={!!billToDelete} onOpenChange={(open) => !open && setBillToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
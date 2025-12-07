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
import FinancialCharts from '@/components/FinancialCharts';
import MonthHeader from './month-view/MonthHeader';
import MonthContent from './month-view/MonthContent';
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
import { getMonthName } from '@/lib/utils';
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
      await addBill({
        name: billData.name!,
        amount: billData.amount!,
        type: billData.type!,
        status: 'pending'
      });
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

  // Computed lists
  const startBills = useMemo(() => bills.filter(b => b.type === 'start'), [bills]);
  const middleBills = useMemo(() => bills.filter(b => b.type === 'middle'), [bills]);

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
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <MonthHeader year={currentMonth.year} month={currentMonth.month} />

      {/* Summary Cards */}
      {summary && (
        <FinancialSummary
          summary={summary}
          onIncomeClick={() => setIsIncomeDialogOpen(true)}
        />
      )}

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
import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMonths } from '@/hooks/useMonths';
import { useBills } from '@/hooks/useBills';
import { Button } from '@/components/ui/button';
import BillList from '@/components/BillList';
import FinancialSummary from '@/components/FinancialSummary';
import IncomeInput from '@/components/IncomeInput';
import BillDialog from '@/components/BillDialog';
import FinancialCharts from '@/components/FinancialCharts';
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

import { ArrowLeft, Loader2 } from 'lucide-react';
import { getMonthName } from '@/lib/utils';
import { Bill, BillType } from '@/types';
import { toast } from 'sonner';

export default function MonthView() {
  const { year, month } = useParams();
  const navigate = useNavigate();
  const { months, updateIncome, loading: loadingMonths } = useMonths();

  const currentMonth = months.find(
    m => m.year === Number(year) && m.month === Number(month)
  );

  const { bills, loading: loadingBills, addBill, updateBill, deleteBill, toggleStatus } = useBills(currentMonth?.id || '');

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [dialogType, setDialogType] = useState<BillType>('start');
  const [billToDelete, setBillToDelete] = useState<string | null>(null);

  const handleSaveIncome = async (start: number, middle: number) => {
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
    const totalInc = incStart + incMiddle;
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold capitalize text-gray-900">
            {getMonthName(currentMonth.month)} {currentMonth.year}
          </h1>
          <p className="text-muted-foreground text-sm">Gerencie suas contas do mês</p>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && <FinancialSummary summary={summary} />}

      {/* Charts */}
      {currentMonth && summary && (
        <FinancialCharts
          month={currentMonth}
          bills={bills}
          summary={summary}
        />
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Start of Month Section */}
        <div className="space-y-4">
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm">
            <h2 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              📅 Início do Mês (1-15)
            </h2>
            <IncomeInput
              label="Recebimento Início"
              initialValue={currentMonth.income_start}
              onSave={(val) => handleSaveIncome(val, currentMonth.income_middle)}
              colorClass="text-blue-700"
            />
          </div>

          <BillList
            title="Contas Início"
            bills={startBills}
            total={totalStart}
            onAdd={() => handleOpenAdd('start')}
            onToggleStatus={toggleStatus}
            onDelete={handleDeleteClick}
            onEdit={handleOpenEdit}
          />
        </div>

        {/* Middle of Month Section */}
        <div className="space-y-4">
          <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 shadow-sm">
            <h2 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              📅 Meio do Mês (16-31)
            </h2>
            <IncomeInput
              label="Recebimento Quinzena"
              initialValue={currentMonth.income_middle}
              onSave={(val) => handleSaveIncome(currentMonth.income_start, val)}
              colorClass="text-purple-700"
            />
          </div>

          <BillList
            title="Contas Quinzena"
            bills={middleBills}
            total={totalMiddle}
            onAdd={() => handleOpenAdd('middle')}
            onToggleStatus={toggleStatus}
            onDelete={handleDeleteClick}
            onEdit={handleOpenEdit}
          />
        </div>
      </div>

      <BillDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        bill={editingBill}
        initialType={dialogType}
        onSave={handleSaveBill}
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
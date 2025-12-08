
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import MonthCard from '@/components/MonthCard';
import MonthDialog from '@/components/MonthDialog';
import { useMonths } from '@/hooks/useMonths';
import { Loader2, Plus, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Month } from '@/types';
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

export default function Dashboard() {
  const { months, loading, createMonth, updateMonth, deleteMonth } = useMonths();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMonth, setEditingMonth] = useState<Month | null>(null);
  const [monthToDelete, setMonthToDelete] = useState<string | null>(null);

  const handleSaveMonth = async (year: number, month: number, name: string, cloneFromId?: string) => {
    try {
      if (editingMonth) {
        await updateMonth(editingMonth.id, { year, month, name });
        toast.success('Mês atualizado!');
      } else {
        await createMonth(year, month, name, cloneFromId);
        toast.success('Mês criado com sucesso!');
      }
      setIsDialogOpen(false); // Close dialog after saving
    } catch (error) {
      toast.error('Erro ao salvar mês');
    }
  };

  const handleEditMonth = (month: Month) => {
    setEditingMonth(month);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (monthId: string) => {
    setMonthToDelete(monthId);
  };

  const confirmDelete = async () => {
    if (!monthToDelete) return;

    try {
      await deleteMonth(monthToDelete);
      toast.success('Mês excluído com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir mês');
    } finally {
      setMonthToDelete(null);
    }
  };

  const handleNewMonth = () => {
    setEditingMonth(null);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Carregando seus dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Meus Meses</h1>
          <p className="text-muted-foreground mt-1">Gerencie seu histórico financeiro</p>
        </div>
        <Button onClick={handleNewMonth} className="gap-2 shadow-sm hover:shadow-md transition-all">
          <Plus className="w-4 h-4" />
          Novo Mês
        </Button>
      </div>

      {months.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/50 rounded-xl border border-dashed border-border">
          <div className="p-4 bg-white rounded-full shadow-sm mb-4">
            <Calendar className="w-10 h-10 text-primary/60" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum mês encontrado</h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-center">
            Crie seu primeiro mês para começar a organizar suas finanças.
          </p>
          <Button onClick={handleNewMonth} variant="default" size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            Criar Mês
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {months.map((month) => (
            <MonthCard
              key={month.id}
              month={month}
              summary={month.summary}
              onEdit={() => handleEditMonth(month)}
              onDelete={() => handleDeleteClick(month.id)}
            />
          ))}
        </div>
      )}

      <MonthDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        monthToEdit={editingMonth}
        availableMonths={months}
        onSave={handleSaveMonth}
      />

      <AlertDialog open={!!monthToDelete} onOpenChange={(open) => !open && setMonthToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir mês?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o mês e todas as contas associadas a ele.
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

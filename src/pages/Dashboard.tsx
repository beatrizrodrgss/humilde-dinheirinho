import { Button } from '@/components/ui/button';
import MonthCard from '@/components/MonthCard';
import { useMonths } from '@/hooks/useMonths';
import { getCurrentYearMonth } from '@/lib/utils';
import { Loader2, Plus, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { months, loading, createMonth } = useMonths();

  const handleNewMonth = async () => {
    const { year, month } = getCurrentYearMonth();

    // Check if current month already exists
    const exists = months.some(m => m.year === year && m.month === month);

    if (exists) {
      toast.info('O mês atual já existe!');
      return;
    }

    try {
      await createMonth(year, month);
      toast.success('Mês criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar mês');
    }
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Meus Meses</h1>
          <p className="text-muted-foreground mt-1">Gerencie seu histórico financeiro</p>
        </div>
        <Button onClick={handleNewMonth} className="gap-2 shadow-sm hover:shadow-md transition-all">
          <Plus className="w-4 h-4" />
          Novo Mês
        </Button>
      </div>

      {months.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          <div className="p-4 bg-white rounded-full shadow-sm mb-4">
            <Calendar className="w-10 h-10 text-primary/60" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum mês encontrado</h3>
          <p className="text-gray-500 mb-6 max-w-sm text-center">
            Parece que você ainda não começou seu controle financeiro. Que tal começar agora?
          </p>
          <Button onClick={handleNewMonth} variant="default" size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            Criar Mês Atual
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {months.map((month) => (
            <MonthCard key={month.id} month={month} summary={month.summary} />
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { Month } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface IncomeDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    month: Month;
    onSave: (data: Partial<Month>) => Promise<void>;
}

export default function IncomeDetailsDialog({ open, onOpenChange, month, onSave }: IncomeDetailsDialogProps) {
    const [loading, setLoading] = useState(false);
    const [incomeStart, setIncomeStart] = useState(month.income_start);
    const [incomeMiddle, setIncomeMiddle] = useState(month.income_middle);
    const [extraIncomes, setExtraIncomes] = useState<{ id: string; name: string; amount: number }[]>(month.extra_incomes || []);

    const [newExtraName, setNewExtraName] = useState('');
    const [newExtraAmount, setNewExtraAmount] = useState('');

    // Update local state when month changes
    useEffect(() => {
        if (open) {
            setIncomeStart(month.income_start);
            setIncomeMiddle(month.income_middle);
            setExtraIncomes(month.extra_incomes || []);
        }
    }, [month, open]);

    const handleAddExtra = () => {
        if (!newExtraName.trim() || !newExtraAmount) {
            toast.error('Preencha nome e valor');
            return;
        }

        const amount = parseFloat(newExtraAmount.replace(',', '.'));
        if (isNaN(amount) || amount <= 0) {
            toast.error('Valor inválido');
            return;
        }

        setExtraIncomes([...extraIncomes, { id: uuidv4(), name: newExtraName, amount }]);
        setNewExtraName('');
        setNewExtraAmount('');
    };

    const handleRemoveExtra = (id: string) => {
        setExtraIncomes(extraIncomes.filter(inc => inc.id !== id));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave({
                income_start: Number(incomeStart),
                income_middle: Number(incomeMiddle),
                extra_incomes: extraIncomes
            });
            onOpenChange(false);
            toast.success('Receitas atualizadas!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar');
        } finally {
            setLoading(false);
        }
    };

    const totalExtras = extraIncomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalIncome = Number(incomeStart) + Number(incomeMiddle) + totalExtras;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detalhes de Receitas</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Receita Fixa</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Dia 15</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                                    <Input
                                        type="number"
                                        value={incomeStart}
                                        onChange={(e) => setIncomeStart(Number(e.target.value))}
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Dia 30</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                                    <Input
                                        type="number"
                                        value={incomeMiddle}
                                        onChange={(e) => setIncomeMiddle(Number(e.target.value))}
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Renda Extra</h3>
                            <span className="text-sm font-medium text-green-600">{formatCurrency(totalExtras)}</span>
                        </div>

                        <div className="flex gap-2 items-end">
                            <div className="space-y-2 flex-1">
                                <Label className="text-xs">Descrição</Label>
                                <Input
                                    placeholder="Ex: Venda de bolo"
                                    value={newExtraName}
                                    onChange={(e) => setNewExtraName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2 w-28">
                                <Label className="text-xs">Valor</Label>
                                <Input
                                    type="number"
                                    placeholder="0,00"
                                    value={newExtraAmount}
                                    onChange={(e) => setNewExtraAmount(e.target.value)}
                                />
                            </div>
                            <Button size="icon" onClick={handleAddExtra} type="button">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        {extraIncomes.length > 0 && (
                            <div className="space-y-2 mt-2">
                                {extraIncomes.map((income) => (
                                    <div key={income.id} className="flex items-center justify-between bg-muted/40 p-2 rounded-md text-sm">
                                        <span>{income.name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium text-green-600">
                                                {formatCurrency(income.amount)}
                                            </span>
                                            <button
                                                onClick={() => handleRemoveExtra(income.id)}
                                                className="text-muted-foreground hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                        <span className="font-bold">Total Receitas</span>
                        <span className="text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</span>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

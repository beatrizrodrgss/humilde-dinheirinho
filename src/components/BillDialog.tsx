import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bill, BillType } from '@/types';
import { toast } from 'sonner';
import { CATEGORIES } from '@/lib/categories';
import { cn } from '@/lib/utils';

interface BillDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bill: Bill | null;
    initialType: BillType;
    onSave: (bill: Partial<Bill>) => Promise<void>;
}

export default function BillDialog({ open, onOpenChange, bill, initialType, onSave }: BillDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        type: initialType,
        category: 'other',
        due_day: ''
    });

    useEffect(() => {
        if (open) {
            if (bill) {
                setFormData({
                    name: bill.name,
                    amount: bill.amount.toString(),
                    type: bill.type,
                    category: bill.category || 'other',
                    due_day: bill.due_day?.toString() || ''
                });
            } else {
                setFormData({
                    name: '',
                    amount: '',
                    type: initialType,
                    category: 'other',
                    due_day: ''
                });
            }
        }
    }, [open, bill, initialType]);

    const handleSubmit = async () => {
        const amount = Number(formData.amount);
        if (!formData.name || isNaN(amount)) {
            toast.error('Preencha os campos corretamente');
            return;
        }

        setLoading(true);
        try {
            const billData: Partial<Bill> = {
                name: formData.name,
                amount,
                type: formData.type,
                category: formData.category
            };

            // Only include due_day if it has a value
            if (formData.due_day && Number(formData.due_day) >= 1 && Number(formData.due_day) <= 31) {
                billData.due_day = Number(formData.due_day);
            }

            await onSave(billData);
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{bill ? 'Editar Conta' : 'Nova Conta'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Nome da conta</Label>
                        <Input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Aluguel, Luz, Internet"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Valor (R$)</Label>
                        <Input
                            type="number"
                            value={formData.amount}
                            onChange={e => {
                                let value = e.target.value;
                                if (value.length > 1 && value.startsWith('0') && value[1] !== '.') {
                                    value = value.replace(/^0+/, '');
                                }
                                setFormData({ ...formData, amount: value });
                            }}
                            placeholder="0,00"
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                    </div>
                    <div className="space-y-3">
                        <Label>Categoria</Label>
                        <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-1">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-2 rounded-lg border transition-all text-xs gap-1 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                        formData.category === cat.id
                                            ? "bg-primary/10 border-primary text-primary dark:bg-primary/20 dark:border-primary dark:text-primary"
                                            : "bg-card border-border text-muted-foreground dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                                    )}
                                    title={cat.label}
                                >
                                    <cat.icon className="w-5 h-5" />
                                    <span className="truncate w-full text-center text-[10px]">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Período</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(v: BillType) => setFormData({ ...formData, type: v })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="start">Início do Mês (1-15)</SelectItem>
                                <SelectItem value="middle">Meio do Mês (16-31)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            Vencimento (opcional)
                            {formData.due_day && (
                                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                    ✓ Dia {formData.due_day}
                                </span>
                            )}
                        </Label>
                        <div className="relative">
                            <Input
                                type="number"
                                placeholder="Dia do mês (1-31)"
                                value={formData.due_day}
                                onChange={(e) => setFormData({ ...formData, due_day: e.target.value })}
                                min="1"
                                max="31"
                                className={formData.due_day ? "border-green-500 dark:border-green-600" : ""}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Em que dia esta conta vence? (ex: 15)
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}

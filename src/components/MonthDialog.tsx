import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Month } from '@/types';
import { getMonthName, getCurrentYearMonth } from '@/lib/utils';
import { toast } from 'sonner';

interface MonthDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    monthToEdit?: Month | null;
    availableMonths?: Month[];
    onSave: (year: number, month: number, name: string, cloneFromId?: string) => Promise<void>;
}

export default function MonthDialog({ open, onOpenChange, monthToEdit, availableMonths = [], onSave }: MonthDialogProps) {
    const [loading, setLoading] = useState(false);
    const current = getCurrentYearMonth();

    const [formData, setFormData] = useState({
        name: '',
        year: current.year.toString(),
        month: current.month.toString(),
        cloneFromId: 'none'
    });

    useEffect(() => {
        if (open) {
            if (monthToEdit) {
                setFormData({
                    name: monthToEdit.name || '',
                    year: monthToEdit.year.toString(),
                    month: monthToEdit.month.toString(),
                    cloneFromId: 'none'
                });
            } else {
                setFormData({
                    name: '',
                    year: current.year.toString(),
                    month: current.month.toString(),
                    cloneFromId: 'none'
                });
            }
        }
    }, [open, monthToEdit, current.year, current.month]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onSave(
                Number(formData.year),
                Number(formData.month),
                formData.name,
                formData.cloneFromId !== 'none' ? formData.cloneFromId : undefined
            );
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const years = Array.from({ length: 5 }, (_, i) => current.year - 2 + i); // Current year +/- 2
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{monthToEdit ? 'Editar Mês' : 'Novo Mês'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Nome Personalizado (Opcional)</Label>
                        <Input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Férias, Reserva de Emergência..."
                        />
                    </div>

                    {!monthToEdit && availableMonths.length > 0 && (
                        <div className="space-y-2">
                            <Label>Clonar contas de...</Label>
                            <Select
                                value={formData.cloneFromId}
                                onValueChange={(v) => setFormData({ ...formData, cloneFromId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um mês para copiar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Não clonar (Começar do zero)</SelectItem>
                                    {availableMonths.map(m => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.name || `${getMonthName(m.month)}/${m.year}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Isso copiará todas as contas do mês selecionado para o novo mês.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Mês</Label>
                            <Select
                                value={formData.month}
                                onValueChange={(v) => setFormData({ ...formData, month: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map(m => (
                                        <SelectItem key={m} value={m.toString()}>
                                            {getMonthName(m)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Ano</Label>
                            <Select
                                value={formData.year}
                                onValueChange={(v) => setFormData({ ...formData, year: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(y => (
                                        <SelectItem key={y} value={y.toString()}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
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
        </Dialog>
    );
}

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
    onSave: (year: number, month: number, name: string) => Promise<void>;
}

export default function MonthDialog({ open, onOpenChange, monthToEdit, onSave }: MonthDialogProps) {
    const [loading, setLoading] = useState(false);
    const current = getCurrentYearMonth();

    const [formData, setFormData] = useState({
        name: '',
        year: current.year.toString(),
        month: current.month.toString()
    });

    useEffect(() => {
        if (open) {
            if (monthToEdit) {
                setFormData({
                    name: monthToEdit.name || '',
                    year: monthToEdit.year.toString(),
                    month: monthToEdit.month.toString()
                });
            } else {
                setFormData({
                    name: '',
                    year: current.year.toString(),
                    month: current.month.toString()
                });
            }
        }
    }, [open, monthToEdit]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onSave(
                Number(formData.year),
                Number(formData.month),
                formData.name
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

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bill, BillType } from '@/types';
import { toast } from 'sonner';

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
        type: initialType
    });

    useEffect(() => {
        if (open) {
            if (bill) {
                setFormData({
                    name: bill.name,
                    amount: bill.amount.toString(),
                    type: bill.type
                });
            } else {
                setFormData({
                    name: '',
                    amount: '',
                    type: initialType
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
            await onSave({
                name: formData.name,
                amount,
                type: formData.type
            });
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
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0,00"
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
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

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface IncomeInputProps {
    label: string;
    initialValue: number;
    onSave: (value: number) => Promise<void>;
    colorClass: string;
}

export default function IncomeInput({ label, initialValue, onSave, colorClass }: IncomeInputProps) {
    const [value, setValue] = useState(initialValue.toString());
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setValue(initialValue.toString());
        setHasChanges(false);
    }, [initialValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;
        // Remove leading zeros if not a decimal
        if (newValue.length > 1 && newValue.startsWith('0') && newValue[1] !== '.') {
            newValue = newValue.replace(/^0+/, '');
        }
        setValue(newValue);
        setHasChanges(Number(newValue) !== initialValue);
    };

    const handleSave = async () => {
        const numValue = Number(value);
        if (isNaN(numValue)) return;

        setLoading(true);
        try {
            await onSave(numValue);
            setHasChanges(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-1">
            <Label className={`text-xs ${colorClass}`}>{label}</Label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">R$</span>
                    <Input
                        type="number"
                        className="pl-9 bg-background"
                        value={value}
                        onChange={handleChange}
                        placeholder="0,00"
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    />
                </div>
                {hasChanges && (
                    <Button
                        size="icon"
                        onClick={handleSave}
                        disabled={loading}
                        className="shrink-0 transition-all duration-200 animate-in fade-in zoom-in"
                        title="Salvar alteração"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </Button>
                )}
            </div>
        </div>
    );
}

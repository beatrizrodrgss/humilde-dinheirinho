import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Target, Pencil, PartyPopper, Trophy, PiggyBank } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface SavingsGoalCardProps {
    currentSavings: number;
    goalAmount?: number;
    goalName?: string;
    onUpdateGoal: (name: string, amount: number) => Promise<void>;
    onAddToSavings: (amount: number) => Promise<void>;
}

export default function SavingsGoalCard({
    currentSavings = 0,
    goalAmount,
    goalName,
    onUpdateGoal,
    onAddToSavings
}: SavingsGoalCardProps) {
    const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [addAmount, setAddAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const hasGoal = goalAmount && goalAmount > 0;
    const progress = hasGoal ? Math.min((currentSavings / goalAmount) * 100, 100) : 0;
    const isCompleted = progress >= 100;

    useEffect(() => {
        if (isGoalDialogOpen) {
            setName(goalName || '');
            setAmount(goalAmount?.toString() || '');
        }
    }, [isGoalDialogOpen, goalName, goalAmount]);

    // Trigger confetti when reaching 100%
    useEffect(() => {
        if (isCompleted && hasGoal) {
            const end = Date.now() + 1000;
            const colors = ['#10b981', '#3b82f6', '#f59e0b'];

            (function frame() {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }, [isCompleted, hasGoal]);

    const handleSaveGoal = async () => {
        const numAmount = Number(amount);
        if (!name || isNaN(numAmount) || numAmount <= 0) return;

        setLoading(true);
        try {
            await onUpdateGoal(name, numAmount);
            setIsGoalDialogOpen(false);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSavings = async () => {
        const numAmount = Number(addAmount);
        if (isNaN(numAmount) || numAmount <= 0) return;

        setLoading(true);
        try {
            await onAddToSavings(numAmount);
            setIsAddDialogOpen(false);
            setAddAmount('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mb-6 border-blue-100 bg-gradient-to-br from-white to-blue-50/50 relative overflow-hidden">
            {isCompleted && (
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Trophy className="w-32 h-32 text-yellow-500" />
                </div>
            )}

            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-blue-900">
                    {isCompleted ? <PartyPopper className="w-5 h-5 text-yellow-500" /> : <Target className="w-5 h-5 text-blue-600" />}
                    Meta de Economia
                </CardTitle>
                {hasGoal && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100" onClick={() => setIsGoalDialogOpen(true)}>
                        <Pencil className="w-4 h-4" />
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {!hasGoal ? (
                    <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-4">
                            Defina uma meta para economizar este mês e acompanhe seu progresso!
                        </p>
                        <Button onClick={() => setIsGoalDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Definir Meta
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="font-semibold text-lg text-slate-800">{goalName}</h3>
                                <p className="text-sm text-slate-500">
                                    {isCompleted
                                        ? "Meta atingida! Parabéns! 🎉"
                                        : `Faltam ${formatCurrency(goalAmount! - currentSavings)}`
                                    }
                                </p>
                            </div>
                            <div className="text-right">
                                <span className={cn(
                                    "text-2xl font-bold",
                                    isCompleted ? "text-green-600" : "text-blue-600"
                                )}>
                                    {Math.floor(progress)}%
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-4 bg-slate-200 rounded-full overflow-hidden relative">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={cn(
                                    "h-full rounded-full transition-colors duration-500",
                                    isCompleted ? "bg-green-500" :
                                        progress > 75 ? "bg-blue-500" :
                                            progress > 40 ? "bg-blue-400" : "bg-blue-300"
                                )}
                            />
                        </div>

                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{formatCurrency(Math.max(0, currentSavings))}</span>
                            <span>{formatCurrency(goalAmount!)}</span>
                        </div>

                        {/* Add Savings Button */}
                        <Button
                            onClick={() => setIsAddDialogOpen(true)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                            disabled={isCompleted}
                        >
                            <PiggyBank className="w-4 h-4" />
                            Guardar Dinheiro
                        </Button>
                    </div>
                )}
            </CardContent>

            {/* Goal Setting Dialog */}
            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Definir Meta de Economia</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome do Objetivo</Label>
                            <Input
                                placeholder="Ex: Viagem, PS5, Reserva"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Valor Alvo (R$)</Label>
                            <Input
                                type="number"
                                placeholder="0,00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsGoalDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveGoal} disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Meta'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Savings Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Guardar Dinheiro</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">
                            Quanto você conseguiu guardar para a meta <strong>"{goalName}"</strong>?
                        </p>
                        <div className="space-y-2">
                            <Label>Valor Guardado (R$)</Label>
                            <Input
                                type="number"
                                placeholder="0,00"
                                value={addAmount}
                                onChange={(e) => setAddAmount(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-800">
                                <strong>Dica:</strong> Esse valor será somado ao total de R$ {formatCurrency(currentSavings)} já guardado.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAddSavings} disabled={loading} className="bg-green-600 hover:bg-green-700">
                            {loading ? 'Guardando...' : 'Confirmar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

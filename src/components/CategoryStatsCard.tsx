import { useMemo } from 'react';
import { Bill } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { formatCurrency } from '@/lib/utils';
import { CATEGORIES } from '@/lib/categories';
import { BarChart3 } from 'lucide-react';

interface CategoryStatsCardProps {
    bills: Bill[];
}

export default function CategoryStatsCard({ bills }: CategoryStatsCardProps) {
    const categoryStats = useMemo(() => {
        const stats = new Map<string, number>();

        bills.forEach(bill => {
            const category = bill.category || 'other';
            stats.set(category, (stats.get(category) || 0) + bill.amount);
        });

        const sorted = Array.from(stats.entries())
            .map(([id, total]) => ({
                id,
                label: CATEGORIES.find(c => c.id === id)?.label || 'Outros',
                icon: CATEGORIES.find(c => c.id === id)?.icon || '📌',
                total
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5); // Top 5

        const totalSpent = bills.reduce((sum, b) => sum + b.amount, 0);

        return {
            categories: sorted,
            totalSpent,
            count: bills.length
        };
    }, [bills]);

    if (categoryStats.count === 0) return null;

    const maxAmount = Math.max(...categoryStats.categories.map(c => c.total));

    return (
        <Card className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-200">
                    <BarChart3 className="w-5 h-5" />
                    Gastos por Categoria
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {categoryStats.categories.map(cat => {
                    const percentage = (cat.total / maxAmount) * 100;
                    const percentOfTotal = (cat.total / categoryStats.totalSpent) * 100;

                    return (
                        <div key={cat.id} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 font-medium">
                                    {typeof cat.icon === 'string' ? (
                                        <span className="text-base">{cat.icon}</span>
                                    ) : (
                                        <cat.icon className="w-4 h-4" />
                                    )}
                                    <span className="truncate">{cat.label}</span>
                                </span>
                                <span className="font-bold text-purple-700 dark:text-purple-300">
                                    {formatCurrency(cat.total)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="text-xs text-muted-foreground w-10 text-right">
                                    {percentOfTotal.toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    );
                })}

                <div className="pt-3 mt-3 border-t border-purple-200 dark:border-purple-800">
                    <div className="flex justify-between text-sm font-semibold">
                        <span className="text-purple-900 dark:text-purple-200">Total Gasto</span>
                        <span className="text-purple-700 dark:text-purple-300">
                            {formatCurrency(categoryStats.totalSpent)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

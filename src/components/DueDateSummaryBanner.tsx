import { useMemo } from 'react';
import { Bill } from '@/types';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { getDaysUntilDue } from '@/lib/due-date';
import { formatCurrency } from '@/lib/utils';

interface DueDateSummaryBannerProps {
    bills: Bill[];
    onFilterOverdue?: () => void;
}

export default function DueDateSummaryBanner({ bills, onFilterOverdue }: DueDateSummaryBannerProps) {
    const today = new Date().getDate();

    const stats = useMemo(() => {
        const billsWithDueDate = bills.filter(b => b.due_day && b.status === 'pending');

        const overdue = billsWithDueDate.filter(b => {
            const days = getDaysUntilDue(b.due_day!, today);
            return days < 0;
        });

        const dueSoon = billsWithDueDate.filter(b => {
            const days = getDaysUntilDue(b.due_day!, today);
            return days >= 0 && days <= 7;
        });

        const overdueTotal = overdue.reduce((sum, b) => sum + b.amount, 0);
        const dueSoonTotal = dueSoon.reduce((sum, b) => sum + b.amount, 0);

        return {
            overdue: overdue.length,
            overdueTotal,
            dueSoon: dueSoon.length,
            dueSoonTotal,
            hasAlerts: overdue.length > 0 || dueSoon.length > 0
        };
    }, [bills, today]);

    if (!stats.hasAlerts) return null;

    return (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <h3 className="font-semibold text-orange-900 dark:text-orange-200">
                            Atenção aos Vencimentos
                        </h3>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                        {stats.overdue > 0 && (
                            <div
                                className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 cursor-pointer hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                                onClick={onFilterOverdue}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    <span className="text-sm font-medium text-red-900 dark:text-red-200">
                                        Vencidas
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                                    {stats.overdue}
                                </p>
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                    Total: {formatCurrency(stats.overdueTotal)}
                                </p>
                            </div>
                        )}

                        {stats.dueSoon > 0 && (
                            <div className="bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                    <span className="text-sm font-medium text-orange-900 dark:text-orange-200">
                                        Próximos 7 dias
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                                    {stats.dueSoon}
                                </p>
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                    Total: {formatCurrency(stats.dueSoonTotal)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {stats.overdue === 0 && stats.dueSoon > 0 && (
                    <div className="hidden sm:flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                )}
            </div>
        </div>
    );
}

import { getDaysUntilDue, getDueDateStatus, getDueDateLabel } from '@/lib/due-date';
import { cn } from '@/lib/utils';
import { Calendar, AlertCircle } from 'lucide-react';

interface DueDateBadgeProps {
    dueDay: number;
    className?: string;
}

export default function DueDateBadge({ dueDay, className }: DueDateBadgeProps) {
    const currentDay = new Date().getDate();
    const daysUntil = getDaysUntilDue(dueDay, currentDay);
    const status = getDueDateStatus(daysUntil);
    const label = getDueDateLabel(daysUntil);

    // Don't show badge if due date is far away (8+ days)
    if (status === 'normal') return null;

    const statusStyles = {
        overdue: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
        urgent: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-600',
        warning: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-600',
        normal: ''
    };

    const Icon = status === 'overdue' ? AlertCircle : Calendar;

    return (
        <div
            className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border',
                statusStyles[status],
                className
            )}
        >
            <Icon className="w-3 h-3" />
            <span>{label}</span>
        </div>
    );
}

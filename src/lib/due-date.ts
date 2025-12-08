/**
 * Calculate days until a bill is due
 * @param dueDay - Day of month the bill is due (1-31)
 * @param currentDay - Current day of month
 * @returns Number of days until due (negative if overdue)
 */
export function getDaysUntilDue(dueDay: number, currentDay: number): number {
    return dueDay - currentDay;
}

/**
 * Get status category based on days until due
 * @param daysUntil - Days until due date
 * @returns Status: 'urgent' (<=3 days), 'warning' (4-7 days), 'normal' (8+ days)
 */
export function getDueDateStatus(daysUntil: number): 'urgent' | 'warning' | 'normal' | 'overdue' {
    if (daysUntil < 0) return 'overdue';
    if (daysUntil <= 3) return 'urgent';
    if (daysUntil <= 7) return 'warning';
    return 'normal';
}

/**
 * Get human-readable label for due date
 * @param daysUntil - Days until due date
 * @returns Label like "Vence hoje", "Vence em 2 dias", etc.
 */
export function getDueDateLabel(daysUntil: number): string {
    if (daysUntil < 0) {
        const daysOverdue = Math.abs(daysUntil);
        if (daysOverdue === 1) return 'Venceu ontem';
        return `Venceu há ${daysOverdue} dias`;
    }
    if (daysUntil === 0) return 'Vence HOJE';
    if (daysUntil === 1) return 'Vence amanhã';
    return `Vence em ${daysUntil} dias`;
}

/**
 * Sort bills by due date (most urgent first)
 */
export function sortBillsByDueDate(bills: Array<{ due_day?: number }>): Array<{ due_day?: number }> {
    const currentDay = new Date().getDate();

    return [...bills].sort((a, b) => {
        // Bills without due date go to the end
        if (!a.due_day && !b.due_day) return 0;
        if (!a.due_day) return 1;
        if (!b.due_day) return -1;

        const daysUntilA = getDaysUntilDue(a.due_day, currentDay);
        const daysUntilB = getDaysUntilDue(b.due_day, currentDay);

        return daysUntilA - daysUntilB;
    });
}

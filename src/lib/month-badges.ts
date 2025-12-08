// Helper to calculate month badges/alerts
import { Bill } from '@/types';
import { getDaysUntilDue } from './due-date';

export interface MonthBadges {
    overdueCount: number;
    upcomingCount: number;
    goalAchieved: boolean;
    allPaid: boolean;
}

export function calculateMonthBadges(
    bills: Bill[],
    currentSavings: number,
    savingsGoal: number
): MonthBadges {
    const today = new Date().getDate();
    const pendingBills = bills.filter(b => b.status === 'pending');

    const overdue = pendingBills.filter(b => {
        if (!b.due_day) return false;
        const days = getDaysUntilDue(b.due_day, today);
        return days < 0;
    });

    const upcoming = pendingBills.filter(b => {
        if (!b.due_day) return false;
        const days = getDaysUntilDue(b.due_day, today);
        return days >= 0 && days <= 7;
    });

    return {
        overdueCount: overdue.length,
        upcomingCount: upcoming.length,
        goalAchieved: savingsGoal > 0 && currentSavings >= savingsGoal,
        allPaid: bills.length > 0 && pendingBills.length === 0
    };
}

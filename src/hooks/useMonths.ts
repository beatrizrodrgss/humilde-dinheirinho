import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Month, MonthSummary, Bill } from '@/types';
import { useAuth } from '@/context/AuthContext';

export interface MonthWithSummary extends Month {
  summary: MonthSummary;
}

export function useMonths() {
  const { user } = useAuth();
  const [months, setMonths] = useState<MonthWithSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all months with real-time updates
  useEffect(() => {
    if (!user) {
      setMonths([]);
      setLoading(false);
      return;
    }

    const monthsRef = collection(db, `users/${user.uid}/months`);
    const q = query(monthsRef, orderBy('year', 'desc'), orderBy('month', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const monthsData: MonthWithSummary[] = [];

      for (const monthDoc of snapshot.docs) {
        const monthData = { id: monthDoc.id, ...monthDoc.data() } as Month;

        // Fetch bills for this month
        const billsRef = collection(db, `users/${user.uid}/months/${monthDoc.id}/bills`);
        const billsSnapshot = await getDocs(billsRef);
        const bills = billsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Bill[];

        // Calculate summary
        const income_start = Number(monthData.income_start) || 0;
        const income_middle = Number(monthData.income_middle) || 0;
        const total_income = income_start + income_middle;

        const expenses_start = bills
          .filter((b) => b.type === 'start')
          .reduce((acc, b) => acc + Number(b.amount), 0);

        const expenses_middle = bills
          .filter((b) => b.type === 'middle')
          .reduce((acc, b) => acc + Number(b.amount), 0);

        const total_expenses = expenses_start + expenses_middle;

        monthsData.push({
          ...monthData,
          summary: {
            total_income,
            total_expenses,
            balance: total_income - total_expenses,
            income_start,
            income_middle,
            expenses_start,
            expenses_middle,
          },
        });
      }

      setMonths(monthsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Create new month
  const createMonth = useCallback(async (year: number, month: number) => {
    if (!user) return;

    const monthId = `${year}-${String(month).padStart(2, '0')}`;
    const monthRef = doc(db, `users/${user.uid}/months/${monthId}`);

    await setDoc(monthRef, {
      user_id: user.uid,
      year,
      month,
      income_start: 0,
      income_middle: 0,
      created_at: new Date().toISOString(),
    });
  }, [user]);

  // Update income values
  const updateIncome = useCallback(async (monthId: string, start: number, middle: number) => {
    if (!user) return;

    const monthRef = doc(db, `users/${user.uid}/months/${monthId}`);
    await updateDoc(monthRef, {
      income_start: start,
      income_middle: middle,
    });
  }, [user]);

  // Ensure month exists (create if not)
  const ensureMonth = useCallback(async (year: number, month: number) => {
    if (!user) return null;

    const monthId = `${year}-${String(month).padStart(2, '0')}`;
    const monthRef = doc(db, `users/${user.uid}/months/${monthId}`);

    // Try to get existing month
    const existingMonth = months.find(m => m.id === monthId);
    if (existingMonth) return existingMonth;

    // Create if doesn't exist
    await setDoc(monthRef, {
      user_id: user.uid,
      year,
      month,
      income_start: 0,
      income_middle: 0,
      created_at: new Date().toISOString(),
    }, { merge: true });

    return null;
  }, [user, months]);

  return { months, loading, createMonth, updateIncome, ensureMonth };
}
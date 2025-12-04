import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch
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

  // Create new month (Auto ID to allow duplicates/custom names)
  const createMonth = useCallback(async (year: number, month: number, name?: string) => {
    if (!user) return;

    const monthsRef = collection(db, `users/${user.uid}/months`);

    await addDoc(monthsRef, {
      user_id: user.uid,
      year,
      month,
      name: name || '',
      income_start: 0,
      income_middle: 0,
      created_at: new Date().toISOString(),
    });
  }, [user]);

  // Update month (name or income)
  const updateMonth = useCallback(async (monthId: string, data: Partial<Month>) => {
    if (!user) return;
    const monthRef = doc(db, `users/${user.uid}/months/${monthId}`);
    await updateDoc(monthRef, data);
  }, [user]);

  // Update income values (wrapper for updateMonth for backward compatibility)
  const updateIncome = useCallback(async (monthId: string, start: number, middle: number) => {
    await updateMonth(monthId, {
      income_start: start,
      income_middle: middle,
    });
  }, [updateMonth]);

  // Delete month and its subcollections (bills)
  const deleteMonth = useCallback(async (monthId: string) => {
    if (!user) return;

    try {
      // 1. Delete all bills in subcollection
      const billsRef = collection(db, `users/${user.uid}/months/${monthId}/bills`);
      const billsSnapshot = await getDocs(billsRef);

      const batch = writeBatch(db);
      billsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // 2. Delete the month document itself
      const monthRef = doc(db, `users/${user.uid}/months/${monthId}`);
      await deleteDoc(monthRef);
    } catch (error) {
      console.error("Error deleting month:", error);
      throw error;
    }
  }, [user]);

  return { months, loading, createMonth, updateMonth, updateIncome, deleteMonth };
}
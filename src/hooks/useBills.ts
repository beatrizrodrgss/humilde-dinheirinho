import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Bill } from '@/types';
import { useAuth } from '@/context/AuthContext';

export function useBills(monthId: string) {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for bills
  useEffect(() => {
    if (!monthId || !user) {
      setBills([]);
      setLoading(false);
      return;
    }

    const billsRef = collection(db, `users/${user.uid}/months/${monthId}/bills`);
    const q = query(billsRef, orderBy('created_at', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const billsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Bill[];

      setBills(billsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [monthId, user]);

  // Add new bill
  const addBill = useCallback(async (bill: Omit<Bill, 'id' | 'created_at' | 'user_id' | 'month_id'>) => {
    if (!user || !monthId) throw new Error('User or month not found');

    const billsRef = collection(db, `users/${user.uid}/months/${monthId}/bills`);
    await addDoc(billsRef, {
      ...bill,
      user_id: user.uid,
      month_id: monthId,
      created_at: new Date().toISOString(),
    });
  }, [user, monthId]);

  // Update existing bill
  const updateBill = useCallback(async (id: string, updates: Partial<Bill>) => {
    if (!user || !monthId) throw new Error('User or month not found');

    const billRef = doc(db, `users/${user.uid}/months/${monthId}/bills/${id}`);
    await updateDoc(billRef, updates);
  }, [user, monthId]);

  // Delete bill
  const deleteBill = useCallback(async (id: string) => {
    if (!user || !monthId) throw new Error('User or month not found');

    const billRef = doc(db, `users/${user.uid}/months/${monthId}/bills/${id}`);
    await deleteDoc(billRef);
  }, [user, monthId]);

  // Toggle bill status (pending <-> paid)
  const toggleStatus = useCallback(async (bill: Bill) => {
    const newStatus = bill.status === 'paid' ? 'pending' : 'paid';
    await updateBill(bill.id, { status: newStatus });
  }, [updateBill]);

  return { bills, loading, addBill, updateBill, deleteBill, toggleStatus };
}
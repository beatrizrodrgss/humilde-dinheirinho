
import BillList from '@/components/BillList';
import IncomeInput from '@/components/IncomeInput';
import { Bill, BillType } from '@/types';

interface MonthContentProps {
    currentMonth: {
        income_start: number;
        income_middle: number;
    };
    startBills: Bill[];
    middleBills: Bill[];
    totalStart: number;
    totalMiddle: number;
    onSaveIncome: (start: number, middle: number) => Promise<void>;
    onAddBill: (type: BillType) => void;
    onToggleStatus: (bill: Bill) => Promise<void>;
    onDeleteBill: (id: string) => void;
    onEditBill: (bill: Bill) => void;
}

export default function MonthContent({
    currentMonth,
    startBills,
    middleBills,
    totalStart,
    totalMiddle,
    onSaveIncome,
    onAddBill,
    onToggleStatus,
    onDeleteBill,
    onEditBill
}: MonthContentProps) {
    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Start of Month Section */}
            <div className="space-y-4">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm">
                    <h2 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        📅 Início do Mês (1-15)
                    </h2>
                    <IncomeInput
                        label="Recebimento Início"
                        initialValue={currentMonth.income_start}
                        onSave={(val) => onSaveIncome(val, currentMonth.income_middle)}
                        colorClass="text-blue-700"
                    />
                </div>

                <BillList
                    title="Contas Início"
                    bills={startBills}
                    total={totalStart}
                    onAdd={() => onAddBill('start')}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDeleteBill}
                    onEdit={onEditBill}
                />
            </div>

            {/* Middle of Month Section */}
            <div className="space-y-4">
                <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 shadow-sm">
                    <h2 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        📅 Meio do Mês (16-31)
                    </h2>
                    <IncomeInput
                        label="Recebimento Quinzena"
                        initialValue={currentMonth.income_middle}
                        onSave={(val) => onSaveIncome(currentMonth.income_start, val)}
                        colorClass="text-purple-700"
                    />
                </div>

                <BillList
                    title="Contas Quinzena"
                    bills={middleBills}
                    total={totalMiddle}
                    onAdd={() => onAddBill('middle')}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDeleteBill}
                    onEdit={onEditBill}
                />
            </div>
        </div>
    );
}

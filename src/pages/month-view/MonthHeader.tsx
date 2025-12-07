
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getMonthName } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface MonthHeaderProps {
    year: number;
    month: number;
}

export default function MonthHeader({ year, month }: MonthHeaderProps) {
    const navigate = useNavigate();

    return (
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold capitalize text-gray-900">
                    {getMonthName(month)} {year}
                </h1>
                <p className="text-muted-foreground text-sm">Gerencie suas contas do mês</p>
            </div>
        </div>
    );
}

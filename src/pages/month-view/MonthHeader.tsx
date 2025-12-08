import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { getMonthName } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportAsPNG, exportAsPDF } from '@/lib/export';
import { toast } from 'sonner';

interface MonthHeaderProps {
    year: number;
    month: number;
    showOnlyUnpaid?: boolean;
    onToggleFilter?: (value: boolean) => void;
}

export default function MonthHeader({ year, month, showOnlyUnpaid = false, onToggleFilter }: MonthHeaderProps) {
    const navigate = useNavigate();

    const handleExportPNG = async () => {
        try {
            const filename = `Financas_${getMonthName(month)}_${year}`;
            await exportAsPNG('month-export-container', filename);
            toast.success('Exportado como PNG! 📸');
        } catch (error) {
            toast.error('Erro ao exportar PNG');
            console.error(error);
        }
    };

    const handleExportPDF = async () => {
        try {
            const filename = `Financas_${getMonthName(month)}_${year}`;
            await exportAsPDF('month-export-container', filename);
            toast.success('Exportado como PDF! 📄');
        } catch (error) {
            toast.error('Erro ao exportar PDF');
            console.error(error);
        }
    };

    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="hover:bg-gray-100">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold capitalize text-foreground">
                        {getMonthName(month)} {year}
                    </h1>
                    <p className="text-muted-foreground text-sm">Gerencie suas contas do mês</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {onToggleFilter && (
                    <Button
                        onClick={() => onToggleFilter(!showOnlyUnpaid)}
                        variant={showOnlyUnpaid ? "default" : "outline"}
                        size="sm"
                        className="gap-2"
                    >
                        {showOnlyUnpaid ? '👁️ Apenas não pagas' : '👁️‍🗨️ Todas'}
                    </Button>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Download className="w-4 h-4" />
                            Exportar
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleExportPNG}>
                            📸 Exportar como PNG
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportPDF}>
                            📄 Exportar como PDF
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

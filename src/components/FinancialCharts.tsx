import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Month, Bill } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

interface FinancialChartsProps {
    month: Month;
    bills: Bill[];
    summary: {
        total_income: number;
        total_expenses: number;
        income_start: number;
        income_middle: number;
        expenses_start: number;
        expenses_middle: number;
    };
}

export default function FinancialCharts({ month, bills, summary }: FinancialChartsProps) {
    // Data for Bar Chart (Income vs Expenses)
    const barData = useMemo(() => [
        {
            name: 'Receitas',
            amount: summary.total_income,
            fill: '#22c55e', // Green
        },
        {
            name: 'Despesas',
            amount: summary.total_expenses,
            fill: '#ef4444', // Red
        },
    ], [summary]);

    // Data for Pie Chart (Expenses Distribution)
    const pieData = useMemo(() => {
        const data = [
            { name: 'Início do Mês', value: summary.expenses_start, color: '#3b82f6' }, // Blue
            { name: 'Meio do Mês', value: summary.expenses_middle, color: '#a855f7' }, // Purple
        ];
        return data.filter(d => d.value > 0);
    }, [summary]);

    const hasData = summary.total_income > 0 || summary.total_expenses > 0;

    if (!hasData) {
        return null;
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Bar Chart: Income vs Expenses */}
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-muted-foreground" />
                        Balanço Mensal
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <YAxis
                                    hide
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [formatCurrency(value), 'Valor']}
                                />
                                <Bar
                                    dataKey="amount"
                                    radius={[4, 4, 0, 0]}
                                    animationDuration={1500}
                                >
                                    {barData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Pie Chart: Expenses Distribution */}
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-muted-foreground" />
                        Distribuição de Despesas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: number) => [formatCurrency(value), 'Valor']}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
                                <PieChartIcon className="w-8 h-8 mb-2 opacity-20" />
                                Sem despesas registradas
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

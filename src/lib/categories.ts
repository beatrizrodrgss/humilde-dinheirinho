import {
    Home,
    Utensils,
    Car,
    HeartPulse,
    Gamepad2,
    GraduationCap,
    PiggyBank,
    MoreHorizontal,
    Wifi,
    Zap,
    Smartphone,
    CreditCard,
    ShoppingBag
} from 'lucide-react';

export const CATEGORIES = [
    { id: 'housing', label: 'Casa', icon: Home },
    { id: 'utilities', label: 'Contas', icon: Zap },
    { id: 'internet', label: 'Internet', icon: Wifi },
    { id: 'food', label: 'Alimentação', icon: Utensils },
    { id: 'transport', label: 'Transporte', icon: Car },
    { id: 'health', label: 'Saúde', icon: HeartPulse },
    { id: 'leisure', label: 'Lazer', icon: Gamepad2 },
    { id: 'education', label: 'Educação', icon: GraduationCap },
    { id: 'shopping', label: 'Compras', icon: ShoppingBag },
    { id: 'card', label: 'Cartão', icon: CreditCard },
    { id: 'savings', label: 'Economia', icon: PiggyBank },
    { id: 'other', label: 'Outros', icon: MoreHorizontal },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

export const getCategory = (id?: string) => {
    return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]; // Default to Other
};

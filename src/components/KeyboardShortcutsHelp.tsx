import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const shortcuts = [
    { keys: ['Ctrl', 'N'], description: 'Adicionar nova conta' },
    { keys: ['Ctrl', 'E'], description: 'Exportar relatório' },
    { keys: ['Ctrl', 'F'], description: 'Alternar filtro de contas' },
    { keys: ['?'], description: 'Mostrar atalhos' },
    { keys: ['Esc'], description: 'Fechar diálogos' },
];

export default function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="w-5 h-5" />
                        Atalhos de Teclado
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-4">
                    {shortcuts.map((shortcut, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                            <span className="text-sm text-muted-foreground">
                                {shortcut.description}
                            </span>
                            <div className="flex gap-1">
                                {shortcut.keys.map((key, keyIndex) => (
                                    <kbd
                                        key={keyIndex}
                                        className="px-2 py-1 text-xs font-semibold text-foreground bg-background border border-border rounded shadow-sm"
                                    >
                                        {key}
                                    </kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                    Pressione <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-background border border-border rounded">?</kbd> a qualquer momento para ver os atalhos
                </p>
            </DialogContent>
        </Dialog>
    );
}

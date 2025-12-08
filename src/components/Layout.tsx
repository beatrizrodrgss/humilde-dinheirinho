import { useAuth } from '@/context/AuthContext';
import { LogOut, Paintbrush } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ModeToggle } from './mode-toggle';
import { useThemeColor } from './theme-customizer';
import { Button } from './ui/button';
import { Toaster } from './ui/toaster';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './PageTransition';

export default function Layout() {
  const { user, signOut } = useAuth();
  const { themeColor, setThemeColor } = useThemeColor();
  const location = useLocation();

  return (
    <div className="min-h-screen transition-colors duration-300">
      <header className="bg-background/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10 transition-colors duration-300 supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Controlaê
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {user?.email}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Paintbrush className="h-4 w-4" />
                  <span className="sr-only">Alterar cor</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setThemeColor("zinc")}>
                  <div className={cn("rounded-full w-4 h-4 mr-2 bg-slate-950", themeColor === 'zinc' && "ring-2 ring-primary")} />
                  Zinc
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setThemeColor("blue")}>
                  <div className={cn("rounded-full w-4 h-4 mr-2 bg-blue-600", themeColor === 'blue' && "ring-2 ring-primary")} />
                  Blue
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setThemeColor("rose")}>
                  <div className={cn("rounded-full w-4 h-4 mr-2 bg-rose-600", themeColor === 'rose' && "ring-2 ring-primary")} />
                  Rose
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setThemeColor("green")}>
                  <div className={cn("rounded-full w-4 h-4 mr-2 bg-green-600", themeColor === 'green' && "ring-2 ring-primary")} />
                  Green
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setThemeColor("orange")}>
                  <div className={cn("rounded-full w-4 h-4 mr-2 bg-orange-500", themeColor === 'orange' && "ring-2 ring-primary")} />
                  Orange
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ModeToggle />
            <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname} className="w-full">
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Toaster />
    </div>
  );
}

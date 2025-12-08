import { createContext, useContext, useEffect, useState } from "react";

export type ThemeColor = "zinc" | "blue" | "rose" | "green" | "orange";

type ThemeColorProviderProps = {
    children: React.ReactNode;
    defaultTheme?: ThemeColor;
    storageKey?: string;
};

type ThemeColorProviderState = {
    themeColor: ThemeColor;
    setThemeColor: (theme: ThemeColor) => void;
};

const initialState: ThemeColorProviderState = {
    themeColor: "zinc",
    setThemeColor: () => null,
};

const ThemeColorProviderContext = createContext<ThemeColorProviderState>(initialState);

export function ThemeColorProvider({
    children,
    defaultTheme = "zinc",
    storageKey = "vite-ui-theme-color",
}: ThemeColorProviderProps) {
    const [themeColor, setThemeColor] = useState<ThemeColor>(
        () => (localStorage.getItem(storageKey) as ThemeColor) || defaultTheme
    );

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove all previous theme data attributes
        root.setAttribute("data-theme", themeColor);

    }, [themeColor]);

    const value = {
        themeColor,
        setThemeColor: (theme: ThemeColor) => {
            localStorage.setItem(storageKey, theme);
            setThemeColor(theme);
        },
    };

    return (
        <ThemeColorProviderContext.Provider value={value}>
            {children}
        </ThemeColorProviderContext.Provider>
    );
}

export const useThemeColor = () => {
    const context = useContext(ThemeColorProviderContext);

    if (context === undefined)
        throw new Error("useThemeColor must be used within a ThemeColorProvider");

    return context;
};

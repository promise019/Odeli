export interface ThemeColors {
    // Backgrounds
    bgMain: string;
    bgSidebar: string;
    bgActivityBar: string;
    bgHeader: string;
    bgHover: string;
    bgActive: string;
    
    // Borders & Dividers
    border: string;
    
    // Accents & Selection
    accent: string;
    accentForeground: string;
    
    // Foreground Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    
    // Syntax Highlighting Tokens
    tokenKeyword: string;
    tokenString: string;
    tokenFunction: string;
    tokenComment: string;
}

export interface Theme {
    id: string;
    name: string;
    type: "dark" | "light";
    colors: ThemeColors;
}

export const builtInThemes: Theme[] = [
    {
        id: "odeli-dark",
        name: "Odeli Dark (Default)",
        type: "dark",
        colors: {
            bgMain: "#18181b",        // zinc-900
            bgSidebar: "#09090b",     // zinc-950
            bgActivityBar: "#09090b", // zinc-950
            bgHeader: "#09090b",
            bgHover: "#27272a",       // zinc-800
            bgActive: "#27272a",
            border: "#27272a",
            accent: "#f97316",       // orange-500
            accentForeground: "#ffffff",
            textPrimary: "#f4f4f5",   // zinc-100
            textSecondary: "#a1a1aa", // zinc-400
            textMuted: "#52525b",      // zinc-600
            tokenKeyword: "#f97316",
            tokenString: "#4ade80",
            tokenFunction: "#60a5fa",
            tokenComment: "#71717a",
        },
    },
    {
        id: "tokyo-night",
        name: "Tokyo Night",
        type: "dark",
        colors: {
            bgMain: "#1a1b26",
            bgSidebar: "#16161e",
            bgActivityBar: "#16161e",
            bgHeader: "#16161e",
            bgHover: "#24283b",
            bgActive: "#292e42",
            border: "#232433",
            accent: "#7aa2f7",
            accentForeground: "#15161e",
            textPrimary: "#a9b1d6",
            textSecondary: "#787c99",
            textMuted: "#565f89",
            tokenKeyword: "#bb9af7",
            tokenString: "#9ece6a",
            tokenFunction: "#7aa2f7",
            tokenComment: "#565f89",
        },
    },
    {
        id: "one-dark-pro",
        name: "One Dark Pro",
        type: "dark",
        colors: {
            bgMain: "#282c34",
            bgSidebar: "#21252b",
            bgActivityBar: "#21252b",
            bgHeader: "#21252b",
            bgHover: "#2c313a",
            bgActive: "#3e4451",
            border: "#181a1f",
            accent: "#61afef",
            accentForeground: "#282c34",
            textPrimary: "#abb2bf",
            textSecondary: "#828997",
            textMuted: "#5c6370",
            tokenKeyword: "#c678dd",
            tokenString: "#98c379",
            tokenFunction: "#61afef",
            tokenComment: "#5c6370",
        },
    },
    {
        id: "github-dark",
        name: "GitHub Dark",
        type: "dark",
        colors: {
            bgMain: "#0d1117",
            bgSidebar: "#010409",
            bgActivityBar: "#010409",
            bgHeader: "#010409",
            bgHover: "#161b22",
            bgActive: "#21262d",
            border: "#30363d",
            accent: "#2f81f7",
            accentForeground: "#ffffff",
            textPrimary: "#c9d1d9",
            textSecondary: "#8b949e",
            textMuted: "#484f58",
            tokenKeyword: "#ff7b72",
            tokenString: "#a5d6ff",
            tokenFunction: "#d2a8ff",
            tokenComment: "#8b949e",
        },
    },
];

type ThemeListener = (theme: Theme) => void;

class ThemeStore {
    private currentTheme: Theme;
    private listeners: Set<ThemeListener> = new Set();
    private readonly STORAGE_KEY = "odeli_active_theme";

    constructor() {
        const savedThemeId = localStorage.getItem(this.STORAGE_KEY);
        const initial = builtInThemes.find((t) => t.id === savedThemeId) ?? builtInThemes[0]!;
        this.currentTheme = initial;
        this.applyThemeToCSSVars(initial);
    }

    public getCurrentTheme(): Theme {
        return this.currentTheme;
    }

    public getThemes(): Theme[] {
        return builtInThemes;
    }

    public setTheme(themeId: string) {
        const found = builtInThemes.find((t) => t.id === themeId);
        if (!found) return;

        this.currentTheme = found;
        localStorage.setItem(this.STORAGE_KEY, themeId);
        this.applyThemeToCSSVars(found);
        this.notify();
    }

    public subscribe(listener: ThemeListener): () => void {
        this.listeners.add(listener);
        listener(this.currentTheme);
        return () => this.listeners.delete(listener);
    }

    private applyThemeToCSSVars(theme: Theme) {
        const root = document.documentElement;
        const c = theme.colors;

        root.style.setProperty("--bg-main", c.bgMain);
        root.style.setProperty("--bg-sidebar", c.bgSidebar);
        root.style.setProperty("--bg-activity-bar", c.bgActivityBar);
        root.style.setProperty("--bg-header", c.bgHeader);
        root.style.setProperty("--bg-hover", c.bgHover);
        root.style.setProperty("--bg-active", c.bgActive);
        root.style.setProperty("--border-color", c.border);
        root.style.setProperty("--accent-color", c.accent);
        root.style.setProperty("--accent-fg", c.accentForeground);
        root.style.setProperty("--text-primary", c.textPrimary);
        root.style.setProperty("--text-secondary", c.textSecondary);
        root.style.setProperty("--text-muted", c.textMuted);

        // Syntax tokens
        root.style.setProperty("--token-keyword", c.tokenKeyword);
        root.style.setProperty("--token-string", c.tokenString);
        root.style.setProperty("--token-function", c.tokenFunction);
        root.style.setProperty("--token-comment", c.tokenComment);
    }

    private notify() {
        this.listeners.forEach((fn) => fn(this.currentTheme));
    }
}

export const themeStore = new ThemeStore();
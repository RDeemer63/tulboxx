import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type BusinessMood = "professional" | "modern" | "warm" | "vibrant" | "minimal";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultMood?: BusinessMood;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  businessMood: BusinessMood;
  setTheme: (theme: Theme) => void;
  setBusinessMood: (mood: BusinessMood) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  businessMood: "professional",
  setTheme: () => null,
  setBusinessMood: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultMood = "professional",
  storageKey = "tulboxx-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  
  const [businessMood, setBusinessMood] = useState<BusinessMood>(
    () => (localStorage.getItem(`${storageKey}-mood`) as BusinessMood) || defaultMood
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    // Apply business mood classes
    root.classList.remove("mood-professional", "mood-modern", "mood-warm", "mood-vibrant", "mood-minimal");
    root.classList.add(`mood-${businessMood}`);
  }, [theme, businessMood]);

  const value = {
    theme,
    businessMood,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    setBusinessMood: (mood: BusinessMood) => {
      localStorage.setItem(`${storageKey}-mood`, mood);
      setBusinessMood(mood);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
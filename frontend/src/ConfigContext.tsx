import React, { createContext, useContext, useEffect, useState } from "react";
import type { SiteConfig } from "./types";
import { getConfig } from "./api";

interface ConfigCtx {
  config: SiteConfig | null;
  refresh: () => Promise<void>;
}

const ConfigContext = createContext<ConfigCtx>({ config: null, refresh: async () => {} });

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  const refresh = async () => {
    const data = await getConfig();
    setConfig(data);
    applyTheme(data);
  };

  useEffect(() => { refresh(); }, []);

  return (
    <ConfigContext.Provider value={{ config, refresh }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() { return useContext(ConfigContext); }

function applyTheme(data: SiteConfig) {
  const { theme } = data;
  const root = document.documentElement;
  root.style.setProperty("--bg", theme.background);
  root.style.setProperty("--fg", theme.foreground);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--secondary", theme.secondary);
  root.style.setProperty("--header-font", `'${theme.headerFont}', serif`);
  root.style.setProperty("--body-font", `'${theme.bodyFont}', sans-serif`);

  // Load Google Fonts dynamically
  const fonts = [theme.headerFont, theme.bodyFont]
    .map((f) => f.replace(/ /g, "+"))
    .join("|");
  const existing = document.getElementById("gfonts");
  const href = `https://fonts.googleapis.com/css2?family=${fonts}:wght@300;400;500;600;700&display=swap`;
  if (existing) {
    (existing as HTMLLinkElement).href = href;
  } else {
    const link = document.createElement("link");
    link.id = "gfonts";
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
}

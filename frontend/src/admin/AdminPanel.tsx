import { useState } from "react";
import {
  Palette,
  Layout,
  User,
  Grid,
  FileText,
  BookOpen,
  Mail,
  Play,
  MessageSquare,
  LogOut,
  ExternalLink,
  Download,
} from "lucide-react";
import ThemeTab from "./tabs/ThemeTab";
import HeroTab from "./tabs/HeroTab";
import AboutTab from "./tabs/AboutTab";
import ProjectsTab from "./tabs/ProjectsTab";
import ResumeTab from "./tabs/ResumeTab";
import PortfolioTab from "./tabs/PortfolioTab";
import ContactTab from "./tabs/ContactTab";
import ShowcaseTab from "./tabs/ShowcaseTab";
import ChatTab from "./tabs/ChatTab";
import ExportTab from "./tabs/ExportTab";

const TABS = [
  { id: "theme",     label: "Theme",     icon: Palette },
  { id: "hero",      label: "Hero",      icon: Layout },
  { id: "about",     label: "About",     icon: User },
  { id: "projects",  label: "Projects",  icon: Grid },
  { id: "resume",    label: "Resume",    icon: FileText },
  { id: "portfolio", label: "Portfolio", icon: BookOpen },
  { id: "contact",   label: "Contact",   icon: Mail },
  { id: "showcase",  label: "Showcase",  icon: Play },
  { id: "chat",      label: "Chat",      icon: MessageSquare },
  { id: "export",    label: "Export",    icon: Download },
];

interface Props { onLogout: () => void; }

export default function AdminPanel({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState("theme");

  const ActiveComponent = {
    theme: ThemeTab,
    hero: HeroTab,
    about: AboutTab,
    projects: ProjectsTab,
    resume: ResumeTab,
    portfolio: PortfolioTab,
    contact: ContactTab,
    showcase: ShowcaseTab,
    chat: ChatTab,
    export: ExportTab,
  }[activeTab]!;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {/* Top bar */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        borderBottom: "1px solid var(--border)",
        background: "rgba(17,17,17,0.95)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
          <span style={{ fontFamily: "var(--header-font)", fontSize: "1.1rem" }}>Admin Panel</span>
          <span style={{ opacity: 0.3, fontSize: "0.85rem" }}>— Tella Irani Shemirani Portfolio</span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <a href="/" target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
            <ExternalLink size={14} /> View Site
          </a>
          <button
            onClick={() => { sessionStorage.removeItem("adminPass"); onLogout(); }}
            className="btn btn-ghost"
            style={{ opacity: 0.6 }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <aside className="admin-sidebar">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`admin-tab-btn ${activeTab === id ? "active" : ""}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="admin-content">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}

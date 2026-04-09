import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { api } from "../../api";
import { useConfig } from "../../ConfigContext";
import Dropzone from "../../components/Dropzone";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

const HEADER_FONTS = [
  "Playfair Display", "Cormorant Garamond", "Libre Baskerville",
  "EB Garamond", "Raleway", "Josefin Sans", "Cinzel",
];
const BODY_FONTS = [
  "Inter", "Montserrat", "Lato", "Source Sans 3",
  "DM Sans", "Nunito", "Open Sans", "Roboto",
];

const PALETTES = [
  { name: "Dark Luxe", bg: "#111111", fg: "#F5F0EB", accent: "#C9A84C", secondary: "#8B6F47" },
  { name: "Ocean", bg: "#0A1628", fg: "#E8F4F8", accent: "#4DBFBF", secondary: "#2A7A8C" },
  { name: "Ember", bg: "#1A0A0A", fg: "#F8EDE3", accent: "#E8773A", secondary: "#9C4A22" },
  { name: "Forest", bg: "#0D1A10", fg: "#EDF5EE", accent: "#5CB85C", secondary: "#2D6A2D" },
  { name: "Monochrome", bg: "#0F0F0F", fg: "#EBEBEB", accent: "#888888", secondary: "#555555" },
  { name: "Royal", bg: "#0E0B1F", fg: "#F0ECFF", accent: "#9B6DFF", secondary: "#5E3AA8" },
];

type ColorKey = "background" | "foreground" | "accent" | "secondary";

export default function ThemeTab() {
  const { config, refresh } = useConfig();
  const theme = config?.theme;

  const [colors, setColors] = useState({
    background: theme?.background ?? "#111111",
    foreground: theme?.foreground ?? "#F5F0EB",
    accent: theme?.accent ?? "#C9A84C",
    secondary: theme?.secondary ?? "#8B6F47",
  });
  const [headerFont, setHeaderFont] = useState(theme?.headerFont ?? "Playfair Display");
  const [bodyFont, setBodyFont] = useState(theme?.bodyFont ?? "Inter");
  const [bgOpacity, setBgOpacity] = useState(theme?.backgroundImageOpacity ?? 0.15);
  const [activeColor, setActiveColor] = useState<ColorKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const applyPalette = (p: typeof PALETTES[0]) => {
    setColors({ background: p.bg, foreground: p.fg, accent: p.accent, secondary: p.secondary });
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post("/api/admin/theme", { ...colors, headerFont, bodyFont, backgroundImageOpacity: bgOpacity });
      await refresh();
      toast.success("Theme saved!");
    } catch { toast.error("Save failed."); }
    setSaving(false);
  };

  const uploadBg = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post("/api/admin/theme/background-image", fd);
      await refresh();
      toast.success("Background image updated!");
    } catch { toast.error("Upload failed."); }
    setUploading(false);
  };

  const removeBg = async () => {
    await api.delete("/api/admin/theme/background-image");
    await refresh();
    toast.success("Background image removed.");
  };

  const colorLabels: { key: ColorKey; label: string }[] = [
    { key: "background", label: "Background" },
    { key: "foreground", label: "Foreground / Text" },
    { key: "accent", label: "Accent (Gold)" },
    { key: "secondary", label: "Secondary Accent" },
  ];

  return (
    <div>
      <h2 style={{ fontFamily: "var(--header-font)", fontSize: "1.5rem", marginBottom: "0.25rem" }}>Theme</h2>
      <p style={{ opacity: 0.5, fontSize: "0.9rem", marginBottom: "2rem" }}>Colors, fonts, and background image</p>

      {/* Palette presets */}
      <div className="field">
        <label>Palette Presets</label>
        <div className="palette-row">
          {PALETTES.map((p) => (
            <button key={p.name} className="palette-preset" onClick={() => applyPalette(p)}>
              <span style={{ background: p.bg, border: "1px solid rgba(255,255,255,0.2)" }} />
              <span style={{ background: p.accent }} />
              <span style={{ background: p.fg }} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Color pickers */}
      <div className="field">
        <label>Colors</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
          {colorLabels.map(({ key, label }) => (
            <div key={key} style={{ textAlign: "center" }}>
              <div
                onClick={() => setActiveColor(activeColor === key ? null : key)}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: colors[key],
                  border: `3px solid ${activeColor === key ? "var(--accent)" : "var(--border)"}`,
                  cursor: "pointer",
                  margin: "0 auto 0.5rem",
                  transition: "border-color 0.2s, transform 0.2s",
                  transform: activeColor === key ? "scale(1.1)" : "scale(1)",
                }}
              />
              <p style={{ fontSize: "0.7rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
              <p style={{ fontSize: "0.75rem", fontFamily: "monospace", opacity: 0.4 }}>{colors[key]}</p>
            </div>
          ))}
        </div>
        {activeColor && (
          <div style={{ padding: "1.5rem", background: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "0.8rem", opacity: 0.6, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Editing: {colorLabels.find(c => c.key === activeColor)?.label}
            </p>
            <HexColorPicker
              color={colors[activeColor]}
              onChange={(c) => setColors((prev) => ({ ...prev, [activeColor]: c }))}
              style={{ width: "100%" }}
            />
            <input
              className="input"
              style={{ marginTop: "0.75rem", fontFamily: "monospace" }}
              value={colors[activeColor]}
              onChange={(e) => setColors((prev) => ({ ...prev, [activeColor!]: e.target.value }))}
            />
          </div>
        )}
      </div>

      {/* Fonts */}
      <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
        <div className="field">
          <label>Header Font</label>
          <select className="select" value={headerFont} onChange={(e) => setHeaderFont(e.target.value)}>
            {HEADER_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <p style={{ fontSize: "0.85rem", opacity: 0.5, marginTop: "0.5rem", fontFamily: `'${headerFont}', serif` }}>
            The quick brown fox — {headerFont}
          </p>
        </div>
        <div className="field">
          <label>Body Font</label>
          <select className="select" value={bodyFont} onChange={(e) => setBodyFont(e.target.value)}>
            {BODY_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <p style={{ fontSize: "0.85rem", opacity: 0.5, marginTop: "0.5rem", fontFamily: `'${bodyFont}', sans-serif` }}>
            The quick brown fox — {bodyFont}
          </p>
        </div>
      </div>

      {/* Background image */}
      <div className="field">
        <label>Global Background Image (low opacity overlay)</label>
        {theme?.backgroundImage ? (
          <div style={{ position: "relative", marginBottom: "1rem" }}>
            <img
              src={theme.backgroundImage}
              alt="bg"
              style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", opacity: 0.6 }}
            />
            <button
              className="btn btn-danger"
              onClick={removeBg}
              style={{ position: "absolute", top: "0.5rem", right: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}
            >
              <Trash2 size={14} /> Remove
            </button>
          </div>
        ) : (
          <Dropzone
            onFile={uploadBg}
            accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }}
            label={uploading ? "Uploading..." : "Drop background image here (JPG, PNG, WebP)"}
          />
        )}
        <div style={{ marginTop: "1rem" }}>
          <label style={{ fontSize: "0.8rem", opacity: 0.6, display: "flex", justifyContent: "space-between" }}>
            <span>Opacity</span><span>{Math.round(bgOpacity * 100)}%</span>
          </label>
          <input
            type="range" min={0.05} max={0.4} step={0.01}
            value={bgOpacity}
            onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: "var(--accent)" }}
          />
        </div>
      </div>

      <button className="btn btn-accent" onClick={save} disabled={saving}>
        {saving ? "Saving..." : "Save Theme"}
      </button>
    </div>
  );
}

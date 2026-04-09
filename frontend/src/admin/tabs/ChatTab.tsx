import { useState, useEffect } from "react";
import { api } from "../../api";
import toast from "react-hot-toast";
import { RefreshCw, Database, Plus, Trash2, Edit2, Check, X } from "lucide-react";

interface Settings {
  ollama_host: string;
  chat_model: string;
  embed_model: string;
  sample_questions: string[];
}

export default function ChatTab() {
  const [settings, setSettings] = useState<Settings>({
    ollama_host:      "http://localhost:11434",
    chat_model:       "llama3.2",
    embed_model:      "nomic-embed-text",
    sample_questions: [],
  });
  const [status, setStatus]       = useState<{ installed: boolean; chunks: number } | null>(null);
  const [saving, setSaving]       = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [newQ, setNewQ]           = useState("");
  const [editIdx, setEditIdx]     = useState<number | null>(null);
  const [editVal, setEditVal]     = useState("");

  const loadStatus = async () => {
    try { setStatus((await api.get("/api/admin/chat/status")).data); } catch { /* ignore */ }
  };

  useEffect(() => {
    api.get("/api/admin/chat/settings").then((r) => setSettings(r.data)).catch(() => {});
    loadStatus();
  }, []);

  const saveSettings = async (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    setSaving(true);
    try {
      await api.post("/api/admin/chat/settings", next);
      toast.success("Saved!");
    } catch { toast.error("Save failed."); }
    setSaving(false);
  };

  const ingest = async () => {
    setIngesting(true);
    try {
      const r = await api.post("/api/admin/chat/ingest", {});
      toast.success(`Ingested ${r.data.chunks} chunks.`);
      loadStatus();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Ingest failed.");
    }
    setIngesting(false);
  };

  const addQ = () => {
    const q = newQ.trim();
    if (!q) return;
    saveSettings({ sample_questions: [...settings.sample_questions, q] });
    setNewQ("");
  };

  const deleteQ = (i: number) =>
    saveSettings({ sample_questions: settings.sample_questions.filter((_, idx) => idx !== i) });

  const startEdit = (i: number) => { setEditIdx(i); setEditVal(settings.sample_questions[i]); };

  const confirmEdit = () => {
    if (editIdx === null) return;
    const updated = [...settings.sample_questions];
    updated[editIdx] = editVal.trim() || updated[editIdx];
    saveSettings({ sample_questions: updated });
    setEditIdx(null);
  };

  const fs = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div>
      <h2 style={{ fontFamily: "var(--header-font)", fontSize: "1.5rem", marginBottom: "0.25rem" }}>Chat</h2>
      <p style={{ opacity: 0.5, fontSize: "0.9rem", marginBottom: "2rem" }}>
        RAG chatbot powered by Ollama — answers questions from the resume
      </p>

      {/* Knowledge Base Status */}
      <div style={{
        background: "var(--surface)",
        border: `1px solid ${status?.chunks ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "1rem 1.25rem",
        marginBottom: "2rem",
        display: "flex", alignItems: "center", gap: "1rem",
      }}>
        <Database size={20} style={{ color: "var(--accent)", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "0.85rem", fontWeight: 500 }}>Knowledge Base</p>
          {status === null ? (
            <p style={{ fontSize: "0.8rem", opacity: 0.5 }}>Loading...</p>
          ) : !status.installed ? (
            <p style={{ fontSize: "0.8rem", opacity: 0.5 }}>Packages not installed — run <code>python app.py</code></p>
          ) : status.chunks === 0 ? (
            <p style={{ fontSize: "0.8rem", opacity: 0.5 }}>Empty — ingest resume to enable chat</p>
          ) : (
            <p style={{ fontSize: "0.8rem", color: "var(--accent)" }}>{status.chunks} chunks indexed</p>
          )}
        </div>
        <button className="btn btn-outline" onClick={ingest} disabled={ingesting}
          style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", flexShrink: 0 }}>
          <RefreshCw size={14} />
          {ingesting ? "Ingesting..." : "Re-ingest Resume"}
        </button>
      </div>

      {/* Sample Questions */}
      <h3 style={{ fontFamily: "var(--header-font)", fontSize: "1.1rem", marginBottom: "0.75rem" }}>
        Sample Questions
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem" }}>
        {settings.sample_questions.map((q, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", padding: "0.5rem 0.75rem",
          }}>
            {editIdx === i ? (
              <>
                <input
                  className="input"
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmEdit()}
                  style={{ flex: 1, padding: "0.25rem 0.5rem", fontSize: "0.9rem" }}
                  autoFocus
                />
                <button onClick={confirmEdit} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer" }}>
                  <Check size={15} />
                </button>
                <button onClick={() => setEditIdx(null)} style={{ background: "none", border: "none", color: "var(--fg)", opacity: 0.4, cursor: "pointer" }}>
                  <X size={15} />
                </button>
              </>
            ) : (
              <>
                <span style={{ flex: 1, fontSize: "0.9rem", opacity: 0.85 }}>{q}</span>
                <button onClick={() => startEdit(i)} style={{ background: "none", border: "none", color: "var(--fg)", opacity: 0.4, cursor: "pointer" }}>
                  <Edit2 size={13} />
                </button>
                <button onClick={() => deleteQ(i)} style={{ background: "none", border: "none", color: "var(--fg)", opacity: 0.4, cursor: "pointer" }}>
                  <Trash2 size={13} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2.5rem" }}>
        <input
          className="input"
          placeholder="Add a sample question..."
          value={newQ}
          onChange={(e) => setNewQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addQ()}
          style={{ flex: 1 }}
        />
        <button className="btn btn-outline" onClick={addQ} disabled={!newQ.trim()}>
          <Plus size={15} /> Add
        </button>
      </div>

      {/* Ollama Settings */}
      <h3 style={{ fontFamily: "var(--header-font)", fontSize: "1.1rem", marginBottom: "0.25rem" }}>
        Ollama Settings
      </h3>
      <p style={{ opacity: 0.5, fontSize: "0.85rem", marginBottom: "1.25rem" }}>
        Pull models: <code style={{ fontSize: "0.8rem" }}>ollama pull llama3.2</code> &amp;{" "}
        <code style={{ fontSize: "0.8rem" }}>ollama pull nomic-embed-text</code>
      </p>
      <div className="field">
        <label>Ollama Host</label>
        <input className="input" value={settings.ollama_host} onChange={fs("ollama_host")} placeholder="http://localhost:11434" />
      </div>
      <div className="field">
        <label>Chat Model</label>
        <input className="input" value={settings.chat_model} onChange={fs("chat_model")} placeholder="llama3.2" />
      </div>
      <div className="field">
        <label>Embed Model</label>
        <input className="input" value={settings.embed_model} onChange={fs("embed_model")} placeholder="nomic-embed-text" />
      </div>
      <button className="btn btn-accent" onClick={() => saveSettings({})} disabled={saving}>
        {saving ? "Saving..." : "Save Ollama Settings"}
      </button>
    </div>
  );
}

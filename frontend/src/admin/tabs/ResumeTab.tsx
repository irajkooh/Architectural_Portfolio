import { useState } from "react";
import { api } from "../../api";
import { useConfig } from "../../ConfigContext";
import Dropzone from "../../components/Dropzone";
import toast from "react-hot-toast";
import { Trash2, Plus, X } from "lucide-react";

export default function ResumeTab() {
  const { config, refresh } = useConfig();
  const resume = config?.resume;

  const [visible, setVisible]     = useState(resume?.visible ?? true);
  const [highlights, setHighlights] = useState<string[]>(resume?.highlights ?? []);
  const [newHL, setNewHL]         = useState("");
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ingesting, setIngesting] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.post("/api/admin/resume", { visible, highlights });
      await refresh();
      toast.success("Resume settings saved!");
    } catch { toast.error("Save failed."); }
    setSaving(false);
  };

  const uploadResume = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post("/api/admin/resume/file", fd);
      await refresh();
      toast.success("Resume uploaded!");
    } catch { toast.error("Upload failed."); }
    setUploading(false);
  };

  const deleteResume = async () => {
    await api.delete("/api/admin/resume/file");
    await refresh();
    toast.success("Resume removed.");
  };

  const ingestResume = async () => {
    setIngesting(true);
    try {
      const r = await api.post("/api/admin/chat/ingest", {});
      toast.success(`Ingested ${r.data.chunks} chunks into chatbot.`);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Ingest failed.");
    }
    setIngesting(false);
  };

  const addHL = () => {
    const s = newHL.trim();
    if (s && !highlights.includes(s)) {
      setHighlights([...highlights, s]);
      setNewHL("");
    }
  };
  const removeHL = (s: string) => setHighlights(highlights.filter((x) => x !== s));

  return (
    <div>
      <h2 style={{ fontFamily: "var(--header-font)", fontSize: "1.5rem", marginBottom: "0.25rem" }}>Resume / CV</h2>
      <p style={{ opacity: 0.5, fontSize: "0.9rem", marginBottom: "2rem" }}>Upload your PDF resume and manage key competencies</p>

      {/* Visibility toggle */}
      <div className="field">
        <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
            style={{ accentColor: "var(--accent)", width: 16, height: 16 }}
          />
          Show Resume section on the portfolio
        </label>
      </div>

      <div className="separator" />

      {/* PDF Upload */}
      <div className="field">
        <label>Resume PDF</label>
        {resume?.file ? (
          <div>
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", aspectRatio: "3/2", marginBottom: "0.75rem" }}>
              <iframe src={`${resume.file}#view=FitH`} style={{ width: "100%", height: "100%", border: "none" }} title="Resume" />
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <a href={resume.file} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
                Open PDF
              </a>
              <button className="btn btn-danger" onClick={deleteResume} style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
                <Trash2 size={14} /> Remove
              </button>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <Dropzone onFile={uploadResume} accept={{ "application/pdf": [".pdf"] }} label="Drop new PDF to replace" />
            </div>
          </div>
        ) : (
          <Dropzone
            onFile={uploadResume}
            accept={{ "application/pdf": [".pdf"] }}
            label={uploading ? "Uploading..." : "Drop resume PDF here"}
          />
        )}
      </div>

      <div className="separator" />

      {/* Key Competencies */}
      <div className="field">
        <label>Key Competencies</label>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          {highlights.map((h) => (
            <span key={h} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }} className="chip">
              {h}
              <button onClick={() => removeHL(h)} style={{ background: "none", border: "none", color: "var(--fg)", cursor: "pointer", opacity: 0.5, padding: 0 }}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            className="input"
            placeholder="Add competency..."
            value={newHL}
            onChange={(e) => setNewHL(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHL()}
          />
          <button className="btn btn-outline" onClick={addHL}><Plus size={16} /></button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button className="btn btn-accent" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Resume Settings"}
        </button>
        {resume?.file && (
          <button className="btn btn-outline" onClick={ingestResume} disabled={ingesting}>
            {ingesting ? "Ingesting..." : "Re-ingest into Chatbot"}
          </button>
        )}
      </div>
    </div>
  );
}

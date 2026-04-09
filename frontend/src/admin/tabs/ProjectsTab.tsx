import { useState } from "react";
import { api } from "../../api";
import { useConfig } from "../../ConfigContext";
import Dropzone from "../../components/Dropzone";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit2, X, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from "lucide-react";
import type { Project } from "../../types";

export default function ProjectsTab() {
  const { config, refresh } = useConfig();
  const projects = config?.projects ?? [];
  const projectTypes = config?.projectTypes ?? [];
  const [newType, setNewType] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", name: "", description: "", category: "Residential", year: "", client: "", location: "" });
  const [saving, setSaving] = useState(false);

  const resetForm = () => setForm({ title: "", name: "", description: "", category: projectTypes[0] ?? "Other", year: "", client: "", location: "" });

  const addType = async () => {
    const t = newType.trim();
    if (!t || projectTypes.includes(t)) return;
    const updated = [...projectTypes, t];
    await api.post("/api/admin/project-types", { projectTypes: updated });
    await refresh();
    setNewType("");
    toast.success(`Added "${t}"`);
  };

  const removeType = async (t: string) => {
    const updated = projectTypes.filter((x) => x !== t);
    await api.post("/api/admin/project-types", { projectTypes: updated });
    await refresh();
    toast.success(`Removed "${t}"`);
  };

  const createProject = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      await api.post("/api/admin/projects", fd);
      await refresh();
      toast.success("Project created!");
      setCreating(false);
      resetForm();
    } catch { toast.error("Failed to create project."); }
    setSaving(false);
  };

  const updateProject = async (id: string) => {
    setSaving(true);
    try {
      await api.put(`/api/admin/projects/${id}`, form);
      await refresh();
      toast.success("Project updated!");
      setEditing(null);
    } catch { toast.error("Update failed."); }
    setSaving(false);
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await api.delete(`/api/admin/projects/${id}`);
    await refresh();
    toast.success("Project deleted.");
  };

  const uploadImages = async (projectId: string, files: File[]) => {
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      await api.post(`/api/admin/projects/${projectId}/images`, fd);
    }
    await refresh();
    toast.success(`${files.length} image${files.length > 1 ? "s" : ""} added!`);
  };

  const deleteImage = async (projectId: string, url: string) => {
    await api.delete(`/api/admin/projects/${projectId}/images`, { params: { url } });
    await refresh();
    toast.success("Image removed.");
  };

  const uploadVideo = async (projectId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    await api.post(`/api/admin/projects/${projectId}/video`, fd);
    await refresh();
    toast.success("Video uploaded!");
  };

  const removeVideo = async (projectId: string) => {
    await api.delete(`/api/admin/projects/${projectId}/video`);
    await refresh();
    toast.success("Video removed.");
  };

  const setCover = async (p: Project, url: string) => {
    await api.put(`/api/admin/projects/${p.id}`, { ...p, cover: url });
    await refresh();
  };

  const moveProject = async (idx: number, dir: -1 | 1) => {
    const ids = projects.map((p) => p.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= ids.length) return;
    [ids[idx], ids[swapIdx]] = [ids[swapIdx], ids[idx]];
    await api.post("/api/admin/projects/reorder", { ids });
    await refresh();
  };

  const startEdit = (p: Project) => {
    setForm({ title: p.title, name: p.name ?? "", description: p.description, category: p.category, year: p.year, client: p.client ?? "", location: p.location });
    setEditing(p.id);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontFamily: "var(--header-font)", fontSize: "1.5rem" }}>Projects</h2>
          <p style={{ opacity: 0.5, fontSize: "0.9rem" }}>{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn btn-accent" onClick={() => { setCreating(true); resetForm(); }}>
          <Plus size={16} /> Add Project
        </button>
      </div>

      {/* Project Types manager */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.25rem", marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.75rem" }}>Project Types</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
          {projectTypes.map((t) => (
            <span key={t} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.75rem", background: "rgba(201,168,76,0.1)", border: "1px solid var(--accent)", borderRadius: "100px", fontSize: "0.8rem" }}>
              {t}
              <button onClick={() => removeType(t)} style={{ background: "none", border: "none", color: "var(--fg)", opacity: 0.5, cursor: "pointer", padding: 0, lineHeight: 1 }}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            className="input"
            placeholder="New type..."
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addType()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-outline" onClick={addType} disabled={!newType.trim()}>
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Create form */}
      {creating && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--accent)", borderRadius: "var(--radius-lg)", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1.25rem", fontFamily: "var(--header-font)" }}>New Project</h3>
          <ProjectForm form={form} setForm={setForm} types={projectTypes} />
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button className="btn btn-accent" onClick={createProject} disabled={saving || !form.name}>{saving ? "Creating..." : "Create Project"}</button>
            <button className="btn btn-outline" onClick={() => setCreating(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Project list */}
      {projects.length === 0 && !creating && (
        <div style={{ textAlign: "center", opacity: 0.35, padding: "3rem 0" }}>No projects yet.</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {projects.map((p, idx) => (
          <div key={p.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem" }}>
              {p.cover && (
                <img src={p.cover} alt="" style={{ width: 60, height: 50, objectFit: "cover", borderRadius: "var(--radius)", flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                {p.name && <p style={{ fontFamily: "var(--header-font)", fontSize: "1rem" }}>{p.name}</p>}
                <p style={{ fontFamily: p.name ? undefined : "var(--header-font)", fontSize: p.name ? "0.85rem" : "1rem", opacity: p.name ? 0.65 : 1 }}>{p.title}</p>
                <p style={{ fontSize: "0.8rem", opacity: 0.5 }}>{[p.category, p.year, p.location].filter(Boolean).join(" · ")}</p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                {/* Reorder */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <button
                    className="btn btn-outline"
                    onClick={() => moveProject(idx, -1)}
                    disabled={idx === 0}
                    title="Move up"
                    style={{ padding: "0.2rem 0.45rem", opacity: idx === 0 ? 0.3 : 1 }}
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => moveProject(idx, 1)}
                    disabled={idx === projects.length - 1}
                    title="Move down"
                    style={{ padding: "0.2rem 0.45rem", opacity: idx === projects.length - 1 ? 0.3 : 1 }}
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>
                <button className="btn btn-outline" onClick={() => { setExpanded(expanded === p.id ? null : p.id); }} style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>
                  {expanded === p.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Media
                </button>
                <button className="btn btn-outline" onClick={() => startEdit(p)} style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>
                  <Edit2 size={14} /> Edit
                </button>
                <button className="btn btn-danger" onClick={() => deleteProject(p.id)} style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Edit form */}
            {editing === p.id && (
              <div style={{ padding: "0 1.25rem 1.25rem", borderTop: "1px solid var(--border)" }}>
                <div style={{ height: "1rem" }} />
                <ProjectForm form={form} setForm={setForm} types={projectTypes} />
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                  <button className="btn btn-accent" onClick={() => updateProject(p.id)} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                  <button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
                </div>
              </div>
            )}

            {/* Media panel */}
            {expanded === p.id && (
              <div style={{ padding: "1.25rem", borderTop: "1px solid var(--border)" }}>
                {/* Images */}
                <p style={{ fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.75rem" }}>Images</p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                  {p.images.map((img) => (
                    <div key={img} style={{ position: "relative", width: 90 }}>
                      <img
                        src={img}
                        alt=""
                        onClick={() => setCover(p, img)}
                        style={{
                          width: 90, height: 70, objectFit: "cover", borderRadius: "var(--radius)",
                          border: `2px solid ${img === p.cover ? "var(--accent)" : "var(--border)"}`,
                          cursor: "pointer",
                        }}
                        title={img === p.cover ? "Cover image" : "Click to set as cover"}
                      />
                      {img === p.cover && (
                        <span style={{ position: "absolute", top: 2, left: 2, background: "var(--accent)", color: "#111", fontSize: "0.6rem", padding: "1px 4px", borderRadius: 2 }}>COVER</span>
                      )}
                      <button
                        onClick={() => deleteImage(p.id, img)}
                        style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.7)", border: "none", color: "white", borderRadius: "50%", width: 18, height: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <div style={{ width: 90 }}>
                    <Dropzone
                      onFiles={(files) => uploadImages(p.id, files)}
                      multiple
                      accept={{ "image/*": [] }}
                      label="+"
                    />
                  </div>
                </div>

                {/* Video */}
                <p style={{ fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.75rem" }}>Video</p>
                {p.video ? (
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <video src={p.video} style={{ height: 60, borderRadius: "var(--radius)", border: "1px solid var(--border)" }} muted />
                    <button className="btn btn-danger" onClick={() => removeVideo(p.id)} style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <Dropzone
                    onFile={(f) => uploadVideo(p.id, f)}
                    accept={{ "video/*": [".mp4", ".webm", ".mov"] }}
                    label="Drop video (MP4, WebM, MOV)"
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectForm({ form, setForm, types }: { form: any; setForm: any; types: string[] }) {
  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p: any) => ({ ...p, [key]: e.target.value }));
  return (
    <>
      <div className="field">
        <label>Company *</label>
        <input className="input" value={form.title} onChange={f("title")} placeholder="Company / Firm name" required />
      </div>
      <div className="field">
        <label>Description</label>
        <textarea className="textarea" value={form.description} onChange={f("description")} style={{ minHeight: 100 }} placeholder="Describe the project..." />
      </div>
      <div className="grid-3">
        <div className="field">
          <label>Project Name *</label>
          <input className="input" value={form.name} onChange={f("name")} placeholder="Project name" required />
        </div>
        <div className="field">
          <label>Category</label>
          <select className="select" value={form.category} onChange={f("category")}>
            {types.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Date</label>
          <input className="input" value={form.year} onChange={f("year")} placeholder="2024" />
        </div>
        <div className="field">
          <label>Client</label>
          <input className="input" value={form.client} onChange={f("client")} placeholder="Client name" />
        </div>
        <div className="field">
          <label>Location</label>
          <input className="input" value={form.location} onChange={f("location")} placeholder="Ottawa, ON" />
        </div>
      </div>
    </>
  );
}

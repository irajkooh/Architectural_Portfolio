import { useState } from "react";
import { api } from "../../api";
import { useConfig } from "../../ConfigContext";
import Dropzone from "../../components/Dropzone";
import toast from "react-hot-toast";
import { Trash2, Plus, X } from "lucide-react";
import type { Education, Honor, Publication } from "../../types";

export default function AboutTab() {
  const { config, refresh } = useConfig();
  const about = config?.about;

  const [bio, setBio] = useState(about?.bio ?? "");
  const [philosophy, setPhilosophy] = useState(about?.philosophy ?? "");
  const [linkedin, setLinkedin] = useState(about?.linkedin ?? "");
  const [skills, setSkills] = useState<string[]>(about?.skills ?? []);
  const [newSkill, setNewSkill] = useState("");
  const [education, setEducation] = useState<Education[]>(about?.education ?? []);
  const [honors, setHonors] = useState<Honor[]>(about?.honors ?? []);
  const [publications, setPublications] = useState<Publication[]>(about?.publications ?? []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.post("/api/admin/about", { bio, philosophy, linkedin, skills, education, honors, publications });
      await refresh();
      toast.success("About section saved!");
    } catch { toast.error("Save failed."); }
    setSaving(false);
  };

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post("/api/admin/about/photo", fd);
      await refresh();
      toast.success("Photo updated!");
    } catch { toast.error("Upload failed."); }
    setUploading(false);
  };

  const removePhoto = async () => {
    await api.delete("/api/admin/about/photo");
    await refresh();
    toast.success("Photo removed.");
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setNewSkill("");
    }
  };
  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const updateEdu = (i: number, field: keyof Education, val: string) =>
    setEducation(education.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  const addEdu = () => setEducation([...education, { year: "", degree: "", institution: "" }]);
  const removeEdu = (i: number) => setEducation(education.filter((_, idx) => idx !== i));

  return (
    <div>
      <h2 style={{ fontFamily: "var(--header-font)", fontSize: "1.5rem", marginBottom: "0.25rem" }}>About Section</h2>
      <p style={{ opacity: 0.5, fontSize: "0.9rem", marginBottom: "2rem" }}>Bio, photo, education, and skills</p>

      {/* Photo */}
      <div className="field">
        <label>Profile Photo</label>
        {about?.photo ? (
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <img src={about.photo} alt="Profile" style={{ width: 120, height: 150, objectFit: "cover", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <p style={{ fontSize: "0.85rem", opacity: 0.6 }}>Current photo</p>
              <button className="btn btn-danger" onClick={removePhoto} style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>
                <Trash2 size={14} /> Remove
              </button>
              <Dropzone onFile={uploadPhoto} accept={{ "image/*": [] }} label="Replace photo" />
            </div>
          </div>
        ) : (
          <Dropzone
            onFile={uploadPhoto}
            accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }}
            label={uploading ? "Uploading..." : "Drop profile photo here (JPG, PNG, WebP)"}
          />
        )}
      </div>

      {/* Bio */}
      <div className="field">
        <label>Biography</label>
        <textarea className="textarea" value={bio} onChange={(e) => setBio(e.target.value)} style={{ minHeight: 140 }} />
      </div>

      {/* Philosophy */}
      <div className="field">
        <label>Design Philosophy (shown as blockquote)</label>
        <textarea className="textarea" value={philosophy} onChange={(e) => setPhilosophy(e.target.value)} style={{ minHeight: 100 }} />
      </div>

      {/* LinkedIn */}
      <div className="field">
        <label>LinkedIn URL</label>
        <input className="input" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
      </div>

      <div className="separator" />

      {/* Skills */}
      <div className="field">
        <label>Skills</label>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          {skills.map((s) => (
            <span key={s} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }} className="chip">
              {s}
              <button onClick={() => removeSkill(s)} style={{ background: "none", border: "none", color: "var(--fg)", cursor: "pointer", opacity: 0.5, padding: 0, lineHeight: 1 }}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            className="input"
            placeholder="Add skill..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
          />
          <button className="btn btn-outline" onClick={addSkill}><Plus size={16} /></button>
        </div>
      </div>

      <div className="separator" />

      {/* Education */}
      <div className="field">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <label style={{ marginBottom: 0 }}>Education</label>
          <button className="btn btn-outline" onClick={addEdu} style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}>
            <Plus size={14} /> Add Entry
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {education.map((e, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr auto", gap: "0.5rem", alignItems: "center" }}>
              <input className="input" placeholder="Year" value={e.year} onChange={(ev) => updateEdu(i, "year", ev.target.value)} />
              <input className="input" placeholder="Degree" value={e.degree} onChange={(ev) => updateEdu(i, "degree", ev.target.value)} />
              <input className="input" placeholder="Institution" value={e.institution} onChange={(ev) => updateEdu(i, "institution", ev.target.value)} />
              <button className="btn btn-danger" onClick={() => removeEdu(i)} style={{ padding: "0.5rem" }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="separator" />

      {/* Honors & Awards */}
      <div className="field">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <label style={{ marginBottom: 0 }}>Honors &amp; Awards</label>
          <button className="btn btn-outline" onClick={() => setHonors([...honors, { year: "", title: "", description: "", url: "" }])} style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}>
            <Plus size={14} /> Add
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {honors.map((h, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: "0.5rem" }}>
              <input className="input" placeholder="Year" value={h.year} onChange={(e) => setHonors(honors.map((x, idx) => idx === i ? { ...x, year: e.target.value } : x))} />
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <input className="input" placeholder="Title" value={h.title} onChange={(e) => setHonors(honors.map((x, idx) => idx === i ? { ...x, title: e.target.value } : x))} />
                <input className="input" placeholder="Description (optional)" value={h.description} onChange={(e) => setHonors(honors.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x))} />
                <input className="input" placeholder="URL (optional)" value={h.url} onChange={(e) => setHonors(honors.map((x, idx) => idx === i ? { ...x, url: e.target.value } : x))} />
              </div>
              <button className="btn btn-danger" onClick={() => setHonors(honors.filter((_, idx) => idx !== i))} style={{ padding: "0.5rem", alignSelf: "start" }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="separator" />

      {/* Publications */}
      <div className="field">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <label style={{ marginBottom: 0 }}>Publications</label>
          <button className="btn btn-outline" onClick={() => setPublications([...publications, { year: "", title: "", venue: "", url: "" }])} style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}>
            <Plus size={14} /> Add
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {publications.map((p, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: "0.5rem" }}>
              <input className="input" placeholder="Year" value={p.year} onChange={(e) => setPublications(publications.map((x, idx) => idx === i ? { ...x, year: e.target.value } : x))} />
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <input className="input" placeholder="Title" value={p.title} onChange={(e) => setPublications(publications.map((x, idx) => idx === i ? { ...x, title: e.target.value } : x))} />
                <input className="input" placeholder="Venue / Journal" value={p.venue} onChange={(e) => setPublications(publications.map((x, idx) => idx === i ? { ...x, venue: e.target.value } : x))} />
                <input className="input" placeholder="URL (optional)" value={p.url} onChange={(e) => setPublications(publications.map((x, idx) => idx === i ? { ...x, url: e.target.value } : x))} />
              </div>
              <button className="btn btn-danger" onClick={() => setPublications(publications.filter((_, idx) => idx !== i))} style={{ padding: "0.5rem", alignSelf: "start" }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-accent" onClick={save} disabled={saving}>
        {saving ? "Saving..." : "Save About"}
      </button>
    </div>
  );
}
